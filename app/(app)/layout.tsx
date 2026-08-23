import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppShell } from '@/app/components/app/AppShell';
import { QueryProvider } from '@/app/components/QueryProvider';
import { WorkspaceProvider } from '@/src/features/workspace/workspaceContext';
import type { Workspace } from '@/src/features/workspace/workspaceContext';
import {
  ACTIVE_ROLE_COOKIE,
  ACTIVE_WORKSPACE_COOKIE,
  appOrigin,
  JWT_COOKIE,
  SESSION_COOKIE,
} from '@/src/lib/api/session';

async function fetchMeData() {
  try {
    const jar = await cookies();
    const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const activeRole = jar.get(ACTIVE_ROLE_COOKIE)?.value;
    const activeWorkspace = jar.get(ACTIVE_WORKSPACE_COOKIE)?.value;
    const cookieHeader = [
      `${JWT_COOKIE}=${token}`,
      `${SESSION_COOKIE}=${token}`,
      activeRole ? `${ACTIVE_ROLE_COOKIE}=${activeRole}` : null,
      activeWorkspace ? `${ACTIVE_WORKSPACE_COOKIE}=${activeWorkspace}` : null,
    ]
      .filter(Boolean)
      .join('; ');

    const response = await fetch(`${appOrigin()}/v1/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: any };
    return payload?.data ?? null;
  } catch {
    return null;
  }
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const me = await fetchMeData();

  if (!me) redirect('/masuk');

  // No active workspace → send to onboarding
  if (!me.activeWorkspace && (!Array.isArray(me.workspaces) || me.workspaces.length === 0)) {
    redirect('/app/onboarding');
  }

  const initialWorkspaces: Workspace[] | undefined = Array.isArray(me?.workspaces)
    ? me.workspaces.map((ws: any) => ({
        id: ws.id,
        name: ws.name,
        kind: ws.type === 'school' ? 'school' : 'personal',
        activeRole:
          ws.role === 'school_admin'
            ? 'school_admin'
            : ws.role === 'superadmin'
              ? 'superadmin'
              : ws.role === 'subscriber'
                ? 'subscriber'
                : 'teacher',
      }))
    : undefined;

  const initialActiveId = me?.activeWorkspace?.id ?? me?.activeWorkspaceId;
  const initialDisplayName = me?.account?.displayName;

  return (
    <WorkspaceProvider
      initialWorkspaces={initialWorkspaces}
      initialActiveId={initialActiveId}
      initialDisplayName={initialDisplayName}
    >
      <QueryProvider>
        <AppShell>{children}</AppShell>
      </QueryProvider>
    </WorkspaceProvider>
  );
}
