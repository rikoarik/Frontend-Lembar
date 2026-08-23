import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { cookieGet } = vi.hoisted(() => ({ cookieGet: vi.fn() }));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: cookieGet })),
}));

describe('POST /v1/admin/unimpersonate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects requests without a trusted impersonator session', async () => {
    cookieGet.mockReturnValue(undefined);
    const { POST } = await import('./route');

    const response = await POST();

    expect(response.status).toBe(401);
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('restores a valid mock superadmin session', async () => {
    cookieGet.mockImplementation((name: string) =>
      name === 'lembar_impersonator' ? { value: 'ops' } : undefined,
    );
    const { POST } = await import('./route');

    const response = await POST();
    const cookies = response.headers.get('set-cookie') ?? '';

    expect(response.status).toBe(200);
    expect(cookies).toContain('lembar_session=ops');
    expect(cookies).toContain('lembar_roles=superadmin');
    expect(cookies).toContain('lembar_active_role=superadmin');
    expect(cookies).not.toContain('lembar_token=ops');
  });

  it('rejects a non-superadmin impersonator session', async () => {
    cookieGet.mockImplementation((name: string) =>
      name === 'lembar_impersonator' ? { value: 'demo' } : undefined,
    );
    const { POST } = await import('./route');

    const response = await POST();

    expect(response.status).toBe(403);
  });
});
