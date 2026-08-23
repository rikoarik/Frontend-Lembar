import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  authCookieOptions,
  backendFetch,
  JWT_COOKIE,
  normalizeRoles,
  SESSION_COOKIE,
  type BackendUser,
} from '@/src/lib/api/session';
import { findMockAccountBySession } from '@/src/lib/mock-api/accounts';
import { isMockApiMode, mockFail } from '@/src/lib/mock-api/preview';

export async function POST() {
  const jar = await cookies();
  const impersonatorToken = jar.get('lembar_impersonator')?.value;

  if (!impersonatorToken) {
    return mockFail('AUTH_REQUIRED', 'Sesi impersonasi tidak ditemukan.', 401);
  }

  if (isMockApiMode()) {
    const account = findMockAccountBySession(impersonatorToken);
    if (!account?.roles.includes('superadmin')) {
      return mockFail('ROLE_FORBIDDEN', 'Sesi impersonator tidak valid.', 403);
    }
  } else {
    const upstream = await backendFetch('/v1/auth/me', {
      method: 'GET',
      token: impersonatorToken,
    });
    if (!upstream.ok) {
      return mockFail('AUTH_REQUIRED', 'Sesi impersonator sudah tidak valid.', 401);
    }

    const payload = await upstream.json().catch(() => null);
    const user = (payload?.user ?? payload?.data ?? payload) as BackendUser | null;
    if (!normalizeRoles(user).includes('superadmin')) {
      return mockFail('ROLE_FORBIDDEN', 'Akses superadmin diperlukan.', 403);
    }
  }

  const response = NextResponse.json({
    data: { targetPath: '/ops' },
  });

  if (isMockApiMode()) {
    response.cookies.set(authCookieOptions(SESSION_COOKIE, impersonatorToken));
    response.cookies.set({ name: JWT_COOKIE, value: '', path: '/', maxAge: 0 });
  } else {
    response.cookies.set(authCookieOptions(JWT_COOKIE, impersonatorToken));
    response.cookies.set({ name: SESSION_COOKIE, value: '', path: '/', maxAge: 0 });
  }
  response.cookies.set(authCookieOptions('lembar_roles', 'superadmin'));
  response.cookies.set(authCookieOptions('lembar_active_role', 'superadmin'));

  // Delete impersonation tracking cookies
  response.cookies.set({
    name: 'lembar_impersonator',
    value: '',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set({
    name: 'lembar_impersonated_name',
    value: '',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set({
    name: 'lembar_is_impersonating',
    value: '',
    path: '/',
    maxAge: 0,
  });

  return response;
}
