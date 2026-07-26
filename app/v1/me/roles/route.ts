import { cookies } from 'next/headers';
import { findMockAccountBySession } from '@/src/lib/mock-api/accounts';
import { isMockApiMode, mockFail, mockOk } from '@/src/lib/mock-api/preview';
import { JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

const ROLES_COOKIE = 'lembar_roles';

/**
 * Lightweight endpoint: returns the current user's roles array.
 * Used by the client-side role switcher — avoids a full /v1/me round-trip.
 */
export async function GET() {
  const jar = await cookies();
  const session = jar.get(SESSION_COOKIE)?.value;

  if (!session) {
    return mockFail('AUTH_REQUIRED', 'Silakan masuk terlebih dahulu.', 401);
  }

  if (isMockApiMode()) {
    const account = findMockAccountBySession(session);
    const roles = account?.roles ?? ['teacher'];
    return mockOk({ roles });
  }

  // Live mode: read the httpOnly roles cookie set by login route
  const rolesStr = jar.get(ROLES_COOKIE)?.value;
  if (rolesStr) {
    const roles = rolesStr
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);
    return mockOk({ roles });
  }

  // Fallback: derive from session value (compatibility)
  if (session === 'ops') return mockOk({ roles: ['superadmin'] });
  if (session === 'admin') return mockOk({ roles: ['school_admin'] });
  return mockOk({ roles: ['teacher'] });
}
