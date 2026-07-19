export type LeadErrorCode =
  | 'VALIDATION_FAILED'
  | 'RATE_LIMITED'
  | 'MAINTENANCE_MODE'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNKNOWN';

export type LeadError = {
  code: LeadErrorCode;
  httpStatus?: number;
  requestId?: string;
  fieldErrors?: Record<string, string[]>;
  retryAfterMs?: number;
  safeMessage: string;
  hint?: string;
  retryable: boolean;
  cause?: unknown;
};

export const LEAD_ERROR_CODES: readonly LeadErrorCode[] = [
  'VALIDATION_FAILED',
  'RATE_LIMITED',
  'MAINTENANCE_MODE',
  'NETWORK',
  'TIMEOUT',
  'UNKNOWN',
];
