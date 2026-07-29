import { NextResponse } from 'next/server';
import { getAssessmentHandler } from '@/src/lib/mock-api/assessmentHandlers';
import { isMockApiMode } from '@/src/lib/api/session';
import { liveClaims, loadLiveAssessment } from '@/src/lib/api/liveAssessment';

export async function GET(
  request: Request,
  context: { params: Promise<{ assessmentId: string }> },
) {
  const { assessmentId } = await context.params;
  if (isMockApiMode()) {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode');
    return getAssessmentHandler(
      request,
      assessmentId,
      mode === 'detail' ? 'detail' : mode === 'quick' ? 'quick' : undefined,
    );
  }

  const auth = await liveClaims();
  if (!auth) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  }
  const result = await loadLiveAssessment(auth.token, auth.claims.workspaceId, assessmentId);
  return NextResponse.json(
    result.payload ?? { error: { code: 'UPSTREAM_ERROR', message: 'Respons backend tidak valid.' } },
    { status: result.status },
  );
}
