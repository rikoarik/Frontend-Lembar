'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Panel } from '@/app/components/ui';
import type { MePlanData } from '@/src/lib/api/plans';
import { DATE_LONG } from '@/src/i18n/formats';
import { useLocaleFormat } from '@/src/i18n/useLocaleFormat';

type ClaimState = 'loading-link' | 'ready' | 'submitting' | 'success' | 'error';

export default function TrialClaimConfirmationPage() {
  const t = useTranslations('subscription.trial');
  const { date } = useLocaleFormat();
  const [claimToken, setClaimToken] = useState('');
  const [state, setState] = useState<ClaimState>('loading-link');
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<MePlanData | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const token = params.get('token') ?? '';
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      if (token.length < 32) {
        setError(t('error.invalidLink'));
        setState('error');
        return;
      }
      setClaimToken(token);
      setState('ready');
    }, 0);
    return () => window.clearTimeout(timer);
    // The translator identity is stable per locale; this link is parsed exactly once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClaim = async () => {
    if (state !== 'ready' || !claimToken) return;
    setState('submitting');
    setError('');
    try {
      const response = await fetch('/v1/me/plan/trial/claim', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimToken }),
      });
      const json = (await response.json()) as {
        data?: MePlanData;
        error?: { message?: string };
      };
      if (!response.ok || !json.data) {
        setError(json.error?.message ?? t('error.claimFailed'));
        setState('error');
        return;
      }
      setPlan(json.data);
      setClaimToken('');
      setState('success');
    } catch {
      setError(t('error.offline'));
      setState('error');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-body-xs font-semibold uppercase tracking-[0.12em] text-brand-accent">
          {t('eyebrow')}
        </p>
        <h1 className="text-body-xl font-semibold text-brand-ink">{t('title')}</h1>
        <p className="text-body-sm text-[#6d665d]">{t('description')}</p>
      </div>

      <Panel>
        <div className="flex flex-col items-start gap-4">
          {state === 'loading-link' && (
            <p className="text-body-sm text-[#6d665d]" role="status">
              {t('checking')}
            </p>
          )}

          {state === 'ready' && (
            <>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-body-sm text-amber-900">
                {t('warning')}
              </div>
              <Button onClick={handleClaim}>{t('claim')}</Button>
              <Link
                href="/app/pengaturan/langganan"
                className="text-body-sm font-medium text-brand-accent underline underline-offset-4"
              >
                {t('cancel')}
              </Link>
            </>
          )}

          {state === 'submitting' && (
            <Button loading loadingLabel={t('claimBusy')}>
              {t('claim')}
            </Button>
          )}

          {state === 'success' && (
            <div className="flex flex-col items-start gap-3" role="status">
              <p className="font-semibold text-green-800">{t('success')}</p>
              {plan?.trial?.endsAt && (
                <p className="text-body-sm text-[#6d665d]">
                  {t('successUntil', { date: date(plan.trial.endsAt, DATE_LONG) })}
                </p>
              )}
              <Link
                href="/app/pengaturan/langganan"
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white hover:bg-brand-accent-hover"
              >
                {t('viewPlan')}
              </Link>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-start gap-3">
              <p className="text-body-sm text-red-700" role="alert">
                {error}
              </p>
              <Link
                href="/app/pengaturan/langganan"
                className="text-body-sm font-medium text-brand-accent underline underline-offset-4"
              >
                {t('backToPlan')}
              </Link>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
