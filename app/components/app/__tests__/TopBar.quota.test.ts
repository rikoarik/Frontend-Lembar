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
  it('offers trial only when the server marks it eligible and unclaimed', () => {
    expect(
      entitlementCta({ plan: 'free', trial: { eligible: true, claimed: false } }),
    ).toEqual({ label: 'Klaim Trial', icon: 'redeem' });
  });

  it('offers upgrade after trial is claimed or unavailable', () => {
    expect(
      entitlementCta({ plan: 'free', trial: { eligible: false, claimed: true } }),
    ).toEqual({ label: 'Upgrade Pro', icon: 'workspace_premium' });
  });

  it('shows Pro without an upsell for active entitlement', () => {
    expect(
      entitlementCta({ plan: 'pro', trial: { eligible: false, claimed: true } }),
    ).toEqual({ label: 'Pro', icon: 'verified' });
  });
});
