import type { GenerateError, GenerateErrorCode } from './generateErrors';

type ErrorCopy = {
  safeMessage: string;
  hint?: string;
  retryable: boolean;
};

const COPY: Record<GenerateErrorCode, ErrorCopy> = {
  VALIDATION_FAILED: {
    safeMessage: 'Periksa kembali isian formulir.',
    retryable: false,
  },
  RATE_LIMITED: {
    safeMessage: 'Buat lembar tidak tersedia. Hubungi admin atau tingkatkan paket Anda.',
    hint: 'Kuota pembuatan lembar telah habis untuk periode ini.',
    retryable: true,
  },
  NETWORK: {
    safeMessage: 'Tidak dapat terhubung. Periksa koneksi Anda.',
    hint: 'Pastikan perangkat terhubung ke internet.',
    retryable: true,
  },
  TIMEOUT: {
    safeMessage: 'Permintaan memakan waktu terlalu lama. Coba lagi.',
    retryable: true,
  },
  UNKNOWN: {
    safeMessage: 'Tidak dapat menyelesaikan permintaan saat ini.',
    hint: 'Coba lagi beberapa saat lagi.',
    retryable: true,
  },
};

export type GenerateErrorEnvelope = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  retryable?: boolean;
};

const KNOWN_CODES = new Set<string>(Object.keys(COPY));

export function mapEnvelopeToGenerateError(
  envelope: GenerateErrorEnvelope | null | undefined,
  httpStatus?: number,
  fallback?: Partial<GenerateError>,
): GenerateError {
  const rawCode = envelope?.code ?? '';
  const code: GenerateErrorCode = (
    KNOWN_CODES.has(rawCode) ? rawCode : 'UNKNOWN'
  ) as GenerateErrorCode;
  const copy =
    fallback?.retryable === undefined
      ? COPY[code]
      : { ...COPY[code], retryable: fallback.retryable };
  return {
    code,
    httpStatus,
    requestId: envelope?.requestId ?? fallback?.requestId,
    fieldErrors: envelope?.fieldErrors ?? fallback?.fieldErrors,
    safeMessage: fallback?.safeMessage ?? copy.safeMessage,
    hint: copy.hint,
    retryable: copy.retryable,
    cause: envelope,
  };
}

export function networkError(cause?: unknown): GenerateError {
  return {
    code: 'NETWORK',
    safeMessage: COPY.NETWORK.safeMessage,
    hint: COPY.NETWORK.hint,
    retryable: true,
    cause,
  };
}

export function timeoutError(): GenerateError {
  return {
    code: 'TIMEOUT',
    safeMessage: COPY.TIMEOUT.safeMessage,
    hint: COPY.TIMEOUT.hint,
    retryable: true,
  };
}
