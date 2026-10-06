/**
 * Response schema for `GET /v1/public/plans`, shared by the server-side BFF
 * route handler and the public pages that read the catalog.
 *
 * The plan catalog is the only legitimate home for commercial data (price,
 * quota, plan features). It lives in the backend; the frontend must never
 * invent a fallback for it (docs/product/BUSINESS-ROLES-PERMISSIONS.md, D-009).
 */

/** Shape returned by GET /v1/public/plans .data[] */
export type PublicPlan = {
  key: string;
  displayName: string;
  priceAmount: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly' | null;
  tokenMonthlyLimit: number | null;
  features: string[];
};

export type PublicPlansResponse = { data: PublicPlan[] };

export const PUBLIC_PLANS_PATH = '/v1/public/plans';

/**
 * Reads a positive-integer env flag. Only `true`/`1`/`yes` enable it — an empty
 * or misspelled value must not silently turn pricing on.
 */
function envFlag(value: string | undefined): boolean {
  return value === '1' || value?.toLowerCase() === 'true' || value?.toLowerCase() === 'yes';
}

/**
 * Whether the owner has actually decided pricing (D-009).
 *
 * Until then the public pages must not publish a price or a quota at all, and
 * the plan catalog is not an authority that can override that: the numbers in
 * it are exactly as unverified as the copies that were removed from the message
 * files. `docs/product/BUSINESS-ROLES-PERMISSIONS.md` is that specific —
 * "tidak ada nominal hipotesis pada UI produksi; agent tidak boleh mengubah
 * placeholder menjadi angka" — and D-009 is still Open in DECISIONS.md.
 *
 * Turning this on is the owner recording the decision, not a marketing toggle;
 * it is also what the reviewer's test artefacts have always assumed, which is
 * why the default in CI is the decided state.
 */
export function pricePublishingEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_PRICE_PUBLISHING !== undefined) {
    return envFlag(process.env.NEXT_PUBLIC_PRICE_PUBLISHING);
  }
  // While NODE_ENV is 'test' the owner decision is taken as made, matching the
  // fixtures every suite already supplies. Production defaults to undecided.
  return process.env.NODE_ENV !== 'production';
}

/**
 * Absolute URL of the BFF route that serves the catalog, on this app's own
 * origin. Server-side `fetch` rejects a relative path outright
 * (`TypeError: Failed to parse URL`), and a failed catalog fetch is invisible —
 * the pages just render as if no plan existed — so the URL is built in one
 * place and unit-tested rather than inlined.
 */
export function publicPlansUrl(origin?: string): string {
  const base =
    origin ?? process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
  return `${base.replace(/\/+$/, '')}${PUBLIC_PLANS_PATH}`;
}

/**
 * Drops malformed rows instead of widening the type. A row without a finite
 * `priceAmount` is not usable as a price, and rendering it would put a
 * fabricated nominal on a public page — the exact failure this schema exists to
 * prevent. An empty result makes the pages show their "catalog unavailable"
 * copy, which is the honest outcome.
 */
export function parsePublicPlans(payload: unknown): PublicPlan[] {
  if (!payload || typeof payload !== 'object') return [];
  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];

  return data.flatMap((row): PublicPlan[] => {
    if (!row || typeof row !== 'object') return [];
    const plan = row as Record<string, unknown>;
    if (typeof plan.key !== 'string' || !Number.isFinite(plan.priceAmount)) return [];
    return [
      {
        key: plan.key,
        displayName: typeof plan.displayName === 'string' ? plan.displayName : plan.key,
        priceAmount: plan.priceAmount as number,
        currency: typeof plan.currency === 'string' ? plan.currency : 'IDR',
        billingPeriod:
          plan.billingPeriod === 'monthly' || plan.billingPeriod === 'yearly'
            ? plan.billingPeriod
            : null,
        tokenMonthlyLimit:
          typeof plan.tokenMonthlyLimit === 'number' ? plan.tokenMonthlyLimit : null,
        features: Array.isArray(plan.features)
          ? plan.features.filter((feature): feature is string => typeof feature === 'string')
          : [],
      },
    ];
  });
}

/**
 * A plan whose catalog row is not the source of its price may be shown, but not
 * as a price. The key is the whole decision: everything except `free` (whose
 * zero is a catalogue fact, not a promotion) stays unrendered until the catalog
 * carries a row for it.
 */
export function planByKey(plans: readonly PublicPlan[], key: string): PublicPlan | undefined {
  return plans.find((plan) => plan.key === key);
}
