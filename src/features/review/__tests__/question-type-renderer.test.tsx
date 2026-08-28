/**
 * TDD: per-questionType renderer in QuickReviewView quick mode.
 * Tests cover all 4 types: multiple_choice, true_false, short_answer, essay.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuickReviewView } from '@/src/features/review/QuickReviewView';
import type { AssessmentDetail } from '@/src/features/review/types';

// ── minimal mock ──────────────────────────────────────────────────────────────
vi.mock('@/src/services/assessments/assessmentService', () => ({
  assessmentService: {
    get: vi.fn(),
    updateQuestionState: vi.fn(),
    updateQuestionContent: vi.fn(),
    bulkAccept: vi.fn(),
  },
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import { assessmentService } from '@/src/services/assessments/assessmentService';

// ── helpers ───────────────────────────────────────────────────────────────────
function makeAssessment(overrides: Partial<AssessmentDetail['questions'][0]>[]): AssessmentDetail {
  const base = {
    id: 'a1',
    title: 'Tes',
    subject: 'IPA',
    gradeLabel: 'X',
    lifecycle: 'review' as const,
    questionCount: overrides.length,
    reviewedCount: 0,
    warningCount: 0,
    reviewMode: 'quick' as const,
    updatedAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    canReview: true,
    canFinalize: false,
    canOpenOutput: false,
    finalizeBlockers: [],
    teacherResponsibilityNote: '',
  };

  const makeQuestion = (q: Partial<AssessmentDetail['questions'][0]>, idx: number) => ({
    id: `q${idx + 1}`,
    number: idx + 1,
    stem: `Soal ${idx + 1}`,
    options: [
      { id: 'a', label: 'A', text: 'Pilihan A' },
      { id: 'b', label: 'B', text: 'Pilihan B' },
    ],
    answerKey: 'a',
    explanation: '',
    topic: 'Topik',
    difficulty: 'easy' as const,
    sourceLabel: 'AI',
    reviewState: 'unreviewed' as const,
    warnings: [],
    updatedAt: '2024-01-01T00:00:00Z',
    ...q,
  });

  return {
    ...base,
    questions: overrides.map((q, i) => makeQuestion(q, i)),
  };
}

function setup(assessment: AssessmentDetail) {
  vi.mocked(assessmentService.get).mockResolvedValue({ ok: true, value: assessment } as never);
}

// ── tests ─────────────────────────────────────────────────────────────────────
describe('QuickReviewView quick mode — per-questionType renderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a generated image in quick mode', async () => {
    setup(
      makeAssessment([
        {
          image: {
            dataUrl: 'data:image/png;base64,aW1hZ2U=',
            alt: 'Diagram siklus air',
            mimeType: 'image/png',
          },
        },
      ]),
    );
    render(<QuickReviewView assessmentId="a1" mode="quick" />);

    expect(await screen.findByRole('img', { name: 'Diagram siklus air' })).toBeInTheDocument();
  });

  it('renders a generated image in detail mode', async () => {
    setup(
      makeAssessment([
        {
          image: {
            dataUrl: 'data:image/webp;base64,aW1hZ2U=',
            alt: 'Ilustrasi rantai makanan',
            mimeType: 'image/webp',
          },
        },
      ]),
    );
    render(<QuickReviewView assessmentId="a1" mode="detail" />);

    expect(
      await screen.findByRole('img', { name: 'Ilustrasi rantai makanan' }),
    ).toBeInTheDocument();
  });

  it('shows a usable empty state when a newly generated assessment has no questions yet', async () => {
    const incompleteAssessment = { ...makeAssessment([]), questions: undefined } as never;
    vi.mocked(assessmentService.get).mockResolvedValue({
      ok: true,
      value: incompleteAssessment,
    });

    render(<QuickReviewView assessmentId="a1" mode="detail" />);

    expect(await screen.findByText('Tidak ada soal pada filter ini.')).toBeInTheDocument();
  });

  it('shows options list for multiple_choice', async () => {
    setup(makeAssessment([{ questionType: 'multiple_choice' }]));
    render(<QuickReviewView assessmentId="a1" mode="quick" />);

    expect(await screen.findByText('Pilihan A')).toBeInTheDocument();
    expect(screen.getByText('Pilihan B')).toBeInTheDocument();
  });

  it('shows options list for true_false', async () => {
    setup(
      makeAssessment([
        {
          questionType: 'true_false',
          options: [
            { id: 'true', label: 'B', text: 'Benar' },
            { id: 'false', label: 'S', text: 'Salah' },
          ],
          answerKey: 'true',
        },
      ]),
    );
    render(<QuickReviewView assessmentId="a1" mode="quick" />);

    expect(await screen.findByText('Benar')).toBeInTheDocument();
    expect(screen.getByText('Salah')).toBeInTheDocument();
  });

  it('shows "Jawaban singkat" label and no options for short_answer', async () => {
    setup(makeAssessment([{ questionType: 'short_answer', options: [], answerKey: 'jawaban' }]));
    render(<QuickReviewView assessmentId="a1" mode="quick" />);

    expect(await screen.findByText('Jawaban singkat')).toBeInTheDocument();
    expect(screen.queryByText('Pilihan A')).not.toBeInTheDocument();
    expect(screen.queryByText('Pilihan B')).not.toBeInTheDocument();
  });

  it('shows "Esai" label and no options for essay', async () => {
    setup(makeAssessment([{ questionType: 'essay', options: [], answerKey: '' }]));
    render(<QuickReviewView assessmentId="a1" mode="quick" />);

    expect(await screen.findByText('Esai')).toBeInTheDocument();
    expect(screen.queryByText('Pilihan A')).not.toBeInTheDocument();
    expect(screen.queryByText('Pilihan B')).not.toBeInTheDocument();
  });

  it('does not show answerKey line for essay', async () => {
    setup(makeAssessment([{ questionType: 'essay', options: [], answerKey: 'ESSAY_KEY' }]));
    render(<QuickReviewView assessmentId="a1" mode="quick" />);

    await screen.findByText('Esai');
    expect(screen.queryByText(/ESSAY_KEY/)).not.toBeInTheDocument();
  });

  it('does not show answerKey line for short_answer', async () => {
    setup(makeAssessment([{ questionType: 'short_answer', options: [], answerKey: 'SHORT_KEY' }]));
    render(<QuickReviewView assessmentId="a1" mode="quick" />);

    await screen.findByText('Jawaban singkat');
    expect(screen.queryByText(/SHORT_KEY/)).not.toBeInTheDocument();
  });

  it('defaults to showing options when questionType is absent (multiple_choice fallback)', async () => {
    // questionType not set — legacy question shape
    setup(makeAssessment([{}]));
    render(<QuickReviewView assessmentId="a1" mode="quick" />);

    expect(await screen.findByText('Pilihan A')).toBeInTheDocument();
  });
});
