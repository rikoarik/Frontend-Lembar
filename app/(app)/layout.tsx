import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { AppShell } from '@/app/components/app/AppShell';
import { WorkspaceProvider } from '@/src/features/workspace/workspaceContext';
import type { Workspace } from '@/src/features/workspace/workspaceContext';
import { apiClient } from '@/src/lib/api/client';

async function fetchMeData() {
  try {
    const { data, error } = await apiClient.GET('/v1/me');
    if (error || !data) return null;
    return data.data;
  } catch {
    return null;
  }
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const me = await fetchMeData();

  // No active workspace → send to onboarding
  if (me && !me.activeWorkspace && me.workspaces.length === 0) {
    redirect('/app/onboarding');
  }

  const initialWorkspaces: Workspace[] | undefined = me?.workspaces.map((ws) => ({
    id: ws.id,
    name: ws.name,
    kind: ws.type === 'school' ? 'school' : 'personal',
    activeRole:
      ws.role === 'school_admin'
        ? 'school_admin'
        : ws.role === 'superadmin'
          ? 'superadmin'
          : 'teacher',
  }));

  const initialActiveId = me?.activeWorkspace?.id ?? me?.activeWorkspaceId;
  const initialDisplayName = me?.account.displayName;

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
