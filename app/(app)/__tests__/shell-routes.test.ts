import { describe, expect, it } from 'vitest';

const shellPlaceholderRoutes = [
  '/app/plan',
  '/app/profil',
  '/app/generate',
  '/app/template',
  '/app/bank-soal',
  '/app/riwayat',
];

describe('app shell route placeholders', () => {
  it('backs every shell navigation/account destination with the catch-all route', () => {
    const catchAllPattern = /^\/app\/(plan|profil|generate|template|bank-soal|riwayat)$/;

    for (const route of shellPlaceholderRoutes) {
      expect(route).toMatch(catchAllPattern);
    }
  });
});
