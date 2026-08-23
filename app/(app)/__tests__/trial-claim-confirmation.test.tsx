import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TrialClaimConfirmationPage from '../app/pengaturan/langganan/trial/konfirmasi/page';

const token = 'opaque-one-time-token-with-at-least-32-characters';

function openClaimLink(value = token) {
  window.history.replaceState(
    null,
    '',
    `/app/pengaturan/langganan/trial/konfirmasi#token=${encodeURIComponent(value)}`,
  );
}

describe('trial claim confirmation link', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, '', '/app/pengaturan/langganan/trial/konfirmasi');
  });

  it('reads the token from the fragment, scrubs it, and only claims after confirmation', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            workspaceId: 'ws_1',
            plan: 'pro',
            tokenUsedThisMonth: 0,
            tokenMonthlyLimit: null,
            billingCycleStartedAt: '2026-08-01T00:00:00.000Z',
            entitlementSource: 'trial',
            catalog: {
              key: 'pro',
              displayName: 'Pro',
              priceAmount: 49_000,
              currency: 'IDR',
              billingPeriod: 'monthly',
              tokenMonthlyLimit: null,
              features: [],
            },
            trial: {
              eligible: false,
              claimed: true,
              activeOnThisDevice: true,
              startsAt: '2026-08-23T00:00:00.000Z',
              endsAt: '2026-10-22T00:00:00.000Z',
              remainingDays: 60,
            },
          },
        }),
        { status: 201, headers: { 'content-type': 'application/json' } },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    openClaimLink();

    render(<TrialClaimConfirmationPage />);

    const claimButton = await screen.findByRole('button', { name: /aktifkan trial 2 bulan/i });
    expect(fetchMock).not.toHaveBeenCalled();
    await waitFor(() => expect(window.location.hash).toBe(''));

    await user.click(claimButton);

    expect(await screen.findByText(/trial berhasil diaktifkan/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/v1/me/plan/trial/claim');
    expect(init).toMatchObject({
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(JSON.parse(String(init.body))).toEqual({ claimToken: token });
  });

  it('does not call the claim endpoint for a missing or malformed link token', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    openClaimLink('short');

    render(<TrialClaimConfirmationPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/tautan klaim tidak valid/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows a replay-safe error when the one-time link was already used', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: {
              code: 'TRIAL_CLAIM_LINK_INVALID',
              message: 'Trial atau tautan klaim tidak tersedia untuk akun ini.',
            },
          }),
          { status: 409, headers: { 'content-type': 'application/json' } },
        ),
      ),
    );
    openClaimLink();

    render(<TrialClaimConfirmationPage />);
    await user.click(await screen.findByRole('button', { name: /aktifkan trial 2 bulan/i }));

    expect(
      await screen.findByText(/trial atau tautan klaim tidak tersedia untuk akun ini/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /hubungi tim lembar/i })).toBeInTheDocument();
  });
});
