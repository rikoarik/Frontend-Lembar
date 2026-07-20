'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { sourceService } from '@/src/services/source/sourceService';
import type { SourceError, SourceState, SourceUploadIntent } from '@/src/types/source';
import { redactTokens } from '@/src/features/pdf-source/validation/pdf-validation';

type UploadPhase = 'idle' | 'validating' | 'requesting' | 'uploading' | 'processing' | 'done';

export type UsePdfSourceUploadOptions = {
  workspaceId: string;
  onSuccess?: (source: SourceState) => void;
  onError?: (error: SourceError) => void;
  pollingIntervalMs?: number;
};

export type UsePdfSourceUploadReturn = {
  phase: UploadPhase;
  progress: number;
  sourceState: SourceState | null;
  error: SourceError | null;
  upload: (file: File) => Promise<void>;
  cancel: () => void;
  retry: () => void;
  deleteSource: () => Promise<void>;
  isDeleting: boolean;
  deleteError: SourceError | null;
  reset: () => void;
};

function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function usePdfSourceUpload(
  options: UsePdfSourceUploadOptions,
): UsePdfSourceUploadReturn {
  const {
    workspaceId,
    onSuccess,
    onError,
    pollingIntervalMs = 2000,
  } = options;

  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [error, setError] = useState<SourceError | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sourceQuery = useQuery({
    queryKey: ['source', sourceId],
    queryFn: async () => {
      if (!sourceId) throw new Error('No sourceId');
      const result = await sourceService.getSource(sourceId, workspaceId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    enabled: !!sourceId && (phase === 'processing' || phase === 'done'),
    refetchInterval: phase === 'processing' ? pollingIntervalMs : false,
    retry: 3,
  });

  const deleteMutation = useMutation({
    mutationFn: async (uploadId: string) => {
      const result = await sourceService.deleteSource(uploadId, workspaceId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      setSourceId(null);
      setPhase('idle');
      setProgress(0);
      setError(null);
      queryClient.removeQueries({ queryKey: ['source', sourceId] });
    },
  });

  const upload = useCallback(
    async (file: File) => {
      abortRef.current = new AbortController();
      setError(null);
      setPhase('requesting');
      setProgress(0);
      setLastFile(file);

      const idempotencyKey = generateIdempotencyKey();

      const intentResult = await sourceService.createUploadIntent(
        file.name,
        file.size,
        workspaceId,
        idempotencyKey,
      );

      if (!intentResult.ok) {
        const safeError = {
          ...intentResult.error,
          safeMessage: redactTokens(intentResult.error.safeMessage),
        };
        setError(safeError);
        setPhase('idle');
        onError?.(safeError);
        return;
      }

      const intent = intentResult.value;
      setSourceId(intent.sourceId);
      setPhase('uploading');
      setProgress(10);

      const uploadResult = await sourceService.uploadFile(file, intent.uploadUrl);

      if (!uploadResult.ok) {
        const safeError = {
          ...uploadResult.error,
          safeMessage: redactTokens(uploadResult.error.safeMessage),
        };
        setError(safeError);
        setPhase('idle');
        onError?.(safeError);
        return;
      }

      setProgress(60);
      setPhase('processing');

      const sourceResult = await sourceService.getSource(intent.sourceId, workspaceId);

      if (!sourceResult.ok) {
        const safeError = {
          ...sourceResult.error,
          safeMessage: redactTokens(sourceResult.error.safeMessage),
        };
        setError(safeError);
        setPhase('idle');
        onError?.(safeError);
        return;
      }

      if (sourceResult.value.status === 'ready') {
        setProgress(100);
        setPhase('done');
        onSuccess?.(sourceResult.value);
      } else if (sourceResult.value.status === 'failed') {
        const failCode = sourceResult.value.failureCode ?? 'PROCESSING_FAILED';
        const safeError: SourceError = {
          code: failCode,
          safeMessage: redactTokens(
            failCode === 'INSUFFICIENT_CONTENT'
              ? 'Dokumen tidak memiliki konten yang cukup untuk diproses.'
              : 'Pemrosesan dokumen gagal. Silakan coba lagi.',
          ),
          retryable: failCode !== 'INSUFFICIENT_CONTENT',
        };
        setError(safeError);
        setPhase('idle');
        onError?.(safeError);
      }
    },
    [workspaceId, onSuccess, onError],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setPhase('idle');
    setProgress(0);
    setError(null);
  }, []);

  const retry = useCallback(() => {
    if (lastFile) {
      void upload(lastFile);
    }
  }, [lastFile, upload]);

  const deleteSource = useCallback(async () => {
    if (sourceId) {
      await deleteMutation.mutateAsync(sourceId);
    }
  }, [sourceId, deleteMutation]);

  const reset = useCallback(() => {
    setPhase('idle');
    setProgress(0);
    setSourceId(null);
    setError(null);
    setLastFile(null);
  }, []);

  return {
    phase,
    progress,
    sourceState: sourceQuery.data ?? null,
    error,
    upload,
    cancel,
    retry,
    deleteSource,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error as SourceError | null,
    reset,
  };
}
