/**
 * Shared plan catalog client.
 * Public endpoint: GET /v1/public/plans (unauthenticated, server-side only)
 * Auth endpoint:   GET /v1/me/plan      (via BFF, credentials:include)
 *
 * Uses plain fetch — no extra dependency.
 */

import type { NumberFormat } from '@/src/i18n/formats';
import {
  parsePublicPlans,
  pricePublishingEnabled,
  publicPlansUrl,
  PUBLIC_PLANS_PATH,
  type PublicPlan,
} from './publicPlansSchema';

// ── Types ──────────────────────────────────────────────────────────────────

export type { PublicPlan, PublicPlansResponse } from './publicPlansSchema';

/** Shape returned by GET /v1/me/plan .data — enriched with usage */
export type MePlanData = {
  workspaceId: string;
  plan: string;
  entitlementState?: 'free' | 'active' | 'grace' | 'blocked' | 'expired';
  tokenUsedThisMonth: number;
  tokenMonthlyLimit: number | null;
  billingCycleStartedAt: string;
  entitlementSource?: 'free' | 'paid' | 'trial';
  catalog: PublicPlan;
  trial?: {
    eligible: boolean;
    claimed: boolean;
    activeOnThisDevice: boolean;
    startsAt: string | null;
    endsAt: string | null;
    remainingDays: number | null;
  };
};

/** Shape for GET/PATCH /v1/admin/plans — includes revision for If-Match */
export type AdminPlan = PublicPlan & {
  active: boolean;
  revision: number;
  updatedAt?: string;
  updatedBy?: string;
};

// ── Format helpers ──────────────────────────────────────────────────────────

/** Rp49.000 / bulan — `format` comes from the locale-aware next-intl formatter. */
export function formatPrice(plan: PublicPlan, format: NumberFormat): string {
  if (plan.priceAmount === 0) return 'Gratis';
  const rp = format(plan.priceAmount, {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  });
  if (plan.billingPeriod === 'monthly') return `${rp} / bulan`;
  if (plan.billingPeriod === 'yearly') return `${rp} / tahun`;
  return rp;
}

/** "60.000 token / bulan" or "Tidak terbatas" */
export function formatTokenLimit(limit: number | null, format: NumberFormat): string {
  if (limit === null) return 'Tidak terbatas';
  return `${format(limit)} token / bulan`;
}

// ── Server-side public plans fetcher (called from RSC / page.tsx) ───────────
// ponytail: no cache strategy here; add revalidate when pricing changes become common

export type FetchPublicPlansOptions = {
  /** Server-only override of the app origin. The browser never calls this. */
  baseUrl?: string;
  /** Injectable for tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
};

/**
 * Reads the live plan catalog through the app's own origin.
 *
 * The catalog must travel server → BFF, never browser → backend: the public API
 * host serves no CORS headers, so a browser fetch of it fails and the plan grid
 * renders empty. That leaves the absolute-URL requirement in `publicPlansUrl`,
 * which is documented there.
 *
 * Rows are validated (see publicPlansSchema) rather than cast: a malformed row
 * is dropped, and callers render their "catalog unavailable" copy instead of a
 * fabricated price.
 */
export async function fetchPublicPlans(opts?: FetchPublicPlansOptions): Promise<PublicPlan[]> {
  // No owner decision on pricing (D-009) means no catalog to publish: callers
  // render their "catalog unavailable" copy instead of a nominal that was never
  // decided. Returning here rather than filtering keeps the unpriced state
  // indistinguishable from "catalog is down" — which is the honest description.
  if (!pricePublishingEnabled()) return [];

  const doFetch = opts?.fetchImpl ?? fetch;
  try {
    const res = await doFetch(publicPlansUrl(opts?.baseUrl));
    if (!res.ok) return [];
    return parsePublicPlans(await res.json());
  } catch {
    return [];
  }
}
