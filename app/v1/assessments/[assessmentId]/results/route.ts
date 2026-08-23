import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';
import { liveClaims } from '@/src/lib/api/liveAssessment';
async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> },
  csv = false,
) {
  const auth = await liveClaims();
  if (!auth)
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  const { assessmentId } = await params;
  const upstream = await backendFetch(
    `/v1/assessments/${encodeURIComponent(assessmentId)}/results${csv ? '.csv' : ''}`,
    { method: 'GET', token: auth.token, headers: { 'x-workspace-id': auth.claims.workspaceId } },
  );
  return new NextResponse(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: {
      'content-type':
        upstream.headers.get('content-type') ?? (csv ? 'text/csv' : 'application/json'),
      'content-disposition': upstream.headers.get('content-disposition') ?? '',
    },
  });
}
export async function GET(r: NextRequest, c: { params: Promise<{ assessmentId: string }> }) {
  return proxy(r, c);
}
