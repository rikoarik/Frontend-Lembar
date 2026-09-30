import { describe, expect, it } from 'vitest';
import {
  PASSWORD_MIN,
  translateValidationFailure,
  validateInvitationAccept,
  validateLogin,
  validateRecoveryRequest,
  validateRegister,
  validateResetPassword,
} from '@/src/features/auth/validation/auth-validation';

describe('auth-validation', () => {
  it('accepts a valid login with demo identifier', () => {
    const result = validateLogin({ identifier: 'demo', password: 'demo1234' });
    expect(result.ok).toBe(true);
  });

  it('rejects empty login identifier', () => {
    const result = validateLogin({ identifier: ' ', password: 'demo1234abcd' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((f) => f.field === 'identifier')).toBe(true);
    }
  });

  it('rejects an empty login password', () => {
    const result = validateLogin({ identifier: 'demo', password: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((f) => f.field === 'password')).toBe(true);
    }
  });

  it('requires all register fields', () => {
    const result = validateRegister({
      username: 'Bu Rina',
      email: 'not-an-email',
      phone: 'abc',
      password: 'short',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const fields = new Set(result.failures.map((f) => f.field));
      expect(fields.has('email')).toBe(true);
      expect(fields.has('phone')).toBe(true);
      expect(fields.has('password')).toBe(true);
    }
  });

  it('accepts a valid recovery request', () => {
    const result = validateRecoveryRequest({ identifier: 'demo@example.com' });
    expect(result.ok).toBe(true);
  });

  it('requires a token + new password for reset', () => {
    const result = validateResetPassword({ token: '', password: 'short' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const fields = new Set(result.failures.map((f) => f.field));
      expect(fields.has('token')).toBe(true);
      expect(fields.has('password')).toBe(true);
    }
  });

  it('invitation accept mirrors register validation', () => {
    const result = validateInvitationAccept({
      username: 'ok_name',
      email: 'demo@example.com',
      phone: '+6281234567890',
      password: 'Lengkap1234!',
    });
    expect(result.ok).toBe(true);
  });

  // BUG-24: `validation.passwordTooWeak` interpolates `{count}`. Rendering it
  // through a bare `t(key)` printed the literal placeholder to the user, which
  // is exactly what `/daftar` did with an 11-character password.
  it('renders the passwordTooWeak failure with its count parameter', () => {
    const result = validateRegister({
      username: 'ok_name',
      email: 'demo@example.com',
      phone: '081234567890',
      password: 'Pendek12345', // 11 chars — the audit's exact repro
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const failure = result.failures.find((f) => f.field === 'password');
      expect(failure?.message).toBe('validation.passwordTooWeak');
      if (!failure) throw new Error('expected a password failure');

      // A translator that records the values it received, so we prove the
      // parameter is actually supplied (not just that the key was used).
      let seen: Record<string, string | number> | undefined;
      const t = (key: string, values?: Record<string, string | number>) => {
        seen = values;
        return values ? `minimal ${values.count} karakter` : `RAW:${key}`;
      };

      const rendered = translateValidationFailure(t, failure);
      expect(seen).toEqual({ count: PASSWORD_MIN });
      expect(rendered).toBe(`minimal ${PASSWORD_MIN} karakter`);
      expect(rendered).not.toContain('{count}');
    }
  });

  it('does not pass a count parameter to keys that have no placeholder', () => {
    const result = validateRegister({
      username: 'ok_name',
      email: 'not-an-email',
      phone: '081234567890',
      password: 'Lengkap1234!',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const failure = result.failures.find((f) => f.field === 'email');
      if (!failure) throw new Error('expected an email failure');
      let seen: Record<string, string | number> | undefined | 'unset' = 'unset';
      const t = (key: string, values?: Record<string, string | number>) => {
        seen = values;
        return key;
      };
      translateValidationFailure(t, failure);
      expect(seen).toBeUndefined();
    }
  });
});
