'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Panel } from '@/app/components/ui';
import FormStatus from '@/app/(auth)/components/FormStatus';

type Account = {
  id?: string;
  displayName: string;
  email?: string;
};

export default function ProfileSettingsPage() {
  const t = useTranslations('settings.profile');
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/v1/me', { credentials: 'include', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(t('error.load'));
        const body = (await response.json()) as { data?: { account?: Account } };
        if (!body.data?.account?.displayName) throw new Error(t('error.incomplete'));
        setAccount(body.data.account);
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : t('error.generic'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // The translator identity is stable per locale; re-fetching on every render is not desired.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initials =
    account?.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'G';

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-body-xl font-semibold text-brand-ink">{t('title')}</h1>
        <p className="text-body-sm text-[#6d665d]">{t('description')}</p>
      </div>

      {error ? <FormStatus tone="alert" message={error} /> : null}

      {loading ? (
        <div className="flex items-center justify-center py-12" aria-busy="true">
          <span className="text-body-sm text-[#6d665d]">{t('loading')}</span>
        </div>
      ) : account ? (
        <>
          <div className="flex items-center gap-4 rounded-xl border border-[#e6dfd4] bg-white p-4 shadow-xs">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#a3202b] text-[18px] font-bold text-white"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-[16px] font-semibold text-[#171717]">
                {account.displayName}
              </h2>
              <p className="truncate text-body-sm text-[#6d665d]">
                {account.email || t('emailFallback')}
              </p>
            </div>
          </div>

          <Panel title={t('infoTitle')} description={t('infoDescription')}>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-label-xs uppercase tracking-wide text-brand-ink-muted">
                  {t('nameLabel')}
                </dt>
                <dd className="mt-1 text-body-sm font-medium text-brand-ink">
                  {account.displayName}
                </dd>
              </div>
              <div>
                <dt className="text-label-xs uppercase tracking-wide text-brand-ink-muted">
                  {t('emailLabel')}
                </dt>
                <dd className="mt-1 text-body-sm font-medium text-brand-ink">
                  {account.email || '—'}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel title={t('securityTitle')} description={t('securityDescription')}>
            <Link
              href="/lupa-sandi"
              className="inline-flex min-h-10 items-center rounded-md border border-brand-line px-4 text-body-sm font-medium text-brand-ink hover:bg-brand-surface"
            >
              {t('resetPassword')}
            </Link>
          </Panel>
        </>
      ) : null}
    </div>
  );
}
