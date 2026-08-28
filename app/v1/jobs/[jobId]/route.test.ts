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

const params = (jobId: string) => ({ params: Promise.resolve({ jobId }) });

function jwt(workspaceId = 'workspace-1') {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ userId: 'user-1', workspaceId })).toString(
    'base64url',
  );
  return `${header}.${payload}.signature`;
}

beforeEach(() => {
  vi.clearAllMocks();
  cookieGet.mockImplementation((name: string) =>
    name === 'lembar_token' ? { value: jwt() } : undefined,
  );
});

describe('GET /v1/jobs/[jobId] handoff contract', () => {
  it('returns jobId and assessmentId as separate fields and never aliases them', async () => {
    const { GET } = await import('./route');

    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'job-abc',
            assessmentId: 'assessment-xyz',
            status: 'completed',
            createdAt: '2026-07-29T10:00:00.000Z',
            updatedAt: '2026-07-29T10:01:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const request = new Request('http://localhost/api/v1/jobs/job-abc');
    const response = await GET(request as never, params('job-abc'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.jobId).toBe('job-abc');
    expect(body.data.assessmentId).toBe('assessment-xyz');
    expect(body.data.jobId).not.toBe(body.data.assessmentId);
  });

  it('preserves Detail mode from the job payload for the review handoff', async () => {
    const { GET } = await import('./route');

    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'job-detail',
            assessmentId: 'assessment-detail',
            status: 'completed',
            payload: { reviewMode: 'detail' },
            createdAt: '2026-07-29T10:00:00.000Z',
            updatedAt: '2026-07-29T10:01:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const response = await GET(
      new Request('http://localhost/api/v1/jobs/job-detail') as never,
      params('job-detail'),
    );

    expect((await response.json()).data.reviewMode).toBe('detail');
  });

  it('does not substitute jobId into the assessmentId field when the backend omits it', async () => {
    const { GET } = await import('./route');

    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'job-pending',
            status: 'running',
            createdAt: '2026-07-29T10:00:00.000Z',
            updatedAt: '2026-07-29T10:01:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const request = new Request('http://localhost/api/v1/jobs/job-pending');
    const response = await GET(request as never, params('job-pending'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.jobId).toBe('job-pending');
    expect(body.data.assessmentId).toBeUndefined();
  });

  it('passes through an undefined assessmentId when the backend has not yet linked one', async () => {
    const { GET } = await import('./route');

    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'job-only',
            status: 'running',
            createdAt: '2026-07-29T10:00:00.000Z',
            updatedAt: '2026-07-29T10:01:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const request = new Request('http://localhost/api/v1/jobs/job-only');
    const response = await GET(request as never, params('job-only'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.jobId).toBe('job-only');
    expect(body.data.assessmentId).toBeUndefined();
  });
});
