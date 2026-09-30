/**
 * Section allow-lists for the admin consoles (BUG-25, FE-AUD-01-2026-09-30).
 *
 * Kept in a plain module — NOT inside `OpsConsoleView.tsx` / `SchoolAdminView.tsx`,
 * which are `'use client'` components. A server component cannot call a function
 * that lives in a client module, so the route-level `notFound()` guard needs
 * these helpers importable from the server.
 */

export const OPS_SECTIONS = [
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
] as const;

/** `''` is the overview; `accounts/<id>` is the account detail drawer. */
export function isKnownOpsSection(section: string): boolean {
  if (section === '') return true;
  if (section.startsWith('accounts/')) return true;
  return (OPS_SECTIONS as readonly string[]).includes(section);
}

export const SCHOOL_SECTIONS = [
  'guru',
  'undang',
  'undangan',
  'penggunaan',
  'billing',
  'pengaturan',
  'library',
  'audit',
  'notifikasi',
] as const;

/** `''` is the ringkasan (overview) section. */
export function isKnownSchoolSection(section: string): boolean {
  if (section === '') return true;
  return (SCHOOL_SECTIONS as readonly string[]).includes(section);
}
