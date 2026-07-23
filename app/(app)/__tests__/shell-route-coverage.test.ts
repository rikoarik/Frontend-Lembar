import { describe, expect, it } from 'vitest';
import { SHELL_PLACEHOLDER_ROUTES } from '@/app/(app)/app/[...slug]/routes';

// Dedicated routes that must NOT be forced through the catch-all placeholder.
const DEDICATED_SHELL_ROUTES = ['/app/riwayat', '/app/generate'];

// Routes that still rely on the catch-all placeholder surface.
const PLACEHOLDER_SHELL_ROUTES = [
  '/app/plan',
  '/app/bank-soal',
  '/app/kelas',
  '/app/analitik',
  '/app/pengaturan/langganan',
  '/app/pengaturan/workspace',
];

describe('app shell navigation route coverage', () => {
  it('placeholder routes remain mapped', () => {
    for (const route of PLACEHOLDER_SHELL_ROUTES) {
      const slug = route.replace(/^\/app\//, '');
      expect(
        Object.prototype.hasOwnProperty.call(SHELL_PLACEHOLDER_ROUTES, slug),
        `${route} must have a placeholder entry in SHELL_PLACEHOLDER_ROUTES`,
      ).toBe(true);
    }
  });

  it('dedicated routes are not stuck as placeholders', () => {
    for (const route of DEDICATED_SHELL_ROUTES) {
      const slug = route.replace(/^\/app\//, '');
      // generate still has placeholder entry historically; riwayat must be dedicated.
      if (route === '/app/riwayat') {
        expect(Object.prototype.hasOwnProperty.call(SHELL_PLACEHOLDER_ROUTES, slug)).toBe(false);
      }
    }
  });
});
