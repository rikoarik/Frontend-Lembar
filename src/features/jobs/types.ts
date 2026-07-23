/** Canonical job statuses from docs/contracts/STATE-MACHINES.md */
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

export function jobStatusLabel(status: JobStatus): string {
  switch (status) {
    case 'queued':
      return 'Dalam antrean';
    case 'running':
      return 'Sedang menyiapkan soal';
    case 'retry_wait':
      return 'Menunggu coba ulang';
    case 'succeeded':
      return 'Draft siap ditinjau';
    case 'partially_succeeded':
      return 'Draft sebagian siap';
    case 'failed':
      return 'Gagal menyiapkan soal';
    case 'cancellation_requested':
      return 'Membatalkan…';
    case 'cancelled':
      return 'Dibatalkan';
    default:
      return 'Status tidak dikenal';
  }
}

export function jobStageLabel(stage?: JobStage): string | undefined {
  if (!stage) return undefined;
  switch (stage) {
    case 'preparing':
      return 'Menyiapkan konteks';
    case 'generating':
      return 'Menyusun draft soal';
    case 'validating':
      return 'Memeriksa kelengkapan';
    case 'finalizing':
      return 'Menyusun hasil tinjauan';
    default:
      return undefined;
  }
}
