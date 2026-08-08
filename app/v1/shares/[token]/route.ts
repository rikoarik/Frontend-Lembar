import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';
import { liveClaims } from '@/src/lib/api/liveAssessment';

async function proxy(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;

  // Public GET — no auth required
  if (request.method === 'GET') {
    const upstream = await backendFetch(`/v1/shares/${encodeURIComponent(token)}`, {
      method: 'GET',
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  }

  const auth = await liveClaims();
  if (!auth) return NextResponse.json({ error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } }, { status: 401 });
  const upstream = await backendFetch(`/v1/shares/${encodeURIComponent(token)}`, {
    method: request.method,
    token: auth.token,
    body: await request.text(),
  });
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}

export const GET = proxy;
export const DELETE = proxy;
