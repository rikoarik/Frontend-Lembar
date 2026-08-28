import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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

describe('admin-issued trial link - /app/pengaturan/langganan', () => {
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

  it('shows the catalog quota and explains that only superadmin can issue the link', async () => {
    render(<PlanUsageSettingsPage />);

    expect(await screen.findByText('1.500 / 30.000')).toBeInTheDocument();
    expect(screen.getByText(/hanya dapat diterbitkan oleh superadmin/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /siapkan|terbitkan.*tautan/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /klaim trial 2 bulan/i })).not.toBeInTheDocument();
  });

  it('never calls the removed self-issue endpoint', async () => {
    render(<PlanUsageSettingsPage />);

    await screen.findByText(/hanya dapat diterbitkan oleh superadmin/i);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/v1/me/plan', { credentials: 'include' });
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
});
