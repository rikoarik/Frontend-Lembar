import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JobProgressPanel } from '@/src/features/jobs/JobProgressPanel';
import { useJobProgress } from '@/src/features/jobs/state/useJobProgress';
import type { JobSnapshot } from '@/src/features/jobs/types';
import { jobService } from '@/src/services/jobs/jobService';

vi.mock('@/src/services/jobs/jobService', () => ({
  jobService: { getJob: vi.fn(), cancelJob: vi.fn() },
}));

class MockEventSource {
  static lastInstance: MockEventSource | null = null;
  listeners = new Map<string, Set<() => void>>();
  constructor(public url: string) {
    MockEventSource.lastInstance = this;
  }
  addEventListener(event: string, cb: () => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(cb);
  }
  removeEventListener(event: string, cb: () => void) {
    this.listeners.get(event)?.delete(cb);
  }
  close() {}
  emit(event: string) {
    for (const cb of this.listeners.get(event) ?? []) cb();
  }
}
(globalThis as unknown as { EventSource: typeof MockEventSource }).EventSource = MockEventSource as never;

const running: JobSnapshot = {
  jobId: 'job-123',
  status: 'running',
  stage: 'generating',
  progressPercent: 50,
  createdAt: '2026-07-29T10:00:00.000Z',
  updatedAt: '2026-07-29T10:01:00.000Z',
  canCancel: true,
  canRetry: false,
};

const succeededWithoutAssessment: JobSnapshot = {
  ...running,
  status: 'succeeded',
  stage: 'finalizing',
  canCancel: false,
  updatedAt: '2026-07-29T10:02:00.000Z',
};

const succeededWithAssessment: JobSnapshot = {
  ...succeededWithoutAssessment,
  assessmentId: 'assessment-789',
};

afterEach(() => vi.useRealTimers());

beforeEach(() => {
  vi.clearAllMocks();
});

describe('job handoff UX', () => {
  it('does not build a review link from jobId when assessmentId is missing', () => {
    render(<JobProgressPanel job={succeededWithoutAssessment} loading={false} />);

    expect(screen.queryByRole('link', { name: 'Buka tinjauan' })).not.toBeInTheDocument();
    expect(screen.getByText('Belum dapat assessmentId, coba lagi')).toBeInTheDocument();
    expect(screen.queryByText(/job-123/)).not.toBeInTheDocument();
  });

  it('keeps polling after success until assessmentId arrives, then exposes the review link', async () => {
    vi.useFakeTimers();
    vi.mocked(jobService.getJob)
      .mockResolvedValueOnce({ ok: true, value: succeededWithoutAssessment })
      .mockResolvedValueOnce({ ok: true, value: succeededWithAssessment });

    const { result } = renderHook(() =>
      useJobProgress({
        jobId: 'job-123',
        workspaceId: 'workspace-1',
        pollIntervalMs: 100,
      }),
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.job?.status).toBe('succeeded');
    expect(result.current.job?.assessmentId).toBeUndefined();

    await act(async () => {
      MockEventSource.lastInstance?.emit('status');
      await Promise.resolve();
    });

    expect(result.current.job?.assessmentId).toBe('assessment-789');

    render(<JobProgressPanel job={result.current.job} loading={false} />);
    expect(screen.getByRole('link', { name: 'Buka tinjauan' })).toHaveAttribute(
      'href',
      '/app/review/assessment-789',
    );
  });

  it('shows a timeout error when assessmentId never arrives after success', async () => {
    vi.useFakeTimers();
    vi.mocked(jobService.getJob).mockResolvedValue({ ok: true, value: succeededWithoutAssessment });

    const { result } = renderHook(() =>
      useJobProgress({
        jobId: 'job-123',
        workspaceId: 'workspace-1',
        pollIntervalMs: 100,
        assessmentHandoffTimeoutMs: 250,
      }),
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.job?.status).toBe('succeeded');

    await act(async () => {
      MockEventSource.lastInstance?.emit('status');
      await Promise.resolve();
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(result.current.error?.safeMessage).toBe('Belum dapat assessmentId, coba lagi');

    expect(screen.queryByRole('link', { name: 'Buka tinjauan' })).not.toBeInTheDocument();
  });
});
