'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { err, type Result } from '@/src/types/result';
import { generateService } from '@/src/services/generate/generateService';
import type { GenerateError } from '@/src/services/generate/generateErrors';
import { mapEnvelopeToGenerateError } from '@/src/services/generate/errorMapping';
import type { CompositionValues } from '../types';

export type UseGenerateSubmitOptions = {
  onSuccess?: (result: unknown) => void;
  onPermissionError?: () => void;
};

export type UseGenerateSubmitApi = {
  busy: boolean;
  error?: GenerateError;
  submit: (
    values: CompositionValues,
    workspaceId: string,
  ) => Promise<Result<unknown, GenerateError>>;
  reset: () => void;
};

const generateIdempotencyKey = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `idem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export function useGenerateSubmit(options?: UseGenerateSubmitOptions): UseGenerateSubmitApi {
  const idempotencyKeyRef = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<GenerateError | undefined>();

  const submit = useCallback(
    async (values: CompositionValues, workspaceId: string) => {
      setBusy(true);
      setError(undefined);

      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = generateIdempotencyKey();
      }

      const result = await generateService.submitConfiguration(
        values,
        workspaceId,
        idempotencyKeyRef.current,
      );

      if (result.ok) {
        setBusy(false);
        idempotencyKeyRef.current = null;
        options?.onSuccess?.(result.value);
        return result;
      }

      const genError: GenerateError = result.error ?? mapEnvelopeToGenerateError(null);
      if (genError.code === 'RATE_LIMITED') {
        options?.onPermissionError?.();
      }
      setError(genError);
      setBusy(false);
      return err(genError);
    },
    [options],
  );

  const reset = useCallback(() => {
    idempotencyKeyRef.current = null;
    setBusy(false);
    setError(undefined);
  }, []);

  return useMemo(() => ({ busy, error, submit, reset }), [busy, error, submit, reset]);
}
