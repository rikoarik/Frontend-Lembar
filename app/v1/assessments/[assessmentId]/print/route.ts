import { NextResponse } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';
import { liveClaims } from '@/src/lib/api/liveAssessment';
import { mapToPrintDTO } from '@/src/features/output/types';

export async function GET(
  _request: Request,
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
  const upstream = await backendFetch(
    `/v1/assessments/${encodeURIComponent(assessmentId)}/print`,
    { method: 'GET', token: auth.token, headers: { 'x-workspace-id': auth.claims.workspaceId } },
  );

  const be = (await upstream.json().catch(() => null)) as Parameters<typeof mapToPrintDTO>[1] | null;
  if (!upstream.ok || !be) {
    return NextResponse.json(be, { status: upstream.status });
  }

  return NextResponse.json({ data: mapToPrintDTO(assessmentId, be) });
}
