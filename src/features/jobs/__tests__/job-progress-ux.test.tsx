import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { JobProgressPanel } from '@/src/features/jobs/JobProgressPanel';
import { useJobProgress } from '@/src/features/jobs/state/useJobProgress';
import { formatJobTiming, type JobSnapshot } from '@/src/features/jobs/types';
import { jobService } from '@/src/services/jobs/jobService';

vi.mock('@/src/services/jobs/jobService', () => ({
  jobService: { getJob: vi.fn(), cancelJob: vi.fn() },
}));

class MockEventSource {
  static instances: MockEventSource[] = [];
  listeners = new Map<string, Set<() => void>>();
  constructor(public url: string) {
    MockEventSource.instances.push(this);
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
(globalThis as unknown as { EventSource: typeof MockEventSource }).EventSource =
  MockEventSource as never;

const running: JobSnapshot = {
  jobId: 'job_internal_123',
  status: 'running',
  stage: 'generating',
  progressPercent: 50,
  createdAt: '2026-07-29T10:00:00.000Z',
  updatedAt: '2026-07-29T10:01:00.000Z',
  canCancel: true,
  canRetry: false,
};

afterEach(() => vi.useRealTimers());

describe('job progress UX', () => {
  it('shows human stage, determinate progress, elapsed time, honest ETA, and no machine ID', () => {
    vi.useFakeTimers();
    vi.setSystemTime('2026-07-29T10:02:00.000Z');
    render(<JobProgressPanel job={running} loading={false} />);

    expect(screen.getByText('Menyusun draft soal')).toBeInTheDocument();
    expect(screen.getByText('50% selesai')).toBeInTheDocument();
    expect(screen.getByText(/Berjalan 2 menit/)).toBeInTheDocument();
    expect(screen.getByText(/Perkiraan tersisa 1–3 menit/)).toBeInTheDocument();
    expect(screen.queryByText(/job_internal_123/)).not.toBeInTheDocument();
  });

  it('uses a stable indeterminate progress and generic timing when evidence is insufficient', () => {
    render(
      <JobProgressPanel
        job={{ ...running, stage: undefined, progressPercent: undefined }}
        loading={false}
      />,
    );
    expect(screen.getByText('Biasanya selesai dalam beberapa menit')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
  });

  it('recovers from an initial status error through polling when SSE sends no events', async () => {
    vi.useFakeTimers();
    vi.mocked(jobService.getJob)
      .mockResolvedValueOnce({
        ok: false,
        error: {
          code: 'UNKNOWN',
          safeMessage: 'Tidak dapat memuat status pekerjaan saat ini.',
          retryable: true,
        },
      })
      .mockResolvedValueOnce({ ok: true, value: running });

    const { result } = renderHook(() =>
      useJobProgress({ jobId: running.jobId, workspaceId: 'workspace', pollIntervalMs: 100 }),
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.error?.code).toBe('UNKNOWN');
    expect(result.current.job).toBeUndefined();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(result.current.job).toEqual(running);
    expect(result.current.error).toBeUndefined();
  });

  it('keeps the previous snapshot visible during background refresh', async () => {
    let resolveRefresh!: (value: Awaited<ReturnType<typeof jobService.getJob>>) => void;
    vi.mocked(jobService.getJob)
      .mockResolvedValueOnce({ ok: true, value: running })
      .mockImplementationOnce(() => new Promise((resolve) => (resolveRefresh = resolve)));

    const { result } = renderHook(() =>
      useJobProgress({ jobId: running.jobId, workspaceId: 'workspace', pollIntervalMs: 60_000 }),
    );
    await waitFor(() => expect(result.current.job).toEqual(running));

    let refreshPromise!: Promise<void>;
    act(() => {
      refreshPromise = result.current.refresh();
    });
    expect(result.current.job).toEqual(running);
    expect(result.current.loading).toBe(false);

    await act(async () => {
      resolveRefresh({ ok: true, value: { ...running, progressPercent: 60 } });
      await refreshPromise;
    });
    expect(result.current.job?.progressPercent).toBe(60);
  });

  it('marks a retained progress snapshot as stale when refresh fails', () => {
    render(
      <JobProgressPanel
        job={running}
        loading={false}
        error={{ code: 'UNKNOWN', safeMessage: 'Tidak dapat memuat status pekerjaan saat ini.', retryable: true }}
      />,
    );

    expect(screen.getByText(/Status terakhir mungkin tidak terbaru/)).toBeInTheDocument();
  });

  it('formats ETA only within evidence boundaries', () => {
    const now = new Date('2026-07-29T10:02:00.000Z').getTime();
    expect(formatJobTiming({ ...running, progressPercent: 0 }, now).eta).toBe(
      'Biasanya selesai dalam beberapa menit',
    );
    expect(formatJobTiming({ ...running, progressPercent: 50 }, now).eta).toBe(
      'Perkiraan tersisa 1–3 menit',
    );
    expect(formatJobTiming({ ...running, progressPercent: 99 }, now).eta).toBe('Hampir selesai');
    expect(formatJobTiming({ ...running, createdAt: 'invalid' }, now).elapsed).toBeUndefined();
  });
});
