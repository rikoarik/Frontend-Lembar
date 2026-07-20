export type GenerateErrorCode =
  | 'VALIDATION_FAILED'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNKNOWN';

export type GenerateError = {
  code: GenerateErrorCode;
  httpStatus?: number;
  requestId?: string;
  fieldErrors?: Record<string, string[]>;
  retryAfterMs?: number;
  safeMessage: string;
  hint?: string;
  retryable: boolean;
  cause?: unknown;
};

export const GENERATE_ERROR_CODES: readonly GenerateErrorCode[] = [
  'VALIDATION_FAILED',
  'RATE_LIMITED',
  'NETWORK',
  'TIMEOUT',
  'UNKNOWN',
];
