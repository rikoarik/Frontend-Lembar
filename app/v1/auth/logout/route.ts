import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isMockApiMode, mockOk } from '@/src/lib/mock-api/preview';
import {
  backendFetch,
  clearJwtCookieOptions,
  JWT_COOKIE,
  SESSION_COOKIE,
} from '@/src/lib/api/session';

export async function POST() {
  if (isMockApiMode()) {
    return mockOk({ loggedOut: true }, { clearSession: true });
  }

  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;

  // Best-effort backend logout so server-side session is invalidated too.
  if (token) {
    try {
      await backendFetch('/v1/auth/logout', {
        method: 'POST',
        token,
      });
    } catch {
      // ignore and still clear cookies locally
    }
  }

  const response = NextResponse.json({ data: { loggedOut: true } }, { status: 200 });
  response.cookies.set(clearJwtCookieOptions());
  response.cookies.set({
    name: 'lembar_session',
    value: '',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set({ name: JWT_COOKIE, value: '', path: '/', maxAge: 0 });
  response.cookies.set({ name: SESSION_COOKIE, value: '', path: '/', maxAge: 0 });
  response.cookies.set({ name: 'lembar_roles', value: '', path: '/', maxAge: 0 });
  return response;
}
