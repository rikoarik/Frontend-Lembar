import { afterEach, describe, expect, it, vi } from 'vitest';

import { adminService } from '../adminService';

describe('admin account actions', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns reset token and URL from the data envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: {
              id: 'account-1',
              sent: true,
              token: 'reset-token',
              resetUrl: '/reset-password?token=reset-token',
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      ),
    );

    const result = await adminService.resetPassword('account-1');

    expect(result).toEqual({
      ok: true,
      value: {
        id: 'account-1',
        sent: true,
        token: 'reset-token',
        resetUrl: '/reset-password?token=reset-token',
      },
    });
  });

  it('returns invite account ID and welcome URL from the data envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: {
              invited: true,
              accountId: 'account-2',
              welcomeUrl: '/set-password?token=welcome-token',
            },
          }),
          { status: 201, headers: { 'content-type': 'application/json' } },
        ),
      ),
    );

    const result = await adminService.invite({ email: 'teacher@example.test' });

    expect(result).toEqual({
      ok: true,
      value: {
        invited: true,
        accountId: 'account-2',
        welcomeUrl: '/set-password?token=welcome-token',
      },
    });
  });
});
