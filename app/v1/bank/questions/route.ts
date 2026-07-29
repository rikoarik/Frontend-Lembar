import { NextResponse } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';
import { liveClaims } from '@/src/lib/api/liveAssessment';

export async function GET() {
  const auth = await liveClaims();
  if (!auth) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  }
  const upstream = await backendFetch('/v1/bank/questions?limit=100', {
    method: 'GET',
    token: auth.token,
    headers: { 'x-workspace-id': auth.claims.workspaceId },
  });
  return NextResponse.json(await upstream.json().catch(() => null), { status: upstream.status });
}
