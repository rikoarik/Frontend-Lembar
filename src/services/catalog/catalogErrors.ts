export type CatalogErrorCode =
  | 'VALIDATION_FAILED'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'UNKNOWN';

export type CatalogError = {
  code: CatalogErrorCode;
  httpStatus?: number;
  requestId?: string;
  fieldErrors?: Record<string, string[]>;
  retryAfterMs?: number;
  safeMessage: string;
  hint?: string;
  retryable: boolean;
  cause?: unknown;
};

export const CATALOG_ERROR_CODES: readonly CatalogErrorCode[] = [
  'VALIDATION_FAILED',
  'RATE_LIMITED',
  'NETWORK',
  'TIMEOUT',
  'UNKNOWN',
];
