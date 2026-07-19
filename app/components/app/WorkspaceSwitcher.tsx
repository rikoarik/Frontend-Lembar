'use client';

import { useId, useState } from 'react';
import type { Workspace } from '@/src/features/workspace/workspaceContext';

type WorkspaceSwitcherProps = {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelect: (workspaceId: string) => void;
  compact?: boolean;
};

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspaceId,
  onSelect,
  compact = false,
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const labelId = useId();
  const active = workspaces.find((workspace) => workspace.id === activeWorkspaceId);

  return (
    <div className={compact ? 'w-full' : ''}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-brand-line bg-brand-surface-raised px-3 py-2 text-left text-body-default text-brand-ink hover:bg-brand-paper"
      >
        <span id={labelId} className="flex min-w-0 flex-col">
          <span className="text-caption text-brand-ink-muted">Workspace aktif</span>
          <span className="truncate font-semibold">{active?.name ?? 'Tanpa workspace'}</span>
        </span>
        <span aria-hidden="true" className="material-symbols-outlined text-brand-ink-muted">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      {open ? (
        <ul
          role="listbox"
          aria-label="Daftar workspace"
          className="mt-2 flex flex-col gap-1 rounded-md border border-brand-line bg-brand-surface-raised p-1 shadow-md"
        >
          {workspaces.map((workspace) => {
            const isActive = workspace.id === activeWorkspaceId;
            return (
              <li key={workspace.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setOpen(false);
                    onSelect(workspace.id);
                  }}
                  className={[
                    'flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-body-default',
                    isActive
                      ? 'bg-brand-accent-soft text-brand-accent'
                      : 'text-brand-ink hover:bg-brand-paper',
                  ].join(' ')}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-semibold">{workspace.name}</span>
                    <span className="text-caption text-brand-ink-muted">
                      {workspace.kind === 'school' ? 'Sekolah' : 'Pribadi'} ·{' '}
                      {workspace.activeRole === 'school_admin'
                        ? 'Admin sekolah'
                        : workspace.activeRole === 'superadmin'
                          ? 'Superadmin'
                          : 'Guru'}
                    </span>
                  </span>
                  {isActive ? (
                    <span aria-hidden="true" className="material-symbols-outlined">check</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
