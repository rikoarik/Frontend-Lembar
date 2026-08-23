import { describe, expect, it } from 'vitest';
import { entitlementCta, formatQuota } from '../TopBar';

describe('formatQuota', () => {
  it('formats the same finite token quota used by the plan catalog', () => {
    expect(formatQuota({ tokenUsedThisMonth: 1_500, tokenMonthlyLimit: 30_000 })).toEqual({
      label: '1.500/30.000',
      percent: 5,
    });
  });

  it('formats unlimited token quota', () => {
    expect(formatQuota({ tokenUsedThisMonth: 7_000, tokenMonthlyLimit: null })).toEqual({
      label: '7.000/∞',
      percent: 0,
    });
  });

  it('handles a zero token limit without dividing by zero', () => {
    expect(formatQuota({ tokenUsedThisMonth: 1, tokenMonthlyLimit: 0 })).toEqual({
      label: '1/0',
      percent: 100,
    });
  });
});

describe('entitlementCta', () => {
  it('shows Upgrade Pro for free plan', () => {
    expect(entitlementCta({ plan: 'free' })).toEqual({
      label: 'Upgrade Pro',
      icon: 'workspace_premium',
    });
  });

  it('shows Pro for active pro plan', () => {
    expect(entitlementCta({ plan: 'pro' })).toEqual({ label: 'Pro', icon: 'verified' });
  });

  it('shows Plus for the highest paid tier', () => {
    expect(entitlementCta({ plan: 'plus' })).toEqual({ label: 'Plus', icon: 'verified' });
  });
});
