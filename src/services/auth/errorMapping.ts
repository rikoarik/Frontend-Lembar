import type { AuthError, AuthErrorCode } from './authErrors';

type ErrorCopy = {
  safeMessage: string;
  hint?: string;
  retryable: boolean;
};

const COPY: Record<AuthErrorCode, ErrorCopy> = {
  INVALID_CREDENTIALS: {
    safeMessage:
      'Username, email, atau nomor telepon dan kata sandi tidak cocok.',
    hint: 'Coba lagi atau pulihkan kata sandi.',
    retryable: false,
  },
  RATE_LIMITED: {
    safeMessage:
      'Terlalu banyak percobaan. Coba lagi dalam beberapa saat.',
    hint: 'Permintaan akan dibuka kembali otomatis.',
    retryable: true,
  },
  ACCOUNT_LOCKED: {
    safeMessage:
      'Akun Anda dikunci sementara untuk keamanan. Coba lagi nanti.',
    hint: 'Jika merasa ini keliru, hubungi bantuan.',
    retryable: true,
  },
  ACCOUNT_NOT_VERIFIED: {
    safeMessage:
      'Akun Anda belum aktif. Cek email untuk langkah verifikasi.',
    hint: 'Tidak menemukan pesan? Periksa folder spam atau kirim ulang.',
    retryable: false,
  },
  PROVIDER_NOT_READY: {
    safeMessage: 'Sedang ada gangguan masuk. Coba lagi dalam beberapa menit.',
    retryable: true,
  },
  PASSWORD_RECOVERY_REQUIRED: {
    safeMessage: 'Kata sandi perlu diatur ulang sebelum masuk.',
    hint: 'Gunakan tautan pemulihan dari email Anda.',
    retryable: false,
  },
  CAPTCHA_REQUIRED: {
    safeMessage: 'Verifikasi tambahan diperlukan untuk melanjutkan.',
    retryable: false,
  },
  NETWORK: {
    safeMessage: 'Tidak dapat terhubung. Periksa koneksi Anda.',
    retryable: true,
  },
  TIMEOUT: {
    safeMessage: 'Permintaan memakan waktu terlalu lama. Coba lagi.',
    retryable: true,
  },
  VALIDATION_FAILED: {
    safeMessage: 'Periksa kembali isian formulir.',
    retryable: false,
  },
  DUPLICATE_RESOURCE: {
    safeMessage: 'Email atau nomor telepon sudah terdaftar.',
    hint: 'Gunakan identitas lain atau pulihkan akun.',
    retryable: false,
  },
  RECOVERY_TOKEN_INVALID: {
    safeMessage: 'Tautan pemulihan tidak valid.',
    hint: 'Minta tautan baru untuk melanjutkan.',
    retryable: false,
  },
  INVITATION_INVALID: {
    safeMessage: 'Undangan tidak lagi aktif.',
    hint: 'Hubungi admin sekolah untuk undangan baru.',
    retryable: false,
  },
  REGISTRATION_UNAVAILABLE: {
    safeMessage: 'Pendaftaran sedang ditutup untuk sementara.',
    retryable: false,
  },
  VERIFICATION_REQUIRED: {
    safeMessage: 'Verifikasi tambahan diperlukan.',
    retryable: false,
  },
  UNKNOWN: {
    safeMessage: 'Tidak dapat menyelesaikan permintaan saat ini.',
    hint: 'Coba lagi beberapa saat lagi.',
    retryable: true,
  },
};

export type AuthErrorEnvelope = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  retryable?: boolean;
};

const KNOWN_CODES = new Set<string>(Object.keys(COPY));

const genericRecoveryCopy: ErrorCopy = {
  safeMessage:
    'Jika akun ditemukan, kami akan mengirimkan langkah berikutnya.',
  retryable: false,
};

export function recoveryRequestCopy(): ErrorCopy {
  return genericRecoveryCopy;
}

export function mapEnvelopeToAuthError(
  envelope: AuthErrorEnvelope | null | undefined,
  httpStatus?: number,
  fallback?: Partial<AuthError>,
): AuthError {
  const rawCode = envelope?.code ?? '';
  const code: AuthErrorCode = (
    KNOWN_CODES.has(rawCode) ? rawCode : 'UNKNOWN'
  ) as AuthErrorCode;
  const copy = fallback?.retryable === undefined ? COPY[code] : { ...COPY[code], retryable: fallback.retryable };
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

export function networkError(cause?: unknown): AuthError {
  return {
    code: 'NETWORK',
    safeMessage: COPY.NETWORK.safeMessage,
    hint: COPY.NETWORK.hint,
    retryable: true,
    cause,
  };
}

export function timeoutError(): AuthError {
  return {
    code: 'TIMEOUT',
    safeMessage: COPY.TIMEOUT.safeMessage,
    hint: COPY.TIMEOUT.hint,
    retryable: true,
  };
}
