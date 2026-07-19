import { describe, expect, it } from 'vitest';
import LegalPrivasiRedirect from '../legal/privasi/page';
import LegalSyaratRedirect from '../legal/syarat/page';

function expectRedirectTo(render: () => unknown, target: string) {
  expect(render).toThrow(expect.objectContaining({ digest: expect.stringContaining(target) }));
}

describe('legal route redirects', () => {
  it('/legal/privasi redirects to the canonical privacy route', () => {
    expectRedirectTo(LegalPrivasiRedirect, '/privasi');
  });

  it('/legal/syarat redirects to the canonical terms route', () => {
    expectRedirectTo(LegalSyaratRedirect, '/syarat');
  });
});
