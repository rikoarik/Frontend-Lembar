'use client';

import { Button } from '@/app/components/ui';

type TopBarProps = {
  workspaceName: string;
  onOpenMobileNav: () => void;
  onOpenSwitcher: () => void;
  displayName: string;
};

export function TopBar({ workspaceName, onOpenMobileNav, onOpenSwitcher, displayName }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-[var(--z-sticky)] flex h-14 items-center justify-between gap-3 border-b border-brand-line bg-brand-surface-raised px-4 md:px-6"
      role="banner"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-brand-line bg-brand-surface-raised text-brand-ink hover:bg-brand-paper md:hidden"
          aria-label="Buka navigasi"
          onClick={onOpenMobileNav}
        >
          <span aria-hidden="true" className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex min-w-0 flex-col">
          <span className="text-caption text-brand-ink-muted">lembar</span>
          <span className="truncate text-body-default font-semibold text-brand-ink">
            Dashboard
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenSwitcher}
          aria-label={`Ganti workspace, saat ini ${workspaceName}`}
        >
          <span aria-hidden="true" className="material-symbols-outlined">workspaces</span>
          <span className="truncate">{workspaceName}</span>
        </Button>
        <span
          className="hidden h-10 items-center gap-2 rounded-md border border-brand-line bg-brand-paper px-3 text-body-sm text-brand-ink sm:inline-flex"
          aria-label={`Pengguna aktif ${displayName}`}
        >
          <span aria-hidden="true" className="material-symbols-outlined">account_circle</span>
          <span className="truncate">{displayName}</span>
        </span>
      </div>
    </header>
  );
}
