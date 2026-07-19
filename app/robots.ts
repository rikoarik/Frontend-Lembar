import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Authentication and session routes
          '/masuk',
          '/daftar',
          '/reset-sandi',
          '/lupa-sandi',
          // Invitation/token-bearing routes
          '/undangan',
          // Auth-scoped help
          '/bantuan/auth',
          // In-product workspace (handled by app/(app))
          '/app',
          '/workspace',
          '/generate',
          '/review',
          '/final',
          // Preview and draft surfaces
          '/preview',
          '/draft',
          // Operations endpoints
          '/api',
          '/ops',
          '/_next',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
