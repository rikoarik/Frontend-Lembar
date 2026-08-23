/**
 * Shared plan catalog client.
 * Public endpoint: GET /v1/public/plans (unauthenticated, server-side only)
 * Auth endpoint:   GET /v1/me/plan      (via BFF, credentials:include)
 *
 * Uses plain fetch — no extra dependency.
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type PlanKey = 'free' | 'pro' | (string & {});

/** Shape returned by GET /v1/public/plans .data[] */
export type PublicPlan = {
  key: PlanKey;
  displayName: string;
  priceAmount: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly' | null;
  tokenMonthlyLimit: number | null;
  features: string[];
};

/** Shape returned by GET /v1/me/plan .data — enriched with usage */
export type MePlanData = {
  workspaceId: string;
  plan: PlanKey;
  entitlementState?: 'free' | 'active' | 'grace' | 'blocked' | 'expired';
  tokenUsedThisMonth: number;
  tokenMonthlyLimit: number | null;
  billingCycleStartedAt: string;
  entitlementSource?: 'free' | 'paid' | 'trial';
  catalog: {
    key: PlanKey;
    displayName: string;
    priceAmount: number;
    currency: string;
    billingPeriod: 'monthly' | 'yearly' | null;
    tokenMonthlyLimit: number | null;
    features: string[];
  };
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

/** Rp49.000 / bulan */
export function formatPrice(plan: PublicPlan): string {
  if (plan.priceAmount === 0) return 'Gratis';
  const rp = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(plan.priceAmount);
  if (plan.billingPeriod === 'monthly') return `${rp} / bulan`;
  if (plan.billingPeriod === 'yearly') return `${rp} / tahun`;
  return rp;
}

/** "60.000 token / bulan" or "Tidak terbatas" */
export function formatTokenLimit(limit: number | null): string {
  if (limit === null) return 'Tidak terbatas';
  return `${new Intl.NumberFormat('id-ID').format(limit)} token / bulan`;
}

// ── Server-side public plans fetcher (called from RSC / page.tsx) ───────────
// ponytail: no cache strategy here; add revalidate when pricing changes become common

export type FetchPublicPlansOptions = {
  baseUrl?: string;
};

export async function fetchPublicPlans(
  opts?: FetchPublicPlansOptions,
): Promise<PublicPlan[]> {
  const base =
    opts?.baseUrl ??
    process.env.BACKEND_API_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000';
  try {
    const res = await fetch(`${base}/v1/public/plans`);
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: unknown };
    const arr = Array.isArray(json.data) ? (json.data as PublicPlan[]) : null;
    if (!arr || arr.length === 0) return [];
    return arr;
  } catch {
    return [];
  }
}
