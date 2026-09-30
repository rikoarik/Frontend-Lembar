import { notFound } from 'next/navigation';
import { SchoolAdminView } from '@/src/features/school/SchoolAdminView';
import { isKnownSchoolSection } from '@/src/features/admin/sections';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * BUG-25 (FE-AUD-01-2026-09-30): an unknown `/school/<slug>` used to render the
 * console shell with HTTP 200 and the text "Halaman tidak ditemukan." — a soft
 * 404. Unknown slugs now 404 for real.
 */
export default async function SchoolPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const section = slug.join('/');
  if (!isKnownSchoolSection(section)) notFound();
  return <SchoolAdminView section={section} />;
}
