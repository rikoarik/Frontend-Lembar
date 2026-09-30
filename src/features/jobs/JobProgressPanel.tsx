import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button, Panel, StatusBadge } from '@/app/components/ui';
import type { StatusLabel } from '@/app/components/ui';
import {
  isTerminalJobStatus,
  formatJobTiming,
  jobStageLabel,
  jobStatusLabel,
  type JobSnapshot,
  type JobStatus,
} from '@/src/features/jobs/types';
import type { Translate } from '@/src/i18n/types';
import type { JobError } from '@/src/services/jobs/jobErrors';

type JobProgressPanelProps = {
  job?: JobSnapshot;
  loading: boolean;
  error?: JobError;
  cancelling?: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
  onRefresh?: () => void;
};

function badgeLabelFor(status: JobStatus, t: Translate): StatusLabel {
  switch (status) {
    case 'succeeded':
    case 'partially_succeeded':
      return t('badge.needsReview') as StatusLabel;
    case 'failed':
      return t('badge.failed') as StatusLabel;
    case 'cancelled':
      return t('badge.draft') as StatusLabel;
    default:
      return t('badge.processing') as StatusLabel;
  }
}

export function JobProgressPanel({
  job,
  loading,
  error,
  cancelling,
  onCancel,
  onRetry,
  onRefresh,
}: JobProgressPanelProps) {
  const t = useTranslations('jobs');

  if (loading && !job) {
    return (
      <Panel
        title={t('panel.preparing.title')}
        description={t('panel.preparing.desc')}
        aria-busy="true"
      >
        <div className="space-y-3 animate-pulse" aria-hidden="true">
          <div className="h-4 w-40 rounded bg-brand-paper" />
          <div className="h-3 w-full rounded bg-brand-paper" />
          <div className="h-3 w-2/3 rounded bg-brand-paper" />
        </div>
      </Panel>
    );
  }

  if (error && !job) {
    return (
      <Panel title={t('panel.unavailable.title')} description={error.safeMessage}>
        <div className="flex flex-col gap-3">
          {error.hint ? <p className="text-body-sm text-brand-ink-muted">{error.hint}</p> : null}
          <div className="flex flex-wrap gap-3">
            {error.retryable && onRefresh ? (
              <Button onClick={onRefresh}>{t('actions.retry')}</Button>
            ) : null}
            <Link
              href="/app"
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-default text-brand-ink"
            >
              {t('actions.backToDashboard')}
            </Link>
          </div>
        </div>
      </Panel>
    );
  }

  if (!job) {
    return (
      <Panel title={t('panel.noJob.title')} description={t('panel.noJob.desc')}>
        <Link
          href="/app/generate"
          className="inline-flex min-h-[var(--control-md)] w-fit items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white"
        >
          {t('actions.newWorksheet')}
        </Link>
      </Panel>
    );
  }

  const terminal = isTerminalJobStatus(job.status);
  const stage = jobStageLabel(job.stage, t);
  const percent =
    typeof job.progressPercent === 'number'
      ? Math.max(0, Math.min(100, Math.round(job.progressPercent)))
      : undefined;
  const timing = formatJobTiming(job, t);

  return (
    <Panel
      title={t('panel.progress.title')}
      description={t('panel.progress.desc')}
      actions={<StatusBadge label={badgeLabelFor(job.status, t)} />}
    >
      <div className="flex flex-col gap-4" aria-live="polite">
        <div className="flex flex-col gap-1">
          <p className="text-body-default font-semibold text-brand-ink">
            {jobStatusLabel(job.status, t)}
          </p>
          {stage ? <p className="text-body-sm text-brand-ink-muted">{stage}</p> : null}
        </div>

        {!terminal ? (
          <div className="flex flex-col gap-2">
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-brand-paper"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-label={t('actions.progressLabel')}
            >
              <div
                className={[
                  'h-full rounded-full bg-sky-600 transition-[width] duration-500',
                  percent === undefined ? 'w-1/3 animate-pulse' : '',
                ].join(' ')}
                style={percent === undefined ? undefined : { width: `${percent}%` }}
              />
            </div>
            <p className="text-body-sm text-brand-ink-muted">
              {percent === undefined
                ? t('actions.processing')
                : t('actions.percentDone', { percent })}
            </p>
            {timing.elapsed ? (
              <p className="text-body-sm text-brand-ink-muted">{timing.elapsed}</p>
            ) : null}
            <p className="text-body-sm text-brand-ink-muted">{timing.eta}</p>
          </div>
        ) : null}

        {job.error ? (
          <div
            role="alert"
            className="rounded-md border border-brand-danger/30 bg-brand-danger-soft px-3 py-3"
          >
            <p className="text-body-sm text-brand-danger">{job.error.safeMessage}</p>
          </div>
        ) : null}

        {error ? (
          <p className="text-body-sm text-brand-danger" role="status">
            {t('staleStatus')} {error.safeMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {job.canCancel && !terminal ? (
            <Button
              variant="secondary"
              loading={cancelling}
              loadingLabel={t('actions.cancelling')}
              onClick={onCancel}
              disabled={cancelling}
            >
              {t('actions.cancel')}
            </Button>
          ) : null}

          {job.canRetry && job.status === 'failed' && onRetry ? (
            <Button onClick={onRetry}>{t('actions.retryGenerate')}</Button>
          ) : null}

          {(job.status === 'succeeded' || job.status === 'partially_succeeded') &&
          job.assessmentId ? (
            <Link
              href={
                job.reviewMode === 'detail'
                  ? `/app/review/${job.assessmentId}?mode=detail`
                  : `/app/review/${job.assessmentId}`
              }
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white"
            >
              {t('actions.openReview')}
            </Link>
          ) : null}

          {(job.status === 'succeeded' || job.status === 'partially_succeeded') &&
          !job.assessmentId ? (
            <p
              role="status"
              data-testid="assessment-handoff-pending"
              className="text-body-sm text-brand-ink-muted"
            >
              {t('handoffTimeout')}
            </p>
          ) : null}

          <Link
            href="/app"
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-default text-brand-ink"
          >
            {t('actions.backToDashboard')}
          </Link>

          {!terminal && onRefresh ? (
            <Button variant="quiet" onClick={onRefresh}>
              {t('actions.refresh')}
            </Button>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
