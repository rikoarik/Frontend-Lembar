'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

type AccountMenuProps = {
  displayName: string;
  planLabel: string;
};

export function AccountMenu({ displayName, planLabel }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    try {
      await fetch('/v1/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // still leave the session UI
    } finally {
      window.location.href = '/masuk';
    }
  };

  return (
    <div ref={wrapperRef} onBlur={handleBlur} className="relative w-full">
      {open ? (
        <div className="absolute bottom-full left-0 right-0 z-[var(--z-popover,50)] mb-2 overflow-hidden rounded-xl border border-[#e6dfd4] bg-white shadow-[0_12px_40px_rgba(23,23,23,0.12)]">
          <div className="border-b border-[#eee6da] px-3 py-3">
            <div className="truncate text-[13px] font-semibold text-[#171717]">{displayName}</div>
            <div className="truncate text-[12px] text-[#6d665d]">{planLabel}</div>
          </div>
          <div className="flex flex-col p-1.5 text-[13px]">
            <Link
              href="/app/pengaturan/profil"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2.5 py-2 text-[#171717] hover:bg-[#f7f3ec]"
            >
              Profil
            </Link>
            <Link
              href="/app/pengaturan/langganan"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2.5 py-2 text-[#171717] hover:bg-[#f7f3ec]"
            >
              Paket & kuota
            </Link>
            <Link
              href="/app/bantuan"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2.5 py-2 text-[#171717] hover:bg-[#f7f3ec]"
            >
              Bantuan
            </Link>
            <button
              type="button"
              disabled={busy}
              onClick={() => void logout()}
              className="rounded-lg px-2.5 py-2 text-left text-[#9f1d2d] hover:bg-[#fae5e8] disabled:opacity-60"
            >
              {busy ? 'Keluar…' : 'Keluar'}
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Menu profil ${displayName}`}
        className="flex w-full items-center gap-2.5 rounded-xl border border-[#e6dfd4] bg-white px-2.5 py-2 text-left hover:bg-[#f7f3ec]"
      >
        <span
          aria-hidden="true"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0ebe3] text-[12px] font-semibold text-[#514b44]"
        >
          {displayName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('') || 'U'}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[13px] font-semibold leading-snug text-[#171717]">
            {displayName}
          </span>
          <span className="truncate text-[11px] text-[#6d665d]">{planLabel}</span>
        </span>
        <span aria-hidden="true" className="material-symbols-outlined ml-auto text-[18px] text-[#8a8379]">
          {open ? 'expand_more' : 'expand_less'}
        </span>
      </button>
    </div>
  );
}
