export type JobErrorCode =
  | 'RESOURCE_NOT_FOUND'
  | 'STATE_CONFLICT'
  | 'PERMISSION_DENIED'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNKNOWN';

export type JobError = {
  code: JobErrorCode;
  httpStatus?: number;
  requestId?: string;
  safeMessage: string;
  hint?: string;
  retryable: boolean;
  cause?: unknown;
};
