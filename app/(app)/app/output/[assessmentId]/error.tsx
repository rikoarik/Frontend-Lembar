'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/app/components/ui';

export default function OutputRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('output');

  useEffect(() => {
    console.error('Output route failed', error);
  }, [error]);

  return (
    <main className="grid min-h-[24rem] place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-brand-line bg-white p-6 text-center shadow-sm">
        <span className="material-symbols-outlined text-3xl text-brand-danger" aria-hidden="true">
          error
        </span>
        <h1 className="mt-3 text-h3 font-semibold text-brand-ink">{t('errorRoute.title')}</h1>
        <p className="mt-2 text-body-sm leading-relaxed text-brand-ink-muted">
          {t('errorRoute.body')}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button onClick={reset}>{t('errorRoute.retry')}</Button>
          <Link
            href="/app/riwayat"
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-sm font-medium text-brand-ink"
          >
            {t('errorRoute.backToHistory')}
          </Link>
        </div>
      </section>
    </main>
  );
}
