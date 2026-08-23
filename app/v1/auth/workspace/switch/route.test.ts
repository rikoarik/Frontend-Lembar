import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { cookieGet } = vi.hoisted(() => ({ cookieGet: vi.fn() }));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: cookieGet })),
}));

describe('POST /v1/auth/workspace/switch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');
    cookieGet.mockImplementation((name: string) =>
      name === 'lembar_session' ? { value: 'demo' } : undefined,
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('switches to a workspace owned by the current mock account', async () => {
    const { POST } = await import('./route');
    const response = await POST(
      new Request('http://localhost/v1/auth/workspace/switch', {
        method: 'POST',
        body: JSON.stringify({ workspaceId: 'ws_school_demo' }),
      }),
    );
    const body = (await response.json()) as { data: { workspaceId: string; activeRole: string } };
    const cookies = response.headers.get('set-cookie') ?? '';

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      workspaceId: 'ws_school_demo',
      activeRole: 'school_admin',
    });
    expect(cookies).toContain('lembar_active_workspace=ws_school_demo');
    expect(cookies).toContain('lembar_active_role=school_admin');
  });

  it('rejects a workspace outside the account membership', async () => {
    const { POST } = await import('./route');
    const response = await POST(
      new Request('http://localhost/v1/auth/workspace/switch', {
        method: 'POST',
        body: JSON.stringify({ workspaceId: 'ws_unknown' }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it('validates the workspace identifier', async () => {
    const { POST } = await import('./route');
    const response = await POST(
      new Request('http://localhost/v1/auth/workspace/switch', {
        method: 'POST',
        body: JSON.stringify({ workspaceId: '' }),
      }),
    );

    expect(response.status).toBe(400);
  });
});
