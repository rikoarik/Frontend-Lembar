import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuickReviewView } from '@/src/features/review/QuickReviewView';
import type { AssessmentDetail, ReviewQuestion } from '@/src/features/review/types';
import { assessmentService as mockedAssessmentService } from '@/src/services/assessments/assessmentService';

vi.mock('@/src/services/assessments/assessmentService', async () => {
  const actual = await vi.importActual<
    typeof import('@/src/services/assessments/assessmentService')
  >('@/src/services/assessments/assessmentService');
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

const question = (id: string, number: number): ReviewQuestion => ({
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
  reviewState: 'unreviewed',
  warnings: [],
  updatedAt: '2026-07-29T10:00:00.000Z',
});

const assessmentWithCtas = (
  overrides: Partial<Pick<AssessmentDetail, 'lifecycle' | 'canFinalize' | 'canOpenOutput'>>,
): AssessmentDetail => ({
  id: 'assessment-1',
  title: 'Latihan',
  subject: 'Matematika',
  gradeLabel: 'Kelas 4',
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
  questions: [question('q-1', 1)],
  finalizeBlockers: [],
  teacherResponsibilityNote: '',
  ...overrides,
});

beforeEach(() => {
  vi.mocked(mockedAssessmentService.get).mockReset();
});

describe('QuickReviewView lifecycle CTA (P1-V)', () => {
  it('menampilkan link Finalisasi ketika canFinalize true dan lifecycle != final', async () => {
    vi.mocked(mockedAssessmentService.get).mockResolvedValue({
      ok: true,
      value: assessmentWithCtas({ lifecycle: 'review', canFinalize: true, canOpenOutput: false }),
    });

    render(<QuickReviewView assessmentId="assessment-1" mode="quick" />);

    const finalize = await waitFor(() => screen.getByRole('link', { name: 'Finalisasi' }));
    expect(finalize).toHaveAttribute('href', '/app/review/assessment-1/finalize');
    expect(screen.queryByRole('link', { name: 'Buka output' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Buka output' })).not.toBeInTheDocument();
  });

  it('menampilkan link Buka output ketika canOpenOutput true (lifecycle final)', async () => {
    vi.mocked(mockedAssessmentService.get).mockResolvedValue({
      ok: true,
      value: assessmentWithCtas({ lifecycle: 'final', canFinalize: false, canOpenOutput: true }),
    });

    render(<QuickReviewView assessmentId="assessment-1" mode="quick" />);

    const openOutput = await waitFor(() => screen.getByRole('link', { name: 'Buka output' }));
    expect(openOutput).toHaveAttribute('href', '/app/output/assessment-1');
    expect(screen.queryByRole('link', { name: 'Finalisasi' })).not.toBeInTheDocument();
  });

  it('tidak menampilkan Finalisasi maupun Buka output ketika kedua flag bernilai false', async () => {
    vi.mocked(mockedAssessmentService.get).mockResolvedValue({
      ok: true,
      value: assessmentWithCtas({ lifecycle: 'review', canFinalize: false, canOpenOutput: false }),
    });

    render(<QuickReviewView assessmentId="assessment-1" mode="quick" />);

    await screen.findByText('Latihan');
    expect(screen.queryByRole('link', { name: 'Finalisasi' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Buka output' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Buka output' })).not.toBeInTheDocument();
  });
});
