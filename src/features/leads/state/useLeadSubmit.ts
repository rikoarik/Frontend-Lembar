'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { err, type Result } from '@/src/types/result';
import type { LeadError } from '@/src/services/leads/leadsErrors';
import { mapEnvelopeToLeadError } from '@/src/services/leads/errorMapping';
import type { LeadSubmissionPayload } from '@/src/features/leads/validation/lead-validation';
import type { SchoolLeadSuccess } from '@/src/types/leads';

type UseLeadSubmitOptions = {
  submit: (
    input: LeadSubmissionPayload,
    idempotencyKey: string,
  ) => Promise<Result<SchoolLeadSuccess, LeadError>>;
  onSuccess?: (value: SchoolLeadSuccess) => void;
};

export type UseLeadSubmitApi = {
  busy: boolean;
  error?: LeadError;
  fieldErrors: Record<string, string[]>;
  statusMessage?: string;
  submitted: boolean;
  submit: (input: LeadSubmissionPayload) => Promise<Result<SchoolLeadSuccess, LeadError>>;
  reset: () => void;
};

const generateIdempotencyKey = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `idem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
};

export function useLeadSubmit(options: UseLeadSubmitOptions): UseLeadSubmitApi {
  const idempotencyKeyRef = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<LeadError | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  const submit = useCallback(
    async (input: LeadSubmissionPayload) => {
      setBusy(true);
      setError(undefined);
      setFieldErrors({});
      setSubmitted(false);
      setStatusMessage('Mengirim permintaan…');

      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = generateIdempotencyKey();
      }

      const result = await options.submit(input, idempotencyKeyRef.current);

      if (result.ok) {
        setBusy(false);
        setStatusMessage(
          'Permintaan terkirim. Tim kami akan menindaklanjuti dalam 1–2 hari kerja.',
        );
        setSubmitted(true);
        idempotencyKeyRef.current = null;
        options.onSuccess?.(result.value);
        return result;
      }

      const leadError: LeadError = result.error ?? mapEnvelopeToLeadError(null);
      setError(leadError);
      setFieldErrors(leadError.fieldErrors ?? {});
      setStatusMessage(leadError.safeMessage);
      setBusy(false);
      return err(leadError);
    },
    [options],
  );

  const reset = useCallback(() => {
    idempotencyKeyRef.current = null;
    setBusy(false);
    setError(undefined);
    setFieldErrors({});
    setStatusMessage(undefined);
    setSubmitted(false);
  }, []);

  return useMemo(
    () => ({ busy, error, fieldErrors, statusMessage, submitted, submit, reset }),
    [busy, error, fieldErrors, statusMessage, submitted, submit, reset],
  );
}
