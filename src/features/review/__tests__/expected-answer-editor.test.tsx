import { render, screen } from '@testing-library/react';
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

const ANSWER_KEY_LABEL = /kunci \/ pedoman jawaban/i;

function buildQuestion(
  overrides: Partial<ReviewQuestion> = {},
): ReviewQuestion {
  return {
    id: 'q-1',
    number: 1,
    stem: 'Jelaskan fotosintesis.',
    options: [],
    answerKey: 'Tanaman menyerap cahaya matahari.',
    explanation: 'Pembahasan fotosintesis.',
    topic: 'Biologi',
    difficulty: 'medium',
    sourceLabel: 'Kurikulum Merdeka',
    reviewState: 'unreviewed',
    warnings: [],
    updatedAt: '2026-07-30T10:00:00.000Z',
    questionType: 'essay',
    ...overrides,
  };
}

function buildAssessment(
  lifecycle: AssessmentDetail['lifecycle'] = 'review',
  questionOverrides: Partial<ReviewQuestion> = {},
): AssessmentDetail {
  return {
    id: 'assessment-1',
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

async function renderDetail(assessment: AssessmentDetail) {
  vi.mocked(assessmentService.get).mockResolvedValue({ ok: true, value: assessment });
  vi.mocked(assessmentService.updateQuestionContent).mockResolvedValue({
    ok: true,
    value: assessment,
  });
  const user = userEvent.setup();
  render(<QuickReviewView assessmentId="assessment-1" mode="detail" />);
  // Wait for the component to finish loading — Pembahasan textarea is always present in detail mode
  await screen.findByLabelText(/pembahasan/i);
  return user;
}

describe('P1-I expected-answer editor (detail mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows Kunci / pedoman jawaban textarea for essay, pre-filled with answerKey', async () => {
    await renderDetail(buildAssessment('review', { questionType: 'essay' }));
    const ta = await screen.findByDisplayValue('Tanaman menyerap cahaya matahari.');
    expect(screen.getByLabelText(ANSWER_KEY_LABEL)).toBe(ta);
  });

  it('shows Kunci / pedoman jawaban textarea for short_answer, pre-filled with answerKey', async () => {
    await renderDetail(buildAssessment('review', { questionType: 'short_answer' }));
    const ta = await screen.findByDisplayValue('Tanaman menyerap cahaya matahari.');
    expect(screen.getByLabelText(ANSWER_KEY_LABEL)).toBe(ta);
  });

  it('hides Kunci / pedoman jawaban for multiple_choice', async () => {
    await renderDetail(buildAssessment('review', { questionType: 'multiple_choice' }));
    expect(screen.queryByLabelText(ANSWER_KEY_LABEL)).toBeNull();
  });

  it('hides Kunci / pedoman jawaban for true_false', async () => {
    await renderDetail(buildAssessment('review', { questionType: 'true_false' }));
    expect(screen.queryByLabelText(ANSWER_KEY_LABEL)).toBeNull();
  });

  it('hides Kunci / pedoman jawaban when lifecycle is final (essay)', async () => {
    await renderDetail(buildAssessment('final', { questionType: 'essay' }));
    expect(screen.queryByLabelText(ANSWER_KEY_LABEL)).toBeNull();
  });

  it('hides Kunci / pedoman jawaban when lifecycle is final (short_answer)', async () => {
    await renderDetail(buildAssessment('final', { questionType: 'short_answer' }));
    expect(screen.queryByLabelText(ANSWER_KEY_LABEL)).toBeNull();
  });

  it('save sends updateQuestionContent with {answerKey} for essay', async () => {
    const user = await renderDetail(buildAssessment('review', { questionType: 'essay' }));
    const ta = screen.getByLabelText(ANSWER_KEY_LABEL) as HTMLTextAreaElement;
    // Wait for useEffect to sync editAnswerKey from the loaded question
    await screen.findByDisplayValue('Tanaman menyerap cahaya matahari.');

    await user.clear(ta);
    await user.type(ta, 'Jawaban baru esai.');

    await user.click(screen.getByRole('button', { name: /simpan edit/i }));

    const call = vi.mocked(assessmentService.updateQuestionContent).mock.calls[0];
    const patch = call[2] as Record<string, unknown>;
    expect(patch.answerKey).toBe('Jawaban baru esai.');
  });

  it('save sends updateQuestionContent with {answerKey} for short_answer', async () => {
    const user = await renderDetail(buildAssessment('review', { questionType: 'short_answer' }));
    const ta = screen.getByLabelText(ANSWER_KEY_LABEL) as HTMLTextAreaElement;
    // Wait for useEffect to sync editAnswerKey from the loaded question
    await screen.findByDisplayValue('Tanaman menyerap cahaya matahari.');

    await user.clear(ta);
    await user.type(ta, 'Jawaban singkat.');

    await user.click(screen.getByRole('button', { name: /simpan edit/i }));

    const call = vi.mocked(assessmentService.updateQuestionContent).mock.calls[0];
    const patch = call[2] as Record<string, unknown>;
    expect(patch.answerKey).toBe('Jawaban singkat.');
  });
});
