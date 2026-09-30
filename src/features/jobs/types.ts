/** Canonical frontend statuses normalized by the jobs BFF. */
import type { Translate } from '@/src/i18n/types';

export type JobStatus =
  | 'queued'
  | 'running'
  | 'retry_wait'
  | 'succeeded'
  | 'partially_succeeded'
  | 'failed'
  | 'cancellation_requested'
  | 'cancelled';

/** Presentation stage — not a status. */

export type JobStage = 'preparing' | 'generating' | 'validating' | 'finalizing';

export type JobSnapshot = {
  jobId: string;
  assessmentId?: string;
  compositionId?: string;
  status: JobStatus;
  stage?: JobStage;
  /** Neutral progress 0–100. Never fake precision; optional. */
  progressPercent?: number;
  createdAt: string;
  updatedAt: string;
  canCancel: boolean;
  canRetry: boolean;
  reviewMode?: 'quick' | 'detail';
  error?: {
    code: string;
    safeMessage: string;
    retryable: boolean;
  };
};

/**
 * After a terminal-success status without an `assessmentId`, the FE keeps
 * polling for the backend to attach one. If none arrives within this window,
 * the hook surfaces a blocking `assessment-id-timeout` error and the panel
 * stops building any review link from the jobId.
 */
export const ASSESSMENT_HANDOFF_TIMEOUT_MS = 5_000;
export const ASSESSMENT_HANDOFF_TIMEOUT_CODE = 'ASSESSMENT_HANDOFF_TIMEOUT';

export type GenerateSubmitResult = {
  status: 'accepted';
  jobId: string;
  assessmentId?: string;
  compositionId?: string;
};

export function isTerminalJobStatus(status: JobStatus): boolean {
  return (
    status === 'succeeded' ||
    status === 'partially_succeeded' ||
    status === 'failed' ||
    status === 'cancelled'
  );
}

export function jobStatusLabel(status: JobStatus, t: Translate): string {
  switch (status) {
    case 'queued':
      return t('status.queued');
    case 'running':
      return t('status.running');
    case 'retry_wait':
      return t('status.retry_wait');
    case 'succeeded':
      return t('status.succeeded');
    case 'partially_succeeded':
      return t('status.partially_succeeded');
    case 'failed':
      return t('status.failed');
    case 'cancellation_requested':
      return t('status.cancellation_requested');
    case 'cancelled':
      return t('status.cancelled');
    default:
      return t('status.unknown');
  }
}

export function jobStageLabel(stage: JobStage | undefined, t: Translate): string | undefined {
  if (!stage) return undefined;
  switch (stage) {
    case 'preparing':
      return t('stage.preparing');
    case 'generating':
      return t('stage.generating');
    case 'validating':
      return t('stage.validating');
    case 'finalizing':
      return t('stage.finalizing');
    default:
      return undefined;
  }
}

export function formatJobTiming(
  job: Pick<JobSnapshot, 'createdAt' | 'progressPercent'>,
  t: Translate,
  now = Date.now(),
): { elapsed?: string; eta: string } {
  const createdAt = Date.parse(job.createdAt);
  const elapsedMinutes = Number.isFinite(createdAt)
    ? Math.max(0, Math.floor((now - createdAt) / 60_000))
    : undefined;
  const elapsed =
    elapsedMinutes === undefined
      ? undefined
      : elapsedMinutes === 0
        ? t('timing.justStarted')
        : t('timing.running', { minutes: elapsedMinutes });
  const progress = job.progressPercent;
  if (progress === undefined || progress <= 0 || progress >= 100 || elapsedMinutes === undefined) {
    return { elapsed, eta: t('timing.typicalEta') };
  }
  if (progress >= 95) return { elapsed, eta: t('timing.almostDone') };

  const estimate = (elapsedMinutes * (100 - progress)) / progress;
  if (!Number.isFinite(estimate) || estimate < 1) return { elapsed, eta: t('timing.almostDone') };
  const low = Math.max(1, Math.floor(estimate * 0.75));
  const high = Math.max(low + 1, Math.ceil(estimate * 1.5));
  return { elapsed, eta: t('timing.remainingEta', { low, high }) };
}
