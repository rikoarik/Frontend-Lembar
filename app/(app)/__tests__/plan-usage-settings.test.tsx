import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('hidden trial controls - /app/pengaturan/langganan', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    // Route by URL: the workspace plan and the public catalog are two different
    // payloads, and the upgrade price must come from the latter.
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        const body = url.includes('/v1/public/plans')
          ? {
              data: [
                {
                  key: 'pro',
                  displayName: 'Pro',
                  priceAmount: 149000,
                  currency: 'IDR',
                  billingPeriod: 'monthly',
                  tokenMonthlyLimit: 300000,
                  features: [],
                },
              ],
            }
          : { data: plan };
        return Promise.resolve(
          new Response(JSON.stringify(body), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        );
      }),
    );
  });

  it('shows the catalog quota without exposing trial controls', async () => {
    render(<PlanUsageSettingsPage />);

    expect(await screen.findByText('1.500 / 30.000')).toBeInTheDocument();
    expect(screen.queryByText(/trial guru pro/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /siapkan|terbitkan.*tautan/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /klaim trial 2 bulan/i })).not.toBeInTheDocument();
  });

  it('renders the upgrade price from the catalog, not from the message files', async () => {
    render(<PlanUsageSettingsPage />);

    // Free non-trial workspace → the upgrade panel is visible.
    expect(await screen.findByText('Upgrade paket')).toBeInTheDocument();
    expect(await screen.findByText(/Rp\s?149\.000 \/ bulan/)).toBeInTheDocument();
  });

  it('never calls the removed self-issue endpoint', async () => {
    render(<PlanUsageSettingsPage />);

    await screen.findByText('1.500 / 30.000');
    // The page reads the workspace plan and the public catalog, and nothing
    // else — in particular no trial self-issue endpoint.
    const calls = (fetch as unknown as { mock: { calls: unknown[][] } }).mock.calls;
    expect(calls.map((call) => call[0]).sort()).toEqual(['/v1/me/plan', '/v1/public/plans']);
    expect(fetch).toHaveBeenCalledWith('/v1/me/plan', { credentials: 'include' });
  });

  it('keeps claimed trial details and claim links hidden', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
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
      ),
    );

    render(<PlanUsageSettingsPage />);

    expect(await screen.findByText('Paket aktif')).toBeInTheDocument();
    expect(screen.queryByText(/60 hari tersisa/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/27 september 2026/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /siapkan tautan klaim/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /buka tautan klaim trial/i }),
    ).not.toBeInTheDocument();
  });
});
