'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button, Panel, StatusBadge } from '@/app/components/ui';
import type { StatusLabel } from '@/app/components/ui';
import { assessmentService } from '@/src/services/assessments/assessmentService';
import type { AssessmentDetail } from '@/src/features/review/types';

type AssessmentResult = Awaited<ReturnType<typeof assessmentService.get>>;

export function FinalizeView({ assessmentId }: { assessmentId: string }) {
  const t = useTranslations('review');
  const router = useRouter();
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const applyLoadResult = useCallback((result: AssessmentResult) => {
    if (!result.ok) {
      setError(result.error.safeMessage);
      setAssessment(null);
      setLoading(false);
      return;
    }
    setAssessment(result.value);
    setError(null);
    setLoading(false);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    applyLoadResult(await assessmentService.get(assessmentId));
  }, [applyLoadResult, assessmentId]);

  useEffect(() => {
    let cancelled = false;

    void assessmentService.get(assessmentId).then((result) => {
      if (!cancelled) applyLoadResult(result);
    });

    return () => {
      cancelled = true;
    };
  }, [applyLoadResult, assessmentId]);

  const onFinalize = async () => {
    setBusy(true);
    setMessage('');
    const result = await assessmentService.finalize(assessmentId, ack);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error.safeMessage);
      if (result.error.blockers?.length) {
        setMessage(`${result.error.safeMessage} ${result.error.blockers.join(' ')}`);
      }
      await load();
      return;
    }
    router.push(`/app/output/${assessmentId}`);
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-md bg-brand-line" aria-busy="true" />;
  }

  if (error || !assessment) {
    return (
      <Panel title={t('finalize.unavailable')} description={error ?? t('finalize.notFound')}>
        <Button onClick={() => void load()}>{t('finalize.retry')}</Button>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">{t('finalize.title')}</h1>
        <p className="text-body-sm text-brand-ink-muted">{t('finalize.subtitle')}</p>
      </div>

      <Panel
        title={assessment.title}
        description={`${assessment.subject} · ${assessment.gradeLabel}`}
        actions={
          <StatusBadge
            label={
              (assessment.lifecycle === 'final'
                ? t('badge.final')
                : t('badge.review')) as StatusLabel
            }
          />
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
            <div className="text-caption text-brand-ink-muted">{t('finalize.reviewed')}</div>
            <div className="text-h3 font-semibold">
              {assessment.reviewedCount}/{assessment.questionCount}
            </div>
          </div>
          <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
            <div className="text-caption text-brand-ink-muted">{t('finalize.warnings')}</div>
            <div className="text-h3 font-semibold">{assessment.warningCount}</div>
          </div>
          <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
            <div className="text-caption text-brand-ink-muted">{t('finalize.status')}</div>
            <div className="text-h3 font-semibold">{assessment.lifecycle}</div>
          </div>
        </div>
      </Panel>

      {assessment.finalizeBlockers.length > 0 ? (
        <Panel title={t('finalize.blockersTitle')} description={t('finalize.blockersDesc')}>
          <ul className="list-disc space-y-1 pl-5 text-body-default text-brand-ink">
            {assessment.finalizeBlockers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-3">
            <Link
              href={`/app/review/${assessmentId}`}
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
            >
              {t('finalize.backToReview')}
            </Link>
          </div>
        </Panel>
      ) : (
        <Panel title={t('finalize.confirmTitle')} description={t('finalize.confirmDesc')}>
          <label className="flex items-start gap-3 text-body-default">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={ack}
              disabled={assessment.lifecycle === 'final' || busy}
              onChange={(e) => setAck(e.target.checked)}
            />
            <span>{assessment.teacherResponsibilityNote}</span>
          </label>
          {message ? (
            <p className="mt-3 text-body-sm text-brand-danger" role="alert">
              {message}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              disabled={!ack || busy || assessment.lifecycle === 'final'}
              loading={busy}
              loadingLabel={t('finalize.finalizing')}
              onClick={() => void onFinalize()}
            >
              {t('finalize.finalizeButton')}
            </Button>
            <Link
              href={`/app/review/${assessmentId}`}
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
            >
              {t('finalize.back')}
            </Link>
            {assessment.lifecycle === 'final' ? (
              <Link
                href={`/app/output/${assessmentId}`}
                className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-white"
              >
                {t('finalize.openOutput')}
              </Link>
            ) : null}
          </div>
        </Panel>
      )}
    </div>
  );
}
