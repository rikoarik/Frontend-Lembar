'use client';

import { useEffect, useState } from 'react';

export type Role = 'teacher' | 'school_admin' | 'superadmin';

const ROLE_PATHS: Record<Role, string> = {
  teacher: '/app',
  school_admin: '/school',
  superadmin: '/ops',
};

export function activeRoleFromPathname(pathname: string): Role {
  if (pathname.startsWith('/ops')) return 'superadmin';
  if (pathname.startsWith('/school')) return 'school_admin';
  return 'teacher';
}

/** i18n key inside the `admin` namespace for a role label. */
const ROLE_LABEL_KEYS: Record<Role, string> = {
  teacher: 'roles.teacher',
  school_admin: 'roles.schoolAdmin',
  superadmin: 'roles.superadmin',
};

export function roleLabelKey(role: Role): string {
  return ROLE_LABEL_KEYS[role] ?? role;
}

export function rolePath(role: Role): string {
  return ROLE_PATHS[role] ?? '/app';
}

/**
 * Fetch the user's available roles from the lightweight /v1/me/roles endpoint.
 * Returns null while loading and empty array if no session.
 */
export function useRoles(): Role[] | null {
  const [roles, setRoles] = useState<Role[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/v1/me/roles', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((json: any) => {
        if (cancelled) return;
        const raw: string[] = json?.data?.roles ?? [];
        setRoles(
          raw.filter((r): r is Role => ['teacher', 'school_admin', 'superadmin'].includes(r)),
        );
      })
      .catch(() => {
        if (!cancelled) setRoles([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return roles;
}
