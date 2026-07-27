import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf-8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const jar = await cookies();
  const token =
    jar.get(JWT_COOKIE)?.value ||
    jar.get(SESSION_COOKIE)?.value ||
    jar.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk.', retryable: false } },
      { status: 401 },
    );
  }

  const payload = decodeJwtPayload(token);
  const workspaceId = (payload?.['workspaceId'] as string) || '';
  const userId = (payload?.['userId'] as string) || (payload?.['sub'] as string) || '';

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {}

  const upstream = await backendFetch('/v1/me/plan/upgrade', {
    method: 'POST',
    token,
    headers: {
      'x-workspace-id': workspaceId,
      'x-tenant-id': userId,
      'x-actor-id': userId,
    },
    body: JSON.stringify(body),
  });

  const json = await upstream.json().catch(() => null);
  return NextResponse.json(
    json ?? { error: { code: 'UPSTREAM_ERROR', message: 'Gagal memproses upgrade.' } },
    { status: upstream.status },
  );
}
