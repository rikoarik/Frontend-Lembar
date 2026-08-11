import type { Metadata } from 'next';
import { fetchMarketingPage, type MarketingSlug } from './fetchMarketingPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id';

type MarketingMetadataFallback = {
  title: string;
  description: string;
  canonical: string;
};

/**
 * Builds metadata from the published, schema-validated CMS document while
 * preserving a static page-specific fallback when the public API is down.
 */
export async function marketingMetadata(
  slug: MarketingSlug,
  fallback: MarketingMetadataFallback,
): Promise<Metadata> {
  const page = await fetchMarketingPage(slug);
  const title = page?.seo.title || fallback.title;
  const description = page?.seo.description || fallback.description;
  const noIndex = page?.seo.noIndex ?? false;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: { canonical: fallback.canonical },
    openGraph: {
      title,
      description,
      url: fallback.canonical,
      siteName: 'lembar',
      locale: 'id_ID',
      type: 'website',
      images: ['/og-image.svg'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.svg'],
    },
    robots: { index: !noIndex, follow: !noIndex },
  };
}
