export type AdminTone = 'ok' | 'warn' | 'bad' | 'info' | 'neutral';

export type AdminNavItem = {
  href: string;
  /** i18n key inside the `admin` namespace (e.g. `nav.ringkasan`). */
  labelKey: string;
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
  { href: '/school', labelKey: 'nav.ringkasan', icon: 'dashboard' },
  { href: '/school/guru', labelKey: 'nav.guru', icon: 'group' },
  { href: '/school/undang', labelKey: 'nav.undang', icon: 'person_add' },
  { href: '/school/undangan', labelKey: 'nav.undangan', icon: 'mail' },
  { href: '/school/penggunaan', labelKey: 'nav.penggunaan', icon: 'monitoring' },
  { href: '/school/billing', labelKey: 'nav.schoolBilling', icon: 'payments' },
  { href: '/school/pengaturan', labelKey: 'nav.pengaturan', icon: 'settings' },
  { href: '/school/library', labelKey: 'nav.library', icon: 'inventory_2' },
  { href: '/school/audit', labelKey: 'nav.audit', icon: 'history' },
  { href: '/school/notifikasi', labelKey: 'nav.notifikasi', icon: 'notifications' },
];

export const OPS_NAV: AdminNavItem[] = [
  { href: '/ops', labelKey: 'nav.ringkasan', icon: 'dashboard' },
  { href: '/ops/accounts', labelKey: 'nav.accounts', icon: 'manage_accounts' },
  { href: '/ops/schools', labelKey: 'nav.schools', icon: 'apartment' },
  { href: '/ops/catalog', labelKey: 'nav.catalog', icon: 'menu_book' },
  { href: '/ops/prompts', labelKey: 'nav.prompts', icon: 'terminal' },
  { href: '/ops/learning-signals', labelKey: 'nav.learningSignals', icon: 'psychology' },
  { href: '/ops/jobs', labelKey: 'nav.jobs', icon: 'work' },
  { href: '/ops/quality', labelKey: 'nav.quality', icon: 'verified' },
  { href: '/ops/audit', labelKey: 'nav.audit', icon: 'policy' },
  { href: '/ops/billing', labelKey: 'nav.billing', icon: 'payments' },
  { href: '/ops/plans', labelKey: 'nav.plans', icon: 'sell' },
  { href: '/ops/flags', labelKey: 'nav.flags', icon: 'toggle_on' },
  { href: '/ops/content', labelKey: 'nav.content', icon: 'web' },
  { href: '/ops/ai-provider', labelKey: 'nav.aiProvider', icon: 'smart_toy' },
  { href: '/ops/wa-gateway', labelKey: 'nav.waGateway', icon: 'chat' },
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
