import { act, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HistoryView, humanizeAssessmentLabel } from '@/src/features/history/HistoryView';
import { assessmentService } from '@/src/services/assessments/assessmentService';
import type { AssessmentSummary } from '@/src/features/review/types';

vi.mock('@/src/services/assessments/assessmentService', () => ({
  assessmentService: { list: vi.fn() },
}));

vi.mock('@/src/features/workspace/workspaceContext', () => ({
  useWorkspace: () => ({ activeWorkspace: { id: 'ws_demo' } }),
}));

const base: AssessmentSummary = {
  id: 'assessment_machine_id',
  title: 'Latihan Seni Tari',
  subject: 'official-subject-sd-mi-a-seni-tari',
  gradeLabel: 'official-grade-sd-mi-2',
  lifecycle: 'generating',
  questionCount: 0,
  reviewedCount: 0,
  warningCount: 0,
  reviewMode: 'quick',
  updatedAt: '2026-07-29T10:00:00.000Z',
  createdAt: '2026-07-29T10:00:00.000Z',
  canReview: false,
  canFinalize: false,
  canOpenOutput: false,
};

function row(title: string) {
  return screen.getByText(title).closest('li')!;
}

afterEach(() => vi.useRealTimers());

describe('history lifecycle UX', () => {
  it('shows generating lifecycle truthfully and refreshes without replacing the list with a skeleton', async () => {
    vi.useFakeTimers();
    vi.mocked(assessmentService.list).mockResolvedValue({ ok: true, value: [base] });
    render(<HistoryView refreshIntervalMs={10_000} />);

    await act(async () => Promise.resolve());
    expect(screen.getByText('Sedang membuat soal')).toBeInTheDocument();
    expect(screen.getByText(/Proses tetap aktif/)).toBeInTheDocument();
    expect(screen.queryByText(/0\/0 ditinjau/)).not.toBeInTheDocument();

    await act(async () => vi.advanceTimersByTimeAsync(10_000));
    expect(assessmentService.list).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Latihan Seni Tari')).toBeInTheDocument();
    expect(document.querySelector('[aria-busy="true"]')).toBeNull();
  });

  it('shows succeeded review copy and CTA', async () => {
    vi.mocked(assessmentService.list).mockResolvedValue({
      ok: true,
      value: [{ ...base, lifecycle: 'review', questionCount: 10, canReview: true }],
    });
    render(<HistoryView />);
    await waitFor(() =>
      expect(screen.getByRole('status', { name: 'Status: Siap ditinjau' })).toBeInTheDocument(),
    );
    expect(within(row(base.title)).getByRole('link', { name: 'Tinjau soal' })).toHaveAttribute(
      'href',
      `/app/review/${base.id}`,
    );
  });

  it('shows an explicit draft state for zero questions without a review ratio', async () => {
    vi.mocked(assessmentService.list).mockResolvedValue({
      ok: true,
      value: [{ ...base, lifecycle: 'draft' }],
    });
    render(<HistoryView />);
    await waitFor(() => expect(screen.getByText('Draf belum berisi soal')).toBeInTheDocument());
    expect(screen.queryByText(/0\/0/)).not.toBeInTheDocument();
  });

  it('humanizes known official slugs and types', () => {
    expect(humanizeAssessmentLabel('practice')).toBe('Latihan');
    expect(humanizeAssessmentLabel('official-subject-sd-mi-a-seni-tari')).toBe('Seni Tari');
    expect(humanizeAssessmentLabel('official-grade-sd-mi-2')).toBe('Kelas 2 SD/MI');
    expect(humanizeAssessmentLabel('official-subject-a12345678901234567890')).toBe('Mata pelajaran');
  });
});
