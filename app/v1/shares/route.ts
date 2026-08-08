import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';
import { liveClaims } from '@/src/lib/api/liveAssessment';

async function proxy(request: NextRequest) {
  const auth = await liveClaims();
  if (!auth) return NextResponse.json({ error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } }, { status: 401 });
  const url = new URL(request.url);
  const upstream = await backendFetch(`/v1/shares${url.search}`, {
    method: request.method,
    token: auth.token,
    headers: { 'x-workspace-id': auth.claims.workspaceId },
    ...(request.method !== 'GET' ? { body: await request.text() } : {}),
  });
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}

export const GET = proxy;
export const POST = proxy;
