import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  backendBaseUrl,
  JWT_COOKIE,
  SESSION_COOKIE,
} from '@/src/lib/api/session';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ jobId: string }> }) {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  }
  const { jobId } = await context.params;
  const upstream = await fetch(
    `${backendBaseUrl()}/v1/jobs/${encodeURIComponent(jobId)}/events`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
      cache: 'no-store',
      signal: _request.signal,
    },
  );
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: 'Stream status tidak tersedia.' } },
      { status: upstream.status },
    );
  }
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
