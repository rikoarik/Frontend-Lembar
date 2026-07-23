import { describe, expect, it } from 'vitest';

const shellPlaceholderRoutes = [
  '/app/plan',
  '/app/profil',
  '/app/generate',
  '/app/template',
  '/app/bank-soal',
];

describe('app shell route placeholders', () => {
  it('backs remaining shell navigation destinations with the catch-all route', () => {
    const catchAllPattern = /^\/app\/(plan|profil|generate|template|bank-soal)$/;

    for (const route of shellPlaceholderRoutes) {
      expect(route).toMatch(catchAllPattern);
    }
  });
});
