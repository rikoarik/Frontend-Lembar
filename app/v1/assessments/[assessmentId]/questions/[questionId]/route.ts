import { NextResponse } from 'next/server';
import { patchQuestionHandler } from '@/src/lib/mock-api/assessmentHandlers';
import { backendFetch, isMockApiMode } from '@/src/lib/api/session';
import { liveClaims, loadLiveAssessment } from '@/src/lib/api/liveAssessment';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ assessmentId: string; questionId: string }> },
) {
  const { assessmentId, questionId } = await context.params;
  if (isMockApiMode()) return patchQuestionHandler(request, assessmentId, questionId);

  const auth = await liveClaims();
  if (!auth) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const detail = await loadLiveAssessment(auth.token, auth.claims.workspaceId, assessmentId);
  const data = (detail.payload as { data?: { versionId?: string } } | null)?.data;
  if (detail.status !== 200 || !data?.versionId) {
    return NextResponse.json(detail.payload, { status: detail.status });
  }
  const reviewState = body.reviewState;
  const status =
    reviewState === 'accepted' ? 'accepted' : reviewState === 'rejected' ? 'rejected' : undefined;
  const patch = {
    ...(typeof body.stem === 'string' ? { stem: body.stem } : {}),
    ...(typeof body.explanation === 'string' ? { explanation: body.explanation } : {}),
    ...(typeof body.answerKey === 'string' ? { answer: body.answerKey } : {}),
    ...(status ? { status } : {}),
  };
  const base = `/v1/workspaces/${encodeURIComponent(auth.claims.workspaceId)}/assessments/${encodeURIComponent(assessmentId)}/versions/${encodeURIComponent(data.versionId)}/questions/${encodeURIComponent(questionId)}`;
  const ifMatch = request.headers.get('if-match');
  const upstreamHeaders: Record<string, string> = { 'x-actor-user-id': auth.claims.userId };
  if (ifMatch) upstreamHeaders['If-Match'] = ifMatch;
  const upstream = await backendFetch(base, {
    method: 'PATCH',
    token: auth.token,
    headers: upstreamHeaders,
    body: JSON.stringify(patch),
  });
  if (!upstream.ok) {
    const payload = await upstream.json().catch(() => null);
    return NextResponse.json(payload, { status: upstream.status });
  }
  const refreshed = await loadLiveAssessment(auth.token, auth.claims.workspaceId, assessmentId);
  return NextResponse.json(refreshed.payload, { status: refreshed.status });
}
