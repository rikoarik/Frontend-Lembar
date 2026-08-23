import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

describe('StudentWorksheetRenderer metadata header', () => {
  it('renders print metadata above the worksheet title', () => {
    const dto: PrintDTO = {
      ...base,
      metadata: {
        schoolName: 'SDN 1 Lembar',
        teacherName: 'Bu Sari',
        subject: 'Matematika',
        class: 'Kelas 4A',
        date: '2026-07-30',
        duration: '90 menit',
        instructions: 'Kerjakan dengan teliti.',
        maxScore: 100,
      },
    };

    const { container } = render(<StudentWorksheetRenderer dto={dto} />);

    const metadata = screen.getByTestId('student-print-metadata');
    const title = screen.getByRole('heading', { name: /pecahan harian/i });
    expect(metadata.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(metadata).toHaveTextContent('SDN 1 Lembar');
    expect(metadata).toHaveTextContent('Guru: Bu Sari');
    expect(metadata).toHaveTextContent('Tanggal: 2026-07-30');
    expect(metadata).toHaveTextContent('Durasi: 90 menit');
    expect(metadata).toHaveTextContent('Instruksi: Kerjakan dengan teliti.');
    expect(metadata).toHaveTextContent('Nama:');
    expect(metadata).toHaveTextContent('Kelas:');
    expect(metadata).toHaveTextContent('Nilai Maksimal: 100');
    expect(container.querySelector('.student-print-metadata')).toHaveClass('print:border-black');
  });

  it('does not render a metadata block when metadata is absent', () => {
    render(<StudentWorksheetRenderer dto={base} />);

    expect(screen.queryByTestId('student-print-metadata')).not.toBeInTheDocument();
  });
});
