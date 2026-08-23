import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanUsageSettingsPage from '../app/pengaturan/langganan/page';

const plan = {
  workspaceId: 'ws_1',
  plan: 'free',
  tokenUsedThisMonth: 1_500,
  tokenMonthlyLimit: 30_000,
  billingCycleStartedAt: '2026-07-01T00:00:00.000Z',
  entitlementSource: 'free',
  catalog: {
    key: 'free',
    displayName: 'Free',
    priceAmount: 0,
    currency: 'IDR',
    billingPeriod: null,
    tokenMonthlyLimit: 30_000,
    features: [],
  },
  trial: {
    eligible: true,
    claimed: false,
    activeOnThisDevice: false,
    startsAt: null,
    endsAt: null,
    remainingDays: null,
  },
};

describe('one-time trial link — /app/pengaturan/langganan', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ data: plan }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
  });

  it('shows the catalog token quota and prepares a link instead of claiming directly', async () => {
    render(<PlanUsageSettingsPage />);

    expect(await screen.findByText('1.500 / 30.000')).toBeInTheDocument();
    expect(screen.getByText(/hanya dapat diklaim satu kali/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siapkan tautan klaim/i })).toBeEnabled();
    expect(screen.queryByRole('button', { name: /klaim trial 2 bulan/i })).not.toBeInTheDocument();
  });

  it('issues a short-lived token and renders it as a non-prefetched claim link', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: plan }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              token: 'opaque-one-time-token-with-at-least-32-characters',
              expiresAt: '2026-08-23T12:15:00.000Z',
            },
          }),
          { status: 201, headers: { 'content-type': 'application/json' } },
        ),
      );

    render(<PlanUsageSettingsPage />);
    await user.click(await screen.findByRole('button', { name: /siapkan tautan klaim/i }));

    const link = await screen.findByRole('link', { name: /buka tautan klaim trial/i });
    expect(link).toHaveAttribute(
      'href',
      '/app/pengaturan/langganan/trial/konfirmasi#token=opaque-one-time-token-with-at-least-32-characters',
    );
    expect(fetch).toHaveBeenNthCalledWith(2, '/v1/me/plan/trial/claim-links', {
      method: 'POST',
      credentials: 'include',
    });
    expect(
      screen.getByText(/setelah digunakan, tautan tidak dapat dipakai lagi/i),
    ).toBeInTheDocument();
  });

  it('shows the trial end date and no new claim link after it has been claimed', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            ...plan,
            plan: 'pro',
            tokenMonthlyLimit: null,
            entitlementSource: 'trial',
            trial: {
              eligible: false,
              claimed: true,
              activeOnThisDevice: true,
              startsAt: '2026-07-29T00:00:00.000Z',
              endsAt: '2026-09-27T00:00:00.000Z',
              remainingDays: 60,
            },
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    render(<PlanUsageSettingsPage />);

    expect(await screen.findByText(/60 hari tersisa/i)).toBeInTheDocument();
    expect(screen.getByText(/27 september 2026/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /siapkan tautan klaim/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /buka tautan klaim trial/i }),
    ).not.toBeInTheDocument();
  });

  it('renders errors returned while issuing a claim link', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: plan }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              code: 'TRIAL_ALREADY_CLAIMED',
              message: 'Trial atau tautan klaim tidak tersedia untuk akun ini.',
            },
          }),
          { status: 409, headers: { 'content-type': 'application/json' } },
        ),
      );

    render(<PlanUsageSettingsPage />);
    await user.click(await screen.findByRole('button', { name: /siapkan tautan klaim/i }));

    expect(
      await screen.findByText(/trial atau tautan klaim tidak tersedia untuk akun ini/i),
    ).toBeInTheDocument();
  });
});
