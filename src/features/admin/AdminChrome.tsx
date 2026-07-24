'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useTransition, type ReactNode } from 'react';
import { Button, StatusBadge } from '@/app/components/ui';
import type { StatusLabel } from '@/app/components/ui';
import { useAdminPanel } from '@/src/features/admin/adminPanelState';
import {
  isAdminNavActive,
  type AdminColumn,
  type AdminNavItem,
  type AdminTone,
} from '@/src/features/admin/types';

export type { AdminColumn, AdminNavItem, AdminTone };

function initials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function AdminAvatar({
  name,
  size = 'md',
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dim = size === 'sm' ? 'h-7 w-7 text-[10px]' : size === 'lg' ? 'h-10 w-10 text-body-sm' : 'h-8 w-8 text-[11px]';
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-accent-soft font-semibold text-brand-accent ring-1 ring-inset ring-brand-line ${dim}`}
    >
      {initials(name)}
    </span>
  );
}

export function AdminStatCards({
  items,
}: {
  items: Array<{ label: string; value: string; hint?: string; tone?: AdminTone; delta?: string }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="group rounded-[12px] border border-brand-line bg-brand-surface-raised p-4 transition-colors duration-[var(--motion-fast)] hover:border-brand-line-strong"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="text-[12px] font-medium tracking-[-0.01em] text-brand-ink-muted">
              {item.label}
            </div>
            {item.tone ? <AdminDot tone={item.tone} /> : null}
          </div>
          <div className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.03em] text-brand-ink">
            {item.value}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[12px] text-brand-ink-muted">
            {item.delta ? (
              <span className="rounded-full bg-brand-paper px-2 py-0.5 font-medium text-brand-ink">
                {item.delta}
              </span>
            ) : null}
            {item.hint ? <span>{item.hint}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminDot({ tone }: { tone: AdminTone }) {
  const color =
    tone === 'ok'
      ? 'bg-brand-success'
      : tone === 'warn'
        ? 'bg-brand-warning'
        : tone === 'bad'
          ? 'bg-brand-danger'
          : tone === 'info'
            ? 'bg-brand-info'
            : 'bg-brand-line-strong';
  return <span className={`mt-1 inline-block h-1.5 w-1.5 rounded-full ${color}`} aria-hidden />;
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
    <div className="flex flex-col gap-3 rounded-[12px] border border-brand-line bg-brand-surface-raised p-3 lg:flex-row lg:items-center lg:justify-between">
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
            className="min-h-[40px] w-full rounded-[10px] border border-brand-line bg-brand-paper/70 py-2 pl-10 pr-3 text-[13px] text-brand-ink placeholder:text-brand-ink-subtle focus-visible:border-brand-line-strong"
          />
        </label>
        {filters ? <div className="flex flex-wrap items-center gap-2">{filters}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminFilterChip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[36px] items-center rounded-full border px-3 text-[12px] font-medium transition-colors ${
        active
          ? 'border-brand-ink bg-brand-ink text-white'
          : 'border-brand-line bg-brand-surface-raised text-brand-ink-muted hover:border-brand-line-strong hover:text-brand-ink'
      }`}
    >
      {children}
    </button>
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
      <div className="rounded-[12px] border border-dashed border-brand-line bg-brand-surface-raised px-6 py-14 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-paper text-brand-ink-muted ring-1 ring-brand-line">
          <span className="material-symbols-outlined text-[20px]" aria-hidden>
            inbox
          </span>
        </div>
        <p className="text-[14px] font-medium text-brand-ink">{emptyLabel}</p>
        {emptyHint ? <p className="mt-1 text-[13px] text-brand-ink-muted">{emptyHint}</p> : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[12px] border border-brand-line bg-brand-surface-raised">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-[13px]">
          <thead className="sticky top-0 z-[1] border-b border-brand-line bg-[#fcfaf7]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-ink-subtle ${
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
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-ink-subtle">
                  Aksi
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-brand-line/80 transition-colors duration-[var(--motion-fast)] hover:bg-[#fbf8f3]"
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
      <div className="flex items-center justify-between border-t border-brand-line bg-[#fcfaf7] px-4 py-2.5 text-[12px] text-brand-ink-muted">
        <span className="font-medium text-brand-ink">{rows.length} baris</span>
        <span>Mock data · non-production</span>
      </div>
    </div>
  );
}

function statusFromTone(tone: AdminTone): StatusLabel {
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

export function AdminBadge({ tone, label }: { tone: AdminTone; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <StatusBadge label={statusFromTone(tone)} />
      <span className="text-[12px] text-brand-ink-muted">{label}</span>
    </span>
  );
}

export function AdminPill({
  tone = 'neutral',
  children,
}: {
  tone?: AdminTone;
  children: ReactNode;
}) {
  const cls =
    tone === 'ok'
      ? 'bg-brand-success-soft text-brand-success ring-brand-success/20'
      : tone === 'warn'
        ? 'bg-brand-warning-soft text-brand-warning ring-brand-warning/20'
        : tone === 'bad'
          ? 'bg-brand-danger-soft text-brand-danger ring-brand-danger/20'
          : tone === 'info'
            ? 'bg-brand-info-soft text-brand-info ring-brand-info/20'
            : 'bg-brand-paper text-brand-ink-muted ring-brand-line';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${cls}`}>
      {children}
    </span>
  );
}

export function AdminContentLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite" aria-label="Memuat konten">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-[12px] border border-brand-line bg-brand-surface-raised" />
        ))}
      </div>
      <div className="h-12 animate-pulse rounded-[12px] border border-brand-line bg-brand-surface-raised" />
      <div className="h-80 animate-pulse rounded-[12px] border border-brand-line bg-brand-surface-raised" />
    </div>
  );
}

export function AdminShell({
  brand,
  title,
  subtitle,
  nav,
  topRight,
  children,
}: {
  brand: string;
  title: string;
  subtitle?: string;
  nav: AdminNavItem[];
  topRight?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast, setToast } = useAdminPanel();
  const isOps = brand.includes('ops');
  const roleLabel = isOps ? 'Ops Superadmin' : 'Admin Sekolah';
  const roleMeta = isOps ? 'platform · least privilege' : 'SDN Contoh 01';

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return;
      startTransition(() => {
        router.push(href);
      });
    },
    [pathname, router],
  );

  return (
    <div className="min-h-screen bg-[#f4efe7] text-brand-ink">
      <a
        href="#konten-admin"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-md focus:bg-brand-surface-raised focus:px-3 focus:py-2"
      >
        Lewati ke konten
      </a>
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-brand-line bg-[#fcfaf7] md:flex">
          <div className="border-b border-brand-line px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-accent text-white">
                <span className="material-symbols-outlined text-[18px]" aria-hidden>
                  {isOps ? 'admin_panel_settings' : 'apartment'}
                </span>
              </div>
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold tracking-[-0.02em]">{brand}</div>
                <div className="text-[11px] text-brand-ink-muted">Management console</div>
              </div>
            </div>
          </div>

          <nav aria-label="Navigasi panel" className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
            <div className="px-2.5 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-ink-subtle">
              Workspace
            </div>
            {nav.map((item) => {
              const active = isAdminNavActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  onClick={(event) => {
                    if (!event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) {
                      event.preventDefault();
                      navigate(item.href);
                    }
                  }}
                  className={`group flex items-center justify-between rounded-[10px] px-2.5 py-2 text-[13px] transition-colors duration-[var(--motion-fast)] ${
                    active
                      ? 'bg-brand-ink text-white'
                      : 'text-brand-ink-muted hover:bg-white hover:text-brand-ink'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        active ? 'text-white' : 'text-brand-ink-subtle group-hover:text-brand-ink'
                      }`}
                      aria-hidden
                    >
                      {item.icon || 'circle'}
                    </span>
                    <span className="truncate font-medium tracking-[-0.01em]">{item.label}</span>
                  </span>
                  {item.badge ? (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                        active ? 'bg-white/15 text-white' : 'bg-white text-brand-ink-muted ring-1 ring-brand-line'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-brand-line p-3">
            <div className="flex items-center gap-3 rounded-[12px] border border-brand-line bg-white p-3">
              <AdminAvatar name={roleLabel} />
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold tracking-[-0.01em]">{roleLabel}</div>
                <div className="truncate text-[11px] text-brand-ink-muted">{roleMeta}</div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-brand-line bg-[#fcfaf7]/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2 text-[12px] text-brand-ink-muted">
                  <span className="font-medium text-brand-ink-subtle">{brand}</span>
                  <span aria-hidden className="text-brand-line-strong">
                    /
                  </span>
                  <span className="font-medium text-brand-ink">{title}</span>
                  {isPending ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-info-soft px-2 py-0.5 text-[11px] font-medium text-brand-info">
                      <span className="material-symbols-outlined animate-spin text-[14px]" aria-hidden>
                        progress_activity
                      </span>
                      memuat
                    </span>
                  ) : null}
                </div>
                <h1 className="truncate text-[24px] font-semibold tracking-[-0.03em] text-brand-ink">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-1 max-w-3xl text-[13px] leading-5 text-brand-ink-muted">{subtitle}</p>
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

          <div className="border-b border-brand-line bg-[#fcfaf7] px-4 py-2 md:hidden">
            <nav aria-label="Navigasi panel mobile" className="flex gap-2 overflow-x-auto pb-1">
              {nav.map((item) => {
                const active = isAdminNavActive(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    onClick={(event) => {
                      if (!event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) {
                        event.preventDefault();
                        navigate(item.href);
                      }
                    }}
                    className={`inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-medium ${
                      active
                        ? 'border-brand-ink bg-brand-ink text-white'
                        : 'border-brand-line bg-white text-brand-ink'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]" aria-hidden>
                      {item.icon || 'circle'}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <main id="konten-admin" className="relative flex-1 space-y-4 p-4 md:p-6">
            {toast ? (
              <div
                className="flex items-start justify-between gap-3 rounded-[12px] border border-brand-line bg-white px-4 py-3 text-[13px] shadow-[0_1px_2px_rgb(23_23_23/0.06)]"
                role="status"
                aria-live="polite"
              >
                <span className="text-brand-ink">{toast}</span>
                <button
                  type="button"
                  className="text-[12px] font-medium text-brand-ink-muted hover:text-brand-ink"
                  onClick={() => setToast(null)}
                >
                  Tutup
                </button>
              </div>
            ) : null}

            <div className={isPending ? 'pointer-events-none' : ''}>
              {isPending ? (
                <div className="absolute inset-x-4 top-4 z-[1] md:inset-x-6 md:top-6">
                  <AdminContentLoading />
                </div>
              ) : null}
              <div className={isPending ? 'invisible' : 'space-y-4'}>{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
