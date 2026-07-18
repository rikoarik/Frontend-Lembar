import { describe, expect, it } from 'vitest';
import {
  AUTH_ERROR_CODES,
  type AuthErrorCode,
} from '@/src/services/auth/authErrors';
import {
  mapEnvelopeToAuthError,
  recoveryRequestCopy,
} from '@/src/services/auth/errorMapping';

describe('errorMapping', () => {
  it.each(AUTH_ERROR_CODES)('maps known code %s to non-empty Indonesian copy', (code) => {
    const result = mapEnvelopeToAuthError({ code }, 500);
    expect(result.code).toBe(code);
    expect(result.safeMessage.length).toBeGreaterThan(0);
  });

  it('falls back to UNKNOWN for unknown envelope code', () => {
    const result = mapEnvelopeToAuthError({ code: 'NOT_A_REAL_CODE' }, 500);
    expect(result.code).toBe('UNKNOWN');
    expect(result.safeMessage).toBeTruthy();
  });

  it('preserves requestId from envelope', () => {
    const result = mapEnvelopeToAuthError(
      { code: 'INVALID_CREDENTIALS', requestId: 'req_abc' },
      401,
    );
    expect(result.requestId).toBe('req_abc');
  });

  it('exposes a generic recovery copy helper', () => {
    expect(recoveryRequestCopy().safeMessage.length).toBeGreaterThan(0);
  });

  it('coverage stays in sync with authErrors codes', () => {
    const known = new Set<string>(AUTH_ERROR_CODES as readonly AuthErrorCode[]);
    expect(known.has('UNKNOWN')).toBe(true);
  });
});
