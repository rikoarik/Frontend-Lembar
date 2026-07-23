import { SchoolAdminView } from '@/src/features/school/SchoolAdminView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SchoolPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  return <SchoolAdminView section={slug.join('/')} />;
}
