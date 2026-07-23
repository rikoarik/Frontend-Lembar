import { describe, expect, it } from 'vitest';
import { SHELL_PLACEHOLDER_ROUTES } from '@/app/(app)/app/[...slug]/routes';

const PLACEHOLDER_SHELL_ROUTES = [
  '/app/plan',
  '/app/pengaturan/langganan',
  '/app/pengaturan/workspace',
];

const DEDICATED = [
  '/app/riwayat',
  '/app/bank-soal',
  '/app/template',
  '/app/analitik',
  '/app/bantuan',
  '/app/gates',
  '/app/kelas',
];

describe('app shell navigation route coverage', () => {
  it('placeholder routes remain mapped', () => {
    for (const route of PLACEHOLDER_SHELL_ROUTES) {
      const slug = route.replace(/^\/app\//, '');
      expect(Object.prototype.hasOwnProperty.call(SHELL_PLACEHOLDER_ROUTES, slug)).toBe(true);
    }
  });

  it('dedicated routes are not placeholders', () => {
    for (const route of DEDICATED) {
      const slug = route.replace(/^\/app\//, '');
      expect(Object.prototype.hasOwnProperty.call(SHELL_PLACEHOLDER_ROUTES, slug)).toBe(false);
    }
  });
});
