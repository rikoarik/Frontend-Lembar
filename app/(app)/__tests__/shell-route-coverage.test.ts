import { describe, expect, it } from 'vitest';
import { SHELL_PLACEHOLDER_ROUTES } from '@/app/(app)/app/[...slug]/routes';

const PLACEHOLDER_SHELL_ROUTES = [
  '/app/plan',
  '/app/kelas',
  '/app/analitik',
  '/app/pengaturan/langganan',
  '/app/pengaturan/workspace',
];

const DEDICATED = ['/app/riwayat', '/app/bank-soal', '/app/template'];

describe('app shell navigation route coverage', () => {
  it('placeholder routes remain mapped', () => {
    for (const route of PLACEHOLDER_SHELL_ROUTES) {
      const slug = route.replace(/^\/app\//, '');
      expect(Object.prototype.hasOwnProperty.call(SHELL_PLACEHOLDER_ROUTES, slug)).toBe(true);
    }
  });

  it('dedicated library/history routes are not placeholders', () => {
    for (const route of DEDICATED) {
      const slug = route.replace(/^\/app\//, '');
      expect(Object.prototype.hasOwnProperty.call(SHELL_PLACEHOLDER_ROUTES, slug)).toBe(false);
    }
  });
});
