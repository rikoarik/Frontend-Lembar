'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { err, ok, type Result } from '@/src/types/result';
import type { AuthError } from '@/src/services/auth/authErrors';
import {
  mapEnvelopeToAuthError,
} from '@/src/services/auth/errorMapping';

type UseAuthSubmitOptions<TInput> = {
  submit: (input: TInput, idempotencyKey: string) => Promise<Result<unknown, AuthError>>;
  onSuccess?: (value: unknown) => void;
};

export type UseAuthSubmitApi<TInput> = {
  busy: boolean;
  error?: AuthError;
  fieldErrors: Record<string, string[]>;
  statusMessage?: string;
  submit: (input: TInput) => Promise<Result<unknown, AuthError>>;
  reset: () => void;
};

const generateIdempotencyKey = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `idem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export function useAuthSubmit<TInput>(
  options: UseAuthSubmitOptions<TInput>,
): UseAuthSubmitApi<TInput> {
  const idempotencyKeyRef = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AuthError | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [statusMessage, setStatusMessage] = useState<string | undefined>();

  const submit = useCallback(
    async (input: TInput) => {
      setBusy(true);
      setError(undefined);
      setFieldErrors({});
      setStatusMessage('Mengirim permintaan…');

      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = generateIdempotencyKey();
      }

      const result = await options.submit(input, idempotencyKeyRef.current);

      if (result.ok) {
        setBusy(false);
        setStatusMessage('Berhasil.');
        idempotencyKeyRef.current = null;
        options.onSuccess?.(result.value);
        return result;
      }

      const authError: AuthError = result.error ?? mapEnvelopeToAuthError(null);
      setError(authError);
      setFieldErrors(authError.fieldErrors ?? {});
      setStatusMessage(authError.safeMessage);
      setBusy(false);
      return err(authError);
    },
    [options],
  );

  const reset = useCallback(() => {
    idempotencyKeyRef.current = null;
    setBusy(false);
    setError(undefined);
    setFieldErrors({});
    setStatusMessage(undefined);
  }, []);

  return useMemo(
    () => ({ busy, error, fieldErrors, statusMessage, submit, reset }),
    [busy, error, fieldErrors, statusMessage, submit, reset],
  );
}

// Re-export for tests that want to assert success-only paths without importing ok.
export const _ok = ok;
