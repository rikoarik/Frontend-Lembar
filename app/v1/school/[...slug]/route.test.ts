import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { cookieGet, backendFetch } = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  backendFetch: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: cookieGet }),
}));
vi.mock('@/src/lib/api/session', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/src/lib/api/session')>();
  return { ...original, backendFetch };
});

import { GET } from './route';

function unsignedJwt(payload: object): string {
  return `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;
}

describe('school BFF auth boundary', () => {
  beforeEach(() => {
    cookieGet.mockReturnValue(undefined);
    backendFetch.mockResolvedValue(Response.json({ data: {} }));
  });

  it('forwards Authorization without trusting JWT claims for role or tenant headers', async () => {
    const token = unsignedJwt({ roles: ['school_admin'], workspaceId: 'attacker-workspace' });
    const request = new NextRequest('http://localhost/v1/school/billing', {
      headers: { authorization: `Bearer ${token}` },
    });

    await GET(request, { params: Promise.resolve({ slug: ['billing'] }) });

    expect(backendFetch).toHaveBeenCalledWith('/v1/school/billing', {
      method: 'GET',
      token,
      body: undefined,
    });
  });
});
