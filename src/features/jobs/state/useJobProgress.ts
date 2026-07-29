'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { jobService } from '@/src/services/jobs/jobService';
import type { JobError } from '@/src/services/jobs/jobErrors';
import {
  ASSESSMENT_HANDOFF_TIMEOUT_CODE,
  ASSESSMENT_HANDOFF_TIMEOUT_MESSAGE,
  ASSESSMENT_HANDOFF_TIMEOUT_MS,
  isTerminalJobStatus,
  type JobSnapshot,
} from '@/src/features/jobs/types';
import { clearActiveJob } from '@/src/features/jobs/activeJobStorage';

const DEFAULT_POLL_MS = 1_200;

export type UseJobProgressOptions = {
  jobId: string;
  workspaceId: string;
  pollIntervalMs?: number;
  /** Max ms to keep polling after terminal success while waiting for assessmentId. */
  assessmentHandoffTimeoutMs?: number;
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

function assessmentHandoffTimeoutError(): JobError {
  return {
    code: ASSESSMENT_HANDOFF_TIMEOUT_CODE as unknown as JobError['code'],
    safeMessage: ASSESSMENT_HANDOFF_TIMEOUT_MESSAGE,
    retryable: true,
  };
}

export function useJobProgress({
  jobId,
  workspaceId,
  pollIntervalMs = DEFAULT_POLL_MS,
  assessmentHandoffTimeoutMs = ASSESSMENT_HANDOFF_TIMEOUT_MS,
  onTerminal,
}: UseJobProgressOptions): UseJobProgressApi {
  const [job, setJob] = useState<JobSnapshot | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<JobError | undefined>();
  const [cancelling, setCancelling] = useState(false);
  const terminalNotified = useRef(false);
  const activeJobId = useRef(jobId);
  const onTerminalRef = useRef(onTerminal);
  const handoffDeadlineAt = useRef<number | null>(null);

  useEffect(() => {
    onTerminalRef.current = onTerminal;
  }, [onTerminal]);

  const refresh = useCallback(async () => {
    if (!jobId) return;
    const result = await jobService.getJob(jobId);
    if (result.ok) {
      setJob(result.value);
      setError(undefined);
      setLoading(false);
      if (isTerminalJobStatus(result.value.status)) {
        clearActiveJob(workspaceId);
        if (!result.value.assessmentId) {
          // Keep polling; surface timeout only after the window elapses.
          if (handoffDeadlineAt.current === null) {
            handoffDeadlineAt.current = Date.now() + assessmentHandoffTimeoutMs;
          }
        } else {
          handoffDeadlineAt.current = null;
        }
        if (!terminalNotified.current) {
          terminalNotified.current = true;
          onTerminalRef.current?.(result.value);
        }
      } else {
        handoffDeadlineAt.current = null;
      }
      return;
    }
    setError(result.error);
    setLoading(false);
  }, [jobId, workspaceId, assessmentHandoffTimeoutMs]);

  useEffect(() => {
    const changedJob = activeJobId.current !== jobId;
    activeJobId.current = jobId;
    terminalNotified.current = false;
    handoffDeadlineAt.current = null;
    void Promise.resolve().then(() => {
      if (changedJob) setLoading(true);
      setError(undefined);
      if (changedJob) setJob(undefined);
      return refresh();
    });
  }, [jobId, refresh]);

  useEffect(() => {
    if (!jobId) return;
    if (job && isTerminalJobStatus(job.status) && job.assessmentId) return;

    const id = window.setInterval(() => {
      if (
        handoffDeadlineAt.current !== null &&
        Date.now() >= handoffDeadlineAt.current
      ) {
        setError(assessmentHandoffTimeoutError());
        handoffDeadlineAt.current = null;
        return;
      }
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
