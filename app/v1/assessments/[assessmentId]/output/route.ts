import { NextResponse } from 'next/server';
import { outputHandler } from '@/src/lib/mock-api/assessmentHandlers';
import { backendFetch, isMockApiMode } from '@/src/lib/api/session';
import { liveClaims, loadLiveAssessment } from '@/src/lib/api/liveAssessment';

export async function GET(
  _request: Request,
  context: { params: Promise<{ assessmentId: string }> },
) {
  const { assessmentId } = await context.params;
  if (isMockApiMode()) return outputHandler(assessmentId);
  const auth = await liveClaims();
  if (!auth) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  }
  const detail = await loadLiveAssessment(auth.token, auth.claims.workspaceId, assessmentId);
  const versionId = (detail.payload as { data?: { versionId?: string; lifecycle?: string } } | null)?.data?.versionId;
  const lifecycle = (detail.payload as { data?: { lifecycle?: string } } | null)?.data?.lifecycle;
  if (detail.status !== 200 || !versionId) return NextResponse.json(detail.payload, { status: detail.status });
  if (lifecycle !== 'final') {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: 'Lembar harus difinalkan sebelum output dibuat.' } },
      { status: 422 },
    );
  }

  const path = `/v1/assessments/${encodeURIComponent(versionId)}/output`;
  let upstream = await backendFetch(path, {
    method: 'GET',
    token: auth.token,
    headers: { 'x-workspace-id': auth.claims.workspaceId },
  });
  if (upstream.status === 404) {
    upstream = await backendFetch(path, {
      method: 'POST',
      token: auth.token,
      headers: { 'x-workspace-id': auth.claims.workspaceId },
      body: '{}',
    });
    if (upstream.ok) {
      upstream = await backendFetch(path, {
        method: 'GET',
        token: auth.token,
        headers: { 'x-workspace-id': auth.claims.workspaceId },
      });
    }
  }
  const payload = (await upstream.json().catch(() => null)) as {
    data?: { artifact?: { status?: string; createdAt?: string }; downloadUrl?: string };
    error?: unknown;
  } | null;
  if (!upstream.ok) return NextResponse.json(payload, { status: upstream.status });
  const artifact = payload?.data?.artifact;
  return NextResponse.json({
    data: {
      assessmentId,
      versionId,
      status: artifact?.status === 'failed' ? 'failed' : artifact?.status === 'ready' ? 'ready' : 'rendering',
      studentSheetLabel: 'Lembar siswa',
      answerKeyLabel: 'Kunci jawaban',
      explanationLabel: 'Pembahasan',
      printHref: `/app/output/${assessmentId}/print`,
      downloadHref: payload?.data?.downloadUrl ?? '#',
      updatedAt: artifact?.createdAt ?? new Date().toISOString(),
    },
  });
}
