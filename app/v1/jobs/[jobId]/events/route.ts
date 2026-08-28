import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { backendBaseUrl, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

export const dynamic = 'force-dynamic';

function workspaceIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'),
    ) as { workspaceId?: unknown };
    return typeof payload.workspaceId === 'string' ? payload.workspaceId : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request, context: { params: Promise<{ jobId: string }> }) {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  }
  const workspaceId = workspaceIdFromToken(token);
  if (!workspaceId) {
    return NextResponse.json(
      { error: { code: 'MISSING_WORKSPACE', message: 'Workspace tidak ditemukan.' } },
      { status: 400 },
    );
  }

  const { jobId } = await context.params;
  let upstream: Response;
  try {
    upstream = await fetch(`${backendBaseUrl()}/v1/jobs/${encodeURIComponent(jobId)}/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
        'x-workspace-id': workspaceId,
      },
      cache: 'no-store',
      signal: request.signal,
    });
  } catch {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Stream status tidak tersedia.' } },
      { status: 502 },
    );
  }
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
