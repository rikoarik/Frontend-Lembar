import 'server-only';

import { cookies } from 'next/headers';
import { findMockAccountBySession } from '@/src/lib/mock-api/accounts';
import {
  backendFetch,
  isMockApiMode,
  JWT_COOKIE,
  normalizeRoles,
  SESSION_COOKIE,
  type BackendUser,
} from '@/src/lib/api/session';

export async function authenticatedRoles(): Promise<string[]> {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) return [];

  if (isMockApiMode()) {
    return findMockAccountBySession(token)?.roles ?? [];
  }

  try {
    const response = await backendFetch('/v1/auth/me', {
      method: 'GET',
      token,
    });
    if (!response.ok) return [];
    const payload = await response.json().catch(() => null);
    const user = (payload?.user ?? payload?.data ?? payload) as BackendUser | null;
    return user ? normalizeRoles(user) : [];
  } catch {
    return [];
  }
}

export async function hasAnyAuthenticatedRole(requiredRoles: readonly string[]): Promise<boolean> {
  const roles = await authenticatedRoles();
  return requiredRoles.some((role) => roles.includes(role));
}
