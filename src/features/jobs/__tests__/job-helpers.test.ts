import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  activeJobStorageKey,
  clearActiveJob,
  readActiveJob,
  writeActiveJob,
} from '@/src/features/jobs/activeJobStorage';
import {
  isTerminalJobStatus,
  jobStatusLabel,
  type JobStatus,
} from '@/src/features/jobs/types';

describe('job helpers', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal('window', {
      sessionStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        },
        removeItem: (k: string) => {
          store.delete(k);
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists and clears active job per workspace', () => {
    writeActiveJob({
      jobId: 'job_1',
      workspaceId: 'ws_demo',
      reviewMode: 'quick',
      savedAt: '2026-07-23T00:00:00.000Z',
    });
    expect(readActiveJob('ws_demo')?.jobId).toBe('job_1');
    expect(store.has(activeJobStorageKey('ws_demo'))).toBe(true);
    clearActiveJob('ws_demo');
    expect(readActiveJob('ws_demo')).toBeNull();
  });

  it('classifies terminal statuses', () => {
    const terminal: JobStatus[] = ['succeeded', 'partially_succeeded', 'failed', 'cancelled'];
    const active: JobStatus[] = ['queued', 'running', 'retry_wait', 'cancellation_requested'];
    for (const s of terminal) expect(isTerminalJobStatus(s)).toBe(true);
    for (const s of active) expect(isTerminalJobStatus(s)).toBe(false);
  });

  it('uses teacher-facing Indonesian status labels', () => {
    expect(jobStatusLabel('running')).toMatch(/menyiapkan/i);
    expect(jobStatusLabel('succeeded')).toMatch(/ditinjau/i);
    expect(jobStatusLabel('failed')).toMatch(/gagal/i);
  });
});
