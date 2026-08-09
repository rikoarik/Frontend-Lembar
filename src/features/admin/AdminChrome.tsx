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
  const gridCols =
    items.length === 5
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
      : items.length === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-2 sm:grid-cols-2 xl:grid-cols-4';

  return (
    <div className={`grid gap-3.5 ${gridCols}`}>
      {items.map((item) => {
        return (
          <div
            key={item.label}
            className="relative overflow-hidden rounded-2xl border border-[#ddd4c8]/80 bg-white p-5 shadow-[0_2px_12px_rgba(23,23,23,0.01),0_1px_2px_rgba(23,23,23,0.02)] hover:shadow-[0_8px_24px_rgba(23,23,23,0.06)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#57534e]">
                {item.tone ? <AdminDot tone={item.tone} /> : null}
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
            {item.hint ? (
              <div className="mt-3 text-[12px] font-medium text-[#57534e]">
                {item.hint}
              </div>
            ) : null}
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
  flat = true,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  flat?: boolean;
}) {
  const containerCls = flat
    ? 'flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between py-1'
    : 'flex flex-col gap-3 rounded-xl border border-[#ddd4c8] bg-white p-3 shadow-[0_1px_0_rgba(23,23,23,0.03)] lg:flex-row lg:items-center lg:justify-between';

  return (
    <div className={containerCls}>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Cari</span>
          <span
            aria-hidden
            className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#57534e]"
          >
            search
          </span>
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="min-h-[40px] w-full rounded-xl border border-[#ddd4c8] bg-white py-2 pl-10 pr-3 text-[13px] text-[#171717] placeholder:text-[#57534e] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
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
      aria-pressed={active}
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
  flat = false,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: string;
  flat?: boolean;
}) {
  const containerCls = flat
    ? 'rounded-xl bg-[#faf8f5]/60 px-6 py-8 text-center'
    : 'rounded-xl border border-dashed border-[#ddd4c8] bg-white px-6 py-14 text-center';

  return (
    <div className={containerCls}>
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#f0ebe3] text-[#57534e]">
        <span className="material-symbols-outlined text-[20px] leading-none inline-flex items-center justify-center" aria-hidden>
          {icon}
        </span>
      </div>
      <p className="text-[13px] font-semibold text-[#171717]">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-[12px] text-[#57534e]">{description}</p>
      ) : null}
      {action ? <div className="mt-3 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function AdminConfirmModal({
  open,
  title = 'Konfirmasi Tindakan',
  description,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-[#ddd4c8]/80 bg-white p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              variant === 'danger'
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] leading-none inline-flex items-center justify-center" aria-hidden>
              {variant === 'danger' ? 'warning' : 'help_outline'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="confirm-dialog-title" className="text-[15px] font-bold text-[#171717]">
              {title}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[#57534e]">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eee6da]/60">
          <Button ref={cancelRef} size="sm" variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            variant={variant === 'danger' ? 'danger' : undefined}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Memproses…' : confirmLabel}
          </Button>
        </div>
      </div>
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
            className="text-[12px] font-medium text-white/70 hover:text-white underline"
          >
            Batal
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
        flat={flat}
      />
    );
  }

  const containerCls = flat
    ? 'border-t border-[#ddd4c8]/50'
    : 'rounded-2xl border border-[#ddd4c8]/70 bg-white shadow-[0_8px_24px_rgba(23,23,23,0.02),0_1px_3px_rgba(23,23,23,0.02)]';

  return (
    <div className={containerCls}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-[13px]">
          <thead className="bg-[#faf7f2]/50 border-b border-[#ddd4c8]/60 text-[11px] font-bold uppercase tracking-[0.08em] text-[#57534e]">
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

export function AdminContentLoading({ label = 'Memuat data…' }: { label?: string }) {
  return (
    <div
      className="fixed top-4 right-28 z-40 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#ddd4c8]/90 bg-white/95 backdrop-blur-md shadow-md text-[12px] font-medium text-[#171717] transition-all animate-in fade-in slide-in-from-top-2"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent" />
      </span>
      <span className="text-[12px] font-semibold text-[#171717]">{label}</span>
    </div>
  );
}

export function AdminSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder = 'Pilih...',
  className = '',
}: {
  value: T;
  onChange: (val: T) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="h-9 px-3.5 rounded-xl border border-[#ddd4c8] bg-white text-[12px] font-medium text-[#171717] hover:bg-[#faf7f2] hover:border-[#b8ad9e] focus:outline-none focus:ring-2 focus:ring-[#171717]/20 inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm select-none"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={`material-symbols-outlined text-[16px] text-[#6d665d] transition-transform duration-150 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 min-w-[150px] max-h-[240px] overflow-y-auto rounded-2xl border border-[#ddd4c8] bg-white p-1.5 shadow-[0_8px_30px_rgba(23,23,23,0.12)] z-50 animate-in fade-in-50 zoom-in-95">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[12px] font-medium transition-all ${
                  isSelected
                    ? 'bg-[#171717] text-white'
                    : 'text-[#171717] hover:bg-[#faf7f2]'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[14px] text-white">
                    check
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
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
  const resolvedActorName = actorName ?? (isOps ? 'Ops Superadmin' : 'Admin');
  const resolvedActorMeta = actorMeta ?? (isOps ? 'platform · least privilege' : 'Sekolah');
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
    <div className="h-dvh flex flex-col bg-[#faf7f2] text-[#171717]">
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
          className={`hidden h-full shrink-0 flex-col bg-[#171717] text-white md:flex transition-all duration-200 ease-in-out ${
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
                      {resolvedActorMeta}
                    </div>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <Link
                    href={isOps ? '/ops/profile' : '/school/pengaturan'}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span
                      className="material-symbols-outlined text-[16px] text-white/50"
                      aria-hidden
                    >
                      person
                    </span>
                    Profil Sesi
                  </Link>
                  <a
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
                  </a>
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

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
                className="fixed top-5 right-5 z-[var(--z-toast)] flex items-center gap-3 rounded-2xl border border-[#ddd4c8]/90 bg-white/95 backdrop-blur-md px-4 py-3 text-[13px] shadow-[0_12px_32px_rgba(23,23,23,0.12),0_2px_6px_rgba(23,23,23,0.04)] max-w-md animate-in fade-in slide-in-from-top-4 duration-200"
                role="status"
                aria-live="polite"
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    toast.toLowerCase().includes('gagal') || toast.toLowerCase().includes('error')
                      ? 'bg-red-50 text-red-600 border border-red-100'
                      : 'bg-[#e4f2ea] text-[#176b45] border border-[#c3e3d2]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] leading-none inline-flex items-center justify-center" aria-hidden>
                    {toast.toLowerCase().includes('gagal') || toast.toLowerCase().includes('error')
                      ? 'error'
                      : 'check_circle'}
                  </span>
                </div>
                <span className="font-medium text-[#171717] leading-snug">{toast}</span>
                <button
                  type="button"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#8a8379] hover:bg-[#faf7f2] hover:text-[#171717] transition-colors ml-2"
                  onClick={() => setToast(null)}
                  aria-label="Tutup notifikasi"
                >
                  <span className="material-symbols-outlined text-[16px] leading-none inline-flex items-center justify-center" aria-hidden>
                    close
                  </span>
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
