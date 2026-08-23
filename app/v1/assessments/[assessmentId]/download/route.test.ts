import { describe, expect, it, vi } from 'vitest';

const backendFetch = vi.fn();
vi.mock('@/src/lib/api/liveAssessment', () => ({
  liveClaims: vi.fn(async () => ({
    token: 'test-token',
    claims: { workspaceId: 'workspace-1' },
  })),
}));
vi.mock('@/src/lib/api/session', () => ({ backendFetch }));

const pdf = Buffer.from('%PDF-1.7\ntest\n%%EOF');

describe('GET /v1/assessments/:id/download', () => {
  it('streams the student PDF copy from the authorized backend endpoint', async () => {
    backendFetch.mockResolvedValue(
      new Response(pdf, { status: 200, headers: { 'content-type': 'application/pdf' } }),
    );
    const { GET } = await import('./route');

    const response = await GET(
      new Request('http://localhost/v1/assessments/asm_1/download?copy=student'),
      {
        params: Promise.resolve({ assessmentId: 'asm_1' }),
      },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(
      Buffer.from(await response.arrayBuffer())
        .subarray(0, 5)
        .toString(),
    ).toBe('%PDF-');
    expect(backendFetch).toHaveBeenCalledWith(
      '/v1/assessments/asm_1/pdf?copy=student',
      expect.any(Object),
    );
  });

  it('defaults to the teacher PDF copy', async () => {
    backendFetch.mockResolvedValue(new Response(pdf, { status: 200 }));
    const { GET } = await import('./route');

    const response = await GET(new Request('http://localhost/v1/assessments/asm_1/download'), {
      params: Promise.resolve({ assessmentId: 'asm_1' }),
    });

    expect(response.headers.get('content-disposition')).toContain('lembar-asm_1-teacher.pdf');
    expect(backendFetch).toHaveBeenCalledWith(
      '/v1/assessments/asm_1/pdf?copy=teacher',
      expect.any(Object),
    );
  });
});
