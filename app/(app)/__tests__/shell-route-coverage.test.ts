import { describe, expect, it } from 'vitest';
import { SHELL_PLACEHOLDER_ROUTES } from '@/app/(app)/app/[...slug]/routes';

// Mirror of the navigation routes that ship in the shell surface. If a
// route appears here that is not handled by the catch-all placeholder,
// the app returns 404 for that route. Keep in sync with LeftRail,
// AccountMenu, app/(app)/app/page.tsx, and ShellStates fallback links.
const NAVIGABLE_SHELL_ROUTES = [
  '/app/generate',
  '/app/riwayat',
  '/app/template',
  '/app/plan',
  '/app/bank-soal',
  '/app/kelas',
  '/app/analitik',
  '/app/pengaturan/langganan',
  '/app/pengaturan/workspace',
];

describe('app shell navigation route coverage', () => {
  it('every navigable shell route maps to a placeholder', () => {
    for (const route of NAVIGABLE_SHELL_ROUTES) {
      const slug = route.replace(/^\/app\//, '');
      expect(
        Object.prototype.hasOwnProperty.call(SHELL_PLACEHOLDER_ROUTES, slug),
        `${route} must have a placeholder entry in SHELL_PLACEHOLDER_ROUTES`,
      ).toBe(true);
    }
  });
});
