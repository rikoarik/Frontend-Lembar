import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { findMockAccountBySession } from '@/src/lib/mock-api/accounts';
import { isMockApiMode, mockFail, mockOk } from '@/src/lib/mock-api/preview';
import { JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

const ROLES_COOKIE = 'lembar_roles';
const ACTIVE_ROLE_COOKIE = 'lembar_active_role';
const ROLE_PATHS: Record<string, string> = {
  teacher: '/app',
  school_admin: '/school',
  superadmin: '/ops',
};

function parseRolesFromJwt(jwt: string): string[] {
  try {
    const parts = jwt.split('.');
    if (parts.length < 2) return [];
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    const payload = JSON.parse(jsonPayload);
    const rawRoles =
      payload.roles ?? payload.role ?? payload.workspace?.role ?? payload.activeWorkspace?.role;
    if (Array.isArray(rawRoles)) return rawRoles;
    if (typeof rawRoles === 'string')
      return rawRoles
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
    return [];
  } catch {
    return [];
  }
}

/**
 * Lightweight endpoint: returns the current user's roles array.
 * Used by the client-side role switcher — avoids a full /v1/me round-trip.
 */
export async function GET() {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value || jar.get(JWT_COOKIE)?.value;

  if (!session) {
    return mockFail('AUTH_REQUIRED', 'Silakan masuk terlebih dahulu.', 401);
  }

  if (isMockApiMode()) {
    const account = findMockAccountBySession(session);
    const roles = account?.roles ?? ['teacher'];
    return mockOk({ roles });
  }

  // Live mode: extract roles from cookies and JWT session token
  const rolesStr = jar.get(ROLES_COOKIE)?.value;
  const activeRole = jar.get(ACTIVE_ROLE_COOKIE)?.value;
  const jwtRoles = parseRolesFromJwt(session);

  const found = new Set<string>();
  if (rolesStr) {
    rolesStr.split(',').forEach((r) => found.add(r.trim()));
  }
  if (activeRole) {
    found.add(activeRole);
  }
  jwtRoles.forEach((r) => found.add(r));

  if (found.size > 0) {
    return mockOk({ roles: Array.from(found) });
  }

  // Fallback: derive from session value (compatibility)
  if (session === 'ops') return mockOk({ roles: ['superadmin'] });
  if (session === 'admin') return mockOk({ roles: ['school_admin'] });
  return mockOk({ roles: ['teacher'] });
}

export async function POST(request: Request) {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value || jar.get(JWT_COOKIE)?.value;
  if (!session) return mockFail('AUTH_REQUIRED', 'Silakan masuk terlebih dahulu.', 401);

  const role = String((await request.formData()).get('role') ?? '');
  const cookieRoles =
    jar
      .get(ROLES_COOKIE)
      ?.value?.split(',')
      .map((value) => value.trim()) ?? [];
  const roles = isMockApiMode()
    ? (findMockAccountBySession(session)?.roles ?? ['teacher'])
    : [...new Set([...cookieRoles, ...parseRolesFromJwt(session)])];

  if (!ROLE_PATHS[role] || !roles.includes(role)) {
    return mockFail('ROLE_FORBIDDEN', 'Role tidak tersedia untuk akun ini.', 403);
  }

  const response = NextResponse.redirect(new URL(ROLE_PATHS[role], request.url), 303);
  response.cookies.set({
    name: ACTIVE_ROLE_COOKIE,
    value: role,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
