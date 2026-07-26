import { NextResponse } from 'next/server';
import { authSuccessFor, findMockAccount } from '@/src/lib/mock-api/accounts';
import { isMockApiMode, mockFail, mockOk } from '@/src/lib/mock-api/preview';
import {
  authSuccessFromBackend,
  backendFetch,
  jwtCookieOptions,
  type BackendAuthResponse,
} from '@/src/lib/api/session';

export async function POST(request: Request) {
  let body: { identifier?: string; password?: string; email?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return mockFail('VALIDATION_FAILED', 'Periksa kembali isian formulir.', 400);
  }

  const identifier = String(body.identifier ?? body.email ?? '').trim();
  const password = String(body.password ?? '');

  if (!identifier || !password) {
    return mockFail(
      'VALIDATION_FAILED',
      'Email/username/telepon dan kata sandi wajib diisi.',
      400,
      {
        identifier: identifier ? [] : ['Wajib diisi.'],
        password: password ? [] : ['Wajib diisi.'],
      },
    );
  }

  if (isMockApiMode()) {
    console.log('[Login BFF] Mode is MOCK. Identifier:', identifier);
    const account = findMockAccount(identifier, password);
    if (!account) {
      console.warn('[Login BFF] Mock login failed for identifier:', identifier);
      return mockFail(
        'INVALID_CREDENTIALS',
        'Username/email/phone dan kata sandi tidak cocok.',
        401,
      );
    }
    console.log('[Login BFF] Mock login success for account:', account.accountId, account.roles);
    return mockOk(authSuccessFor(account), {
      setSession: account.session,
      setRoles: account.roles,
    });
  }

  console.log('[Login BFF] Mode is LIVE. Fetching upstream login from backend...');
  const upstream = await backendFetch('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identifier,
      email: identifier.includes('@') ? identifier : undefined,
      password,
    }),
  });

  if (!upstream.ok) {
    const payload = await upstream.json().catch(() => null);
    console.error('[Login BFF] Upstream login failed with status:', upstream.status, payload);
    const message =
      payload?.error?.message ||
      (upstream.status === 401
        ? 'Email/username/telepon dan kata sandi tidak cocok.'
        : 'Gagal masuk. Coba lagi.');
    return mockFail(
      upstream.status === 401 ? 'INVALID_CREDENTIALS' : 'UNKNOWN',
      message,
      upstream.status === 401 ? 401 : upstream.status || 500,
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
    console.error('[Login BFF] Invalid backend auth payload:', JSON.stringify(raw).slice(0, 300));
    return mockFail('UNKNOWN', 'Respons autentikasi tidak valid.', 502);
  }

  const successPayload = authSuccessFromBackend(auth);
  console.log('[Login BFF Success] Logged in user:', user.email, 'roles:', user.roles ?? user.role, 'homePath:', successPayload.homePath);
  console.log('[Login BFF Success] JWT token preview:', token.slice(0, 15) + '...');

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
