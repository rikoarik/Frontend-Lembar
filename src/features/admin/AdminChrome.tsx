'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from 'react';
import { Button, StatusBadge } from '@/app/components/ui';
import type { StatusLabel } from '@/app/components/ui';
import { ImpersonationBanner } from '@/app/components/auth/ImpersonationBanner';
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

const AVATAR_TONES = [
  'bg-[#f5e4e5] text-[#851925]',
  'bg-[#e4f2ea] text-[#176b45]',
  'bg-[#e3eff7] text-[#245a82]',
  'bg-[#fff0cf] text-[#8a5400]',
  'bg-[#ece8e2] text-[#3f3a34]',
];

function avatarTone(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash + name.charCodeAt(i) * (i + 1)) % 997;
  return AVATAR_TONES[hash % AVATAR_TONES.length] ?? AVATAR_TONES[0];
}

export function AdminAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const dim =
    size === 'sm'
      ? 'h-7 w-7 text-[10px]'
      : size === 'lg'
        ? 'h-10 w-10 text-body-sm'
        : 'h-8 w-8 text-[11px]';
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-inset ring-black/5 ${dim} ${avatarTone(name)}`}
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        let borderAccent = 'border-t-2 border-t-[#b9afa2]';
        if (item.tone === 'ok') borderAccent = 'border-t-2 border-t-[#176b45]';
        if (item.tone === 'warn') borderAccent = 'border-t-2 border-t-[#8a5400]';
        if (item.tone === 'bad') borderAccent = 'border-t-2 border-t-[#851925]';
        if (item.tone === 'info') borderAccent = 'border-t-2 border-t-[#245a82]';

        return (
          <div
            key={item.label}
            className={`relative overflow-hidden rounded-2xl border border-[#ddd4c8]/80 bg-white p-5 shadow-[0_2px_12px_rgba(23,23,23,0.01),0_1px_2px_rgba(23,23,23,0.02)] hover:shadow-[0_8px_24px_rgba(23,23,23,0.06)] hover:-translate-y-0.5 transition-all duration-300 ${borderAccent}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-bold tracking-wider uppercase text-[#6d665d]/90">
                {item.label}
              </div>
              {item.delta ? (
                <span className="inline-flex items-center rounded-full bg-[#f4eade] px-2 py-0.5 text-[9px] font-bold text-[#514b44] uppercase tracking-wider">
                  {item.delta}
                </span>
              ) : null}
            </div>
            <div className="mt-3.5 text-[34px] font-extrabold tracking-[-0.05em] text-[#171717] leading-none">
              {item.value}
            </div>
            <div className="mt-3.5 flex items-center gap-1.5 text-[12px] text-[#8a8379]">
              {item.tone ? <AdminDot tone={item.tone} /> : null}
              {item.hint ? <span className="font-medium text-[#6d665d]">{item.hint}</span> : null}
            </div>
          </div>
        );
      })}
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
            : 'bg-[#b9afa2]';
  return <span className={`mt-1 inline-block h-2 w-2 rounded-full ${color}`} aria-hidden />;
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
    <div className="flex flex-col gap-3 rounded-xl border border-[#ddd4c8] bg-white p-3 shadow-[0_1px_0_rgba(23,23,23,0.03)] lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Cari</span>
          <span
            aria-hidden
            className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#8a8379]"
          >
            search
          </span>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="min-h-[40px] w-full rounded-lg border border-[#ddd4c8] bg-[#f7f3ec] py-2 pl-10 pr-3 text-[13px] text-[#171717] placeholder:text-[#8a8379] focus-visible:border-[#b9afa2]"
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
      className={`inline-flex min-h-[34px] items-center rounded-lg border px-3 text-[12px] font-medium transition-colors ${
        active
          ? 'border-[#171717] bg-[#171717] text-white'
          : 'border-[#ddd4c8] bg-white text-[#6d665d] hover:border-[#b9afa2] hover:text-[#171717]'
      }`}
    >
      {children}
    </button>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
  meta,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-[#ddd4c8]/70 bg-white px-5 py-3.5 sm:py-4 shadow-[0_2px_12px_rgba(23,23,23,0.01),0_1px_2px_rgba(23,23,23,0.02)] sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-[18px] font-bold leading-normal pb-0.5 tracking-[-0.03em] text-[#171717]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[#6d665d]">{description}</p>
        ) : null}
        {meta ? <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminEmptyState({
  title = 'Tidak ada data.',
  description,
  action,
  icon = 'inbox',
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#ddd4c8] bg-white px-6 py-14 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#f0ebe3] text-[#6d665d]">
        <span className="material-symbols-outlined text-[22px]" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="text-[14px] font-semibold text-[#171717]">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-[13px] text-[#6d665d]">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function AdminBulkBar({
  count,
  children,
  onClear,
}: {
  count: number;
  children: ReactNode;
  onClear?: () => void;
}) {
  if (count <= 0) return null;
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#171717] bg-[#171717] px-3 py-2.5 text-white sm:flex-row sm:items-center sm:justify-between">
      <div className="text-[13px] font-medium">
        <span className="font-semibold tabular-nums">{count}</span> dipilih
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Bersihkan pilihan"
            className="rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-white/75 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          >
            Bersihkan
          </button>
        ) : null}
      </div>
    </div>
  );
}
export function AdminDataTable<T extends { id: string }>({
  columns,
  rows,
  emptyLabel = 'Tidak ada data.',
  emptyHint,
  emptyAction,
  rowActions,
  density = 'comfortable',
  footerNote = 'Data preview',
  selectable = false,
  selectedIds = [],
  onToggleRow,
  onToggleAll,
  flat = false,
}: {
  columns: Array<AdminColumn<T>>;
  rows: T[];
  emptyLabel?: string;
  emptyHint?: string;
  emptyAction?: ReactNode;
  rowActions?: (row: T) => ReactNode;
  density?: 'comfortable' | 'compact';
  footerNote?: string;
  selectable?: boolean;
  selectedIds?: string[];
  onToggleRow?: (id: string) => void;
  onToggleAll?: (ids: string[]) => void;
  flat?: boolean;
}) {
  const cellY = density === 'compact' ? 'py-2' : 'py-3';
  const allSelected =
    selectable && rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));
  const someSelected =
    selectable && rows.some((row) => selectedIds.includes(row.id)) && !allSelected;

  if (rows.length === 0) {
    return (
      <AdminEmptyState
        title={emptyLabel}
        description={emptyHint}
        action={emptyAction}
        icon="filter_alt_off"
      />
    );
  }

  const containerCls = flat
    ? 'overflow-hidden border-t border-[#ddd4c8]/50'
    : 'overflow-hidden rounded-2xl border border-[#ddd4c8]/70 bg-white shadow-[0_8px_24px_rgba(23,23,23,0.02),0_1px_3px_rgba(23,23,23,0.02)]';

  return (
    <div className={containerCls}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-[13px]">
          <thead className="bg-[#faf8f5] border-b border-[#ddd4c8]/50 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6d665d]">
            <tr>
              {selectable ? (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Pilih semua baris"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={() => {
                      if (!onToggleAll) return;
                      onToggleAll(allSelected ? [] : rows.map((row) => row.id));
                    }}
                    className="h-4 w-4 rounded border-[#b9afa2] text-[#171717] focus:ring-[#171717]/30"
                  />
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3.5 ${
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
              {rowActions ? <th className="px-4 py-3.5 text-right">Aksi</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const selected = selectedIds.includes(row.id);
              return (
                <tr
                  key={row.id}
                  className={`border-t border-[#eee6da]/50 transition-colors hover:bg-[#fbf9f6]/80 ${
                    selected ? 'bg-[#f5efe6]/70' : ''
                  }`}
                >
                  {selectable ? (
                    <td className={`px-4 ${cellY} align-middle`}>
                      <input
                        type="checkbox"
                        aria-label={`Pilih ${row.id}`}
                        checked={selected}
                        onChange={() => onToggleRow?.(row.id)}
                        className="h-4 w-4 rounded border-[#b9afa2] text-[#171717] focus:ring-[#171717]/30"
                      />
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 ${cellY} align-middle ${
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
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        {rowActions(row)}
                      </div>
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-[#ddd4c8]/40 bg-[#faf8f5] px-4 py-3 text-[12px] text-[#8a8379]">
        <span className="font-semibold text-[#514b44]">{rows.length} baris</span>
        <span className="text-[11px] font-medium tracking-wide uppercase">{footerNote}</span>
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
      <span className="text-[12px] text-[#6d665d]">{label}</span>
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
      ? 'bg-brand-success-soft text-brand-success ring-brand-success/25'
      : tone === 'warn'
        ? 'bg-brand-warning-soft text-brand-warning ring-brand-warning/25'
        : tone === 'bad'
          ? 'bg-brand-danger-soft text-brand-danger ring-brand-danger/25'
          : tone === 'info'
            ? 'bg-brand-info-soft text-brand-info ring-brand-info/25'
            : 'bg-[#f0ebe3] text-[#514b44] ring-[#ddd4c8]';
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold leading-normal ring-1 ring-inset ${cls}`}
    >
      {children}
    </span>
  );
}

export function AdminContentLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite" aria-label="Memuat konten">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[108px] animate-pulse rounded-xl border border-[#ddd4c8] bg-white"
          />
        ))}
      </div>
      <div className="h-12 animate-pulse rounded-xl border border-[#ddd4c8] bg-white" />
      <div className="h-80 animate-pulse rounded-xl border border-[#ddd4c8] bg-white" />
    </div>
  );
}

export function AdminShell({
  brand,
  title,
  subtitle,
  nav,
  topRight,
  actorName,
  actorMeta,
  children,
}: {
  brand: string;
  title: string;
  subtitle?: string;
  nav: AdminNavItem[];
  topRight?: ReactNode;
  actorName?: string;
  actorMeta?: string;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast, setToast } = useAdminPanel();
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const isOps = brand.includes('ops');
  const resolvedActorName = actorName ?? (isOps ? 'Ops Superadmin' : 'Admin Sekolah');
  const resolvedActorMeta = actorMeta ?? (isOps ? 'platform · least privilege' : 'SDN Contoh 01');
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast, setToast]);

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
    <div className="h-dvh flex flex-col overflow-hidden bg-[#faf7f2] text-[#171717]">
      <ImpersonationBanner />
      <a
        href="#konten-admin"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-toast)] focus:rounded-md focus:bg-white focus:px-3 focus:py-2"
      >
        Lewati ke konten
      </a>
      <div className="flex h-full w-full">
        {/* Fixed-height rail: never scrolls with page content */}
        <aside
          className={`hidden h-full shrink-0 flex-col bg-[#171717] text-white md:flex transition-[width] duration-250 ease-in-out ${
            collapsed ? 'w-[68px]' : 'w-[252px]'
          }`}
        >
          <div className="border-b border-white/10 p-3.5">
            {collapsed ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setCollapsed(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-brand-accent hover:text-white transition-all shadow-sm"
                  title="Perluas sidebar"
                  aria-label="Perluas sidebar"
                >
                  <span className="material-symbols-outlined text-[20px]" aria-hidden>
                    menu_open
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-accent text-white shadow-sm ring-1 ring-white/10">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden>
                      {isOps ? 'admin_panel_settings' : 'apartment'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold tracking-[-0.02em] text-white">
                      <span className="font-extrabold text-white">Lembar</span>{' '}
                      <span className="font-normal text-brand-accent-soft/85">
                        {brand.split(' ')[1] || ''}
                      </span>
                    </div>
                    <div className="text-[9px] tracking-wider uppercase text-white/40 font-bold">
                      Console
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  className="hidden md:flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                  title="Ciutkan sidebar"
                  aria-label="Ciutkan sidebar"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden>
                    dock_to_left
                  </span>
                </button>
              </div>
            )}
          </div>

          <nav
            aria-label="Navigasi panel"
            className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3"
          >
            {!collapsed ? (
              <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                Workspace
              </div>
            ) : null}
            {nav.map((item) => {
              const active = isAdminNavActive(item.href, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  onClick={(event) => {
                    if (!event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) {
                      event.preventDefault();
                      navigate(item.href);
                    }
                  }}
                  className={`group flex items-center ${
                    collapsed ? 'h-10 w-10 justify-center mx-auto' : 'justify-between px-3 py-2'
                  } rounded-xl text-[13px] transition-all duration-[var(--motion-fast)] ${
                    active
                      ? 'bg-white text-[#171717] shadow-[0_2px_8px_rgba(0,0,0,0.12)] font-semibold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-105 ${
                        active ? 'text-brand-accent' : 'text-white/45 group-hover:text-white/80'
                      }`}
                      aria-hidden
                    >
                      {item.icon || 'circle'}
                    </span>
                    {!collapsed ? (
                      <span className="truncate font-medium tracking-[-0.01em]">{item.label}</span>
                    ) : null}
                  </span>
                  {!collapsed && item.badge ? (
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                        active
                          ? 'bg-brand-accent-soft text-brand-accent'
                          : 'bg-white/10 text-white/75'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="relative border-t border-white/10 p-3" ref={profileMenuRef}>
            {profileOpen ? (
              <div
                className={`absolute w-64 rounded-2xl border border-white/15 bg-[#222222] p-3 text-white shadow-[0_12px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl z-[50] ${
                  collapsed ? 'left-full ml-3 bottom-0' : 'bottom-full left-3 mb-2'
                }`}
                role="menu"
                aria-label="Menu profil"
              >
                <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                  <AdminAvatar name={resolvedActorName} size="md" />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-white">
                      {resolvedActorName}
                    </div>
                    <div className="truncate text-[11px] text-white/60">
                      {isOps ? 'ops@lembar.id' : 'admin@sekolah.sch.id'}
                    </div>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <Link
                    href="/app"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span
                      className="material-symbols-outlined text-[16px] text-white/50"
                      aria-hidden
                    >
                      auto_awesome
                    </span>
                    Aplikasi Guru
                  </Link>
                  <Link
                    href={isOps ? '/ops/profile' : '/school/profile'}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span
                      className="material-symbols-outlined text-[16px] text-white/50"
                      aria-hidden
                    >
                      person
                    </span>
                    Pengaturan Profil
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch('/v1/auth/logout', { method: 'POST', credentials: 'include' });
                      window.location.href = '/masuk';
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]" aria-hidden>
                      logout
                    </span>
                    Keluar Sesi
                  </button>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className={`flex w-full items-center rounded-xl border border-white/10 bg-white/5 text-left transition-all hover:border-white/20 hover:bg-white/10 ${
                profileOpen ? 'ring-2 ring-white/20 bg-white/10' : ''
              } ${collapsed ? 'h-10 w-10 justify-center mx-auto p-0' : 'gap-3 p-2'}`}
              title={collapsed ? resolvedActorName : undefined}
              aria-label={`Profil ${resolvedActorName}`}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              >
              <AdminAvatar name={resolvedActorName} />
              {!collapsed ? (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold tracking-[-0.01em] text-white">
                    {resolvedActorName}
                  </div>
                  <div className="truncate text-[11px] text-white/50">{resolvedActorMeta}</div>
                </div>
              ) : null}
              {!collapsed ? (
                <span className="material-symbols-outlined text-[16px] text-white/40" aria-hidden>
                  unfold_more
                </span>
              ) : null}
            </button>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <header className="shrink-0 border-b border-[#ddd4c8]/80 bg-white/80 py-3 px-4 backdrop-blur-md md:px-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-[18px] font-bold leading-normal tracking-[-0.04em] text-[#171717]">
                  {title}
                </h1>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-[#8a8379]">
                  <span className="font-semibold text-brand-accent-hover/80">{brand}</span>
                  <span aria-hidden className="text-[#ccc4b8]">
                    /
                  </span>
                  <span className="font-medium text-[#171717]/80">{title}</span>
                  {isPending ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-brand-info-soft px-1.5 py-0.5 text-[9px] font-bold text-brand-info ml-1">
                      <span
                        className="material-symbols-outlined animate-spin text-[11px]"
                        aria-hidden
                      >
                        progress_activity
                      </span>
                      memuat
                    </span>
                  ) : null}
                </div>
                {subtitle ? (
                  <p className="mt-1 max-w-3xl text-[12px] leading-5 text-[#6d665d]">{subtitle}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">{topRight}</div>
            </div>
          </header>

          <div className="shrink-0 border-b border-[#ddd4c8]/80 bg-white px-4 py-2 md:hidden">
            <nav aria-label="Navigasi panel mobile" className="flex gap-2 overflow-x-auto pb-1">
              {nav.map((item) => {
                const active = isAdminNavActive(item.href, pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    onClick={(event) => {
                      if (
                        !event.metaKey &&
                        !event.ctrlKey &&
                        !event.shiftKey &&
                        event.button === 0
                      ) {
                        event.preventDefault();
                        navigate(item.href);
                      }
                    }}
                    className={`inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-xl border px-3.5 text-[12px] font-medium transition-colors ${
                      active
                        ? 'border-[#171717] bg-[#171717] text-white font-semibold'
                        : 'border-[#ddd4c8] bg-white text-[#171717] hover:bg-[#faf7f2]'
                    }`}
                    aria-current={active ? 'page' : undefined}
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

          <main
            id="konten-admin"
            className="relative min-h-0 flex-1 space-y-6 overflow-y-auto p-5 md:p-8"
          >
            {toast ? (
              <div
                className="fixed bottom-6 right-6 z-[var(--z-toast)] flex items-center justify-between gap-4 rounded-xl border border-[#333] bg-[#171717] text-white px-4 py-3 text-[13px] shadow-2xl max-w-md"
                role="status"
                aria-live="polite"
              >
                <span className="font-medium text-white">{toast}</span>
                <button
                  type="button"
                  className="text-[12px] font-bold text-[#b0a89e] hover:text-white transition-colors ml-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                  onClick={() => setToast(null)}
                  aria-label="Tutup notifikasi"
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
