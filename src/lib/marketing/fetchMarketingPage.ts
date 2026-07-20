import type { components } from '@/src/lib/api/schema';

export type MarketingPageDocument = components['schemas']['MarketingPageDocument'];
export type MarketingSlug = MarketingPageDocument['slug'];

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api';
const TIMEOUT_MS = 3000;

/**
 * Fetches a published marketing page document from the CMS.
 * Returns null on any error, timeout, or 404 — callers must render seed fallback.
 * Supports ETag-based conditional requests via Next.js fetch cache tags.
 */
export async function fetchMarketingPage(
  slug: MarketingSlug,
): Promise<MarketingPageDocument | null> {
  const url = `${API_BASE}/v1/public/marketing/pages/${slug}?locale=id-ID`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 300, tags: [`marketing-page-${slug}`] },
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timer);

    if (!res.ok) return null;

    const json = (await res.json()) as { data: MarketingPageDocument };
    return json.data ?? null;
  } catch {
    return null;
  }
}
