import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth');
  return {
    title: t('login.metaTitle'),
    description: t('login.metaDescription'),
  };
}

export default function MasukLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
