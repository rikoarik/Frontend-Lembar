'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { JobProgressPanel } from '@/src/features/jobs/JobProgressPanel';
import { useJobProgress } from '@/src/features/jobs/state/useJobProgress';
import { useWorkspace } from '@/src/features/workspace/workspaceContext';
import { clearActiveJob } from '@/src/features/jobs/activeJobStorage';

type JobProgressViewProps = {
  jobId: string;
};

export function JobProgressView({ jobId }: JobProgressViewProps) {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace.id;

  const { job, loading, error, cancelling, refresh, cancel } = useJobProgress({
    jobId,
    workspaceId,
  });

  const onRetry = useCallback(() => {
    clearActiveJob(workspaceId);
    router.push('/app/generate');
  }, [router, workspaceId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Progres generate</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Status netral dan aman dimuat ulang. Draft final tetap membutuhkan tinjauan guru.
        </p>
      </div>
      <JobProgressPanel
        job={job}
        loading={loading}
        error={error}
        cancelling={cancelling}
        onCancel={() => void cancel()}
        onRefresh={() => void refresh()}
        onRetry={onRetry}
      />
    </div>
  );
}
