import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isMockApiMode, mockOk } from '@/src/lib/mock-api/preview';
import {
  ACTIVE_ROLE_COOKIE,
  ACTIVE_WORKSPACE_COOKIE,
  backendFetch,
  clearJwtCookieOptions,
  JWT_COOKIE,
  ROLES_COOKIE,
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
  for (const name of [
    SESSION_COOKIE,
    ROLES_COOKIE,
    ACTIVE_ROLE_COOKIE,
    ACTIVE_WORKSPACE_COOKIE,
    'lembar_impersonator',
    'lembar_is_impersonating',
    'lembar_impersonated_name',
  ]) {
    response.cookies.set({ name, value: '', path: '/', maxAge: 0 });
  }
  return response;
}
