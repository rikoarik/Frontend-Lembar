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

function jwt(workspaceId = 'workspace-1') {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ userId: 'user-1', workspaceId }),
  ).toString('base64url');
  return `${header}.${payload}.signature`;
}

describe('POST /v1/generate/submit blueprint distribution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieGet.mockImplementation((name: string) =>
      name === 'lembar_token' ? { value: jwt() } : undefined,
    );
  });

  it('builds blueprintItems from questionTypeCounts instead of hardcoding multiple_choice', async () => {
    const { POST } = await import('./route');

    backendFetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ assessment: { id: 'assessment-1' }, version: { id: 'version-1' } }),
          { status: 201, headers: { 'content-type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ jobId: 'job-1', status: 'queued' }), {
          status: 202,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const request = new Request('http://localhost/api/v1/generate/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': 'idem-1' },
      body: JSON.stringify({
        curriculumVersionId: 'cv-1',
        gradeId: 'grade-1',
        subjectId: 'subject-1',
        assessmentType: 'practice',
        difficulty: 'hard',
        questionCount: 7,
        questionTypeCounts: {
          multiple_choice: 2,
          short_answer: 2,
          essay: 2,
          true_false: 1,
        },
        teacherFocus: 'pecahan',
        sourceId: 'upload-1',
      }),
    });

    const response = await POST(request as never);

    expect(response.status).toBe(202);
    const assessmentBody = JSON.parse(String((backendFetch.mock.calls[0]?.[1] as RequestInit).body));
    const jobBody = JSON.parse(String((backendFetch.mock.calls[1]?.[1] as RequestInit).body));
    const expected = [
      'multiple_choice',
      'multiple_choice',
      'short_answer',
      'short_answer',
      'essay',
      'essay',
      'true_false',
    ];

    expect(assessmentBody.blueprintItems).toHaveLength(7);
    expect(assessmentBody.blueprintItems.map((item: { questionType: string }) => item.questionType)).toEqual(
      expected,
    );
    expect(assessmentBody.blueprintItems.map((item: { sequence: number }) => item.sequence)).toEqual([
      0, 1, 2, 3, 4, 5, 6,
    ]);
    expect(assessmentBody.blueprintItems.every((item: { difficulty: string }) => item.difficulty === 'hard')).toBe(true);
    expect(
      assessmentBody.blueprintItems.every(
        (item: { sourceUploadId: string | null }) => item.sourceUploadId === 'upload-1',
      ),
    ).toBe(true);
    expect(jobBody.payload.blueprintItems).toEqual(assessmentBody.blueprintItems);
  });

  it('clamps questionCount and keeps a single surviving type when counts collapse to one type', async () => {
    const { POST } = await import('./route');

    backendFetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ assessment: { id: 'assessment-2' }, version: { id: 'version-2' } }),
          { status: 201, headers: { 'content-type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ jobId: 'job-2', status: 'queued' }), {
          status: 202,
          headers: { 'content-type': 'application/json' },
        }),
      );

    const request = new Request('http://localhost/api/v1/generate/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        curriculumVersionId: 'cv-1',
        gradeId: 'grade-1',
        subjectId: 'subject-1',
        assessmentType: 'practice',
        difficulty: 'mixed',
        questionCount: 0,
        questionTypeCounts: {
          multiple_choice: 0,
          short_answer: 0,
          essay: 1,
          true_false: 0,
        },
      }),
    });

    await POST(request as never);

    const assessmentBody = JSON.parse(String((backendFetch.mock.calls[0]?.[1] as RequestInit).body));
    expect(assessmentBody.blueprintItems).toEqual([
      expect.objectContaining({
        sequence: 0,
        questionType: 'essay',
        difficulty: 'medium',
        sourceUploadId: null,
      }),
    ]);
  });
});
