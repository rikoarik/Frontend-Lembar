'use client';

import type { ReactNode } from 'react';
import { Button, StatusBadge } from '@/app/components/ui';
import type { StatusLabel } from '@/app/components/ui';

export type AdminColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
};

export function AdminStatCards({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-brand-line bg-brand-surface-raised px-4 py-3 shadow-sm"
        >
          <div className="text-caption text-brand-ink-muted">{item.label}</div>
          <div className="mt-1 text-h2 font-semibold text-brand-ink">{item.value}</div>
          {item.hint ? <div className="mt-1 text-caption text-brand-ink-muted">{item.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function AdminToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Cari…',
  filters,
  actions,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-brand-line bg-brand-surface-raised p-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Cari</span>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="min-h-[var(--control-md)] w-full rounded-md border border-brand-line px-3 text-body-sm"
          />
        </label>
        {filters}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminDataTable<T extends { id: string }>({
  columns,
  rows,
  emptyLabel = 'Tidak ada data.',
  rowActions,
}: {
  columns: Array<AdminColumn<T>>;
  rows: T[];
  emptyLabel?: string;
  rowActions?: (row: T) => ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-brand-line px-4 py-10 text-center text-body-sm text-brand-ink-muted">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-brand-line bg-brand-surface-raised">
      <table className="min-w-full border-collapse text-left text-body-sm">
        <thead className="bg-brand-paper text-caption uppercase tracking-wide text-brand-ink-muted">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={`px-3 py-3 font-semibold ${column.className ?? ''}`}>
                {column.header}
              </th>
            ))}
            {rowActions ? <th className="px-3 py-3 font-semibold">Aksi</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-brand-line hover:bg-brand-paper/70">
              {columns.map((column) => (
                <td key={column.key} className={`px-3 py-3 align-middle ${column.className ?? ''}`}>
                  {column.render(row)}
                </td>
              ))}
              {rowActions ? (
                <td className="px-3 py-3 align-middle">
                  <div className="flex flex-wrap gap-2">{rowActions(row)}</div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function statusFromTone(
  tone: 'ok' | 'warn' | 'bad' | 'info' | 'neutral',
): StatusLabel {
  switch (tone) {
    case 'ok':
      return 'Final';
    case 'warn':
      return 'Perlu ditinjau';
    case 'bad':
      return 'Gagal';
    case 'info':
      return 'Diproses';
    default:
      return 'Draft';
  }
}

export function AdminShell({
  brand,
  title,
  subtitle,
  nav,
  currentPath,
  topRight,
  children,
}: {
  brand: string;
  title: string;
  subtitle?: string;
  nav: Array<{ href: string; label: string; badge?: string }>;
  currentPath: string;
  topRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-paper text-brand-ink">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="hidden w-64 shrink-0 border-r border-brand-line bg-brand-surface-raised md:flex md:flex-col">
          <div className="border-b border-brand-line px-4 py-4">
            <div className="text-caption uppercase tracking-wide text-brand-ink-muted">{brand}</div>
            <div className="mt-1 text-body-default font-semibold">Management</div>
          </div>
          <nav aria-label="Navigasi panel" className="flex flex-1 flex-col gap-1 p-3">
            {nav.map((item) => {
              const active =
                item.href === currentPath ||
                (item.href !== '/school' &&
                  item.href !== '/ops' &&
                  currentPath.startsWith(item.href));
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-body-sm ${
                    active
                      ? 'bg-brand-accent-soft font-semibold text-brand-accent'
                      : 'text-brand-ink hover:bg-brand-paper'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span className="rounded-full bg-brand-line px-2 py-0.5 text-caption">
                      {item.badge}
                    </span>
                  ) : null}
                </a>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line bg-brand-surface-raised px-4 py-3">
            <div className="min-w-0">
              <h1 className="truncate text-h2 font-semibold">{title}</h1>
              {subtitle ? (
                <p className="text-body-sm text-brand-ink-muted">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {topRight}
              <Button
                size="sm"
                variant="secondary"
                onClick={async () => {
                  await fetch('/v1/auth/logout', { method: 'POST', credentials: 'include' });
                  window.location.href = '/masuk';
                }}
              >
                Keluar
              </Button>
            </div>
          </header>

          <div className="border-b border-brand-line bg-brand-surface-raised px-4 py-2 md:hidden">
            <nav aria-label="Navigasi panel mobile" className="flex gap-2 overflow-x-auto">
              {nav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-[var(--control-sm)] shrink-0 items-center rounded-md border border-brand-line px-3 text-body-sm"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <main id="main" className="flex-1 space-y-4 p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function AdminBadge({ tone, label }: { tone: 'ok' | 'warn' | 'bad' | 'info' | 'neutral'; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <StatusBadge label={statusFromTone(tone)} />
      <span className="text-caption text-brand-ink-muted">{label}</span>
    </span>
  );
}
