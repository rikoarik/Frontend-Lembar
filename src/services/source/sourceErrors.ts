import type { SourceError } from '@/src/types/source';

type ErrorEnvelope = {
  code?: string;
  message?: string;
  details?: Array<{ field?: string; message?: string }>;
};

const SAFE_MESSAGES: Record<string, string> = {
  VALIDATION_FAILED: 'File tidak memenuhi persyaratan. Periksa format dan ukuran file.',
  FILE_TOO_LARGE: 'Ukuran file melebihi batas maksimal.',
  INVALID_CONTENT_TYPE: 'Format file tidak valid. Hanya file PDF yang dapat diunggah.',
  SOURCE_NOT_FOUND: 'Sumber dokumen tidak ditemukan.',
  SOURCE_ALREADY_DELETED: 'Sumber dokumen sudah dihapus.',
  UPLOAD_EXPIRED: 'Sesi unggah telah berakhir. Silakan coba lagi.',
  PROCESSING_FAILED: 'Pemrosesan dokumen gagal. Silakan coba lagi.',
  EXTRACTION_FAILED: 'Gagal mengekstrak konten dari dokumen.',
  SOURCE_TEXT_INSUFFICIENT: 'Dokumen tidak memiliki konten yang cukup untuk diproses.',
  NETWORK_ERROR: 'Koneksi jaringan bermasalah. Periksa koneksi Anda dan coba lagi.',
  TIMEOUT: 'Permintaan habis waktu. Silakan coba lagi.',
  UNKNOWN: 'Terjadi kesalahan. Silakan coba lagi.',
};

function mapErrorCode(code: string | undefined): string {
  if (!code) return 'UNKNOWN';
  return code in SAFE_MESSAGES ? code : 'UNKNOWN';
}

export function mapEnvelopeToSourceError(
  envelope: ErrorEnvelope | null,
  status: number,
): SourceError {
  if (status === 413) {
    return {
      code: 'FILE_TOO_LARGE',
      safeMessage: SAFE_MESSAGES.FILE_TOO_LARGE,
      retryable: false,
    };
  }

  if (status === 400) {
    const code = mapErrorCode(envelope?.code);
    return {
      code,
      safeMessage: SAFE_MESSAGES[code] ?? SAFE_MESSAGES.UNKNOWN,
      retryable: false,
    };
  }

  if (status === 404) {
    return {
      code: 'SOURCE_NOT_FOUND',
      safeMessage: SAFE_MESSAGES.SOURCE_NOT_FOUND,
      retryable: false,
    };
  }

  if (status === 409) {
    const code = mapErrorCode(envelope?.code);
    return {
      code,
      safeMessage: SAFE_MESSAGES[code] ?? SAFE_MESSAGES.UNKNOWN,
      retryable: false,
    };
  }

  if (status >= 500) {
    return {
      code: 'SERVER_ERROR',
      safeMessage: SAFE_MESSAGES.UNKNOWN,
      retryable: true,
    };
  }

  const code = mapErrorCode(envelope?.code);
  return {
    code,
    safeMessage: SAFE_MESSAGES[code] ?? SAFE_MESSAGES.UNKNOWN,
    retryable: false,
  };
}

export function networkError(cause: unknown): SourceError {
  return {
    code: 'NETWORK_ERROR',
    safeMessage: SAFE_MESSAGES.NETWORK_ERROR,
    retryable: true,
  };
}

export function timeoutError(): SourceError {
  return {
    code: 'TIMEOUT',
    safeMessage: SAFE_MESSAGES.TIMEOUT,
    retryable: true,
  };
}
