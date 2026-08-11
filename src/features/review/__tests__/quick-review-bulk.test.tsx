import { render, screen, waitFor, within } from '@testing-library/react';
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

describe('QuickReviewView bulk acceptance', () => {
  it('master checkbox selects only visible actionable questions and accepted states are compact', async () => {
    const user = userEvent.setup();
    render(<QuickReviewView assessmentId="assessment-1" />);

    const master = await screen.findByRole('checkbox', {
      name: 'Pilih semua soal yang dapat diterima di tampilan ini',
    });
    await user.click(master);

    expect(screen.getByRole('button', { name: 'Terima 2 soal' })).toBeEnabled();
    expect(screen.getByRole('checkbox', { name: 'Pilih soal 1' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Pilih soal 2' })).toBeChecked();
    expect(screen.queryByRole('checkbox', { name: 'Pilih soal 3' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Pilih soal 4' })).not.toBeInTheDocument();

    const acceptedCard = screen.getByText('Soal 3').closest('li')!;
    const editedCard = screen.getByText('Soal 4').closest('li')!;
    expect(within(acceptedCard).getByText('Diterima')).toBeInTheDocument();
    expect(within(acceptedCard).queryByRole('button', { name: 'Terima' })).not.toBeInTheDocument();
    expect(within(acceptedCard).getByRole('button', { name: 'Ubah keputusan' })).toBeEnabled();
    expect(within(editedCard).queryByRole('button', { name: 'Terima' })).not.toBeInTheDocument();
  });

  it('uses bulkAccept without a browser confirmation, then clears selection and updates the UI', async () => {
    const user = userEvent.setup();
    const updated = assessment();
    updated.questions = updated.questions.map((item) =>
      ['q-1', 'q-2'].includes(item.id) ? { ...item, reviewState: 'accepted' } : item,
    );
    vi.mocked(assessmentService.bulkAccept).mockResolvedValue({ ok: true, value: updated });
    const confirm = vi.spyOn(window, 'confirm');
    render(<QuickReviewView assessmentId="assessment-1" />);

    await screen.findByText('Pertanyaan 1');
    await user.click(screen.getByRole('button', { name: 'Pilih semua soal belum ditinjau' }));
    await user.click(screen.getByRole('button', { name: 'Terima 2 soal' }));

    expect(confirm).not.toHaveBeenCalled();
    expect(assessmentService.bulkAccept).toHaveBeenCalledWith('assessment-1', ['q-1', 'q-2']);
    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Tindakan soal terpilih' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole('checkbox', { name: 'Pilih soal 1' })).not.toBeInTheDocument();
  });

  it('prunes selection when the filter changes', async () => {
    const user = userEvent.setup();
    render(<QuickReviewView assessmentId="assessment-1" />);
    await user.click(await screen.findByRole('checkbox', { name: 'Pilih soal 1' }));
    await user.click(screen.getByRole('button', { name: 'Sudah ditinjau' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: 'Tindakan soal terpilih' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('disables every mutation in the final lifecycle', async () => {
    vi.mocked(assessmentService.get).mockResolvedValue({ ok: true, value: assessment('final') });
    render(<QuickReviewView assessmentId="final-assessment" />);

    await screen.findByText('Pertanyaan 1');
    expect(screen.getByRole('checkbox', { name: 'Pilih soal 1' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Terima' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tandai perhatian' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pilih semua soal belum ditinjau' })).toBeDisabled();
  });
});
