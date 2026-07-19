import type { LeadError, LeadErrorCode } from './leadsErrors';

type ErrorCopy = {
  safeMessage: string;
  hint?: string;
  retryable: boolean;
};

const COPY: Record<LeadErrorCode, ErrorCopy> = {
  VALIDATION_FAILED: {
    safeMessage: 'Periksa kembali isian formulir.',
    hint: 'Pastikan nama, sekolah, peran, kontak, dan persetujuan terisi.',
    retryable: false,
  },
  RATE_LIMITED: {
    safeMessage: 'Terlalu banyak permintaan. Coba lagi beberapa saat lagi.',
    hint: 'Permintaan akan dibuka kembali otomatis.',
    retryable: true,
  },
  MAINTENANCE_MODE: {
    safeMessage: 'Layanan sedang dalam pemeliharaan singkat.',
    hint: 'Coba lagi setelah beberapa menit.',
    retryable: true,
  },
  NETWORK: {
    safeMessage: 'Tidak dapat terhubung. Periksa koneksi Anda.',
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

export type LeadErrorEnvelope = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  retryable?: boolean;
};

const KNOWN_CODES = new Set<string>(Object.keys(COPY));

export function mapEnvelopeToLeadError(
  envelope: LeadErrorEnvelope | null | undefined,
  httpStatus?: number,
  fallback?: Partial<LeadError>,
): LeadError {
  const rawCode = envelope?.code ?? '';
  const code: LeadErrorCode = (
    KNOWN_CODES.has(rawCode) ? rawCode : 'UNKNOWN'
  ) as LeadErrorCode;
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

export function networkError(cause?: unknown): LeadError {
  return {
    code: 'NETWORK',
    safeMessage: COPY.NETWORK.safeMessage,
    hint: COPY.NETWORK.hint,
    retryable: true,
    cause,
  };
}

export function timeoutError(): LeadError {
  return {
    code: 'TIMEOUT',
    safeMessage: COPY.TIMEOUT.safeMessage,
    hint: COPY.TIMEOUT.hint,
    retryable: true,
  };
}

// Enumeration-safe copy for lead submission. We never reveal whether a school
// or contact already exists; submissions are processed by the team later.
export function leadAcknowledgeCopy(): ErrorCopy {
  return {
    safeMessage:
      'Jika data Anda memenuhi syarat, tim kami akan menindaklanjuti dalam 1–2 hari kerja.',
    retryable: false,
  };
}
