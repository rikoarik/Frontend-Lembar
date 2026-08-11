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
  questionCount: 2,
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
      options: [
        { key: 'A', text: '3/4' },
        { key: 'B', text: '2/3' },
      ],
      answerKey: 'A',
      explanation: 'Samakan penyebut.',
    },
    {
      number: 2,
      stem: 'Jelaskan fotosintesis.',
      questionType: 'essay',
      answerKey: 'Tumbuhan membuat makanan dengan cahaya.',
      rubric: [{ label: 'Isi', description: 'Menyebut cahaya', points: 10 }],
    },
  ],
};

function okFetch() {
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ data: dto })));
}

beforeEach(() => {
  vi.restoreAllMocks();
  replace.mockReset();
});

describe('P1-Q OutputCenterContent', () => {
  it('fetches PrintDTO from the assessment print BFF route', async () => {
    okFetch();

    render(<OutputCenterContent assessmentId="asm_1" />);

    await screen.findByRole('heading', { name: /pusat output/i });
    expect(fetch).toHaveBeenCalledWith('/v1/assessments/asm_1/print', { credentials: 'include' });
  });

  it('renders student worksheet, teacher key, metadata sections with real renderers', async () => {
    okFetch();

    render(<OutputCenterContent assessmentId="asm_1" />);

    const student = await screen.findByRole('region', { name: /lembar siswa/i });
    expect(within(student).getByText('1/2 + 1/4 = ...')).toBeInTheDocument();
    expect(within(student).queryByText('Samakan penyebut.')).not.toBeInTheDocument();

    const teacher = screen.getByRole('region', { name: /kunci guru/i });
    expect(within(teacher).getByLabelText('Correct answer: A. 3/4')).toBeInTheDocument();
    expect(within(teacher).getByText('Model answer')).toBeInTheDocument();

    const metadata = screen.getByRole('region', { name: /metadata/i });
    expect(within(metadata).getByLabelText('Nama sekolah')).toHaveValue('SDN 1');
  });

  it('section toggles control visibility', async () => {
    const user = userEvent.setup();
    okFetch();

    render(<OutputCenterContent assessmentId="asm_1" />);

    await screen.findByRole('region', { name: /lembar siswa/i });
    await user.click(screen.getByRole('button', { name: /sembunyikan lembar siswa/i }));
    expect(screen.queryByRole('region', { name: /lembar siswa/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /tampilkan lembar siswa/i }));
    expect(screen.getByRole('region', { name: /lembar siswa/i })).toBeInTheDocument();
  });

  it('redirects to sign-in when the print route returns 401', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: { code: 'AUTH_REQUIRED' } }, { status: 401 })));

    render(<OutputCenterContent assessmentId="asm_1" />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/masuk'));
  });
});
