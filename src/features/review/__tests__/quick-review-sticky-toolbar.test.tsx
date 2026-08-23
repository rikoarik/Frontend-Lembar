import { render, screen, waitFor } from '@testing-library/react';
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
  },
}));

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

const assessment = (lifecycle: AssessmentDetail['lifecycle'] = 'review'): AssessmentDetail => ({
  id: 'assessment-1',
  title: 'Latihan',
  subject: 'Matematika',
  gradeLabel: 'Kelas 4',
  lifecycle,
  questionCount: 4,
  reviewedCount: 2,
  warningCount: 0,
  reviewMode: 'quick',
  updatedAt: '2026-07-29T10:00:00.000Z',
  createdAt: '2026-07-29T10:00:00.000Z',
  canReview: lifecycle !== 'final',
  canFinalize: lifecycle !== 'final',
  canOpenOutput: lifecycle === 'final',
  questions: [
    question('q-1', 1, 'unreviewed'),
    question('q-2', 2, 'needs_attention'),
    question('q-3', 3, 'accepted'),
    question('q-4', 4, 'edited'),
  ],
  finalizeBlockers: [],
  teacherResponsibilityNote: '',
});

beforeEach(() => {
  vi.mocked(assessmentService.get).mockResolvedValue({ ok: true, value: assessment() });
});

describe('QuickReviewView sticky bulk toolbar', () => {
  it('sticky bar is absent when nothing is selected', async () => {
    render(<QuickReviewView assessmentId="assessment-1" />);
    await screen.findByText('Pertanyaan 1');
    expect(
      screen.queryByRole('region', { name: 'Tindakan soal terpilih' }),
    ).not.toBeInTheDocument();
  });

  it('sticky bar appears with count label and action buttons when selection is non-empty', async () => {
    const user = userEvent.setup();
    render(<QuickReviewView assessmentId="assessment-1" />);

    await user.click(await screen.findByRole('checkbox', { name: 'Pilih soal 1' }));

    const bar = screen.getByRole('region', { name: 'Tindakan soal terpilih' });
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveTextContent('1 soal dipilih');
    expect(screen.getByRole('button', { name: 'Terima 1 soal' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Batal' })).toBeEnabled();
  });

  it('sticky bar reflects updated count when more questions are selected', async () => {
    const user = userEvent.setup();
    render(<QuickReviewView assessmentId="assessment-1" />);

    await user.click(await screen.findByRole('checkbox', { name: 'Pilih soal 1' }));
    await user.click(screen.getByRole('checkbox', { name: 'Pilih soal 2' }));

    const bar = screen.getByRole('region', { name: 'Tindakan soal terpilih' });
    expect(bar).toHaveTextContent('2 soal dipilih');
    expect(screen.getByRole('button', { name: 'Terima 2 soal' })).toBeEnabled();
  });

  it('Batal button clears selection and hides the sticky bar', async () => {
    const user = userEvent.setup();
    render(<QuickReviewView assessmentId="assessment-1" />);

    await user.click(await screen.findByRole('checkbox', { name: 'Pilih soal 1' }));
    expect(screen.getByRole('region', { name: 'Tindakan soal terpilih' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Batal' }));

    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Tindakan soal terpilih' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('checkbox', { name: 'Pilih soal 1' })).not.toBeChecked();
  });

  it('Escape key clears selection and hides the sticky bar', async () => {
    const user = userEvent.setup();
    render(<QuickReviewView assessmentId="assessment-1" />);

    await user.click(await screen.findByRole('checkbox', { name: 'Pilih soal 1' }));
    expect(screen.getByRole('region', { name: 'Tindakan soal terpilih' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Tindakan soal terpilih' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('master checkbox and filter toolbar remain in the document regardless of selection', async () => {
    const user = userEvent.setup();
    render(<QuickReviewView assessmentId="assessment-1" />);

    await user.click(await screen.findByRole('checkbox', { name: 'Pilih soal 1' }));

    // master checkbox still present
    expect(
      screen.getByRole('checkbox', {
        name: 'Pilih semua soal yang dapat diterima di tampilan ini',
      }),
    ).toBeInTheDocument();
    // filter toolbar still present
    expect(screen.getByRole('toolbar', { name: 'Filter soal' })).toBeInTheDocument();
  });
});
