import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ActiveRole, WorkspaceKind } from '@/src/types/auth';

type LeftRailProps = {
  activeWorkspaceKind: WorkspaceKind;
  activeRole: ActiveRole;
  workspaceSwitcher?: React.ReactNode;
  accountMenu?: React.ReactNode;
  onNavigate?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
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

const SUPPORT_NAV = [{ href: '/app/bantuan', label: 'Bantuan', icon: 'help' }] as const;

const SCHOOL_ONLY_NAV = [
  { href: '/app/kelas', label: 'Kelas', icon: 'groups', entitlement: 'school_admin' as const },
  {
    href: '/app/analitik',
    label: 'Analitik',
    icon: 'monitoring',
    entitlement: 'school_admin' as const,
  },
  {
    href: '/school',
    label: 'Admin sekolah',
    icon: 'apartment',
    entitlement: 'school_admin' as const,
  },
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
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={[
        'group flex min-h-10 items-center rounded-lg text-[13px] font-medium transition-colors',
        collapsed ? 'justify-center px-2' : 'gap-3 px-3',
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
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function NavSection({
  label,
  collapsed,
  children,
}: {
  label?: string;
  collapsed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        collapsed ? (
          <div className="my-1.5 border-t border-[#e6dfd4]" />
        ) : (
          <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a8379]">
            {label}
          </div>
        )
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
  collapsed = false,
  onToggleCollapse,
}: LeftRailProps) {
  const pathname = usePathname() ?? '/app';
  const schoolItems =
    activeWorkspaceKind === 'school'
      ? SCHOOL_ONLY_NAV.filter((item) => roleAllows(activeRole, item.entitlement))
      : [];

  const isActive = (href: string) =>
    href === '/app' ? pathname === '/app' : pathname.startsWith(href);

  return (
    <nav
      aria-label="Navigasi utama"
      className={[
        'flex h-full shrink-0 flex-col overflow-hidden border-r border-[#e6dfd4] bg-[#fbf8f2] transition-all duration-200 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[248px]',
      ].join(' ')}
    >
      {workspaceSwitcher ? (
        <div className="shrink-0 border-b border-[#e6dfd4] p-3">{workspaceSwitcher}</div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 py-3">
        <NavSection collapsed={collapsed}>
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </NavSection>

        <NavSection label="Pustaka" collapsed={collapsed}>
          {LIBRARY_NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </NavSection>

        {schoolItems.length > 0 ? (
          <NavSection label="Sekolah" collapsed={collapsed}>
            {schoolItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            ))}
          </NavSection>
        ) : null}

        <NavSection label="Bantuan" collapsed={collapsed}>
          {SUPPORT_NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(item.href)}
              collapsed={collapsed}
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
