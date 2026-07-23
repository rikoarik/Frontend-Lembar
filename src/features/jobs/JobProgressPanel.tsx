'use client';

import Link from 'next/link';
import { Button, Panel, StatusBadge } from '@/app/components/ui';
import type { StatusLabel } from '@/app/components/ui';
import {
  isTerminalJobStatus,
  jobStageLabel,
  jobStatusLabel,
  type JobSnapshot,
  type JobStatus,
} from '@/src/features/jobs/types';
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

function badgeLabelFor(status: JobStatus): StatusLabel {
  switch (status) {
    case 'succeeded':
    case 'partially_succeeded':
      return 'Perlu ditinjau';
    case 'failed':
      return 'Gagal';
    case 'cancelled':
      return 'Draft';
    default:
      return 'Diproses';
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
  if (loading && !job) {
    return (
      <Panel title="Menyiapkan pekerjaan" description="Memuat status generate." aria-busy="true">
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
      <Panel title="Status belum bisa dimuat" description={error.safeMessage}>
        <div className="flex flex-col gap-3">
          {error.hint ? <p className="text-body-sm text-brand-ink-muted">{error.hint}</p> : null}
          <div className="flex flex-wrap gap-3">
            {error.retryable && onRefresh ? (
              <Button onClick={onRefresh}>Coba lagi</Button>
            ) : null}
            <Link
              href="/app"
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-default text-brand-ink"
            >
              Kembali ke dashboard
            </Link>
          </div>
        </div>
      </Panel>
    );
  }

  if (!job) {
    return (
      <Panel title="Pekerjaan tidak tersedia" description="Tidak ada status generate aktif.">
        <Link
          href="/app/generate"
          className="inline-flex min-h-[var(--control-md)] w-fit items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white"
        >
          Buat lembar baru
        </Link>
      </Panel>
    );
  }

  const terminal = isTerminalJobStatus(job.status);
  const stage = jobStageLabel(job.stage);
  const percent =
    typeof job.progressPercent === 'number'
      ? Math.max(0, Math.min(100, Math.round(job.progressPercent)))
      : undefined;

  return (
    <Panel
      title="Progres generate"
      description="Anda boleh meninggalkan halaman ini; status tetap dapat dilanjutkan."
      actions={<StatusBadge label={badgeLabelFor(job.status)} />}
    >
      <div className="flex flex-col gap-4" aria-live="polite">
        <div className="flex flex-col gap-1">
          <p className="text-body-default font-semibold text-brand-ink">{jobStatusLabel(job.status)}</p>
          {stage ? <p className="text-body-sm text-brand-ink-muted">{stage}</p> : null}
          <p className="text-caption text-brand-ink-muted">ID pekerjaan: {job.jobId}</p>
        </div>

        {!terminal ? (
          <div className="flex flex-col gap-2">
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-brand-paper"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-label="Progres generate"
            >
              <div
                className={[
                  'h-full rounded-full bg-brand-accent transition-[width] duration-500',
                  percent === undefined ? 'w-1/3 animate-pulse' : '',
                ].join(' ')}
                style={percent === undefined ? undefined : { width: `${percent}%` }}
              />
            </div>
            <p className="text-body-sm text-brand-ink-muted">
              {percent === undefined
                ? 'Sedang menyiapkan soal. Progress ditampilkan secara netral.'
                : `${percent}% selesai`}
            </p>
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
            {error.safeMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {job.canCancel && !terminal ? (
            <Button
              variant="secondary"
              loading={cancelling}
              loadingLabel="Membatalkan…"
              onClick={onCancel}
              disabled={cancelling}
            >
              Batalkan
            </Button>
          ) : null}

          {job.canRetry && job.status === 'failed' && onRetry ? (
            <Button onClick={onRetry}>Coba generate lagi</Button>
          ) : null}

          {(job.status === 'succeeded' || job.status === 'partially_succeeded') && (
            <Link
              href={
                job.reviewMode === 'detail'
                  ? `/app/review/${job.assessmentId ?? job.jobId}?mode=detail`
                  : `/app/review/${job.assessmentId ?? job.jobId}`
              }
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white"
            >
              Buka tinjauan
            </Link>
          )}

          <Link
            href="/app"
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-default text-brand-ink"
          >
            Kembali ke dashboard
          </Link>

          {!terminal && onRefresh ? (
            <Button variant="quiet" onClick={onRefresh}>
              Muat ulang status
            </Button>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
