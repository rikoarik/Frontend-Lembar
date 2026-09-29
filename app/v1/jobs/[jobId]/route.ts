import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

function workspaceIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'),
    ) as {
      workspaceId?: unknown;
    };
    return typeof payload.workspaceId === 'string' ? payload.workspaceId : null;
  } catch {
    return null;
  }
}

/**
 * Presentation stage for the FE progress panel.
 *
 * The backend only distinguishes queued / running / terminal, so we derive a
 * finer stage from the neutral status: a finished job is `finalizing` (the
 * review handoff is being attached), a job waiting to retry is `preparing`.
 * Anything else falls back to the raw backend status.
 */
function jobStageFor(rawStatus: string, neutralStatus: string): string {
  if (neutralStatus === 'succeeded' || neutralStatus === 'partially_succeeded') return 'finalizing';
  if (neutralStatus === 'retry_wait' || rawStatus === 'retry_wait') return 'preparing';
  if (neutralStatus === 'running') return 'generating';
  return rawStatus;
}

async function proxy(request: NextRequest, jobId: string, cancel: boolean) {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      {
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Silakan masuk terlebih dahulu.',
          retryable: false,
        },
      },
      { status: 401 },
    );
  }
  const workspaceId = workspaceIdFromToken(token);
  if (!workspaceId) {
    return NextResponse.json(
      {
        error: {
          code: 'MISSING_WORKSPACE',
          message: 'Workspace tidak ditemukan.',
          retryable: false,
        },
      },
      { status: 400 },
    );
  }
  const suffix = cancel ? '/cancel' : '';
  const upstream = await backendFetch(`/v1/jobs/${encodeURIComponent(jobId)}${suffix}`, {
    method: cancel ? 'POST' : 'GET',
    token,
    headers: { 'x-workspace-id': workspaceId },
    ...(cancel ? { body: '{}' } : {}),
  });
  const payload = (await upstream.json().catch(() => null)) as {
    data?: Record<string, unknown>;
    error?: unknown;
  } | null;
  if (upstream.ok && payload?.data) {
    const data = payload.data;
    const payloadReviewMode =
      data.payload && typeof data.payload === 'object'
        ? (data.payload as Record<string, unknown>).reviewMode
        : undefined;
    const reviewMode =
      data.reviewMode === 'detail' || payloadReviewMode === 'detail' ? 'detail' : 'quick';
    const rawStatus = String(data.status ?? 'queued');
    const status =
      rawStatus === 'completed'
        ? 'succeeded'
        : rawStatus === 'partially_failed'
          ? 'partially_succeeded'
          : ['preparing', 'generating', 'validating', 'rendering'].includes(rawStatus)
            ? 'running'
            : rawStatus;
    const progressCurrent = Number(data.progressCurrent);
    const progressTotal = Number(data.progressTotal);
    const rawProgress =
      Number.isFinite(progressCurrent) && Number.isFinite(progressTotal) && progressTotal > 0
        ? Math.round((progressCurrent / progressTotal) * 100)
        : undefined;
    // `100%` is reserved for a job that has actually reached a terminal state.
    // The worker reports progress per generated item, so the counter hits the
    // total while review import / finalization is still running.
    const progressPercent =
      rawProgress === undefined
        ? undefined
        : ['succeeded', 'partially_succeeded', 'failed', 'cancelled'].includes(status)
          ? Math.min(100, rawProgress)
          : Math.min(99, rawProgress);
    return NextResponse.json({
      data: {
        jobId: data.id ?? jobId,
        assessmentId: data.assessmentId,
        compositionId: data.compositionId,
        reviewMode,
        status,
        stage: jobStageFor(rawStatus, status),
        ...(progressPercent === undefined ? {} : { progressPercent }),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        canCancel: !['succeeded', 'partially_succeeded', 'failed', 'cancelled'].includes(status),
        canRetry: status === 'failed',
        ...(data.failureCode
          ? {
              error: {
                code: data.failureCode,
                safeMessage:
                  typeof data.failureMessage === 'string' && data.failureMessage.trim()
                    ? data.failureMessage
                    : 'Pembuatan soal gagal. Silakan coba kembali.',
                retryable: true,
              },
            }
          : {}),
      },
    });
  }
  return NextResponse.json(
    payload ?? { error: { code: 'UPSTREAM_ERROR', message: 'Respons backend tidak valid.' } },
    { status: upstream.status },
  );
}

export async function GET(request: NextRequest, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params;
  return proxy(request, jobId, false);
}

export async function POST(request: NextRequest, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params;
  return proxy(request, jobId, true);
}
