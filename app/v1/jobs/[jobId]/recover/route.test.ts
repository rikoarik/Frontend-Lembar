import { beforeEach, describe, expect, it, vi } from 'vitest';

const { cookieGet, backendFetch } = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  backendFetch: vi.fn(),
}));

vi.mock('next/headers', () => ({ cookies: vi.fn(async () => ({ get: cookieGet })) }));
vi.mock('@/src/lib/api/session', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/src/lib/api/session')>();
  return { ...original, backendFetch };
});

function jwt() {
  const header = Buffer.from('{}').toString('base64url');
  const payload = Buffer.from(JSON.stringify({ workspaceId: 'workspace-1' })).toString('base64url');
  return `${header}.${payload}.signature`;
}

beforeEach(() => {
  vi.clearAllMocks();
  cookieGet.mockImplementation((name: string) =>
    name === 'lembar_token' ? { value: jwt() } : undefined,
  );
});

describe('POST /v1/jobs/[jobId]/recover', () => {
  it('forwards recovery to backend with workspace isolation', async () => {
    const { POST } = await import('./route');
    backendFetch.mockResolvedValue(
      new Response(JSON.stringify({ data: { id: 'job-1', status: 'queued' } }), { status: 200 }),
    );

    const response = await POST(
      new Request('http://localhost/v1/jobs/job-1/recover', { method: 'POST' }) as never,
      {
        params: Promise.resolve({ jobId: 'job-1' }),
      },
    );

    expect(response.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledWith(
      '/v1/jobs/job-1/recover',
      expect.objectContaining({
        method: 'POST',
        headers: { 'x-workspace-id': 'workspace-1' },
        body: '{}',
      }),
    );
  });
});
