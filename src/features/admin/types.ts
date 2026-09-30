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
  { href: '/school/guru', label: 'Guru', icon: 'group' },
  { href: '/school/undang', label: 'Undang', icon: 'person_add' },
  { href: '/school/undangan', label: 'Undangan menunggu', icon: 'mail' },
  { href: '/school/penggunaan', label: 'Penggunaan', icon: 'monitoring' },
  { href: '/school/billing', label: 'Langganan & Billing', icon: 'payments' },
  { href: '/school/pengaturan', label: 'Pengaturan', icon: 'settings' },
  { href: '/school/library', label: 'Library', icon: 'inventory_2' },
  { href: '/school/audit', label: 'Audit', icon: 'history' },
  { href: '/school/notifikasi', label: 'Notifikasi', icon: 'notifications' },
];

export const OPS_NAV: AdminNavItem[] = [
  { href: '/ops', label: 'Ringkasan', icon: 'dashboard' },
  { href: '/ops/accounts', label: 'Akun', icon: 'manage_accounts' },
  { href: '/ops/schools', label: 'Sekolah', icon: 'apartment' },
  { href: '/ops/catalog', label: 'Katalog', icon: 'menu_book' },
  { href: '/ops/prompts', label: 'Prompt', icon: 'terminal' },
  { href: '/ops/learning-signals', label: 'Learning Signals', icon: 'psychology' },
  { href: '/ops/jobs', label: 'Jobs', icon: 'work' },
  { href: '/ops/quality', label: 'Quality', icon: 'verified' },
  { href: '/ops/audit', label: 'Audit', icon: 'policy' },
  { href: '/ops/billing', label: 'Billing', icon: 'payments' },
  { href: '/ops/plans', label: 'Plan & Harga', icon: 'sell' },
  { href: '/ops/flags', label: 'Flags', icon: 'toggle_on' },
  { href: '/ops/content', label: 'Marketing CMS', icon: 'web' },
  { href: '/ops/ai-provider', label: 'Konfigurasi AI', icon: 'smart_toy' },
  { href: '/ops/wa-gateway', label: 'WA Gateway', icon: 'chat' },
];

export function isAdminNavActive(href: string, currentPath: string): boolean {
  if (href === currentPath) return true;
  if (href === '/school' || href === '/ops') return false;
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

/**
 * Sections that are actually rendered by each console view. Any other slug is a
 * dead link (FE-VER-02 F-5) and must 404 instead of returning a 200 shell.
 */
export const OPS_SECTIONS: readonly string[] = [
  '',
  'accounts',
  'schools',
  'catalog',
  'prompts',
  'learning-signals',
  'jobs',
  'quality',
  'audit',
  'billing',
  'plans',
  'flags',
  'content',
  'profile',
  'ai-provider',
  'wa-gateway',
];

export const SCHOOL_SECTIONS: readonly string[] = [
  '',
  'guru',
  'undang',
  'undangan',
  'penggunaan',
  'billing',
  'pengaturan',
  'library',
  'audit',
  'notifikasi',
];

/** Sub-routes that render a detail view of a section (e.g. `/ops/accounts/<id>`). */
const SECTION_DETAIL_PREFIXES: Record<string, readonly string[]> = {
  accounts: ['accounts/'],
};

export function isKnownAdminSection(root: '/school' | '/ops', section: string): boolean {
  const known = root === '/ops' ? OPS_SECTIONS : SCHOOL_SECTIONS;
  if (known.includes(section)) return true;
  return (SECTION_DETAIL_PREFIXES[section.split('/')[0] ?? ''] ?? []).some((prefix) =>
    section.startsWith(prefix),
  );
}

export function sectionFromPath(pathname: string, root: '/school' | '/ops'): string {
  if (pathname === root) return '';
  if (!pathname.startsWith(`${root}/`)) return '';
  return pathname.slice(root.length + 1);
}
