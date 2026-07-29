import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuickReviewView } from '@/src/features/review/QuickReviewView';
import type { AssessmentDetail, ReviewQuestion } from '@/src/features/review/types';
import { assessmentService as mockedAssessmentService } from '@/src/services/assessments/assessmentService';
import { err, ok } from '@/src/types/result';

vi.mock('@/src/services/assessments/assessmentService', async () => {
  const actual = await vi.importActual<typeof import('@/src/services/assessments/assessmentService')>(
    '@/src/services/assessments/assessmentService',
  );
  return {
    ...actual,
    assessmentService: {
      ...actual.assessmentService,
      get: vi.fn(),
      bulkAccept: vi.fn(),
      updateQuestionState: vi.fn(),
      updateQuestionContent: vi.fn(),
    },
  };
});

const question = (
  id: string,
  number: number,
  reviewState: ReviewQuestion['reviewState'],
): ReviewQuestion => ({
  id,
  number,
  stem: `Pertanyaan ${number}`,
  options: [
    { id: `a-${id}`, label: 'A', text: 'Pilihan A' },
    { id: `b-${id}`, label: 'B', text: 'Pilihan B' },
  ],
  answerKey: `a-${id}`,
  explanation: 'Pembahasan',
  topic: 'Topik',
  difficulty: 'easy',
  sourceLabel: 'Kurikulum',
  reviewState,
  warnings: [],
  updatedAt: '2026-07-29T10:00:00.000Z',
});

const assessment = (version = '1'): AssessmentDetail => ({
  id: 'assessment-1',
  title: 'Latihan',
  subject: 'Matematika',
  gradeLabel: 'Kelas 4',
  lifecycle: 'review',
  questionCount: 2,
  reviewedCount: 0,
  warningCount: 0,
  reviewMode: 'detail',
  updatedAt: '2026-07-29T10:00:00.000Z',
  createdAt: '2026-07-29T10:00:00.000Z',
  canReview: true,
  canFinalize: false,
  canOpenOutput: false,
  questions: [question('q-1', 1, 'unreviewed'), question('q-2', 2, 'unreviewed')],
  finalizeBlockers: [],
  teacherResponsibilityNote: '',
  etag: `W/"${version}"`,
});

beforeEach(() => {
  vi.mocked(mockedAssessmentService.get).mockResolvedValue({ ok: true, value: assessment() });
});

describe('Question review ETag/If-Match round-trip (P1-D)', () => {
  it('updateQuestionContent forwards the expectedEtag as If-Match header', async () => {
    const { assessmentService } = await vi.importActual<
      typeof import('@/src/services/assessments/assessmentService')
    >('@/src/services/assessments/assessmentService');
    const realFetch = globalThis.fetch;
    const fetchSpy = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      return new Response(JSON.stringify({ data: assessment('2') }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    globalThis.fetch = fetchSpy as unknown as typeof fetch;
    try {
      const result = await assessmentService.updateQuestionContent(
        'asm_pecahan_01',
        'q-1',
        { stem: 'Teks baru' },
        { expectedEtag: 'W/"7"' },
      );
      expect(result.ok).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith(
        '/v1/assessments/asm_pecahan_01/questions/q-1',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({ 'If-Match': 'W/"7"' }),
        }),
      );
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  it('updateQuestionState surfaces HTTP 409 as AssessmentError with code STATE_CONFLICT', async () => {
    const { assessmentService } = await vi.importActual<
      typeof import('@/src/services/assessments/assessmentService')
    >('@/src/services/assessments/assessmentService');
    const realFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          error: { code: 'STATE_CONFLICT', message: 'Versi soal sudah berubah.', retryable: false },
        }),
        { status: 409, headers: { 'content-type': 'application/json' } },
      );
    }) as unknown as typeof fetch;
    try {
      const result = await assessmentService.updateQuestionState(
        'asm_pecahan_01',
        'q-1',
        'accepted',
        { expectedEtag: 'W/"3"' },
      );
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('STATE_CONFLICT');
      expect(result.error.safeMessage).toBe(
        'Versi soal berubah, muat ulang untuk melihat perubahan terbaru.',
      );
      expect(result.error.retryable).toBe(false);
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  it('QuickReviewView edit handler shows STATE_CONFLICT alert with Muat ulang button that re-fetches', async () => {
    const user = userEvent.setup();
    const refreshed = assessment('2');
    vi.mocked(mockedAssessmentService.get)
      .mockResolvedValueOnce({ ok: true, value: assessment('1') })
      .mockResolvedValueOnce({ ok: true, value: refreshed });
    vi.mocked(mockedAssessmentService.updateQuestionContent).mockResolvedValue(
      err({
        code: 'STATE_CONFLICT',
        safeMessage: 'Versi soal berubah, muat ulang untuk melihat perubahan terbaru.',
        retryable: false,
      }),
    );
    vi.mocked(mockedAssessmentService.updateQuestionState).mockResolvedValue(ok(refreshed));

    render(<QuickReviewView assessmentId="assessment-1" mode="detail" />);

    await screen.findByText('Pertanyaan 1');
    await user.clear(screen.getByLabelText('Stem soal'));
    await user.type(screen.getByLabelText('Stem soal'), 'Stem baru');
    await user.click(screen.getByRole('button', { name: 'Simpan edit' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(
      'Versi soal berubah, muat ulang untuk melihat perubahan terbaru',
    );
    await user.click(screen.getByRole('button', { name: 'Muat ulang' }));

    await waitFor(() => {
      expect(mockedAssessmentService.get).toHaveBeenCalledTimes(2);
    });
  });
});
