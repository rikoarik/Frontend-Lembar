'use client';

import type { ReactNode } from 'react';
import { Button, StatusBadge } from '@/app/components/ui';
import type { StatusLabel } from '@/app/components/ui';

export type AdminColumn<T> = {
  key: string;
  header: string;
  className?: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => ReactNode;
};

const toneAccent: Record<'ok' | 'warn' | 'bad' | 'info' | 'neutral', string> = {
  ok: 'from-brand-success/15 to-transparent',
  warn: 'from-brand-warning/15 to-transparent',
  bad: 'from-brand-danger/15 to-transparent',
  info: 'from-brand-info/15 to-transparent',
  neutral: 'from-brand-line/40 to-transparent',
};

export function AdminStatCards({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string; tone?: 'ok' | 'warn' | 'bad' | 'info' | 'neutral' }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const tone = item.tone ?? 'neutral';
        return (
          <div
            key={item.label}
            className="relative overflow-hidden rounded-[var(--radius-lg)] border border-brand-line/80 bg-brand-surface-raised p-4 shadow-[var(--shadow-sm)]"
          >
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${toneAccent[tone]}`}
            />
            <div className="relative">
              <div className="text-caption font-medium uppercase tracking-[0.06em] text-brand-ink-muted">
                {item.label}
              </div>
              <div className="mt-2 text-[1.75rem] font-semibold leading-none tracking-tight text-brand-ink">
                {item.value}
              </div>
              {item.hint ? (
                <div className="mt-2 text-caption text-brand-ink-muted">{item.hint}</div>
              ) : null}
            </div>
          </div>
        );
      })}
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
    <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-brand-line/80 bg-brand-surface-raised p-3 shadow-[var(--shadow-sm)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Cari</span>
          <span
            aria-hidden
            className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-brand-ink-subtle"
          >
            search
          </span>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="min-h-[var(--control-md)] w-full rounded-full border border-brand-line bg-brand-paper/60 py-2 pl-10 pr-3 text-body-sm text-brand-ink placeholder:text-brand-ink-subtle focus-visible:border-brand-line-strong"
          />
        </label>
        {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminDataTable<T extends { id: string }>({
  columns,
  rows,
  emptyLabel = 'Tidak ada data.',
  emptyHint,
  rowActions,
  density = 'comfortable',
}: {
  columns: Array<AdminColumn<T>>;
  rows: T[];
  emptyLabel?: string;
  emptyHint?: string;
  rowActions?: (row: T) => ReactNode;
  density?: 'compact' | 'comfortable';
}) {
  const cellY = density === 'compact' ? 'py-2.5' : 'py-3.5';

  if (rows.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-brand-line bg-brand-surface-raised px-6 py-14 text-center shadow-[var(--shadow-sm)]">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-paper text-brand-ink-muted">
          <span className="material-symbols-outlined text-[22px]" aria-hidden>
            inbox
          </span>
        </div>
        <p className="text-body-default font-medium text-brand-ink">{emptyLabel}</p>
        {emptyHint ? <p className="mt-1 text-body-sm text-brand-ink-muted">{emptyHint}</p> : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-brand-line/80 bg-brand-surface-raised shadow-[var(--shadow-sm)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-body-sm">
          <thead className="sticky top-0 z-[1] border-b border-brand-line bg-brand-paper/95 backdrop-blur">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-caption font-semibold uppercase tracking-[0.05em] text-brand-ink-muted ${
                    column.align === 'right'
                      ? 'text-right'
                      : column.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                  } ${column.className ?? ''}`}
                >
                  {column.header}
                </th>
              ))}
              {rowActions ? (
                <th className="px-4 py-3 text-right text-caption font-semibold uppercase tracking-[0.05em] text-brand-ink-muted">
                  Aksi
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={`border-t border-brand-line/70 transition-colors duration-[var(--motion-fast)] hover:bg-brand-accent-soft/35 ${
                  index % 2 === 1 ? 'bg-brand-paper/35' : 'bg-transparent'
                }`}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 ${cellY} align-middle text-brand-ink ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    } ${column.className ?? ''}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
                {rowActions ? (
                  <td className={`px-4 ${cellY} align-middle`}>
                    <div className="flex flex-wrap justify-end gap-1.5">{rowActions(row)}</div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-brand-line bg-brand-paper/60 px-4 py-2.5 text-caption text-brand-ink-muted">
        <span>{rows.length} baris</span>
        <span>Mock data · tidak live</span>
      </div>
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

function isNavActive(href: string, currentPath: string): boolean {
  if (href === currentPath) return true;
  if (href === '/school' || href === '/ops') return false;
  return currentPath.startsWith(`${href}/`) || currentPath.startsWith(href);
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
  nav: Array<{ href: string; label: string; badge?: string; icon?: string }>;
  currentPath: string;
  topRight?: ReactNode;
  children: ReactNode;
}) {
  const roleLabel = brand.includes('ops') ? 'Superadmin' : 'School Admin';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(163,32,43,0.06),_transparent_28%),linear-gradient(180deg,_#f3eee6_0%,_var(--color-paper)_42%,_#f7f3ec_100%)] text-brand-ink">
      <div className="mx-auto flex min-h-screen max-w-[1480px]">
        <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col border-r border-brand-line/80 bg-brand-surface-raised/95 backdrop-blur md:flex">
          <div className="border-b border-brand-line/80 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent text-white shadow-[var(--shadow-sm)]">
                <span className="material-symbols-outlined text-[20px]" aria-hidden>
                  {brand.includes('ops') ? 'admin_panel_settings' : 'apartment'}
                </span>
              </div>
              <div className="min-w-0">
                <div className="truncate text-body-default font-semibold tracking-tight">{brand}</div>
                <div className="text-caption text-brand-ink-muted">Management console</div>
              </div>
            </div>
          </div>

          <nav aria-label="Navigasi panel" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
            <div className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-ink-subtle">
              Menu
            </div>
            {nav.map((item) => {
              const active = isNavActive(item.href, currentPath);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-body-sm transition-colors duration-[var(--motion-fast)] ${
                    active
                      ? 'bg-brand-accent text-white shadow-[var(--shadow-sm)]'
                      : 'text-brand-ink hover:bg-brand-paper'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        active ? 'text-white/95' : 'text-brand-ink-muted group-hover:text-brand-ink'
                      }`}
                      aria-hidden
                    >
                      {item.icon || 'circle'}
                    </span>
                    <span className="truncate font-medium">{item.label}</span>
                  </span>
                  {item.badge ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        active ? 'bg-white/20 text-white' : 'bg-brand-paper text-brand-ink-muted'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </a>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-brand-line/80 p-4">
            <div className="rounded-xl border border-brand-line bg-brand-paper/70 p-3">
              <div className="text-caption text-brand-ink-muted">Signed in as</div>
              <div className="mt-0.5 text-body-sm font-semibold">{roleLabel}</div>
              <div className="mt-2 text-caption text-brand-ink-subtle">Mock session · non-production</div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-brand-line/80 bg-brand-surface-raised/90 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2 text-caption text-brand-ink-muted">
                  <span>{brand}</span>
                  <span aria-hidden>/</span>
                  <span className="text-brand-ink">{title}</span>
                </div>
                <h1 className="truncate text-[1.45rem] font-semibold tracking-tight text-brand-ink">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-0.5 max-w-3xl text-body-sm text-brand-ink-muted">{subtitle}</p>
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
            </div>
          </header>

          <div className="border-b border-brand-line/80 bg-brand-surface-raised/90 px-4 py-2 backdrop-blur md:hidden">
            <nav aria-label="Navigasi panel mobile" className="flex gap-2 overflow-x-auto pb-1">
              {nav.map((item) => {
                const active = isNavActive(item.href, currentPath);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`inline-flex min-h-[var(--control-sm)] shrink-0 items-center gap-1.5 rounded-full border px-3 text-body-sm ${
                      active
                        ? 'border-brand-accent bg-brand-accent text-white'
                        : 'border-brand-line bg-brand-paper text-brand-ink'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]" aria-hidden>
                      {item.icon || 'circle'}
                    </span>
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>

          <main id="main" className="flex-1 space-y-5 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function AdminBadge({
  tone,
  label,
}: {
  tone: 'ok' | 'warn' | 'bad' | 'info' | 'neutral';
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <StatusBadge label={statusFromTone(tone)} />
      <span className="text-caption text-brand-ink-muted">{label}</span>
    </span>
  );
}

export function AdminSectionCard({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[var(--radius-lg)] border border-brand-line/80 bg-brand-surface-raised shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-brand-line/70 px-4 py-3.5">
        <div className="min-w-0">
          <h2 className="text-body-default font-semibold text-brand-ink">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-body-sm text-brand-ink-muted">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
