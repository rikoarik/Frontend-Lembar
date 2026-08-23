import { describe, expect, it } from 'vitest';
import { SHELL_REDIRECT_ROUTES } from '@/app/(app)/app/[...slug]/routes';

const DEDICATED = [
  '/app/riwayat',
  '/app/bank-soal',
  '/app/template',
  '/app/analitik',
  '/app/bantuan',
  '/app/kelas',
  '/app/pengaturan/langganan',
  '/app/pengaturan/profil',
  '/app/pengaturan/workspace',
];

describe('app shell navigation route coverage', () => {
  it('redirects legacy profile and plan routes to dedicated pages', () => {
    expect(SHELL_REDIRECT_ROUTES).toEqual({
      profil: '/app/pengaturan/profil',
      plan: '/app/pengaturan/langganan',
    });
  });

  it('does not shadow dedicated routes with catch-all redirects', () => {
    for (const route of DEDICATED) {
      const slug = route.replace(/^\/app\//, '');
      expect(Object.prototype.hasOwnProperty.call(SHELL_REDIRECT_ROUTES, slug)).toBe(false);
    }
  });
});
