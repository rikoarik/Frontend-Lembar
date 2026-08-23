import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudentWorksheetRenderer } from '@/src/features/output/StudentWorksheetRenderer';
import type { PrintDTO } from '@/src/features/output/types';

const base: PrintDTO = {
  assessmentId: 'asm_1',
  title: 'Pecahan Harian',
  subject: 'Matematika',
  gradeLabel: 'Kelas 4',
  questionCount: 0,
  questions: [],
};

describe('StudentWorksheetRenderer', () => {
  it('renders the assessment title', () => {
    render(<StudentWorksheetRenderer dto={base} />);
    expect(screen.getByRole('heading', { name: 'UJIAN PECAHAN HARIAN' })).toBeInTheDocument();
  });

  it('renders subject and grade label', () => {
    render(<StudentWorksheetRenderer dto={base} />);
    expect(screen.getByText(/Matematika/)).toBeInTheDocument();
    expect(screen.getByText(/Kelas 4/)).toBeInTheDocument();
  });

  it('renders questions with their numbers', () => {
    const dto: PrintDTO = {
      ...base,
      questionCount: 2,
      questions: [
        { number: 1, stem: 'Pertanyaan pertama', questionType: 'short_answer' },
        { number: 2, stem: 'Pertanyaan kedua', questionType: 'short_answer' },
      ],
    };
    render(<StudentWorksheetRenderer dto={dto} />);
    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('Pertanyaan pertama')).toBeInTheDocument();
    expect(screen.getByText('Pertanyaan kedua')).toBeInTheDocument();
  });

  it('renders a generated question image with meaningful alt text', () => {
    const dto: PrintDTO = {
      ...base,
      questionCount: 1,
      questions: [
        {
          number: 1,
          stem: 'Amati diagram berikut.',
          questionType: 'short_answer',
          image: {
            dataUrl: 'data:image/png;base64,aW1hZ2U=',
            alt: 'Diagram pecahan lingkaran',
            mimeType: 'image/png',
          },
        },
      ],
    };

    render(<StudentWorksheetRenderer dto={dto} />);

    expect(screen.getByRole('img', { name: 'Diagram pecahan lingkaran' })).toBeInTheDocument();
  });

  it('renders multiple_choice options', () => {
    const dto: PrintDTO = {
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
    };
    render(<StudentWorksheetRenderer dto={dto} />);
    expect(screen.getByText(/A\./)).toBeInTheDocument();
    expect(screen.getByText(/3\/4/)).toBeInTheDocument();
    expect(screen.getByText(/B\./)).toBeInTheDocument();
    expect(screen.getByText(/2\/3/)).toBeInTheDocument();
  });

  it('does not render answerKey for multiple_choice', () => {
    const dto: PrintDTO = {
      ...base,
      questionCount: 1,
      questions: [
        {
          number: 1,
          stem: '1/2 + 1/4 = ...',
          questionType: 'multiple_choice',
          options: [{ key: 'A', text: '3/4' }],
          answerKey: 'A',
          explanation: 'Samakan penyebut.',
        },
      ],
    };
    render(<StudentWorksheetRenderer dto={dto} />);
    // "A" appears only as option label, not as a standalone answer key text
    expect(screen.queryByText('Samakan penyebut.')).not.toBeInTheDocument();
    expect(screen.queryByText('Jawaban: A')).not.toBeInTheDocument();
  });

  it('renders true_false options', () => {
    const dto: PrintDTO = {
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
        },
      ],
    };
    render(<StudentWorksheetRenderer dto={dto} />);
    expect(screen.getByText(/Benar/)).toBeInTheDocument();
    expect(screen.getByText(/Salah/)).toBeInTheDocument();
  });

  it('renders short_answer with a blank answer line', () => {
    const dto: PrintDTO = {
      ...base,
      questionCount: 1,
      questions: [
        {
          number: 1,
          stem: 'Sebutkan ibukota Indonesia.',
          questionType: 'short_answer',
          answerKey: 'Jakarta',
        },
      ],
    };
    render(<StudentWorksheetRenderer dto={dto} />);
    // blank line present
    expect(document.querySelector('.answer-line')).toBeInTheDocument();
    // answer key NOT rendered
    expect(screen.queryByText('Jakarta')).not.toBeInTheDocument();
  });

  it('renders essay with a lined answer box', () => {
    const dto: PrintDTO = {
      ...base,
      questionCount: 1,
      questions: [
        {
          number: 1,
          stem: 'Jelaskan proses fotosintesis.',
          questionType: 'essay',
          rubric: [{ label: 'Isi', description: 'Lengkap', points: 10 }],
        },
      ],
    };
    render(<StudentWorksheetRenderer dto={dto} />);
    // lined answer box present
    expect(document.querySelector('.answer-box-lined')).toBeInTheDocument();
    // rubric NOT rendered
    expect(screen.queryByText('Lengkap')).not.toBeInTheDocument();
    expect(screen.queryByText('Isi')).not.toBeInTheDocument();
  });

  it('does not render explanation for any question type', () => {
    const dto: PrintDTO = {
      ...base,
      questionCount: 1,
      questions: [
        {
          number: 1,
          stem: 'Soal apa saja.',
          questionType: 'short_answer',
          answerKey: 'jawaban',
          explanation: 'Penjelasan rahasia.',
        },
      ],
    };
    render(<StudentWorksheetRenderer dto={dto} />);
    expect(screen.queryByText('Penjelasan rahasia.')).not.toBeInTheDocument();
  });

  it('applies print-friendly wrapper class', () => {
    const { container } = render(<StudentWorksheetRenderer dto={base} />);
    expect(container.firstChild).toHaveClass('worksheet-print');
  });
});
