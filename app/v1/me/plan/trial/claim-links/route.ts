import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

export async function POST() {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk.', retryable: false } },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const upstream = await backendFetch('/v1/me/plan/trial/claim-links', {
    method: 'POST',
    token,
  });
  const body = await upstream.json().catch(() => null);
  return NextResponse.json(
    body ?? { error: { code: 'UPSTREAM_ERROR', message: 'Gagal menyiapkan tautan trial.' } },
    { status: upstream.status, headers: { 'Cache-Control': 'no-store' } },
  );
}
