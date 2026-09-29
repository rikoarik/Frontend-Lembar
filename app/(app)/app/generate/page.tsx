'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import ConfigurationCompose from '@/src/features/generate/ConfigurationCompose';

function GeneratePageFallback() {
  const t = useTranslations('generate');
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label={t('page.loadingAria')}>
      <div className="flex items-center gap-4">
        <Link href="/app" className="text-body-sm text-brand-accent hover:text-brand-accent-hover">
          {t('page.backToDashboard')}
        </Link>
      </div>
      <div className="animate-pulse rounded-md bg-brand-line h-8 w-64" />
      <div className="animate-pulse rounded-md bg-brand-line h-[600px] w-full" />
    </div>
  );
}

export default function GeneratePage() {
  const t = useTranslations('generate');
  return (
    <div className="min-w-0 flex flex-col gap-4">
      <Link
        href="/app"
        className="text-body-sm text-brand-accent hover:text-brand-accent-hover w-fit"
      >
        {t('page.backToDashboard')}
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-h1 text-brand-ink font-semibold">{t('page.title')}</h1>
        <p className="text-body-sm text-brand-ink-muted">{t('page.subtitle')}</p>
      </div>

      <Suspense fallback={<GeneratePageFallback />}>
        <ConfigurationCompose />
      </Suspense>
    </div>
  );
}
