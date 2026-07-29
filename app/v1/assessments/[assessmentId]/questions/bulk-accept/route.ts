import { NextResponse } from 'next/server';
import { bulkAcceptHandler } from '@/src/lib/mock-api/assessmentHandlers';
import { backendFetch, isMockApiMode } from '@/src/lib/api/session';
import { liveClaims, loadLiveAssessment } from '@/src/lib/api/liveAssessment';

export async function POST(
  request: Request,
  context: { params: Promise<{ assessmentId: string }> },
) {
  const { assessmentId } = await context.params;
  if (isMockApiMode()) return bulkAcceptHandler(request, assessmentId);
  const auth = await liveClaims();
  if (!auth) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  }
  const body = (await request.json().catch(() => ({}))) as { questionIds?: unknown };
  const questionIds = Array.isArray(body.questionIds)
    ? body.questionIds.filter((id): id is string => typeof id === 'string')
    : [];
  if (!questionIds.length) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: 'Pilih minimal satu soal.' } },
      { status: 400 },
    );
  }
  const detail = await loadLiveAssessment(auth.token, auth.claims.workspaceId, assessmentId);
  const versionId = (detail.payload as { data?: { versionId?: string } } | null)?.data?.versionId;
  if (detail.status !== 200 || !versionId) {
    return NextResponse.json(detail.payload, { status: detail.status });
  }
  for (const questionId of questionIds) {
    const upstream = await backendFetch(
      `/v1/workspaces/${encodeURIComponent(auth.claims.workspaceId)}/assessments/${encodeURIComponent(assessmentId)}/versions/${encodeURIComponent(versionId)}/questions/${encodeURIComponent(questionId)}`,
      {
        method: 'PATCH',
        token: auth.token,
        headers: { 'x-actor-user-id': auth.claims.userId },
        body: JSON.stringify({ status: 'accepted' }),
      },
    );
    if (!upstream.ok) {
      const payload = await upstream.json().catch(() => null);
      return NextResponse.json(payload, { status: upstream.status });
    }
  }
  const refreshed = await loadLiveAssessment(auth.token, auth.claims.workspaceId, assessmentId);
  return NextResponse.json(refreshed.payload, { status: refreshed.status });
}
