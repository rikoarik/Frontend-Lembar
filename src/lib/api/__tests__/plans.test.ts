import { describe, expect, it, vi } from 'vitest';
import { fetchPublicPlans, formatPrice, formatTokenLimit } from '../plans';
import type { NumberFormat } from '@/src/i18n/formats';

/** Test-local formatter: components get theirs from next-intl. */
const idNumber: NumberFormat = (value, options) =>
  new Intl.NumberFormat('id-ID', options).format(value);

describe('canonical plan catalog helper', () => {
  it('maps the public response and formats IDR/token limits', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: [
              {
                key: 'free',
                displayName: 'Free',
                priceAmount: 0,
                currency: 'IDR',
                billingPeriod: null,
                tokenMonthlyLimit: 60000,
                features: [],
              },
              {
                key: 'pro',
                displayName: 'Pro',
                priceAmount: 49000,
                currency: 'IDR',
                billingPeriod: 'monthly',
                tokenMonthlyLimit: null,
                features: [],
              },
            ],
          }),
          { status: 200 },
        ),
      ),
    );

    const plans = await fetchPublicPlans({ baseUrl: 'https://api.example.test' });
    expect(plans.map((plan) => plan.key)).toEqual(['free', 'pro']);
    // Intl.NumberFormat locale output varies by runtime; verify shape, not exact string
    const price = formatPrice(plans[1]!, idNumber);
    expect(price).toMatch(/49[.,]?000/);
    expect(price).toMatch(/bulan/);
    expect(formatTokenLimit(plans[0]!.tokenMonthlyLimit, idNumber)).toBe('60.000 token / bulan');
    expect(formatTokenLimit(plans[1]!.tokenMonthlyLimit, idNumber)).toBe('Tidak terbatas');
  });

  it('returns no plans when the API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await fetchPublicPlans({ baseUrl: 'https://api.example.test' })).toEqual([]);
  });
});
