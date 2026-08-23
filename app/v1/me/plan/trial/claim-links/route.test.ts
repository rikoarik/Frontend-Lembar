import { beforeEach, describe, expect, it, vi } from 'vitest';

const { cookieGet, backendFetch } = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  backendFetch: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: cookieGet })),
}));
vi.mock('@/src/lib/api/session', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/src/lib/api/session')>();
  return { ...original, backendFetch };
});

import { POST } from './route';

describe('POST /v1/me/plan/trial/claim-links', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieGet.mockImplementation((name: string) =>
      name === 'lembar_token' ? { value: 'jwt-secret' } : undefined,
    );
  });

  it('requires an authenticated session', async () => {
    cookieGet.mockReturnValue(undefined);

    const response = await POST();

    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(backendFetch).not.toHaveBeenCalled();
  });

  it('issues the link token through the authenticated backend and disables caching', async () => {
    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            token: 'opaque-one-time-token-with-at-least-32-characters',
            expiresAt: '2026-08-23T12:15:00.000Z',
          },
        }),
        { status: 201, headers: { 'content-type': 'application/json' } },
      ),
    );

    const response = await POST();

    expect(response.status).toBe(201);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(backendFetch).toHaveBeenCalledWith('/v1/me/plan/trial/claim-links', {
      method: 'POST',
      token: 'jwt-secret',
    });
    expect(await response.json()).toMatchObject({
      data: { token: 'opaque-one-time-token-with-at-least-32-characters' },
    });
  });
});
