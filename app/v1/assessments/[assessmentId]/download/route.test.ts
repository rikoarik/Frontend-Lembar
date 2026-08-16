import { describe, expect, it, vi } from 'vitest';

const backendFetch = vi.fn();
vi.mock('@/src/lib/api/liveAssessment', () => ({
  liveClaims: vi.fn(async () => ({
    token: 'test-token',
    claims: { workspaceId: 'workspace-1' },
  })),
}));
vi.mock('@/src/lib/api/session', () => ({ backendFetch }));

const upstream = {
  data: {
    meta: { title: 'Pecahan' },
    questions: [{ sequence: 1, stem: '1/2 + 1/4 = ...', options: [{ key: 'A', text: '3/4' }], answer: 'A', explanation: 'Samakan penyebut.' }],
  },
};

describe('GET /v1/assessments/:id/download', () => {
  it('keeps answer material out of the student copy', async () => {
    backendFetch.mockResolvedValue(new Response(JSON.stringify(upstream), { status: 200 }));
    const { GET } = await import('./route');

    const response = await GET(new Request('http://localhost/v1/assessments/asm_1/download?copy=student'), {
      params: Promise.resolve({ assessmentId: 'asm_1' }),
    });

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain('1/2 + 1/4');
    expect(html).not.toContain('Kunci jawaban');
    expect(html).not.toContain('Samakan penyebut.');
  });

  it('includes key and explanation only in the teacher copy', async () => {
    backendFetch.mockResolvedValue(new Response(JSON.stringify(upstream), { status: 200 }));
    const { GET } = await import('./route');

    const response = await GET(new Request('http://localhost/v1/assessments/asm_1/download?copy=teacher'), {
      params: Promise.resolve({ assessmentId: 'asm_1' }),
    });

    const html = await response.text();
    expect(html).toContain('Kunci jawaban');
    expect(html).toContain('Samakan penyebut.');
  });
});
