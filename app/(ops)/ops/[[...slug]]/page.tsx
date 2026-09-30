import { notFound } from 'next/navigation';
import { OpsConsoleView } from '@/src/features/ops/OpsConsoleView';
import { isKnownOpsSection } from '@/src/features/admin/sections';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * BUG-25 (FE-AUD-01-2026-09-30): an unknown `/ops/<slug>` used to render the
 * console shell with HTTP 200 and a "Section <slug> / coming soon" header.
 * Unknown slugs now 404 for real, so crawlers and uptime checks see the truth.
 */
export default async function OpsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  const section = slug.join('/');
  if (!isKnownOpsSection(section)) notFound();
  return <OpsConsoleView section={section} />;
}
