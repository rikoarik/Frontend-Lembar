'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ActiveRole, WorkspaceKind } from '@/src/types/auth';

type LeftRailProps = {
  activeWorkspaceKind: WorkspaceKind;
  activeRole: ActiveRole;
  workspaceSwitcher?: React.ReactNode;
  accountMenu?: React.ReactNode;
  onNavigate?: () => void;
};

const PRIMARY_NAV = [
  { href: '/app', label: 'Beranda', icon: 'home' },
  { href: '/app/generate', label: 'Buat lembar', icon: 'auto_awesome' },
  { href: '/app/riwayat', label: 'Riwayat', icon: 'history' },
] as const;

const LIBRARY_NAV = [
  { href: '/app/bank-soal', label: 'Bank soal', icon: 'inventory_2' },
  { href: '/app/template', label: 'Template', icon: 'description' },
] as const;

const SUPPORT_NAV = [
  { href: '/app/bantuan', label: 'Bantuan', icon: 'help' },
] as const;

const SCHOOL_ONLY_NAV = [
  { href: '/app/kelas', label: 'Kelas', icon: 'groups', entitlement: 'school_admin' as const },
  { href: '/app/analitik', label: 'Analitik', icon: 'monitoring', entitlement: 'school_admin' as const },
  { href: '/school', label: 'Admin sekolah', icon: 'apartment', entitlement: 'school_admin' as const },
];

function roleAllows(activeRole: ActiveRole, entitlement: ActiveRole): boolean {
  if (entitlement === 'school_admin') {
    return activeRole === 'school_admin' || activeRole === 'superadmin';
  }
  return true;
}

function NavLink({
  href,
  label,
  icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={[
        'group flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors',
        active
          ? 'bg-[#171717] text-white'
          : 'text-[#514b44] hover:bg-[#f0ebe3] hover:text-[#171717]',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'material-symbols-outlined text-[18px]',
          active ? 'text-white' : 'text-[#8a8379] group-hover:text-[#171717]',
        ].join(' ')}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NavSection({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a8379]">
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function LeftRail({
  activeWorkspaceKind,
  activeRole,
  workspaceSwitcher,
  accountMenu,
  onNavigate,
}: LeftRailProps) {
  const pathname = usePathname() ?? '/app';
  const schoolItems = SCHOOL_ONLY_NAV.filter((item) => roleAllows(activeRole, item.entitlement));

  const isActive = (href: string) =>
    href === '/app' ? pathname === '/app' : pathname.startsWith(href);

  return (
    <nav
      aria-label="Navigasi utama"
      className="flex h-full w-[248px] shrink-0 flex-col overflow-hidden border-r border-[#e6dfd4] bg-[#fbf8f2]"
    >
      <div className="shrink-0 border-b border-[#e6dfd4] px-3 py-3">
        <Link
          href="/app"
          onClick={onNavigate}
          className="mb-3 inline-flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[14px] font-semibold tracking-[-0.02em] text-[#171717] hover:bg-white"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#a3202b] text-white"
          >
            <span className="material-symbols-outlined text-[18px]">layers</span>
          </span>
          lembar
          {activeWorkspaceKind === 'school' ? (
            <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#6d665d] ring-1 ring-[#e6dfd4]">
              Sekolah
            </span>
          ) : null}
        </Link>
        {workspaceSwitcher ? <div>{workspaceSwitcher}</div> : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 py-3">
        <NavSection>
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </NavSection>

        <NavSection label="Pustaka">
          {LIBRARY_NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </NavSection>

        {schoolItems.length > 0 ? (
          <NavSection label="Sekolah">
            {schoolItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                onNavigate={onNavigate}
              />
            ))}
          </NavSection>
        ) : null}

        <NavSection label="Bantuan">
          {SUPPORT_NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </NavSection>
      </div>

      {accountMenu ? (
        <div className="shrink-0 border-t border-[#e6dfd4] p-3">{accountMenu}</div>
      ) : null}
    </nav>
  );
}
