import { NextResponse } from 'next/server';
import {
  authCookieOptions,
  authSuccessFromBackend,
  backendFetch,
  jwtCookieOptions,
  normalizeRoles,
  SESSION_COOKIE,
  type BackendAuthResponse,
} from '@/src/lib/api/session';
import { isMockApiMode, mockFail, mockOk } from '@/src/lib/mock-api/preview';
import { findMockAccount } from '@/src/lib/mock-api/accounts';

export async function POST(request: Request) {
  let body: { email?: string; password?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return mockFail('VALIDATION_FAILED', 'Periksa kembali isian formulir.', 400);
  }

  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '');
  if (!email || !password) {
    return mockFail('VALIDATION_FAILED', 'Email dan kata sandi wajib diisi.', 400, {
      email: email ? [] : ['Wajib diisi.'],
      password: password ? [] : ['Wajib diisi.'],
    });
  }

  if (isMockApiMode()) {
    const account = findMockAccount('ops', 'ops1234');
    if (!account) return mockFail('INVALID_CREDENTIALS', 'Email atau kata sandi tidak cocok.', 401);
    const data = authSuccessFromBackend({
      user: {
        id: account.accountId,
        email: account.identifier,
        name: account.displayName,
        roles: account.roles,
        workspaceId: account.workspaceId,
      },
    });
    const response = mockOk(data, { setSession: account.session, setRoles: account.roles });
    response.cookies.set(authCookieOptions('lembar_active_role', data.activeRole));
    return response;
  }

  const upstream = await backendFetch('/v1/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const raw = (await upstream.json().catch(() => null)) as BackendAuthResponse | null;
  if (!upstream.ok) {
    return NextResponse.json(raw ?? { error: { code: 'UNKNOWN', message: 'Gagal masuk.' } }, {
      status: upstream.status,
    });
  }

  const token = raw?.token ?? raw?.data?.token;
  const user = raw?.user ?? raw?.data?.user;
  if (!token || !user) {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_ERROR', message: 'Respons autentikasi tidak valid.' } },
      { status: 502 },
    );
  }

  const successPayload = authSuccessFromBackend(raw as BackendAuthResponse);
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
