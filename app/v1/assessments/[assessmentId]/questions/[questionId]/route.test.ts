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

function detail() {
  return {
    status: 200,
    payload: {
      data: {
        versionId: 'version-1',
        questions: [],
      },
    },
  };
}

describe('PATCH /v1/assessments/:assessmentId/questions/:questionId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadLiveAssessment.mockResolvedValue(detail());
    backendFetch.mockResolvedValue(
      new Response(JSON.stringify({ question: { id: 'question-1' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
  });

  it('forwards edited choices using the backend option contract', async () => {
    const { PATCH } = await import('./route');
    const request = new Request(
      'http://localhost/v1/assessments/assessment-1/questions/question-1',
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', 'if-match': 'etag-1' },
        body: JSON.stringify({
          options: [
            { id: 'a', label: 'A', text: 'Pilihan pertama' },
            { id: 'b', label: 'B', text: 'Pilihan kedua' },
          ],
          answerKey: 'b',
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ assessmentId: 'assessment-1', questionId: 'question-1' }),
    });

    expect(response.status).toBe(200);
    expect(backendFetch).toHaveBeenCalledTimes(1);
    const [path, init] = backendFetch.mock.calls[0] as [string, RequestInit];
    expect(path).toBe(
      '/v1/workspaces/workspace-1/assessments/assessment-1/versions/version-1/questions/question-1',
    );
    expect(init).toMatchObject({
      method: 'PATCH',
      headers: {
        'x-actor-user-id': 'user-1',
        'If-Match': 'etag-1',
      },
    });
    expect(JSON.parse(String(init.body))).toEqual({
      answer: 'b',
      options: [
        { key: 'a', text: 'Pilihan pertama' },
        { key: 'b', text: 'Pilihan kedua' },
      ],
    });
  });

  it('rejects malformed choice payloads before calling the backend', async () => {
    const { PATCH } = await import('./route');
    const request = new Request(
      'http://localhost/v1/assessments/assessment-1/questions/question-1',
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ options: [{ id: 'a' }] }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({ assessmentId: 'assessment-1', questionId: 'question-1' }),
    });

    expect(response.status).toBe(400);
    expect(backendFetch).not.toHaveBeenCalled();
  });
});
