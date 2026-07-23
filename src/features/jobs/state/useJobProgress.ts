'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { jobService } from '@/src/services/jobs/jobService';
import type { JobError } from '@/src/services/jobs/jobErrors';
import {
  isTerminalJobStatus,
  type JobSnapshot,
} from '@/src/features/jobs/types';
import { clearActiveJob } from '@/src/features/jobs/activeJobStorage';

const DEFAULT_POLL_MS = 1_200;

export type UseJobProgressOptions = {
  jobId: string;
  workspaceId: string;
  pollIntervalMs?: number;
  onTerminal?: (job: JobSnapshot) => void;
};

export type UseJobProgressApi = {
  job?: JobSnapshot;
  loading: boolean;
  error?: JobError;
  cancelling: boolean;
  refresh: () => Promise<void>;
  cancel: () => Promise<void>;
};

export function useJobProgress({
  jobId,
  workspaceId,
  pollIntervalMs = DEFAULT_POLL_MS,
  onTerminal,
}: UseJobProgressOptions): UseJobProgressApi {
  const [job, setJob] = useState<JobSnapshot | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<JobError | undefined>();
  const [cancelling, setCancelling] = useState(false);
  const terminalNotified = useRef(false);
  const onTerminalRef = useRef(onTerminal);
  onTerminalRef.current = onTerminal;

  const refresh = useCallback(async () => {
    if (!jobId) return;
    const result = await jobService.getJob(jobId);
    if (result.ok) {
      setJob(result.value);
      setError(undefined);
      setLoading(false);
      if (isTerminalJobStatus(result.value.status)) {
        clearActiveJob(workspaceId);
        if (!terminalNotified.current) {
          terminalNotified.current = true;
          onTerminalRef.current?.(result.value);
        }
      }
      return;
    }
    setError(result.error);
    setLoading(false);
  }, [jobId, workspaceId]);

  useEffect(() => {
    terminalNotified.current = false;
    setLoading(true);
    setError(undefined);
    setJob(undefined);
    void refresh();
  }, [jobId, refresh]);

  useEffect(() => {
    if (!jobId) return;
    if (job && isTerminalJobStatus(job.status)) return;

    const id = window.setInterval(() => {
      void refresh();
    }, pollIntervalMs);

    return () => window.clearInterval(id);
  }, [jobId, job, pollIntervalMs, refresh]);

  const cancel = useCallback(async () => {
    if (!jobId || cancelling) return;
    setCancelling(true);
    const result = await jobService.cancelJob(jobId);
    if (result.ok) {
      setJob(result.value);
      setError(undefined);
      if (isTerminalJobStatus(result.value.status)) {
        clearActiveJob(workspaceId);
        if (!terminalNotified.current) {
          terminalNotified.current = true;
          onTerminalRef.current?.(result.value);
        }
      }
    } else {
      setError(result.error);
    }
    setCancelling(false);
  }, [jobId, cancelling, workspaceId]);

  return useMemo(
    () => ({ job, loading, error, cancelling, refresh, cancel }),
    [job, loading, error, cancelling, refresh, cancel],
  );
}
