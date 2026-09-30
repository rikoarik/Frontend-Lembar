import { notFound } from 'next/navigation';
import { OpsConsoleView } from '@/src/features/ops/OpsConsoleView';
import { isKnownAdminSection } from '@/src/features/admin/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function OpsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const section = slug.join('/');
  // Unknown ops slug must 404 instead of rendering a 200 "coming soon" shell (FE-VER-02 F-5).
  if (!isKnownAdminSection('/ops', section)) notFound();
  return <OpsConsoleView section={section} />;
}
