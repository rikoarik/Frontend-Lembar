export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'RATE_LIMITED'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_NOT_VERIFIED'
  | 'PROVIDER_NOT_READY'
  | 'PASSWORD_RECOVERY_REQUIRED'
  | 'CAPTCHA_REQUIRED'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'VALIDATION_FAILED'
  | 'DUPLICATE_RESOURCE'
  | 'RECOVERY_TOKEN_INVALID'
  | 'INVITATION_INVALID'
  | 'REGISTRATION_UNAVAILABLE'
  | 'VERIFICATION_REQUIRED'
  | 'UNKNOWN';

export type AuthError = {
  code: AuthErrorCode;
  httpStatus?: number;
  requestId?: string;
  fieldErrors?: Record<string, string[]>;
  retryAfterMs?: number;
  safeMessage: string;
  hint?: string;
  retryable: boolean;
  cause?: unknown;
};

export const AUTH_ERROR_CODES: readonly AuthErrorCode[] = [
  'INVALID_CREDENTIALS',
  'RATE_LIMITED',
  'ACCOUNT_LOCKED',
  'ACCOUNT_NOT_VERIFIED',
  'PROVIDER_NOT_READY',
  'PASSWORD_RECOVERY_REQUIRED',
  'CAPTCHA_REQUIRED',
  'NETWORK',
  'TIMEOUT',
  'VALIDATION_FAILED',
  'DUPLICATE_RESOURCE',
  'RECOVERY_TOKEN_INVALID',
  'INVITATION_INVALID',
  'REGISTRATION_UNAVAILABLE',
  'VERIFICATION_REQUIRED',
  'UNKNOWN',
];
