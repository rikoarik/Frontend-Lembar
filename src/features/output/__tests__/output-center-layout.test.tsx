import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OutputCenterContent } from '@/app/(app)/app/assessments/[assessmentId]/output/page';
import type { PrintDTO } from '@/src/features/output/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

const dto: PrintDTO = {
  assessmentId: 'asm_1',
  title: 'Pecahan Harian',
  subject: 'Matematika',
  gradeLabel: 'Kelas 4',
  questionCount: 1,
  metadata: {
    schoolName: 'SDN 1',
    teacherName: 'Bu Sari',
    subject: 'Matematika',
    class: '4A',
    date: '2026-07-30',
    duration: '90 menit',
    instructions: 'Kerjakan dengan teliti.',
  },
  questions: [
    {
      number: 1,
      stem: '1/2 + 1/4 = ...',
      questionType: 'multiple_choice',
      options: [{ key: 'A', text: '3/4' }],
      answerKey: 'A',
    },
  ],
};

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ data: dto })),
  );
});

describe('P1-Q2 OutputCenterContent layout', () => {
  it('uses mobile-stacked controls and a desktop two-column sticky preview layout', async () => {
    render(<OutputCenterContent assessmentId="asm_1" />);

    await screen.findByRole('heading', { name: /pusat output/i });

    const layout = screen.getByTestId('output-center-layout');
    expect(layout).toHaveClass('grid', 'lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]');

    const controls = screen.getByRole('complementary', { name: /kontrol output/i });
    expect(controls).toHaveClass('order-1', 'lg:order-none');
    expect(controls).toContainElement(screen.getByLabelText('Nama sekolah'));
    expect(controls).toContainElement(
      screen.getByRole('button', { name: /sembunyikan lembar siswa/i }),
    );

    const preview = screen.getByRole('region', { name: /pratinjau output/i });
    expect(preview).toHaveClass('order-2', 'lg:sticky', 'lg:top-4', 'lg:self-start');
    expect(preview).toContainElement(screen.getByRole('region', { name: /lembar siswa/i }));
    expect(preview).toContainElement(screen.getByRole('region', { name: /kunci guru/i }));
  });
});
