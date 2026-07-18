import type { MetadataRoute } from 'next';

// Public marketing routes only. Auth, app, ops, and token-bearing routes
// are intentionally excluded. lastModified uses build time; update when a
// canonical content change ships.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const publicRoutes = [
    '',
    '/untuk-sekolah',
    '/harga',
    '/faq',
    '/bantuan',
    '/kontak',
    '/tentang',
    '/privasi',
    '/syarat',
    '/keamanan-data',
  ];

  return publicRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
