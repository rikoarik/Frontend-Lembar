/**
 * Route allow-list for the `/app/*` teacher workspace (BUG-25, FE-AUD-01-2026-09-30).
 *
 * Why the proxy needs this: `/ops/<unknown>` and `/school/<unknown>` now 404 for
 * real via `notFound()` in their catch-all pages. `/app/<unknown>` cannot —
 * `(app)/loading.tsx` plus the shell layout make that segment stream, so the
 * response status is flushed as 200 before `notFound()` runs and only the
 * boundary content is a 404. The proxy runs before streaming and can still
 * rewrite, so unknown `/app/*` paths are rewritten to a path that does not
 * exist, which makes Next serve a genuine 404.
 *
 * `appRoutes.test.ts` derives this list from the filesystem, so a new page that
 * is not added here fails the test instead of silently 404-ing in production.
 */

/** Exact paths with a `page.tsx` under `app/(app)/app`. */
export const APP_STATIC_ROUTES: readonly string[] = [
  '/app',
  '/app/analitik',
  '/app/bank-soal',
  '/app/bantuan',
  '/app/gates',
  '/app/generate',
  '/app/kelas',
  '/app/onboarding',
  '/app/pengaturan/langganan',
  '/app/pengaturan/langganan/trial/konfirmasi',
  '/app/pengaturan/profil',
  '/app/pengaturan/workspace',
  '/app/riwayat',
  '/app/template',
  '/app/workspace-switcher',
];

/** Prefixes whose next segment is a dynamic parameter (`[id]`, `[token]`, …). */
export const APP_DYNAMIC_PREFIXES: readonly string[] = [
  '/app/assessments/',
  '/app/jobs/',
  '/app/output/',
  '/app/review/',
];

/** Redirect-only slugs served by `app/(app)/app/[...slug]`. */
export const APP_LEGACY_REDIRECTS: readonly string[] = ['/app/profil', '/app/plan'];

export function isKnownAppPath(pathname: string): boolean {
  if (APP_STATIC_ROUTES.includes(pathname)) return true;
  if (APP_LEGACY_REDIRECTS.includes(pathname)) return true;
  return APP_DYNAMIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
