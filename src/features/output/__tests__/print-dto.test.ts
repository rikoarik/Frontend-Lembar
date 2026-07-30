import { describe, expect, it, vi } from 'vitest';
import { mapToPrintDTO } from '@/src/features/output/types';

vi.mock('@/src/lib/api/liveAssessment', () => ({
  liveClaims: vi.fn(async () => null),
}));
vi.mock('@/src/lib/api/session', () => ({
  backendFetch: vi.fn(),
}));

describe('PrintDTO', () => {
  it('maps BE response to PrintDTO shape', () => {
    const dto = mapToPrintDTO('asm_1', {
      assessment: { id: 'asm_1', title: 'Pecahan Harian' },
      version: { configSnapshot: { subjectLabel: 'Matematika', gradeLabel: 'Kelas 4' } },
      questions: [
        {
          stem: '1/2 + 1/4 = ...',
          questionType: 'multiple_choice',
          options: [{ key: 'A', text: '3/4' }],
          answer: 'A',
          explanation: 'Samakan penyebut.',
          rubric: [{ label: 'Langkah', description: 'Menunjukkan penyebut sama', points: 2 }],
        },
      ],
      metadata: { generatedAt: '2026-07-30T00:00:00.000Z' },
    });

    expect(dto).toEqual({
      assessmentId: 'asm_1',
      title: 'Pecahan Harian',
      subject: 'Matematika',
      gradeLabel: 'Kelas 4',
      questionCount: 1,
      questions: [
        {
          number: 1,
          stem: '1/2 + 1/4 = ...',
          questionType: 'multiple_choice',
          options: [{ key: 'A', text: '3/4' }],
          answerKey: 'A',
          explanation: 'Samakan penyebut.',
          rubric: [{ label: 'Langkah', description: 'Menunjukkan penyebut sama', points: 2 }],
        },
      ],
      metadata: { generatedAt: '2026-07-30T00:00:00.000Z' },
    });
  });

  it('returns 401 without session', async () => {
    const { GET } = await import('@/app/v1/assessments/[assessmentId]/print/route');
    const response = await GET(new Request('http://localhost/v1/assessments/asm_1/print'), {
      params: Promise.resolve({ assessmentId: 'asm_1' }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' },
    });
  });
});
