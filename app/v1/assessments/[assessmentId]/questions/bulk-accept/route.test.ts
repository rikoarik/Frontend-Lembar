import { beforeEach, describe, expect, it, vi } from 'vitest';

const { cookieGet, backendFetch, loadLiveAssessment } = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  backendFetch: vi.fn(),
  loadLiveAssessment: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({ get: cookieGet })),
}));
vi.mock('@/src/lib/api/session', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/src/lib/api/session')>();
  return { ...original, backendFetch, isMockApiMode: () => false };
});
vi.mock('@/src/lib/api/liveAssessment', () => ({
  liveClaims: vi.fn(async () => ({
    token: 'token-1',
    claims: { userId: 'user-1', workspaceId: 'workspace-1' },
  })),
  loadLiveAssessment,
}));

const context = { params: Promise.resolve({ assessmentId: 'assessment-1' }) };

describe('bulk-accept route method contract (FE-VER-02 F-9)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadLiveAssessment.mockResolvedValue({
      status: 200,
      payload: { data: { versionId: 'version-1', questions: [] } },
    });
    backendFetch.mockResolvedValue(
      new Response(JSON.stringify({ question: { id: 'question-1' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
  });

  it('answers PATCH with a JSON 405 instead of an empty body', async () => {
    const { PATCH } = await import('./route');
    const response = await PATCH();

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
    const body = (await response.json()) as { error?: { code?: string; message?: string } };
    expect(body.error?.code).toBe('METHOD_NOT_ALLOWED');
    expect(body.error?.message).toContain('POST');
  });

  it('answers PUT and DELETE the same way', async () => {
    const { PUT, DELETE } = await import('./route');
    for (const handler of [PUT, DELETE]) {
      const response = await handler();
      expect(response.status).toBe(405);
      expect(((await response.json()) as { error?: { code?: string } }).error?.code).toBe(
        'METHOD_NOT_ALLOWED',
      );
    }
  });

  it('accepts the POST verb the FE actually calls', async () => {
    const { POST } = await import('./route');
    const request = new Request(
      'http://localhost/v1/assessments/assessment-1/questions/bulk-accept',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ questionIds: ['question-1'] }),
      },
    );
    const response = await POST(request, context);
    expect(response.status).toBe(200);
  });
});
