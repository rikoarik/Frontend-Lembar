import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuickReviewView } from '@/src/features/review/QuickReviewView';
import type { AssessmentDetail, ReviewQuestion } from '@/src/features/review/types';
import {
  mapReviewStateFromBackend,
  mapReviewStateToBackend,
} from '@/src/features/review/types';
import { loadLiveAssessment } from '@/src/lib/api/liveAssessment';
import { assessmentService } from '@/src/services/assessments/assessmentService';

vi.mock('@/src/services/assessments/assessmentService', () => ({
  assessmentService: {
    get: vi.fn(),
    bulkAccept: vi.fn(),
    updateQuestionState: vi.fn(),
    updateQuestionContent: vi.fn(),
    finalize: vi.fn(),
    getOutput: vi.fn(),
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/src/lib/api/session', async () => {
  const actual = await vi.importActual('@/src/lib/api/session');
  return {
    ...actual,
    backendFetch: vi.fn(),
  };
});

async function sessionModule() {
  return await import('@/src/lib/api/session');
}

function buildAssessmentWithState(reviewState: string): AssessmentDetail {
  return {
    id: 'asm-state',
    title: 'Latihan status',
    subject: 'IPA',
    gradeLabel: 'Kelas 5',
    lifecycle: 'review',
    questionCount: 1,
    reviewedCount: 0,
    warningCount: 0,
    reviewMode: 'quick',
    updatedAt: '2026-07-29T10:00:00.000Z',
    createdAt: '2026-07-29T10:00:00.000Z',
    canReview: true,
    canFinalize: false,
    canOpenOutput: false,
    questions: [
      {
        id: 'q-1',
        number: 1,
        stem: 'Apa jawaban yang benar?',
        options: [
          { id: 'a', label: 'A', text: 'A' },
          { id: 'b', label: 'B', text: 'B' },
        ],
        answerKey: 'a',
        explanation: 'Karena benar.',
        topic: 'Topik',
        difficulty: 'easy',
        sourceLabel: 'Kurikulum',
        reviewState: reviewState as ReviewQuestion['reviewState'],
        warnings: [],
        updatedAt: '2026-07-29T10:00:00.000Z',
      },
    ],
    finalizeBlockers: ['Semua soal harus diterima sebelum finalisasi.'],
    teacherResponsibilityNote: '',
  };
}

describe('review state normalization', () => {
  it('maps backend pending to frontend unreviewed and preserves supported states', () => {
    expect(mapReviewStateFromBackend('pending')).toBe('unreviewed');
    expect(mapReviewStateFromBackend('accepted')).toBe('accepted');
    expect(mapReviewStateFromBackend('edited')).toBe('edited');
    expect(mapReviewStateFromBackend('rejected')).toBe('rejected');
    expect(mapReviewStateFromBackend('needs_attention')).toBe('needs_attention');
  });

  it('maps frontend unreviewed back to backend pending and preserves supported states', () => {
    expect(mapReviewStateToBackend('unreviewed')).toBe('pending');
    expect(mapReviewStateToBackend('accepted')).toBe('accepted');
    expect(mapReviewStateToBackend('edited')).toBe('edited');
    expect(mapReviewStateToBackend('rejected')).toBe('rejected');
    expect(mapReviewStateToBackend('needs_attention')).toBe('needs_attention');
  });

  it('shows pending backend review state as unreviewed in quick review', async () => {
    vi.mocked(assessmentService.get).mockResolvedValue({
      ok: true,
      value: buildAssessmentWithState('pending'),
    });

    render(<QuickReviewView assessmentId="asm-state" mode="quick" />);

    expect(await screen.findByText(/Belum ditinjau · Topik/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Terima' })).toBeInTheDocument();
  });

  it('normalizes live assessment question status and finalized lifecycle from backend payload', async () => {
    const { backendFetch } = await sessionModule();
    vi.mocked(backendFetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          assessment: {
            id: 'asm-live',
            title: 'Latihan live',
            updatedAt: '2026-07-29T10:00:00.000Z',
            createdAt: '2026-07-29T09:00:00.000Z',
          },
          version: {
            id: 'ver-1',
            configSnapshot: { subjectId: 'IPA', gradeId: 'Kelas 5' },
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            questions: [
              {
                id: 'q-1',
                stem: 'Apa jawaban yang benar?',
                options: [
                  { key: 'A', text: 'Pilihan A' },
                  { key: 'B', text: 'Pilihan B' },
                ],
                answer: 'A',
                explanation: 'Karena benar.',
                difficulty: 'medium',
                sourceIds: [],
                status: 'pending',
                isFinalized: true,
                updatedAt: '2026-07-29T10:00:00.000Z',
              },
            ],
          },
        }),
      } as Response);

    const result = await loadLiveAssessment('token', 'ws-1', 'asm-live');
    const payload = result.payload as {
      data: {
        questions: Array<{ reviewState: string }>;
        lifecycle: string;
        canOpenOutput: boolean;
      };
    };

    expect(result.status).toBe(200);
    expect(payload.data.questions[0]?.reviewState).toBe('unreviewed');
    expect(payload.data.lifecycle).toBe('final');
    expect(payload.data.canOpenOutput).toBe(true);
  });
});
