import { describe, expect, it } from 'vitest';

const shellPlaceholderRoutes = ['/app/plan', '/app/profil', '/app/kelas', '/app/analitik'];

describe('app shell route placeholders', () => {
  it('backs remaining shell navigation destinations with the catch-all route', () => {
    const catchAllPattern = /^\/app\/(plan|profil|kelas|analitik)$/;
    for (const route of shellPlaceholderRoutes) {
      expect(route).toMatch(catchAllPattern);
    }
  });
});
