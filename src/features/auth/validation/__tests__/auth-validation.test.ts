import { describe, expect, it } from 'vitest';
import {
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
});
