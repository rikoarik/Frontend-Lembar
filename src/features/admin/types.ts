export type AdminTone = 'ok' | 'warn' | 'bad' | 'info' | 'neutral';

export type AdminNavItem = {
  href: string;
  label: string;
  badge?: string;
  icon?: string;
};

export type AdminColumn<T> = {
  key: string;
  header: string;
  className?: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => React.ReactNode;
};

export const SCHOOL_NAV: AdminNavItem[] = [
  { href: '/school', label: 'Ringkasan', icon: 'dashboard' },
  { href: '/school/guru', label: 'Guru', badge: '5', icon: 'group' },
  { href: '/school/guru/undang', label: 'Undang', icon: 'person_add' },
  { href: '/school/penggunaan', label: 'Penggunaan', icon: 'monitoring' },
  { href: '/school/pengaturan', label: 'Pengaturan', icon: 'settings' },
  { href: '/school/library', label: 'Library', icon: 'inventory_2' },
  { href: '/school/audit', label: 'Audit', icon: 'history' },
];

export const OPS_NAV: AdminNavItem[] = [
  { href: '/ops', label: 'Ringkasan', icon: 'dashboard' },
  { href: '/ops/accounts', label: 'Akun', badge: '5', icon: 'manage_accounts' },
  { href: '/ops/schools', label: 'Sekolah', badge: '4', icon: 'apartment' },
  { href: '/ops/catalog', label: 'Katalog', icon: 'menu_book' },
  { href: '/ops/prompts', label: 'Prompt', icon: 'terminal' },
  { href: '/ops/jobs', label: 'Jobs', badge: '3', icon: 'work' },
  { href: '/ops/quality', label: 'Quality', badge: '2', icon: 'verified' },
  { href: '/ops/audit', label: 'Audit', icon: 'policy' },
  { href: '/ops/billing', label: 'Billing', icon: 'payments' },
  { href: '/ops/flags', label: 'Flags', icon: 'toggle_on' },
  { href: '/ops/content', label: 'Marketing CMS', icon: 'web' },
];

export function isAdminNavActive(href: string, currentPath: string): boolean {
  if (href === currentPath) return true;
  if (href === '/school' || href === '/ops') return false;
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function sectionFromPath(pathname: string, root: '/school' | '/ops'): string {
  if (pathname === root) return '';
  if (!pathname.startsWith(`${root}/`)) return '';
  return pathname.slice(root.length + 1);
}
