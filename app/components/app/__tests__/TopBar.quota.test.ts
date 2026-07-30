import { describe, expect, it } from 'vitest';
import { entitlementCta, formatQuota } from '../TopBar';

describe('formatQuota', () => {
  it('formats finite backend quota', () => {
    expect(formatQuota({ generationsUsedThisMonth: 3, monthlyLimit: 10 })).toEqual({
      label: '3/10',
      percent: 30,
    });
  });

  it('formats unlimited backend quota', () => {
    expect(formatQuota({ generationsUsedThisMonth: 7, monthlyLimit: null })).toEqual({
      label: '7/∞',
      percent: 0,
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
});
