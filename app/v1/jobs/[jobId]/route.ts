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
    const progressPercent =
      Number.isFinite(progressCurrent) && Number.isFinite(progressTotal) && progressTotal > 0
        ? Math.round((progressCurrent / progressTotal) * 100)
        : undefined;
    return NextResponse.json({
      data: {
        jobId: data.id ?? jobId,
        assessmentId: data.assessmentId,
        compositionId: data.compositionId,
        reviewMode,
        status,
        stage: rawStatus === 'completed' ? 'finalizing' : rawStatus,
        ...(progressPercent === undefined ? {} : { progressPercent }),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        canCancel: !['succeeded', 'partially_succeeded', 'failed', 'cancelled'].includes(status),
        canRetry: status === 'failed',
        ...(data.failureCode
          ? {
              error: {
                code: data.failureCode,
                safeMessage: 'Pembuatan soal gagal. Silakan coba kembali.',
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
