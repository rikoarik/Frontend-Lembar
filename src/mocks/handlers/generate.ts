import { HttpResponse, delay, http } from 'msw';
import type { JobSnapshot, JobStage, JobStatus } from '@/src/features/jobs/types';

type MockJob = JobSnapshot & {
  startedAtMs: number;
  forceFail?: boolean;
};

const jobs = new Map<string, MockJob>();
const idempotencyToJob = new Map<string, string>();

function nowIso() {
  return new Date().toISOString();
}

function ok<T>(data: T, status = 200) {
  return HttpResponse.json({ data }, { status });
}

function error(code: string, message: string, status: number) {
  return HttpResponse.json(
    { error: { code, message, retryable: status >= 500 || status === 429 } },
    { status },
  );
}

function deriveRuntime(job: MockJob): JobSnapshot {
  if (
    job.status === 'succeeded' ||
    job.status === 'partially_succeeded' ||
    job.status === 'failed' ||
    job.status === 'cancelled' ||
    job.status === 'cancellation_requested'
  ) {
    return job;
  }

  const elapsed = Date.now() - job.startedAtMs;
  let status: JobStatus = job.status;
  let stage: JobStage | undefined = job.stage;
  let progressPercent = job.progressPercent;
  let canCancel = true;
  let canRetry = false;
  let errorInfo = job.error;

  if (job.forceFail && elapsed > 2_500) {
    status = 'failed';
    stage = 'generating';
    progressPercent = 42;
    canCancel = false;
    canRetry = true;
    errorInfo = {
      code: 'GENERATION_FAILED',
      safeMessage: 'Gagal menyiapkan soal. Coba generate lagi.',
      retryable: true,
    };
  } else if (elapsed < 800) {
    status = 'queued';
    stage = 'preparing';
    progressPercent = 8;
  } else if (elapsed < 2_200) {
    status = 'running';
    stage = 'preparing';
    progressPercent = 28;
  } else if (elapsed < 4_000) {
    status = 'running';
    stage = 'generating';
    progressPercent = 58;
  } else if (elapsed < 5_500) {
    status = 'running';
    stage = 'validating';
    progressPercent = 82;
  } else {
    status = 'succeeded';
    stage = 'finalizing';
    progressPercent = 100;
    canCancel = false;
    canRetry = false;
  }

  const next: MockJob = {
    ...job,
    status,
    stage,
    progressPercent,
    canCancel,
    canRetry,
    error: errorInfo,
    updatedAt: nowIso(),
    assessmentId: status === 'succeeded' ? job.assessmentId ?? `asm_${job.jobId}` : job.assessmentId,
    compositionId: job.compositionId,
  };
  jobs.set(job.jobId, next);
  return next;
}

function createJob(reviewMode: 'quick' | 'detail' = 'quick', forceFail = false): MockJob {
  const jobId = `job_${Math.random().toString(36).slice(2, 10)}`;
  const job: MockJob = {
    jobId,
    status: 'queued',
    stage: 'preparing',
    progressPercent: 5,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    canCancel: true,
    canRetry: false,
    reviewMode,
    compositionId: `comp_${jobId}`,
    startedAtMs: Date.now(),
    forceFail,
  };
  jobs.set(jobId, job);
  return job;
}

export const generateHandlers = [
  http.post(/\/v1\/generate\/submit\/?$/, async ({ request }) => {
    await delay(250);
    const idem = request.headers.get('Idempotency-Key') ?? '';
    if (idem && idempotencyToJob.has(idem)) {
      const existingId = idempotencyToJob.get(idem)!;
      const existing = jobs.get(existingId);
      if (existing) {
        return ok({
          status: 'accepted' as const,
          jobId: existing.jobId,
          assessmentId: existing.assessmentId,
          compositionId: existing.compositionId,
        });
      }
    }

    let reviewMode: 'quick' | 'detail' = 'quick';
    let forceFail = false;
    try {
      const body = (await request.json()) as {
        reviewMode?: 'quick' | 'detail';
        __scenario?: string;
      };
      if (body?.reviewMode === 'detail' || body?.reviewMode === 'quick') {
        reviewMode = body.reviewMode;
      }
      forceFail = body?.__scenario === 'fail';
    } catch {
      // body optional in tests
    }

    const job = createJob(reviewMode, forceFail);
    if (idem) idempotencyToJob.set(idem, job.jobId);

    return ok(
      {
        status: 'accepted' as const,
        jobId: job.jobId,
        compositionId: `comp_${job.jobId}`,
      },
      202,
    );
  }),

  http.get(/\/v1\/jobs\/(?<jobId>[^/]+)\/?$/, async ({ params }) => {
    await delay(120);
    const jobId = String((params as { jobId?: string }).jobId ?? '');
    const job = jobs.get(jobId);
    if (!job) {
      return error('RESOURCE_NOT_FOUND', 'Pekerjaan tidak ditemukan.', 404);
    }
    return ok(deriveRuntime(job));
  }),

  http.post(/\/v1\/jobs\/(?<jobId>[^/]+)\/cancel\/?$/, async ({ params }) => {
    await delay(150);
    const jobId = String((params as { jobId?: string }).jobId ?? '');
    const job = jobs.get(jobId);
    if (!job) {
      return error('RESOURCE_NOT_FOUND', 'Pekerjaan tidak ditemukan.', 404);
    }
    const current = deriveRuntime(job);
    if (
      current.status === 'succeeded' ||
      current.status === 'partially_succeeded' ||
      current.status === 'failed' ||
      current.status === 'cancelled'
    ) {
      return error('STATE_CONFLICT', 'Status pekerjaan sudah berubah.', 409);
    }

    const next: MockJob = {
      ...job,
      ...current,
      status: 'cancelled',
      canCancel: false,
      canRetry: true,
      progressPercent: current.progressPercent ?? 20,
      updatedAt: nowIso(),
      startedAtMs: job.startedAtMs,
    };
    jobs.set(jobId, next);
    return ok(next);
  }),
];

/** Test helper — not used in browser runtime paths. */
export function __resetMockJobs() {
  jobs.clear();
  idempotencyToJob.clear();
}

export function __seedMockJob(job: MockJob) {
  jobs.set(job.jobId, job);
}
