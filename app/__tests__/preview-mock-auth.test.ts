import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { POST as loginPost } from '@/app/v1/auth/login/route';
import { GET as meGet } from '@/app/v1/me/route';

describe('preview mock auth routes', () => {
  const originalMode = process.env.NEXT_PUBLIC_API_MODE;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_MODE = 'mock';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_MODE = originalMode;
  });

  it('accepts demo credentials and sets session cookie', async () => {
    const request = new Request('http://localhost/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'demo', password: 'demo1234' }),
    });

    const response = await loginPost(request);
    expect(response.status).toBe(200);
    const json = (await response.json()) as { data: { accountId: string } };
    expect(json.data.accountId).toBe('acct_demo');
    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toMatch(/lembar_session=demo/);
  });

  it('rejects invalid credentials', async () => {
    const request = new Request('http://localhost/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'demo', password: 'salah' }),
    });
    const response = await loginPost(request);
    expect(response.status).toBe(401);
    const json = (await response.json()) as { error: { code: string } };
    expect(json.error.code).toBe('INVALID_CREDENTIALS');
  });
});
