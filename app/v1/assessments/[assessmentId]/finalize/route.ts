import { NextResponse } from 'next/server';
import { finalizeHandler } from '@/src/lib/mock-api/assessmentHandlers';
import { backendFetch, isMockApiMode } from '@/src/lib/api/session';
import { liveClaims, loadLiveAssessment } from '@/src/lib/api/liveAssessment';

export async function POST(
  request: Request,
  context: { params: Promise<{ assessmentId: string }> },
) {
  const { assessmentId } = await context.params;
  if (isMockApiMode()) return finalizeHandler(request, assessmentId);
  const auth = await liveClaims();
  if (!auth) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  }
  const body = (await request.json().catch(() => ({}))) as { acknowledged?: boolean };
  if (body.acknowledged !== true) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: 'Konfirmasi tanggung jawab guru wajib dicentang.' } },
      { status: 400 },
    );
  }
  const detail = await loadLiveAssessment(auth.token, auth.claims.workspaceId, assessmentId);
  const versionId = (detail.payload as { data?: { versionId?: string } } | null)?.data?.versionId;
  if (detail.status !== 200 || !versionId) return NextResponse.json(detail.payload, { status: detail.status });
  const upstream = await backendFetch(
    `/v1/workspaces/${encodeURIComponent(auth.claims.workspaceId)}/assessments/${encodeURIComponent(assessmentId)}/versions/${encodeURIComponent(versionId)}/finalize`,
    {
      method: 'POST',
      token: auth.token,
      headers: { 'x-actor-user-id': auth.claims.userId },
      body: '{}',
    },
  );
  const payload = (await upstream.json().catch(() => null)) as { finalizedAt?: string; error?: unknown } | null;
  if (!upstream.ok) return NextResponse.json(payload, { status: upstream.status });
  return NextResponse.json({
    data: {
      assessmentId,
      versionId,
      lifecycle: 'final',
      finalizedAt: payload?.finalizedAt ?? new Date().toISOString(),
    },
  });
}
