import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isMockApiMode, mockFail } from '@/src/lib/mock-api/preview';
import {
  authSuccessFromBackend,
  authCookieOptions,
  backendFetch,
  jwtCookieOptions,
  normalizeRoles,
  SESSION_COOKIE,
  type BackendAuthResponse,
} from '@/src/lib/api/session';
import { clearOauthStateCookie, OAUTH_STATE_COOKIE } from '@/src/lib/api/oauthState';

function oauthFailure(code: string, message: string, status: number) {
  const response = mockFail(code, message, status);
  response.cookies.set(clearOauthStateCookie());
  return response;
}

export async function POST(request: Request) {
  if (isMockApiMode()) {
    return mockFail('PROVIDER_NOT_READY', 'Google OAuth tidak tersedia di mode mock.', 503);
  }

  let body: { code?: string; state?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return oauthFailure('VALIDATION_FAILED', 'Authorization code diperlukan.', 400);
  }

  if (!body.code) {
    return oauthFailure('VALIDATION_FAILED', 'Authorization code diperlukan.', 400);
  }

  const jar = await cookies();
  const expectedState = jar.get(OAUTH_STATE_COOKIE)?.value;
  if (!body.state || !expectedState || body.state !== expectedState) {
    return oauthFailure(
      'OAUTH_STATE_INVALID',
      'Sesi Google OAuth tidak valid atau kedaluwarsa.',
      400,
    );
  }

  const upstream = await backendFetch('/v1/auth/google/callback', {
    method: 'POST',
    body: JSON.stringify({ code: body.code, state: body.state }),
  });

  if (!upstream.ok) {
    const payload = await upstream.json().catch(() => null);
    return oauthFailure(
      'INVALID_CREDENTIALS',
      payload?.error?.message || 'Autentikasi Google gagal.',
      upstream.status || 401,
    );
  }

  const raw = await upstream.json();
  const token = raw?.token ?? raw?.data?.token;
  if (!token) {
    return oauthFailure('UNKNOWN', 'Respons Google OAuth tidak valid.', 502);
  }

  const successPayload = authSuccessFromBackend(raw);
  const user = raw?.user ?? raw?.data?.user ?? raw?.data;
  const roles = normalizeRoles(user);

  const response = NextResponse.json({ data: successPayload }, { status: 200 });
  response.cookies.set(jwtCookieOptions(token));
  response.cookies.set({ name: SESSION_COOKIE, value: '', path: '/', maxAge: 0 });

  if (roles.length > 0) {
    response.cookies.set(authCookieOptions('lembar_roles', roles.join(',')));
  }
  response.cookies.set(authCookieOptions('lembar_active_role', successPayload.activeRole));
  response.cookies.set(clearOauthStateCookie());
  return response;
}
