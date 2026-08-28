import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { cookieGet, upstreamFetch } = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  upstreamFetch: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: cookieGet })),
}));

function jwt(workspaceId = 'workspace-1') {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ userId: 'user-1', workspaceId })).toString(
    'base64url',
  );
  return `${header}.${payload}.signature`;
}

const context = { params: Promise.resolve({ jobId: 'job-1' }) };

beforeEach(() => {
  vi.clearAllMocks();
  cookieGet.mockImplementation((name: string) =>
    name === 'lembar_token' ? { value: jwt() } : undefined,
  );
  vi.stubGlobal('fetch', upstreamFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GET /v1/jobs/[jobId]/events', () => {
  it('forwards the authenticated workspace to the backend event stream', async () => {
    upstreamFetch.mockResolvedValue(
      new Response('event: status\ndata: {}\n\n', {
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
      }),
    );

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/v1/jobs/job-1/events'), context);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/event-stream');
    expect(upstreamFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/jobs/job-1/events'),
      expect.objectContaining({
        headers: {
          Authorization: `Bearer ${jwt()}`,
          Accept: 'text/event-stream',
          'x-workspace-id': 'workspace-1',
        },
        cache: 'no-store',
      }),
    );
  });

  it('returns a structured 502 when the upstream stream cannot be reached', async () => {
    upstreamFetch.mockRejectedValue(new TypeError('fetch failed'));

    const { GET } = await import('./route');
    const response = await GET(new Request('http://localhost/v1/jobs/job-1/events'), context);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Stream status tidak tersedia.' },
    });
  });
});
