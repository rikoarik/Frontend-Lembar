import { notFound } from 'next/navigation';
import { SchoolAdminView } from '@/src/features/school/SchoolAdminView';
import { isKnownAdminSection } from '@/src/features/admin/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SchoolPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const section = slug.join('/');
  // Unknown school slug must 404 instead of rendering a 200 shell (FE-VER-02 F-5).
  if (!isKnownAdminSection('/school', section)) notFound();
  return <SchoolAdminView section={section} />;
}
