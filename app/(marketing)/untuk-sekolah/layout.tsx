import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { marketingMetadata } from '@/src/lib/marketing/marketingMetadata';

// Per-route metadata lives in a sibling server layout so it can stay a server
// module regardless of how page.tsx is rendered. The page's JSX is unchanged.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketing.school.meta');
  return marketingMetadata('untuk-sekolah', {
    title: t('title'),
    description: t('description'),
    canonical: '/untuk-sekolah',
  });
}

export default function UntukSekolahLayout({ children }: { children: ReactNode }) {
  return children;
}
