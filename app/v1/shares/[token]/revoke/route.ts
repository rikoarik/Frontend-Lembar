import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';
import { liveClaims } from '@/src/lib/api/liveAssessment';

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const auth = await liveClaims();
  if (!auth) return NextResponse.json({ error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } }, { status: 401 });
  const { token } = await context.params;
  const upstream = await backendFetch(`/v1/shares/${encodeURIComponent(token)}/revoke`, {
    method: 'POST',
    token: auth.token,
    body: '{}',
  });
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
