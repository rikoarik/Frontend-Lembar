import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.lembar.web.id';

const PRIVATE_PATHS = [
  // Authentication and session routes
  '/masuk',
  '/daftar',
  '/reset-sandi',
  '/lupa-sandi',
  // Invitation/token-bearing routes
  '/undangan',
  '/trial/claim',
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
  // Operations and BFF endpoints
  '/api',
  '/v1',
  '/ops',
  '/_next',
];

const SEARCH_AND_AI_CRAWLERS = [
  'Googlebot',
  'Bingbot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'Google-Extended',
  'PerplexityBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: SEARCH_AND_AI_CRAWLERS,
        allow: ['/', '/generator-soal-ai', '/llms.txt', '/llms-full.txt'],
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
