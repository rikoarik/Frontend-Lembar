import type { AuthError, AuthErrorCode } from './authErrors';

type ErrorCopy = {
  safeMessage: string;
  hint?: string;
  retryable: boolean;
};

// safeMessage/hint carry message keys from the `errors` namespace
// (messages/<locale>/errors.json), resolved at render time.
const COPY: Record<AuthErrorCode, ErrorCopy> = {
  INVALID_CREDENTIALS: {
    safeMessage: 'auth.invalidCredentials.message',
    hint: 'auth.invalidCredentials.hint',
    retryable: false,
  },
  RATE_LIMITED: {
    safeMessage: 'auth.rateLimited.message',
    hint: 'auth.rateLimited.hint',
    retryable: true,
  },
  ACCOUNT_LOCKED: {
    safeMessage: 'auth.accountLocked.message',
    hint: 'auth.accountLocked.hint',
    retryable: true,
  },
  ACCOUNT_NOT_VERIFIED: {
    safeMessage: 'auth.accountNotVerified.message',
    hint: 'auth.accountNotVerified.hint',
    retryable: false,
  },
  PROVIDER_NOT_READY: {
    safeMessage: 'auth.providerNotReady.message',
    retryable: true,
  },
  PASSWORD_RECOVERY_REQUIRED: {
    safeMessage: 'auth.passwordRecoveryRequired.message',
    hint: 'auth.passwordRecoveryRequired.hint',
    retryable: false,
  },
  CAPTCHA_REQUIRED: {
    safeMessage: 'auth.captchaRequired.message',
    retryable: false,
  },
  NETWORK: {
    safeMessage: 'auth.network.message',
    retryable: true,
  },
  TIMEOUT: {
    safeMessage: 'auth.timeout.message',
    retryable: true,
  },
  VALIDATION_FAILED: {
    safeMessage: 'auth.validationFailed.message',
    retryable: false,
  },
  DUPLICATE_RESOURCE: {
    safeMessage: 'auth.duplicateResource.message',
    hint: 'auth.duplicateResource.hint',
    retryable: false,
  },
  RECOVERY_TOKEN_INVALID: {
    safeMessage: 'auth.recoveryTokenInvalid.message',
    hint: 'auth.recoveryTokenInvalid.hint',
    retryable: false,
  },
  INVITATION_INVALID: {
    safeMessage: 'auth.invitationInvalid.message',
    hint: 'auth.invitationInvalid.hint',
    retryable: false,
  },
  REGISTRATION_UNAVAILABLE: {
    safeMessage: 'auth.registrationUnavailable.message',
    retryable: false,
  },
  VERIFICATION_REQUIRED: {
    safeMessage: 'auth.verificationRequired.message',
    retryable: false,
  },
  UNKNOWN: {
    safeMessage: 'auth.unknown.message',
    hint: 'auth.unknown.hint',
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
  safeMessage: 'auth.recoveryRequest.message',
  retryable: false,
};

const COPY_MESSAGE_KEYS = new Set<string>(
  Object.values(COPY).flatMap((copy) =>
    copy.hint ? [copy.safeMessage, copy.hint] : [copy.safeMessage],
  ),
);
COPY_MESSAGE_KEYS.add(genericRecoveryCopy.safeMessage);

export function resolveErrorMessage(
  t: (key: string) => string,
  value: string | undefined,
): string | undefined {
  if (!value) return value;
  return COPY_MESSAGE_KEYS.has(value) ? t(value) : value;
}

export function recoveryRequestCopy(): ErrorCopy {
  return genericRecoveryCopy;
}

export function mapEnvelopeToAuthError(
  envelope: AuthErrorEnvelope | null | undefined,
  httpStatus?: number,
  fallback?: Partial<AuthError>,
): AuthError {
  const rawCode = envelope?.code ?? '';
  const code: AuthErrorCode = (KNOWN_CODES.has(rawCode) ? rawCode : 'UNKNOWN') as AuthErrorCode;
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
