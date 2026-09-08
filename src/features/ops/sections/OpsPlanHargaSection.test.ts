import { describe, expect, it } from 'vitest';
import { planRequirements } from './OpsPlanHargaSection';

describe('planRequirements', () => {
  it('requires paid plan fields before activation', () => {
    expect(planRequirements('pro', {
      displayName: 'Guru Pro', priceAmount: '49000', tokenMonthlyLimit: '300000', billingPeriod: 'monthly', features: 'Kuota AI', active: false,
    }).every((item) => item.met)).toBe(true);
  });

  it('rejects an incomplete paid plan and billed Free plan', () => {
    expect(planRequirements('plus', {
      displayName: 'Plus', priceAmount: '0', tokenMonthlyLimit: '', billingPeriod: '', features: '', active: false,
    }).some((item) => !item.met)).toBe(true);
    expect(planRequirements('free', {
      displayName: 'Free', priceAmount: '0', tokenMonthlyLimit: '30000', billingPeriod: 'monthly', features: 'Dasar', active: false,
    }).some((item) => !item.met)).toBe(true);
  });
});
