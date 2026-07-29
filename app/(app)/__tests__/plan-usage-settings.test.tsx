import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlanUsageSettingsPage from '../app/pengaturan/langganan/page';

const plan = {
  workspaceId: 'ws_1',
  plan: 'free',
  generationsUsedThisMonth: 12,
  monthlyLimit: 50,
  billingCycleStartedAt: '2026-07-01T00:00:00.000Z',
  entitlementSource: 'free',
  trial: {
    eligible: true,
    claimed: false,
    activeOnThisDevice: false,
    startsAt: null,
    endsAt: null,
    remainingDays: null,
  },
};

describe('trial self-service — /app/pengaturan/langganan', () => {
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

  it('shows eligibility and a two-month claim action', async () => {
    render(<PlanUsageSettingsPage />);

    expect(await screen.findByText(/memenuhi syarat trial/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /klaim trial 2 bulan/i })).toBeEnabled();
  });

  it('shows the trial end date and remaining days when already claimed', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            ...plan,
            plan: 'pro',
            monthlyLimit: null,
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
    expect(screen.queryByRole('button', { name: /klaim trial/i })).not.toBeInTheDocument();
  });

  it('claims without putting device identity in browser requests and renders the claimed summary', async () => {
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
              ...plan,
              plan: 'pro',
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
          { status: 201, headers: { 'content-type': 'application/json' } },
        ),
      );

    render(<PlanUsageSettingsPage />);
    await user.click(await screen.findByRole('button', { name: /klaim trial 2 bulan/i }));

    await waitFor(() => expect(screen.getByText(/trial berhasil diaktifkan/i)).toBeInTheDocument());
    expect(screen.getByText(/60 hari tersisa/i)).toBeInTheDocument();
    expect(fetch).toHaveBeenNthCalledWith(2, '/v1/me/plan/trial/claim', {
      method: 'POST',
      credentials: 'include',
    });
  });

  it('renders device conflict errors from the claim endpoint', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: plan }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              code: 'TRIAL_DEVICE_CONFLICT',
              message: 'Perangkat ini sudah pernah memakai trial.',
            },
          }),
          { status: 409, headers: { 'content-type': 'application/json' } },
        ),
      );

    render(<PlanUsageSettingsPage />);
    await user.click(await screen.findByRole('button', { name: /klaim trial 2 bulan/i }));

    expect(
      await screen.findByText(/perangkat ini sudah pernah memakai trial/i),
    ).toBeInTheDocument();
  });
});
