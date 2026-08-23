import { beforeEach, describe, expect, it, vi } from 'vitest';

const { backendFetch, cookieGet } = vi.hoisted(() => ({
  backendFetch: vi.fn(),
  cookieGet: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: cookieGet })),
}));
vi.mock('@/src/lib/mock-api/preview', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/src/lib/mock-api/preview')>();

  return {
    ...original,
    isMockApiMode: () => false,
  };
});
vi.mock('@/src/lib/api/session', () => ({
  backendFetch,
  authSuccessFromBackend: () => ({ activeRole: 'teacher', homePath: '/app' }),
  authCookieOptions: () => ({ name: 'x', value: 'x' }),
  jwtCookieOptions: () => ({ name: 'x', value: 'x' }),
  normalizeRoles: () => ['teacher'],
  SESSION_COOKIE: 'session',
}));

describe('Google callback BFF logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not log OAuth response data containing an identity or token', async () => {
    cookieGet.mockImplementation((name: string) =>
      name === 'lembar_oauth_state' ? { value: 'expected-state' } : undefined,
    );
    const { POST } = await import('./route');
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    backendFetch.mockResolvedValue(
      new Response(JSON.stringify({ user: { email: 'private@example.test' } }), { status: 200 }),
    );

    const response = await POST(
      new Request('http://localhost/v1/auth/google/callback', {
        method: 'POST',
        body: JSON.stringify({ code: 'code', state: 'expected-state' }),
      }),
    );

    expect(response.status).toBe(502);
    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    log.mockRestore();
    error.mockRestore();
  });

  it('rejects a callback when OAuth state does not match the HttpOnly cookie', async () => {
    cookieGet.mockImplementation((name: string) =>
      name === 'lembar_oauth_state' ? { value: 'expected-state' } : undefined,
    );
    const { POST } = await import('./route');

    const response = await POST(
      new Request('http://localhost/v1/auth/google/callback', {
        method: 'POST',
        body: JSON.stringify({ code: 'code', state: 'attacker-state' }),
      }),
    );

    expect(response.status).toBe(400);
    expect(backendFetch).not.toHaveBeenCalled();
    expect(response.headers.get('set-cookie')).toContain('lembar_oauth_state=');
  });
});
