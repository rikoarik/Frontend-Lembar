import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setTestLocale } from '@/test/locale-state';

import { LeftRail } from '@/app/components/app/LeftRail';
import PlanUsageSettingsPage from '@/app/(app)/app/pengaturan/langganan/page';

vi.mock('next/navigation', () => ({
  usePathname: () => '/app/pengaturan/langganan',
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

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

afterEach(() => {
  setTestLocale('id');
});

/**
 * End-to-end switcher proof: the global next-intl double resolves against the
 * locale held in `test/locale-state.ts`, so flipping it and re-rendering the app
 * shell *and* a real app page must change both surfaces.
 */
describe('locale switch changes the shell and an app page', () => {
  it('renders the shell and the plan page in Indonesian for id', async () => {
    setTestLocale('id');
    render(<LeftRail activeWorkspaceKind="school" activeRole="school_admin" />);
    render(<PlanUsageSettingsPage />);

    expect(screen.getByRole('link', { name: 'Beranda' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bank soal' })).toBeInTheDocument();
    // Locale-aware number formatting, not a hardcoded 'id-ID' tag.
    expect(await screen.findByText('1.500 / 30.000')).toBeInTheDocument();
  });

  it('renders the shell and the plan page in English for en', async () => {
    setTestLocale('en');
    render(<LeftRail activeWorkspaceKind="school" activeRole="school_admin" />);
    render(<PlanUsageSettingsPage />);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Question bank' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Beranda' })).not.toBeInTheDocument();
    expect(await screen.findByText('1,500 / 30,000')).toBeInTheDocument();
  });

  it('switches both surfaces in place when the locale changes', async () => {
    setTestLocale('id');
    const shell = render(<LeftRail activeWorkspaceKind="school" activeRole="school_admin" />);
    const page = render(<PlanUsageSettingsPage />);

    expect(screen.getByRole('link', { name: 'Beranda' })).toBeInTheDocument();
    expect(await screen.findByText('1.500 / 30.000')).toBeInTheDocument();

    setTestLocale('en');
    shell.rerender(<LeftRail activeWorkspaceKind="school" activeRole="school_admin" />);
    page.rerender(<PlanUsageSettingsPage />);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Beranda' })).not.toBeInTheDocument();
    expect(await screen.findByText('1,500 / 30,000')).toBeInTheDocument();
    expect(screen.queryByText('1.500 / 30.000')).not.toBeInTheDocument();
  });
});
