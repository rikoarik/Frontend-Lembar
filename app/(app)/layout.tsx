import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppShell } from '@/app/components/app/AppShell';
import { WorkspaceProvider } from '@/src/features/workspace/workspaceContext';
import type { Workspace } from '@/src/features/workspace/workspaceContext';
import { appOrigin, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

async function fetchMeData() {
  try {
    const jar = await cookies();
    const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const response = await fetch(`${appOrigin()}/v1/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Cookie: `${JWT_COOKIE}=${token}; ${SESSION_COOKIE}=${token}`,
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
  if (!me.activeWorkspace && me.workspaces.length === 0) {
    redirect('/app/onboarding');
  }

  const initialWorkspaces: Workspace[] | undefined = me?.workspaces.map((ws: any) => ({
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
  }));

  const initialActiveId = me?.activeWorkspace?.id ?? me?.activeWorkspaceId;
  const initialDisplayName = me?.account?.displayName;

  return (
    <WorkspaceProvider
      initialWorkspaces={initialWorkspaces}
      initialActiveId={initialActiveId}
      initialDisplayName={initialDisplayName}
    >
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}
