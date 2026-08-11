import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OutputCenterContent } from '@/app/(app)/app/assessments/[assessmentId]/output/page';
import type { PrintDTO } from '@/src/features/output/types';

const replace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
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
    maxScore: 100,
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
  vi.restoreAllMocks();
  replace.mockReset();
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ data: dto })));
});

describe('P1-Q3 OutputCenterContent live preview', () => {
  it('updates preview sections immediately when toggles change without refetching', async () => {
    const user = userEvent.setup();
    render(<OutputCenterContent assessmentId="asm_1" />);

    const preview = await screen.findByRole('region', { name: /pratinjau output/i });
    expect(within(preview).getByRole('region', { name: /lembar siswa/i })).toBeInTheDocument();
    expect(within(preview).getByRole('region', { name: /kunci guru/i })).toBeInTheDocument();
    expect(within(preview).getByTestId('student-print-metadata')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /sembunyikan lembar siswa/i }));
    expect(within(preview).queryByRole('region', { name: /lembar siswa/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /sembunyikan kunci guru/i }));
    expect(within(preview).queryByRole('region', { name: /kunci guru/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /sembunyikan metadata/i }));
    expect(within(preview).queryByTestId('student-print-metadata')).not.toBeInTheDocument();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('updates visible student preview metadata while typing without refetching', async () => {
    const user = userEvent.setup();
    render(<OutputCenterContent assessmentId="asm_1" />);

    const preview = await screen.findByRole('region', { name: /pratinjau output/i });
    const school = screen.getByLabelText('Nama sekolah');
    await user.clear(school);
    await user.type(school, 'SDN 2');

    await waitFor(() => expect(within(preview).getByTestId('student-print-metadata')).toHaveTextContent('SDN 2'));
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
