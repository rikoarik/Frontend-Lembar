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

  const raw = await upstream.json();
  // Handle both { token, user } and { data: { token, user } } shapes
  const auth: BackendAuthResponse = raw?.data?.token
    ? { token: raw.data.token, user: raw.data.user, data: raw.data }
    : (raw as BackendAuthResponse);

  const token = auth.token ?? auth.data?.token;
  const user = auth.user ?? auth.data?.user;
  if (!token || !user) {
    console.error('[Google Callback BFF] Invalid backend auth payload:', JSON.stringify(raw).slice(0, 300));
    return mockFail('UNKNOWN', 'Respons Google OAuth tidak valid.', 502);
  }

  const successPayload = authSuccessFromBackend(auth);
  console.log('[Google Callback BFF] Success. User:', user.email, 'roles:', user.roles ?? user.role, 'homePath:', successPayload.homePath);

  const response = NextResponse.json({ data: successPayload }, { status: 200 });
  response.cookies.set(jwtCookieOptions(token));
  response.cookies.set({
    name: 'lembar_session',
    value: token,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ?? false,
    maxAge: 60 * 60 * 24 * 7,
  });
  // Set roles cookie for middleware/client role detection
  const roles = Array.isArray(user.roles) ? user.roles : typeof user.roles === 'string' ? [user.roles] : typeof user.role === 'string' ? [user.role] : [];
  if (roles.length > 0) {
    response.cookies.set({
      name: 'lembar_roles',
      value: roles.join(','),
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ?? false,
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return response;
}
