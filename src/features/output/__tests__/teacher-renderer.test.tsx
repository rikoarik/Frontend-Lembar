import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TeacherKeyRenderer } from '@/src/features/output/TeacherKeyRenderer';
import type { PrintDTO } from '@/src/features/output/types';

const base: PrintDTO = {
  assessmentId: 'asm_1',
  title: 'Pecahan Harian',
  subject: 'Matematika',
  gradeLabel: 'Kelas 4',
  questionCount: 0,
  questions: [],
};

describe('TeacherKeyRenderer', () => {
  it('renders the title with subject and grade header', () => {
    render(<TeacherKeyRenderer dto={base} />);

    expect(screen.getByRole('heading', { name: 'Pecahan Harian' })).toBeInTheDocument();
    expect(screen.getByText('Matematika · Kelas 4')).toBeInTheDocument();
  });

  it('renders numbered question stems', () => {
    render(
      <TeacherKeyRenderer
        dto={{
          ...base,
          questionCount: 2,
          questions: [
            { number: 1, stem: 'Pertanyaan pertama', questionType: 'short_answer' },
            { number: 2, stem: 'Pertanyaan kedua', questionType: 'short_answer' },
          ],
        }}
      />,
    );

    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('Pertanyaan pertama')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('Pertanyaan kedua')).toBeInTheDocument();
  });

  it('highlights the correct multiple-choice option and shows explanation', () => {
    render(
      <TeacherKeyRenderer
        dto={{
          ...base,
          questionCount: 1,
          questions: [
            {
              number: 1,
              stem: '1/2 + 1/4 = ...',
              questionType: 'multiple_choice',
              options: [
                { key: 'A', text: '3/4' },
                { key: 'B', text: '2/3' },
              ],
              answerKey: 'A',
              explanation: 'Samakan penyebut.',
            },
          ],
        }}
      />,
    );

    const correct = screen.getByText('A.').closest('li');
    const wrong = screen.getByText('B.').closest('li');
    expect(correct).toHaveAttribute('aria-label', 'Correct answer: A. 3/4');
    expect(correct).toHaveTextContent('✓');
    expect(wrong).not.toHaveTextContent('✓');
    expect(screen.getByText('Samakan penyebut.')).toBeInTheDocument();
  });

  it('highlights the correct true-false option', () => {
    render(
      <TeacherKeyRenderer
        dto={{
          ...base,
          questionCount: 1,
          questions: [
            {
              number: 1,
              stem: 'Bumi mengelilingi matahari.',
              questionType: 'true_false',
              options: [
                { key: 'True', text: 'Benar' },
                { key: 'False', text: 'Salah' },
              ],
              answerKey: 'True',
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('True.').closest('li')).toHaveAttribute('aria-label', 'Correct answer: True. Benar');
  });

  it('shows short-answer answer key text', () => {
    render(
      <TeacherKeyRenderer
        dto={{
          ...base,
          questionCount: 1,
          questions: [{ number: 1, stem: 'Ibukota Indonesia?', questionType: 'short_answer', answerKey: 'Jakarta' }],
        }}
      />,
    );

    expect(screen.getByText('Answer key')).toBeInTheDocument();
    expect(screen.getByText('Jakarta')).toBeInTheDocument();
  });

  it('shows essay model answer and rubric criteria with max score', () => {
    render(
      <TeacherKeyRenderer
        dto={{
          ...base,
          questionCount: 1,
          questions: [
            {
              number: 1,
              stem: 'Jelaskan fotosintesis.',
              questionType: 'essay',
              answerKey: 'Tumbuhan membuat makanan dengan cahaya.',
              rubric: [
                { label: 'Isi', description: 'Menyebut cahaya dan klorofil', points: 6 },
                { label: 'Struktur', description: 'Jawaban runtut', points: 4 },
              ],
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Model answer')).toBeInTheDocument();
    expect(screen.getByText('Tumbuhan membuat makanan dengan cahaya.')).toBeInTheDocument();
    expect(screen.getByText('Rubric')).toBeInTheDocument();
    expect(screen.getByText('Max score: 10')).toBeInTheDocument();
    const rubric = screen.getByRole('list', { name: 'Rubric criteria' });
    expect(within(rubric).getByText('Isi')).toBeInTheDocument();
    expect(within(rubric).getByText('Menyebut cahaya dan klorofil')).toBeInTheDocument();
    expect(within(rubric).getByText('6 pts')).toBeInTheDocument();
    expect(within(rubric).getByText('Struktur')).toBeInTheDocument();
    expect(within(rubric).getByText('4 pts')).toBeInTheDocument();
  });

  it('uses print-friendly semantic markup', () => {
    const { container } = render(<TeacherKeyRenderer dto={base} />);
    expect(container.firstChild).toHaveClass('teacher-key-print');
    expect(container.firstChild).toHaveClass('print:bg-white');
    expect(screen.getByLabelText('Teacher answer key questions')).toBeInTheDocument();
  });
});
