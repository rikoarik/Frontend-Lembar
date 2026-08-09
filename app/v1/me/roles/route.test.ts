import { beforeEach, describe, expect, it, vi } from 'vitest';

const cookieValues = new Map<string, string>();

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const value = cookieValues.get(name);
      return value ? { value } : undefined;
    },
  })),
}));

import { POST } from './route';

describe('POST /v1/me/roles', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_MODE = 'live';
    cookieValues.clear();
    cookieValues.set('lembar_session', 'session');
    cookieValues.set('lembar_roles', 'teacher,superadmin');
  });

  it('menetapkan role yang dimiliki sebagai cookie HttpOnly lalu mengalihkan halaman', async () => {
    const response = await POST(
      new Request('http://localhost/v1/me/roles', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: 'role=teacher',
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe('/app');
    expect(response.headers.get('set-cookie')).toMatch(/lembar_active_role=teacher/);
    expect(response.headers.get('set-cookie')).toMatch(/HttpOnly/i);
  });

  it('menolak role yang tidak dimiliki tanpa mengubah cookie', async () => {
    const response = await POST(
      new Request('http://localhost/v1/me/roles', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: 'role=school_admin',
      }),
    );

    expect(response.status).toBe(403);
    expect(response.headers.get('set-cookie')).toBeNull();
  });
});
