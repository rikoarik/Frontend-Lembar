import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

function workspaceIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')) as { workspaceId?: unknown };
    return typeof payload.workspaceId === 'string' ? payload.workspaceId : null;
  } catch { return null; }
}

export async function POST(request: NextRequest, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params;
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.', retryable: false } }, { status: 401 });
  const workspaceId = workspaceIdFromToken(token);
  if (!workspaceId) return NextResponse.json({ error: { code: 'MISSING_WORKSPACE', message: 'Workspace tidak ditemukan.', retryable: false } }, { status: 400 });

  const upstream = await backendFetch(`/v1/jobs/${encodeURIComponent(jobId)}/recover`, {
    method: 'POST',
    token,
    headers: { 'x-workspace-id': workspaceId },
    body: '{}',
  });
  const payload = await upstream.json().catch(() => null);
  return NextResponse.json(payload ?? { error: { code: 'UPSTREAM_ERROR', message: 'Respons backend tidak valid.' } }, { status: upstream.status });
}
