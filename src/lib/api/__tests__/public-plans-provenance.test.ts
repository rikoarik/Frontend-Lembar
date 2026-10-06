import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * Regression guard for the /harga page's live shape.
 *
 * What shipped to production once already: the Pro card rendered
 * `Rp 149.000` while the subtitle claimed prices came "langsung dari katalog
 * paket aktif". The number was literal copy in the message file. Moving it out
 * of the message file was not enough — the page went on publishing an
 * equally unverified nominal, read from the backend plan catalog instead.
 *
 * Three things are asserted here, and none of them can be satisfied by editing
 * copy:
 *
 * 1. Provenance. The catalog is read through the app's own origin — the BFF
 *    handler at `app/v1/public/plans/route.ts` — never straight from a
 *    backend host. The backend's public API serves no CORS headers, and the
 *    previous resolver preferred an env-provided backend origin, so a browser
 *    fetch of it failed and the plan grid rendered empty.
 *
 * 2. Transport. The URL is absolute: `fetch('/v1/public/plans')` on the server
 *    throws `TypeError: Failed to parse URL`, and the failure is swallowed, so
 *    the page simply renders as if no plan existed.
 *
 * 3. Policy. While D-009 is undecided the page publishes nothing commercial:
 *    no price and no quota. The catalog only ever becomes the source of a
 *    nominal once the owner has actually decided pricing. `free` is the one
 *    exception — a zero is a product fact, not a hypothesis — and a paid row
 *    that would otherwise render "Rp 149.000 / 300.000 token" is dropped at
 *    the same point, so clearing the message files cannot be undone by the
 *    catalog.
 */

const SOURCE = readFileSync('src/lib/api/plans.ts', 'utf8');

describe('public plan catalog provenance', () => {
  it('reads the catalog from the app origin, never from an env-provided backend host', () => {
    expect(SOURCE).toContain("from './publicPlansSchema'");
    expect(SOURCE).toMatch(/publicPlansUrl\(opts\?\.baseUrl\)/);
    expect(SOURCE).not.toMatch(/BACKEND_API_BASE_URL/);
    expect(SOURCE).not.toMatch(/NEXT_PUBLIC_BACKEND_API_BASE_URL/);
  });

  it('always builds an absolute URL — a server-side fetch of a relative path throws', async () => {
    const { publicPlansUrl } = await import('@/src/lib/api/publicPlansSchema');

    expect(publicPlansUrl('https://app.example.test')).toBe(
      'https://app.example.test/v1/public/plans',
    );
    expect(publicPlansUrl('https://app.example.test/')).toBe(
      'https://app.example.test/v1/public/plans',
    );
    expect(publicPlansUrl()).toMatch(/^https?:\/\//);
  });
});

describe('pricing policy (D-009)', () => {
  it('publishes the free tier but withholds the paid nominal while the owner decision is open', async () => {
    const { fetchPublicPlans } = await import('@/src/lib/api/plans');
    const previous = process.env.NEXT_PUBLIC_PRICE_PUBLISHING;

    process.env.NEXT_PUBLIC_PRICE_PUBLISHING = 'false';
    try {
      // A free tier is a product fact — a product that offers one must be able
      // to say so. The paid rows seeded by migrations no decision authorises
      // are dropped, so a nominal cleared out of the message files cannot come
      // back through the catalog. Note the fetch is *not* refused outright:
      // withholding everything made the page blank, which hides the free tier
      // and reads as a broken page rather than an undecided price.
      const fetchImpl = async () =>
        new Response(
          JSON.stringify({
            data: [
              {
                key: 'free',
                displayName: 'Free',
                priceAmount: 0,
                currency: 'IDR',
                billingPeriod: null,
                tokenMonthlyLimit: null,
                features: [],
              },
              {
                key: 'pro',
                displayName: 'Pro',
                priceAmount: 149000,
                currency: 'IDR',
                billingPeriod: 'monthly',
                tokenMonthlyLimit: 300000,
                features: ['Menggunakan GPT-5.6 Sol terbaru.'],
              },
            ],
          }),
          { status: 200 },
        );
      const plans = await fetchPublicPlans({ fetchImpl: fetchImpl as unknown as typeof fetch });

      expect(plans.map((plan) => plan.key)).toEqual(['free']);
      expect(JSON.stringify(plans)).not.toMatch(/149|300000|GPT/);
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_PRICE_PUBLISHING;
      else process.env.NEXT_PUBLIC_PRICE_PUBLISHING = previous;
    }
  });

  it('serves the catalog once the owner has decided, so the flag is not a dead switch', async () => {
    const { fetchPublicPlans } = await import('@/src/lib/api/plans');
    const previous = process.env.NEXT_PUBLIC_PRICE_PUBLISHING;

    process.env.NEXT_PUBLIC_PRICE_PUBLISHING = 'true';
    try {
      const fetchImpl = async () =>
        new Response(JSON.stringify({ data: [{ key: 'pro', priceAmount: 149000 }] }), {
          status: 200,
        });
      const plans = await fetchPublicPlans({ fetchImpl: fetchImpl as unknown as typeof fetch });
      expect(plans).toHaveLength(1);
      expect(plans[0].priceAmount).toBe(149000);
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_PRICE_PUBLISHING;
      else process.env.NEXT_PUBLIC_PRICE_PUBLISHING = previous;
    }
  });

  it('treats an empty or misspelled flag as undecided, not as enabled', async () => {
    const { pricePublishingEnabled } = await import('@/src/lib/api/publicPlansSchema');
    const previous = process.env.NEXT_PUBLIC_PRICE_PUBLISHING;

    try {
      process.env.NEXT_PUBLIC_PRICE_PUBLISHING = '';
      expect(pricePublishingEnabled()).toBe(false);
      process.env.NEXT_PUBLIC_PRICE_PUBLISHING = 'flase';
      expect(pricePublishingEnabled()).toBe(false);
      process.env.NEXT_PUBLIC_PRICE_PUBLISHING = '1';
      expect(pricePublishingEnabled()).toBe(true);
      // An explicit value always wins over the environment default, including
      // in a production build — otherwise the deploy-time switch could not turn
      // pricing on.
      process.env.NEXT_PUBLIC_PRICE_PUBLISHING = 'true';
      expect(pricePublishingEnabled()).toBe(true);
    } finally {
      if (previous === undefined) delete process.env.NEXT_PUBLIC_PRICE_PUBLISHING;
      else process.env.NEXT_PUBLIC_PRICE_PUBLISHING = previous;
    }
  });

  it('publishes only the free tier by default: the free plan is not a hypothesis', async () => {
    const { planPricePublishable } = await import('@/src/lib/api/publicPlansSchema');
    const previous = process.env.NEXT_PUBLIC_PRICE_PUBLISHING;

    try {
      delete process.env.NEXT_PUBLIC_PRICE_PUBLISHING;
      (process.env as Record<string, string>).NODE_ENV = 'production';
      // The production default: no owner decision recorded, so no paid row is
      // an authoritative price — while the free tier still renders, because a
      // zero is a catalogue fact rather than a hypothesis.
      expect(planPricePublishable({ key: 'free' })).toBe(true);
      expect(planPricePublishable({ key: 'pro' })).toBe(false);
      expect(planPricePublishable({ key: 'plus' })).toBe(false);

      process.env.NEXT_PUBLIC_PRICE_PUBLISHING = 'true';
      expect(planPricePublishable({ key: 'pro' })).toBe(true);
    } finally {
      (process.env as Record<string, string>).NODE_ENV = 'test';
      if (previous === undefined) delete process.env.NEXT_PUBLIC_PRICE_PUBLISHING;
      else process.env.NEXT_PUBLIC_PRICE_PUBLISHING = previous;
    }
  });
});

describe('public plan catalog shape', () => {
  it('drops rows that carry no usable price instead of rendering a fallback nominal', async () => {
    const { parsePublicPlans } = await import('@/src/lib/api/publicPlansSchema');

    expect(parsePublicPlans(null)).toEqual([]);
    expect(parsePublicPlans({})).toEqual([]);
    expect(parsePublicPlans({ data: 'nope' })).toEqual([]);
    expect(parsePublicPlans({ data: [{ displayName: 'Pro' }] })).toEqual([]);
    expect(parsePublicPlans({ data: [{ key: 'pro', priceAmount: 'Rp149.000' }] })).toEqual([]);

    const [pro] = parsePublicPlans({
      data: [
        {
          key: 'pro',
          displayName: 'Pro',
          priceAmount: 149000,
          currency: 'IDR',
          billingPeriod: 'monthly',
          tokenMonthlyLimit: 300000,
          features: ['Menggunakan GPT-5.6 Sol terbaru.'],
        },
      ],
    });

    // The catalog row passes through untouched: the frontend formats what the
    // backend publishes, it does not second-guess it.
    expect(pro).toEqual({
      key: 'pro',
      displayName: 'Pro',
      priceAmount: 149000,
      currency: 'IDR',
      billingPeriod: 'monthly',
      tokenMonthlyLimit: 300000,
      features: ['Menggunakan GPT-5.6 Sol terbaru.'],
    });
  });
});
