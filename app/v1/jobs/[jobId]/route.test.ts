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

  it('never reports 100% while the job is still running', async () => {
    const { GET } = await import('./route');
    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'job-full',
            status: 'running',
            progressCurrent: 4,
            progressTotal: 4,
            createdAt: '2026-07-29T10:00:00.000Z',
            updatedAt: '2026-07-29T10:01:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const response = await GET(
      new Request('http://localhost/api/v1/jobs/job-full') as never,
      params('job-full'),
    );
    const body = await response.json();

    expect(body.data.status).toBe('running');
    expect(body.data.progressPercent).toBe(99);
  });

  it('reports 100% once the job reaches a terminal status', async () => {
    const { GET } = await import('./route');
    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'job-done',
            status: 'completed',
            progressCurrent: 4,
            progressTotal: 4,
            createdAt: '2026-07-29T10:00:00.000Z',
            updatedAt: '2026-07-29T10:01:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const response = await GET(
      new Request('http://localhost/api/v1/jobs/job-done') as never,
      params('job-done'),
    );
    const body = await response.json();

    expect(body.data.status).toBe('succeeded');
    expect(body.data.stage).toBe('finalizing');
    expect(body.data.progressPercent).toBe(100);
  });

  it('maps a waiting retry to the preparing stage', async () => {
    const { GET } = await import('./route');
    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'job-retry',
            status: 'retry_wait',
            createdAt: '2026-07-29T10:00:00.000Z',
            updatedAt: '2026-07-29T10:01:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const response = await GET(
      new Request('http://localhost/api/v1/jobs/job-retry') as never,
      params('job-retry'),
    );
    const body = await response.json();

    expect(body.data.status).toBe('retry_wait');
    expect(body.data.stage).toBe('preparing');
  });

  it('passes the backend preparing stage through to the panel', async () => {
    const { GET } = await import('./route');
    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'job-preparing',
            status: 'preparing',
            createdAt: '2026-07-29T10:00:00.000Z',
            updatedAt: '2026-07-29T10:01:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const response = await GET(
      new Request('http://localhost/api/v1/jobs/job-preparing') as never,
      params('job-preparing'),
    );
    const body = await response.json();

    expect(body.data.status).toBe('running');
    expect(body.data.stage).toBe('preparing');
  });

  it('reaches the validating stage once every item is generated but the job is still running', async () => {
    const { GET } = await import('./route');
    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'job-validating',
            status: 'generating',
            progressCurrent: 4,
            progressTotal: 4,
            createdAt: '2026-07-29T10:00:00.000Z',
            updatedAt: '2026-07-29T10:01:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const response = await GET(
      new Request('http://localhost/api/v1/jobs/job-validating') as never,
      params('job-validating'),
    );
    const body = await response.json();

    expect(body.data.status).toBe('running');
    expect(body.data.stage).toBe('validating');
    expect(body.data.progressPercent).toBe(99);
  });

  it('stays in generating while items remain', async () => {
    const { GET } = await import('./route');
    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'job-generating',
            status: 'generating',
            progressCurrent: 1,
            progressTotal: 4,
            createdAt: '2026-07-29T10:00:00.000Z',
            updatedAt: '2026-07-29T10:01:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const response = await GET(
      new Request('http://localhost/api/v1/jobs/job-generating') as never,
      params('job-generating'),
    );
    const body = await response.json();

    expect(body.data.stage).toBe('generating');
    expect(body.data.progressPercent).toBe(25);
  });

  it('maps the backend rendering stage to validating', async () => {
    const { GET } = await import('./route');
    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'job-rendering',
            status: 'rendering',
            createdAt: '2026-07-29T10:00:00.000Z',
            updatedAt: '2026-07-29T10:01:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const response = await GET(
      new Request('http://localhost/api/v1/jobs/job-rendering') as never,
      params('job-rendering'),
    );

    expect((await response.json()).data.stage).toBe('validating');
  });

  it('forwards the backend root failure code and message instead of a generic UNKNOWN', async () => {
    const { GET } = await import('./route');
    backendFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'job-failed',
            status: 'failed',
            failureCode: 'GENERATION_ERROR',
            failureMessage: 'AI provider error for question at sequence 0: error',
            createdAt: '2026-07-29T10:00:00.000Z',
            updatedAt: '2026-07-29T10:01:00.000Z',
          },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const response = await GET(
      new Request('http://localhost/api/v1/jobs/job-failed') as never,
      params('job-failed'),
    );
    const body = await response.json();

    expect(body.data.error.code).toBe('GENERATION_ERROR');
    expect(body.data.error.safeMessage).toContain('provider error');
  });
});
