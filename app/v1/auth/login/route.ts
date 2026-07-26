import { NextResponse } from 'next/server';
import { authSuccessFor, findMockAccount } from '@/src/lib/mock-api/accounts';
import { isMockApiMode, mockFail, mockOk } from '@/src/lib/mock-api/preview';
import {
  authSuccessFromBackend,
  backendFetch,
  jwtCookieOptions,
  normalizeRoles,
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
  const token = raw?.token ?? raw?.data?.token;
  if (!token) {
    console.error('[Login BFF] Token missing in backend payload:', JSON.stringify(raw).slice(0, 300));
    return mockFail('UNKNOWN', 'Respons autentikasi tidak valid.', 502);
  }

  const successPayload = authSuccessFromBackend(raw);
  const user = raw?.user ?? raw?.data?.user ?? raw?.data;
  const roles = normalizeRoles(user);

  console.log(
    '[Login BFF Success] Logged in user:',
    user?.email || user?.id,
    'roles:',
    roles,
    'activeRole:',
    successPayload.activeRole,
    'homePath:',
    successPayload.homePath,
  );
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
  response.cookies.set({
    name: 'lembar_active_role',
    value: successPayload.activeRole,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ?? false,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
