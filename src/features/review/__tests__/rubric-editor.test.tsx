import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuickReviewView } from '@/src/features/review/QuickReviewView';
import type { AssessmentDetail, ReviewQuestion } from '@/src/features/review/types';
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

function buildQuestion(overrides: Partial<ReviewQuestion> = {}): ReviewQuestion {
  return {
    id: 'q-essay',
    number: 1,
    stem: 'Jelaskan dampak fotosintesis.',
    options: [],
    answerKey: 'Jawaban menjelaskan proses dan dampak.',
    explanation: 'Pembahasan.',
    topic: 'Biologi',
    difficulty: 'medium',
    sourceLabel: 'Kurikulum',
    reviewState: 'unreviewed',
    warnings: [],
    updatedAt: '2026-07-30T10:00:00.000Z',
    questionType: 'essay',
    rubric: [
      { id: 'r-1', description: 'Ketepatan konsep', maxScore: 3 },
      { id: 'r-2', description: 'Kejelasan argumen', maxScore: 2 },
    ],
    ...overrides,
  };
}

function buildAssessment(
  lifecycle: AssessmentDetail['lifecycle'] = 'review',
  questionOverrides: Partial<ReviewQuestion> = {},
): AssessmentDetail {
  return {
    id: 'assessment-rubric',
    title: 'Ujian Biologi',
    subject: 'Biologi',
    gradeLabel: 'Kelas 7',
    lifecycle,
    questionCount: 1,
    reviewedCount: 0,
    warningCount: 0,
    reviewMode: 'detail',
    updatedAt: '2026-07-30T10:00:00.000Z',
    createdAt: '2026-07-30T10:00:00.000Z',
    canReview: lifecycle !== 'final',
    canFinalize: lifecycle !== 'final',
    canOpenOutput: lifecycle === 'final',
    questions: [buildQuestion(questionOverrides)],
    finalizeBlockers: [],
    teacherResponsibilityNote: '',
  };
}

async function renderReview(assessment: AssessmentDetail, mode: 'quick' | 'detail' = 'detail') {
  vi.mocked(assessmentService.get).mockResolvedValue({ ok: true, value: assessment });
  vi.mocked(assessmentService.updateQuestionContent).mockResolvedValue({ ok: true, value: assessment });
  const user = userEvent.setup();
  render(<QuickReviewView assessmentId="assessment-rubric" mode={mode} />);
  await screen.findByText('Jelaskan dampak fotosintesis.');
  return user;
}

describe('P1-L rubric editor/renderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders rubric criteria for essay questions in editable detail mode', async () => {
    await renderReview(buildAssessment());

    const rubric = screen.getByRole('group', { name: /rubrik/i });
    expect(within(rubric).getByDisplayValue('Ketepatan konsep')).toBeInTheDocument();
    expect(within(rubric).getByDisplayValue('3')).toBeInTheDocument();
    expect(within(rubric).getByDisplayValue('Kejelasan argumen')).toBeInTheDocument();
    expect(within(rubric).getByDisplayValue('2')).toBeInTheDocument();
  });

  it('adds, edits, removes, and saves rubric criteria for essay questions', async () => {
    const user = await renderReview(buildAssessment());
    const rubric = screen.getByRole('group', { name: /rubrik/i });

    await user.click(within(rubric).getByRole('button', { name: /tambah kriteria/i }));
    const rowsAfterAdd = within(rubric).getAllByRole('listitem');
    const newRow = rowsAfterAdd[2];
    await user.type(within(newRow).getByRole('textbox', { name: /deskripsi kriteria 3/i }), 'Struktur jawaban');
    await user.clear(within(newRow).getByRole('spinbutton', { name: /skor maksimum kriteria 3/i }));
    await user.type(within(newRow).getByRole('spinbutton', { name: /skor maksimum kriteria 3/i }), '4');

    await user.clear(within(rowsAfterAdd[0]).getByRole('textbox', { name: /deskripsi kriteria 1/i }));
    await user.type(within(rowsAfterAdd[0]).getByRole('textbox', { name: /deskripsi kriteria 1/i }), 'Akurasi konsep');
    await user.click(within(rowsAfterAdd[1]).getByRole('button', { name: /hapus kriteria/i }));

    await user.click(screen.getByRole('button', { name: /simpan edit/i }));

    const patch = vi.mocked(assessmentService.updateQuestionContent).mock.calls[0][2] as Record<
      string,
      unknown
    >;
    expect(patch.rubric).toEqual([
      { id: 'r-1', description: 'Akurasi konsep', maxScore: 3 },
      { id: expect.any(String), description: 'Struktur jawaban', maxScore: 4 },
    ]);
  });

  it('shows compact rubric count in quick mode for essay questions with rubric', async () => {
    await renderReview(buildAssessment(), 'quick');

    expect(screen.getByText(/Esai · 2 kriteria rubrik/i)).toBeInTheDocument();
  });

  it('hides rubric editor for non-essay and final detail mode', async () => {
    await renderReview(buildAssessment('review', { questionType: 'short_answer' }));
    expect(screen.queryByRole('group', { name: /rubrik/i })).toBeNull();

    vi.clearAllMocks();
    await renderReview(buildAssessment('final'));
    expect(screen.queryByRole('group', { name: /rubrik/i })).toBeNull();
  });
});
