import type { ReactNode } from 'react';
import { AppShell } from '@/app/components/app/AppShell';
import { WorkspaceProvider } from '@/src/features/workspace/workspaceContext';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}
