import { describe, expect, it, vi } from 'vitest';

const { backendFetch } = vi.hoisted(() => ({ backendFetch: vi.fn() }));

vi.mock('@/src/lib/mock-api/preview', () => ({ isMockApiMode: () => false, mockFail: (code: string, message: string, status: number) => Response.json({ error: { code, message } }, { status }) }));
vi.mock('@/src/lib/api/session', () => ({
  backendFetch,
  authSuccessFromBackend: () => ({ activeRole: 'teacher', homePath: '/app' }),
  authCookieOptions: () => ({ name: 'x', value: 'x' }),
  jwtCookieOptions: () => ({ name: 'x', value: 'x' }),
  normalizeRoles: () => ['teacher'],
  SESSION_COOKIE: 'session',
}));

describe('Google callback BFF logging', () => {
  it('does not log OAuth response data containing an identity or token', async () => {
    const { POST } = await import('./route');
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    backendFetch.mockResolvedValue(new Response(JSON.stringify({ user: { email: 'private@example.test' } }), { status: 200 }));

    const response = await POST(new Request('http://localhost/v1/auth/google/callback', { method: 'POST', body: JSON.stringify({ code: 'code' }) }));

    expect(response.status).toBe(502);
    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    log.mockRestore();
    error.mockRestore();
  });
});
