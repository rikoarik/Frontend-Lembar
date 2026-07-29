import 'server-only';
import { cache } from 'react';
import { backendFetch, homePathForRoles, normalizeRoles, readJwtFromCookies } from './session';

export const getMarketingSession = cache(async () => {
  const token = await readJwtFromCookies();
  if (!token) return null;

  const response = await backendFetch('/v1/auth/me', { token });
  if (!response.ok) return null;

  const payload = await response.json().catch(() => null);
  const user = payload?.user ?? payload?.data ?? payload;
  if (!user?.id) return null;

  return {
    displayName: String(user.name ?? user.email ?? 'Akun'),
    homePath: homePathForRoles(normalizeRoles(user)),
  };
});
