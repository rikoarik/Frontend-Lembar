import type { JobError, JobErrorCode } from './jobErrors';

type ErrorCopy = {
  safeMessage: string;
  hint?: string;
  retryable: boolean;
};

const COPY: Record<JobErrorCode, ErrorCopy> = {
  RESOURCE_NOT_FOUND: {
    safeMessage: 'Pekerjaan tidak ditemukan.',
    hint: 'Periksa tautan atau kembali ke dashboard.',
    retryable: false,
  },
  STATE_CONFLICT: {
    safeMessage: 'Status pekerjaan sudah berubah.',
    hint: 'Muat ulang untuk melihat status terbaru.',
    retryable: true,
  },
  PERMISSION_DENIED: {
    safeMessage: 'Anda tidak memiliki akses ke pekerjaan ini.',
    retryable: false,
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
    safeMessage: 'Tidak dapat memuat status pekerjaan saat ini.',
    hint: 'Coba lagi beberapa saat lagi.',
    retryable: true,
  },
};

const KNOWN = new Set<string>(Object.keys(COPY));

export function mapJobEnvelope(
  envelope: { code?: string; message?: string; requestId?: string; retryable?: boolean } | null,
  httpStatus?: number,
): JobError {
  const raw = envelope?.code ?? '';
  const code: JobErrorCode = (KNOWN.has(raw) ? raw : 'UNKNOWN') as JobErrorCode;
  const copy = COPY[code];
  return {
    code,
    httpStatus,
    requestId: envelope?.requestId,
    safeMessage: envelope?.message || copy.safeMessage,
    hint: copy.hint,
    retryable: envelope?.retryable ?? copy.retryable,
    cause: envelope,
  };
}

export function jobNetworkError(cause?: unknown): JobError {
  return { code: 'NETWORK', safeMessage: COPY.NETWORK.safeMessage, hint: COPY.NETWORK.hint, retryable: true, cause };
}

export function jobTimeoutError(): JobError {
  return { code: 'TIMEOUT', safeMessage: COPY.TIMEOUT.safeMessage, retryable: true };
}
