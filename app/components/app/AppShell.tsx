'use client';

import { useState } from 'react';
import { LeftRail } from './LeftRail';
import { TopBar } from './TopBar';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { AccountMenu } from './AccountMenu';
import { ImpersonationBanner } from '@/app/components/auth/ImpersonationBanner';
import { useWorkspace } from '@/src/features/workspace/workspaceContext';

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { activeWorkspace, workspaces, switchWorkspace, announcement, displayName } =
    useWorkspace();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const switcher = (
    <WorkspaceSwitcher
      workspaces={workspaces}
      activeWorkspaceId={activeWorkspace.id}
      onSelect={switchWorkspace}
      compact={collapsed}
    />
  );

  const accountMenu = (
    <AccountMenu displayName={displayName} planLabel="Paket Guru" compact={collapsed} />
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f3eee6] text-[#171717]">
      <ImpersonationBanner />
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-md focus:bg-white focus:px-3 focus:py-2"
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

      <div className="flex min-h-0 flex-1">
        <div className="hidden h-full shrink-0 md:block">
          <LeftRail
            activeWorkspaceKind={activeWorkspace.kind}
            activeRole={activeWorkspace.activeRole}
            workspaceSwitcher={switcher}
            accountMenu={accountMenu}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((prev) => !prev)}
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
              className="absolute inset-0 bg-[#171717]/25"
              aria-label="Tutup navigasi"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-[min(18rem,90vw)] overflow-hidden bg-[#fbf8f2] shadow-xl">
              <LeftRail
                activeWorkspaceKind={activeWorkspace.kind}
                activeRole={activeWorkspace.activeRole}
                onNavigate={() => setMobileNavOpen(false)}
                workspaceSwitcher={switcher}
                accountMenu={accountMenu}
              />
            </div>
          </div>
        ) : null}

        <main
          id="konten-utama"
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6 md:py-6"
          data-lenis-prevent
        >
          {children}
        </main>
      </div>
    </div>
  );
}
