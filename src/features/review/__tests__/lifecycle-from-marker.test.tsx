import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuickReviewView } from '@/src/features/review/QuickReviewView';
import type { AssessmentDetail, AssessmentLifecycle, ReviewQuestion } from '@/src/features/review/types';
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

const question = (id: string, number: number, state: ReviewQuestion['reviewState']): ReviewQuestion => ({
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
  reviewState: state,
  warnings: [],
  updatedAt: '2026-07-29T10:00:00.000Z',
});

type MarkerOverrides = Partial<Pick<AssessmentDetail, 'canFinalize' | 'canOpenOutput'>>;

const baseAssessment = (lifecycle: AssessmentLifecycle, overrides: MarkerOverrides = {}): AssessmentDetail => ({
  id: 'assessment-1',
  title: 'Latihan',
  subject: 'Matematika',
  gradeLabel: 'Kelas 4',
  lifecycle,
  questionCount: 2,
  reviewedCount: lifecycle === 'final' ? 2 : 1,
  warningCount: 0,
  reviewMode: 'quick',
  updatedAt: '2026-07-29T10:00:00.000Z',
  createdAt: '2026-07-29T10:00:00.000Z',
  canReview: lifecycle !== 'final',
  canFinalize: overrides.canFinalize ?? lifecycle !== 'final',
  canOpenOutput: overrides.canOpenOutput ?? lifecycle === 'final',
  questions: [question('q-1', 1, 'accepted'), question('q-2', 2, 'unreviewed')],
  finalizeBlockers: [],
  teacherResponsibilityNote: '',
});

beforeEach(() => {
  vi.mocked(assessmentService.get).mockReset();
});

describe('QuickReviewView lifecycle eligibility (BE-marker driven)', () => {
  it('menyembunyikan tombol Finalisasi ketika canFinalize false walau lifecycle review', async () => {
    vi.mocked(assessmentService.get).mockResolvedValue({
      ok: true,
      value: baseAssessment('review', { canFinalize: false, canOpenOutput: false }),
    });

    render(<QuickReviewView assessmentId="assessment-1" />);
    await screen.findByText('Pertanyaan 1');
    expect(screen.queryByRole('button', { name: 'Finalisasi' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Buka output' })).not.toBeInTheDocument();
  });

  it('enables the Finalisasi button when canFinalize is true and shows no Buka output yet', async () => {
    vi.mocked(assessmentService.get).mockResolvedValue({
      ok: true,
      value: baseAssessment('review', { canFinalize: true, canOpenOutput: false }),
    });

    render(<QuickReviewView assessmentId="assessment-1" />);
    const finalize = await screen.findByRole('button', { name: 'Finalisasi' });
    expect(finalize).toBeEnabled();
    expect(screen.queryByRole('link', { name: 'Buka output' })).not.toBeInTheDocument();
  });

  it('menyembunyikan Finalisasi dan menampilkan Buka output saat canOpenOutput true', async () => {
    vi.mocked(assessmentService.get).mockResolvedValue({
      ok: true,
      value: baseAssessment('final', { canFinalize: false, canOpenOutput: true }),
    });

    render(<QuickReviewView assessmentId="assessment-1" />);
    await screen.findByText('Pertanyaan 1');
    expect(screen.queryByRole('button', { name: 'Finalisasi' })).not.toBeInTheDocument();
    const buka = screen.getByRole('link', { name: 'Buka output' });
    expect(buka).toHaveAttribute('href', '/app/output/assessment-1');
  });

  it('prefers the BE canFinalize marker over local lifecycle heuristic (final lifecycle but BE allows finalize)', async () => {
    // Backend says it is allowed even though local lifecycle says it is final.
    // UI must trust canFinalize, not lifecycle.
    vi.mocked(assessmentService.get).mockResolvedValue({
      ok: true,
      value: baseAssessment('final', { canFinalize: true, canOpenOutput: true }),
    });

    render(<QuickReviewView assessmentId="assessment-1" />);
    await screen.findByText('Pertanyaan 1');
    const finalize = screen.getByRole('button', { name: 'Finalisasi' });
    expect(finalize).toBeEnabled();
    expect(screen.getByRole('link', { name: 'Buka output' })).toHaveAttribute(
      'href',
      '/app/output/assessment-1',
    );
  });

  it('ignores lifecycle=final when BE says canFinalize=false and canOpenOutput=false', async () => {
    vi.mocked(assessmentService.get).mockResolvedValue({
      ok: true,
      value: baseAssessment('final', { canFinalize: false, canOpenOutput: false }),
    });

    render(<QuickReviewView assessmentId="assessment-1" />);
    await screen.findByText('Pertanyaan 1');
    expect(screen.queryByRole('button', { name: 'Finalisasi' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Buka output' })).not.toBeInTheDocument();
  });

  it('shows LifecycleBadge text Final with output subtitle based on canOpenOutput', async () => {
    vi.mocked(assessmentService.get).mockResolvedValue({
      ok: true,
      value: baseAssessment('final', { canFinalize: false, canOpenOutput: true }),
    });

    const view = render(<QuickReviewView assessmentId="assessment-1" />);
    const badge = await screen.findByRole('status', { name: 'Status: Final' });
    expect(within(badge).getByText('Final')).toBeInTheDocument();
    expect(screen.getByTestId('lifecycle-subtitle')).toHaveTextContent(/output siap dibuka/i);

    vi.mocked(assessmentService.get).mockResolvedValue({
      ok: true,
      value: baseAssessment('final', { canFinalize: false, canOpenOutput: false }),
    });
    view.unmount();
    render(<QuickReviewView assessmentId="assessment-1" />);
    expect(await screen.findByTestId('lifecycle-subtitle')).toHaveTextContent(/output belum tersedia/i);
  });
});