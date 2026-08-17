import { NextResponse } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';
import { liveClaims } from '@/src/lib/api/liveAssessment';

export async function GET(
  request: Request,
  context: { params: Promise<{ assessmentId: string }> },
) {
  const auth = await liveClaims();
  if (!auth) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  }
  const { assessmentId } = await context.params;
  const copy = new URL(request.url).searchParams.get('copy') === 'student' ? 'student' : 'teacher';
  const upstream = await backendFetch(
    `/v1/assessments/${encodeURIComponent(assessmentId)}/pdf?copy=${copy}`,
    { method: 'GET', token: auth.token, headers: { 'x-workspace-id': auth.claims.workspaceId } },
  );
  if (!upstream.ok) {
    return NextResponse.json(await upstream.json().catch(() => null), { status: upstream.status });
  }
  return new NextResponse(await upstream.arrayBuffer(), {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="lembar-${assessmentId}-${copy}.pdf"`,
      'cache-control': 'private, no-store',
    },
  });
}
