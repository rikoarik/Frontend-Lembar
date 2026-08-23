import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

function jwt(payload: Record<string, unknown>) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.signature`;
}

function request(path: string, cookies = '') {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookies ? { cookie: cookies } : undefined,
  });
}

describe('proxy session guards', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('redirects an expired JWT to login and clears session cookies', () => {
    const token = jwt({ exp: Math.floor(Date.now() / 1000) - 60, roles: ['superadmin'] });
    const response = proxy(
      request(
        '/ops',
        `lembar_token=${token}; lembar_roles=superadmin; lembar_active_workspace=ws_expired`,
      ),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/masuk');
    expect(response.cookies.get('lembar_token')).toMatchObject({
      value: '',
      path: '/',
      maxAge: 0,
    });
    expect(response.cookies.get('lembar_active_workspace')).toMatchObject({
      value: '',
      path: '/',
      maxAge: 0,
    });
  });

  it('allows a fresh superadmin JWT into the ops shell', () => {
    const token = jwt({ exp: Math.floor(Date.now() / 1000) + 600, roles: ['superadmin'] });
    const response = proxy(request('/ops', `lembar_token=${token}; lembar_roles=superadmin`));

    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('does not accept literal mock sessions in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');

    const response = proxy(request('/ops', 'lembar_session=ops; lembar_roles=superadmin'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost/masuk');
  });

  it('keeps mock sessions available in non-production preview mode', () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'mock');

    const response = proxy(request('/ops', 'lembar_session=ops; lembar_roles=superadmin'));

    expect(response.status).toBe(200);
  });
});
