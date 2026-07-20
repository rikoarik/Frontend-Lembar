import type { CatalogError, CatalogErrorCode } from './catalogErrors';

type ErrorCopy = {
  safeMessage: string;
  hint?: string;
  retryable: boolean;
};

const COPY: Record<CatalogErrorCode, ErrorCopy> = {
  VALIDATION_FAILED: {
    safeMessage: 'Periksa kembali isian formulir.',
    retryable: false,
  },
  RATE_LIMITED: {
    safeMessage: 'Terlalu banyak permintaan. Coba lagi dalam beberapa saat.',
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

export type CatalogErrorEnvelope = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  retryable?: boolean;
};

const KNOWN_CODES = new Set<string>(Object.keys(COPY));

export function mapEnvelopeToCatalogError(
  envelope: CatalogErrorEnvelope | null | undefined,
  httpStatus?: number,
  fallback?: Partial<CatalogError>,
): CatalogError {
  const rawCode = envelope?.code ?? '';
  const code: CatalogErrorCode = (KNOWN_CODES.has(rawCode) ? rawCode : 'UNKNOWN') as CatalogErrorCode;
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

export function networkError(cause?: unknown): CatalogError {
  return {
    code: 'NETWORK',
    safeMessage: COPY.NETWORK.safeMessage,
    hint: COPY.NETWORK.hint,
    retryable: true,
    cause,
  };
}

export function timeoutError(): CatalogError {
  return {
    code: 'TIMEOUT',
    safeMessage: COPY.TIMEOUT.safeMessage,
    hint: COPY.TIMEOUT.hint,
    retryable: true,
  };
}
