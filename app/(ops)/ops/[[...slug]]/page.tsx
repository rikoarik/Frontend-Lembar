import { OpsConsoleView } from '@/src/features/ops/OpsConsoleView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function OpsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  return <OpsConsoleView section={slug.join('/')} />;
}
