import { NextResponse } from 'next/server';
import { isMockApiMode, mockFail } from '@/src/lib/mock-api/preview';
import {
  authSuccessFromBackend,
  backendFetch,
  jwtCookieOptions,
  type BackendAuthResponse,
} from '@/src/lib/api/session';

export async function POST(request: Request) {
  if (isMockApiMode()) {
    return mockFail('PROVIDER_NOT_READY', 'Google OAuth tidak tersedia di mode mock.', 503);
  }

  let body: { code?: string; state?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return mockFail('VALIDATION_FAILED', 'Authorization code diperlukan.', 400);
  }

  if (!body.code) {
    return mockFail('VALIDATION_FAILED', 'Authorization code diperlukan.', 400);
  }

  const upstream = await backendFetch('/v1/auth/google/callback', {
    method: 'POST',
    body: JSON.stringify({ code: body.code, state: body.state }),
  });

  if (!upstream.ok) {
    const payload = await upstream.json().catch(() => null);
    return mockFail(
      'INVALID_CREDENTIALS',
      payload?.error?.message || 'Autentikasi Google gagal.',
      upstream.status || 401,
    );
  }

  const auth = (await upstream.json()) as BackendAuthResponse;
  if (!auth?.token || !auth?.user) {
    return mockFail('UNKNOWN', 'Respons Google OAuth tidak valid.', 502);
  }

  const response = NextResponse.json({ data: authSuccessFromBackend(auth) }, { status: 200 });
  response.cookies.set(jwtCookieOptions(auth.token));
  response.cookies.set({
    name: 'lembar_session',
    value: auth.token,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ?? false,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
