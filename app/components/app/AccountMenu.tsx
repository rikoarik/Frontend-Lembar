'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

type AccountMenuProps = {
  displayName: string;
  planLabel: string;
};

export function AccountMenu({ displayName, planLabel }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} onBlur={handleBlur} className="relative w-full">
      {/* Popover overlay — muncul ke atas (bottom-full), tidak menggeser konten sidebar */}
      {open ? (
        <div className="absolute bottom-full left-0 right-0 z-[var(--z-popover,50)] mb-1 flex flex-col gap-1 rounded-md border border-brand-line bg-brand-surface-raised p-2 text-body-sm shadow-md">
          <div className="flex flex-col px-2 py-1">
            <span className="text-body-default font-semibold text-brand-ink">{displayName}</span>
            <span className="text-caption text-brand-ink-muted">{planLabel}</span>
          </div>
          <Link
            href="/app/pengaturan/profil"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-brand-ink hover:bg-brand-paper"
          >
            Profil
          </Link>
          <Link
            href="/app/pengaturan/langganan"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-brand-ink hover:bg-brand-paper"
          >
            Paket &amp; kuota
          </Link>
          <Link
            href="/bantuan"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-brand-ink hover:bg-brand-paper"
          >
            Bantuan
          </Link>
          <Link
            href="/masuk"
            onClick={() => setOpen(false)}
            className="rounded-md px-2 py-1 text-brand-danger hover:bg-brand-danger-soft"
          >
            Keluar
          </Link>
        </div>
      ) : null}

      {/* Trigger button permanen di bawah sidebar */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Menu profil ${displayName}`}
        className="flex w-full items-center gap-2 rounded-md border border-brand-line bg-brand-surface-raised px-3 py-2 text-left text-body-default text-brand-ink hover:bg-brand-paper"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-brand-ink-muted">
          account_circle
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate font-semibold leading-snug">{displayName}</span>
          <span className="text-caption text-brand-ink-muted">{planLabel}</span>
        </span>
        <span aria-hidden="true" className="material-symbols-outlined ml-auto text-brand-ink-muted">
          {open ? 'expand_more' : 'expand_less'}
        </span>
      </button>
    </div>
  );
}
