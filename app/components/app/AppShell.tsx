'use client';

import { useState } from 'react';
import { LeftRail } from './LeftRail';
import { TopBar } from './TopBar';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { AccountMenu } from './AccountMenu';
import { useWorkspace } from '@/src/features/workspace/workspaceContext';

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { activeWorkspace, workspaces, switchWorkspace, announcement, displayName } = useWorkspace();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const switcher = (
    <WorkspaceSwitcher
      workspaces={workspaces}
      activeWorkspaceId={activeWorkspace.id}
      onSelect={switchWorkspace}
    />
  );

  return (
    <div className="min-h-screen bg-brand-paper text-brand-ink">
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-md focus:bg-brand-surface-raised focus:px-3 focus:py-2"
      >
        Lewati ke konten utama
      </a>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <TopBar
        workspaceName={activeWorkspace.name}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onOpenSwitcher={() => setMobileNavOpen(true)}
        displayName={displayName}
      />
      <div className="flex min-h-[calc(100vh-56px)]">
        <div className="hidden md:block">
          <LeftRail
            activeWorkspaceKind={activeWorkspace.kind}
            activeRole={activeWorkspace.activeRole}
            workspaceSwitcher={
              <>
                {switcher}
                <AccountMenu displayName={displayName} planLabel="Paket Guru" />
              </>
            }
          />
        </div>

        {mobileNavOpen ? (
          <div
            className="fixed inset-0 z-[var(--z-modal)] md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi aplikasi"
          >
            <button
              type="button"
              className="absolute inset-0 bg-brand-ink/20"
              aria-label="Tutup navigasi"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-[min(20rem,92vw)] bg-brand-surface-raised">
              <LeftRail
                activeWorkspaceKind={activeWorkspace.kind}
                activeRole={activeWorkspace.activeRole}
                onNavigate={() => setMobileNavOpen(false)}
                workspaceSwitcher={
                  <>
                    {switcher}
                    <AccountMenu displayName={displayName} planLabel="Paket Guru" />
                  </>
                }
              />
            </div>
          </div>
        ) : null}

        <main id="konten-utama" className="min-w-0 flex-1 px-4 py-4 md:px-6 md:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
