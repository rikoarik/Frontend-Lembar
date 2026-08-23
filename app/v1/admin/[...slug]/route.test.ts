import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  backendFetch: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (name === 'lembar_jwt' ? { value: 'test-admin-token' } : undefined),
  }),
}));

vi.mock('@/src/lib/api/session', () => ({
  backendFetch: mocks.backendFetch,
  JWT_COOKIE: 'lembar_jwt',
  SESSION_COOKIE: 'lembar_session',
}));

vi.mock('@/src/lib/mock-api/preview', () => ({ isMockApiMode: () => false }));
vi.mock('@/src/lib/mock-api/accounts', () => ({ findMockAccountBySession: () => null }));

import { PUT } from './route';

describe('admin BFF proxy revision headers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            enabled: true,
            label: 'Beta',
            message: 'Pesan baru.',
            ctaLabel: null,
            ctaHref: null,
            revision: 8,
            updatedAt: '2026-08-23T00:00:00.000Z',
          },
        }),
        { status: 200 },
      ),
    );
  });

  it('forwards If-Match when updating the announcement', async () => {
    const payload = {
      enabled: true,
      label: 'Beta',
      message: 'Pesan baru.',
      ctaLabel: null,
      ctaHref: null,
    };
    const request = new NextRequest('http://localhost/v1/admin/announcement', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'if-match': '7' },
      body: JSON.stringify(payload),
    });

    const response = await PUT(request, {
      params: Promise.resolve({ slug: ['announcement'] }),
    });

    expect(response.status).toBe(200);
    expect(mocks.backendFetch).toHaveBeenCalledWith(
      '/v1/admin/announcement',
      expect.objectContaining({
        method: 'PUT',
        token: 'test-admin-token',
        headers: { 'If-Match': '7' },
        body: JSON.stringify(payload),
      }),
    );
  });
});
