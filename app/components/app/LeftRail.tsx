'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ActiveRole, WorkspaceKind } from '@/src/types/auth';

type LeftRailProps = {
  activeWorkspaceKind: WorkspaceKind;
  activeRole: ActiveRole;
  workspaceSwitcher?: React.ReactNode;
  onNavigate?: () => void;
};

const TEACHER_NAV = [
  { href: '/app', label: 'Dashboard', icon: 'space_dashboard' },
  { href: '/app/riwayat', label: 'Riwayat', icon: 'history' },
  { href: '/app/bank-soal', label: 'Bank Soal', icon: 'inventory_2' },
  { href: '/app/template', label: 'Template', icon: 'description' },
  { href: '/app/generate', label: 'Generate', icon: 'auto_awesome' },
];

const SCHOOL_ONLY_NAV = [
  { href: '/app/kelas', label: 'Kelas', icon: 'groups', entitlement: 'school_admin' },
  { href: '/app/analitik', label: 'Analitik', icon: 'monitoring', entitlement: 'school_admin' },
] as const;

function roleAllows(activeRole: ActiveRole, entitlement: ActiveRole): boolean {
  if (entitlement === 'school_admin') {
    return activeRole === 'school_admin' || activeRole === 'superadmin';
  }
  return true;
}

export function LeftRail({
  activeWorkspaceKind,
  activeRole,
  workspaceSwitcher,
  onNavigate,
}: LeftRailProps) {
  const pathname = usePathname() ?? '/app';
  const items = [
    ...TEACHER_NAV,
    ...SCHOOL_ONLY_NAV.filter((item) => roleAllows(activeRole, item.entitlement)).map((item) => ({
      href: item.href,
      label: item.label,
      icon: item.icon,
    })),
  ];

  return (
    <nav
      aria-label="Navigasi utama"
      className="flex h-full w-64 shrink-0 flex-col gap-2 border-r border-brand-line bg-brand-surface-raised px-3 py-4"
    >
      <Link
        href="/app"
        className="mb-2 inline-flex items-center gap-2 rounded-md px-2 py-2 text-body-default font-semibold text-brand-ink hover:bg-brand-paper"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          layers
        </span>
        lembar
        {activeWorkspaceKind === 'school' ? (
          <span className="ml-auto rounded-full border border-brand-line bg-brand-paper px-2 py-0.5 text-caption text-brand-ink-muted">
            Sekolah
          </span>
        ) : null}
      </Link>

      <ul className="flex flex-col gap-1" role="list">
        {items.map((item) => {
          const isActive =
            item.href === '/app' ? pathname === '/app' : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                onClick={onNavigate}
                className={[
                  'flex items-center gap-3 rounded-md px-3 py-2 text-body-default',
                  isActive
                    ? 'bg-brand-accent-soft text-brand-accent'
                    : 'text-brand-ink hover:bg-brand-paper',
                ].join(' ')}
              >
                <span
                  aria-hidden="true"
                  className={[
                    'inline-block h-1.5 w-1.5 rounded-full',
                    isActive ? 'bg-brand-accent' : 'bg-transparent',
                  ].join(' ')}
                />
                <span aria-hidden="true" className="material-symbols-outlined">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto flex flex-col gap-2 pt-4">{workspaceSwitcher}</div>
    </nav>
  );
}
