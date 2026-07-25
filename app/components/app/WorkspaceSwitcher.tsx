'use client';

import { useId, useRef, useState } from 'react';
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const active = workspaces.find((workspace) => workspace.id === activeWorkspaceId);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} onBlur={handleBlur} className="relative w-full">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={() => setOpen((prev) => !prev)}
        title={active?.name ?? 'Workspace'}
        aria-label={`Workspace saat ini: ${active?.name}`}
        className={[
          'flex w-full items-center gap-2 rounded-xl border border-[#e6dfd4] bg-white hover:bg-[#f7f3ec]',
          compact ? 'justify-center p-2' : 'justify-between px-3 py-2.5 text-left',
        ].join(' ')}
      >
        {compact ? (
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-[#8a8379]">
            workspaces
          </span>
        ) : (
          <>
            <span id={labelId} className="flex min-w-0 flex-col">
              <span className="text-[11px] font-medium text-[#8a8379]">Workspace</span>
              <span className="truncate text-[13px] font-semibold text-[#171717]">
                {active?.name ?? 'Tanpa workspace'}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[18px] text-[#8a8379]"
            >
              {open ? 'expand_less' : 'expand_more'}
            </span>
          </>
        )}
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Daftar workspace"
          className={[
            'absolute top-full z-[var(--z-popover,50)] mt-1.5 overflow-hidden rounded-xl border border-[#e6dfd4] bg-white p-1.5 shadow-[0_12px_40px_rgba(23,23,23,0.12)]',
            compact ? 'left-0 w-56' : 'left-0 right-0',
          ].join(' ')}
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
                    onSelect(workspace.id);
                    setOpen(false);
                  }}
                  className={[
                    'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left',
                    isActive ? 'bg-[#f0ebe3]' : 'hover:bg-[#f7f3ec]',
                  ].join(' ')}
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-semibold text-[#171717]">
                      {workspace.name}
                    </span>
                    <span className="text-[11px] text-[#6d665d]">
                      {workspace.kind === 'school' ? 'Sekolah' : 'Pribadi'} ·{' '}
                      {workspace.activeRole === 'school_admin'
                        ? 'Admin sekolah'
                        : workspace.activeRole === 'superadmin'
                          ? 'Superadmin'
                          : 'Guru'}
                    </span>
                  </span>
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined ml-auto text-[16px] text-[#171717]"
                    >
                      check
                    </span>
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
