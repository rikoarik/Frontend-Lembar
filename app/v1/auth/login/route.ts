import { NextResponse } from 'next/server';
import { authSuccessFor, findMockAccount } from '@/src/lib/mock-api/accounts';
import { isMockApiMode, mockFail, mockOk } from '@/src/lib/mock-api/preview';
import {
  authSuccessFromBackend,
  authCookieOptions,
  backendFetch,
  jwtCookieOptions,
  normalizeRoles,
  SESSION_COOKIE,
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
    const account = findMockAccount(identifier, password);
    if (!account) {

      return mockFail(
        'INVALID_CREDENTIALS',
        'Username/email/phone dan kata sandi tidak cocok.',
        401,
      );
    }

    return mockOk(authSuccessFor(account), {
      setSession: account.session,
      setRoles: account.roles,
    });
  }


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

    return mockFail('UNKNOWN', 'Respons autentikasi tidak valid.', 502);
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
  return response;
}
