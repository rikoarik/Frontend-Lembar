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

const buildQuestion = (): ReviewQuestion => ({
  id: 'q-mc',
  number: 1,
  stem: 'Stem soal pilihan ganda.',
  options: [
    { id: 'a-q-mc', label: 'A', text: 'Pilihan A' },
    { id: 'b-q-mc', label: 'B', text: 'Pilihan B' },
    { id: 'c-q-mc', label: 'C', text: 'Pilihan C' },
    { id: 'd-q-mc', label: 'D', text: 'Pilihan D' },
  ],
  answerKey: 'a-q-mc',
  explanation: 'Pembahasan singkat.',
  topic: 'Topik',
  difficulty: 'easy',
  sourceLabel: 'Kurikulum',
  reviewState: 'unreviewed',
  warnings: [],
  updatedAt: '2026-07-29T10:00:00.000Z',
});

const buildAssessment = (
  lifecycle: AssessmentDetail['lifecycle'] = 'review',
): AssessmentDetail => ({
  id: 'assessment-mc',
  title: 'Latihan MC',
  subject: 'Matematika',
  gradeLabel: 'Kelas 4',
  lifecycle,
  questionCount: 1,
  reviewedCount: 0,
  warningCount: 0,
  reviewMode: 'detail',
  updatedAt: '2026-07-29T10:00:00.000Z',
  createdAt: '2026-07-29T10:00:00.000Z',
  canReview: lifecycle !== 'final',
  canFinalize: lifecycle !== 'final',
  canOpenOutput: lifecycle === 'final',
  questions: [buildQuestion()],
  finalizeBlockers: [],
  teacherResponsibilityNote: '',
});

beforeEach(() => {
  vi.mocked(assessmentService.get).mockResolvedValue({ ok: true, value: buildAssessment() });
  vi.mocked(assessmentService.updateQuestionContent).mockResolvedValue({
    ok: true,
    value: buildAssessment(),
  });
});

async function openDetail() {
  const user = userEvent.setup();
  render(<QuickReviewView assessmentId="assessment-mc" mode="detail" />);
  await screen.findByRole('group', { name: /daftar pilihan/i });
  return user;
}

function optionGroup(): HTMLElement {
  return screen.getByRole('group', { name: /daftar pilihan/i });
}

describe('QuickReviewView option editor (P1-J, detail mode)', () => {
  it('renders current options with editable text inputs and answerKey preselected', async () => {
    const user = await openDetail();

    const group = optionGroup();
    expect(within(group).getByDisplayValue('Pilihan A')).toBeInTheDocument();
    expect(within(group).getByDisplayValue('Pilihan B')).toBeInTheDocument();
    expect(within(group).getByDisplayValue('Pilihan C')).toBeInTheDocument();
    expect(within(group).getByDisplayValue('Pilihan D')).toBeInTheDocument();

    const answerKey = within(group).getByRole('radio', { name: /kunci jawaban a/i });
    expect(answerKey).toBeChecked();

    // editing the text on option B must update the input
    const inputB = within(group).getByDisplayValue('Pilihan B');
    await user.clear(inputB);
    await user.type(inputB, 'Pilihan B+');
    expect(inputB).toHaveValue('Pilihan B+');
  });

  it('adds a new option up to 6, then disables the add button at the cap', async () => {
    const user = await openDetail();
    const group = optionGroup();

    for (let i = 0; i < 2; i += 1) {
      await user.click(within(group).getByRole('button', { name: /tambah pilihan/i }));
    }
    // started with 4 → +2 = 6
    const rows = within(group).getAllByRole('listitem');
    expect(rows).toHaveLength(6);
    expect(within(group).getByRole('button', { name: /tambah pilihan/i })).toBeDisabled();
  });

  it('removes an option down to 2, then disables every remove button at the floor', async () => {
    const user = await openDetail();
    const group = optionGroup();

    // remove 2 → 4 - 2 = 2 remaining
    const removes = within(group).getAllByRole('button', { name: /hapus pilihan/i });
    await user.click(removes[0]);
    await user.click(removes[1]); // (one of the remaining)

    const rows = within(group).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(within(group).getAllByRole('button', { name: /hapus pilihan/i })).toHaveLength(2);
    within(group)
      .getAllByRole('button', { name: /hapus pilihan/i })
      .forEach((button) => expect(button).toBeDisabled());
  });

  it('reorders options using up and down buttons', async () => {
    const user = await openDetail();
    const group = optionGroup();

    const initial = within(group)
      .getAllByRole('listitem')
      .map((row) => row.dataset.optionId);
    expect(initial).toEqual(['a-q-mc', 'b-q-mc', 'c-q-mc', 'd-q-mc']);

    // move B up → ['b-q-mc', 'a-q-mc', 'c-q-mc', 'd-q-mc']
    const rowB = within(group).getAllByRole('listitem')[1];
    await user.click(within(rowB).getByRole('button', { name: /pindah ke atas/i }));
    expect(
      within(group)
        .getAllByRole('listitem')
        .map((row) => row.dataset.optionId),
    ).toEqual(['b-q-mc', 'a-q-mc', 'c-q-mc', 'd-q-mc']);

    // move the same option (now at index 0) down → ['a-q-mc', 'b-q-mc', 'c-q-mc', 'd-q-mc']
    const rowMoved = within(group).getAllByRole('listitem')[0];
    await user.click(within(rowMoved).getByRole('button', { name: /pindah ke bawah/i }));
    expect(
      within(group)
        .getAllByRole('listitem')
        .map((row) => row.dataset.optionId),
    ).toEqual(['a-q-mc', 'b-q-mc', 'c-q-mc', 'd-q-mc']);
  });

  it('answerKey radio only lists current options; saving preserves the selected option id', async () => {
    const user = await openDetail();
    const group = optionGroup();

    await user.click(within(group).getByRole('radio', { name: /kunci jawaban c/i }));
    expect(within(group).getByRole('radio', { name: /kunci jawaban c/i })).toBeChecked();
    expect(within(group).getByRole('radio', { name: /kunci jawaban a/i })).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: /simpan edit/i }));

    expect(assessmentService.updateQuestionContent).toHaveBeenCalledWith(
      'assessment-mc',
      'q-mc',
      expect.objectContaining({
        answerKey: 'c-q-mc',
        options: expect.arrayContaining([expect.objectContaining({ id: 'c-q-mc' })]),
      }),
      expect.any(Object),
    );
  });

  it('save call payload contains the current options array and the chosen answerKey', async () => {
    const user = await openDetail();
    const group = optionGroup();

    // change B's text, add a 5th option, select it as the answer key
    const inputB = within(group).getByDisplayValue('Pilihan B');
    await user.clear(inputB);
    await user.type(inputB, 'Pilihan B baru');

    await user.click(within(group).getByRole('button', { name: /tambah pilihan/i }));
    const rows = within(group).getAllByRole('listitem');
    const newRow = rows[rows.length - 1];
    const newId = newRow.dataset.optionId!;
    const newInput = within(newRow).getByRole('textbox');
    await user.type(newInput, 'Pilihan E');

    await user.click(within(newRow).getByRole('radio', { name: /kunci jawaban e/i }));

    await user.click(screen.getByRole('button', { name: /simpan edit/i }));

    const call = vi.mocked(assessmentService.updateQuestionContent).mock.calls[0];
    const patch = call[2] as {
      options: { id: string; label: string; text: string }[];
      answerKey: string;
    };
    expect(patch.answerKey).toBe(newId);
    expect(patch.options).toHaveLength(5);
    expect(patch.options[0]).toEqual({ id: 'a-q-mc', label: 'A', text: 'Pilihan A' });
    expect(patch.options[1]).toEqual({ id: 'b-q-mc', label: 'B', text: 'Pilihan B baru' });
    expect(patch.options[4]).toEqual({ id: newId, label: 'E', text: 'Pilihan E' });
  });
});
