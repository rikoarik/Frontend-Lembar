'use client';

import { useEffect, useState } from 'react';

export type ActorIdentity = {
  name: string | null;
  meta: string | null;
};

const ROLE_META: Record<string, string> = {
  superadmin: 'superadmin · least privilege',
  school_admin: 'admin sekolah',
  teacher: 'guru',
  subscriber: 'pelanggan',
};

/**
 * Identity shown in the admin/school shell chrome (sidebar footer + profile menu).
 *
 * FE-VER-02 F-3: the shell rendered a hardcoded `Ops Superadmin · platform ·
 * least privilege` for every signed-in account, so `/ops/profile` still showed a
 * fake identity in the shell even after the profile card itself was fixed. Read the
 * real account/role from `/v1/me` instead.
 *
 * Returns `null` while loading (the shell then shows a neutral placeholder rather
 * than a fabricated name).
 */
export function useActorIdentity(): ActorIdentity | null {
  const [identity, setIdentity] = useState<ActorIdentity | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/v1/me', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          body: {
            data?: {
              account?: { displayName?: string; email?: string };
              activeWorkspace?: { role?: string };
            };
          } | null,
        ) => {
          if (cancelled) return;
          const account = body?.data?.account;
          const role = body?.data?.activeWorkspace?.role ?? '';
          setIdentity({
            name: account?.displayName?.trim() || account?.email?.trim() || null,
            meta: account?.email?.trim() || ROLE_META[role] || role || null,
          });
        },
      )
      .catch(() => {
        if (!cancelled) setIdentity({ name: null, meta: null });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return identity;
}
