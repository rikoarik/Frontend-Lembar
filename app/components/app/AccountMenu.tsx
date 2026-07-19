'use client';

import Link from 'next/link';

type AccountMenuProps = {
  displayName: string;
  planLabel: string;
};

export function AccountMenu({ displayName, planLabel }: AccountMenuProps) {
  return (
    <div className="flex w-full flex-col gap-1 rounded-md border border-brand-line bg-brand-surface-raised p-2 text-body-sm">
      <div className="flex flex-col px-2 py-1">
        <span className="text-body-default font-semibold text-brand-ink">{displayName}</span>
        <span className="text-caption text-brand-ink-muted">{planLabel}</span>
      </div>
      <Link href="/app/profil" className="rounded-md px-2 py-1 text-brand-ink hover:bg-brand-paper">
        Profil
      </Link>
      <Link href="/app/plan" className="rounded-md px-2 py-1 text-brand-ink hover:bg-brand-paper">
        Paket &amp; kuota
      </Link>
      <Link href="/bantuan" className="rounded-md px-2 py-1 text-brand-ink hover:bg-brand-paper">
        Bantuan
      </Link>
      <Link
        href="/masuk"
        className="rounded-md px-2 py-1 text-brand-danger hover:bg-brand-danger-soft"
      >
        Keluar
      </Link>
    </div>
  );
}
