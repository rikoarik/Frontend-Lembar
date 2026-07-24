import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { POST as loginPost } from '@/app/v1/auth/login/route';

describe('role-based mock login', () => {
  const original = process.env.NEXT_PUBLIC_API_MODE;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_MODE = 'mock';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_MODE = original;
  });

  it('logs teacher to /app', async () => {
    const response = await loginPost(
      new Request('http://localhost/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: 'demo', password: 'demo1234' }),
      }),
    );
    expect(response.status).toBe(200);
    const json = (await response.json()) as { data: { homePath: string; activeRole: string } };
    expect(json.data.homePath).toBe('/app');
    expect(json.data.activeRole).toBe('teacher');
  });

  it('logs school admin to /school', async () => {
    const response = await loginPost(
      new Request('http://localhost/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: 'admin', password: 'admin1234' }),
      }),
    );
    expect(response.status).toBe(200);
    const json = (await response.json()) as { data: { homePath: string; activeRole: string } };
    expect(json.data.homePath).toBe('/school');
    expect(json.data.activeRole).toBe('school_admin');
    expect(response.headers.get('set-cookie') || '').toMatch(/lembar_session=admin/);
  });

  it('logs ops superadmin to /ops', async () => {
    const response = await loginPost(
      new Request('http://localhost/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: 'ops', password: 'ops1234' }),
      }),
    );
    expect(response.status).toBe(200);
    const json = (await response.json()) as { data: { homePath: string; activeRole: string } };
    expect(json.data.homePath).toBe('/ops');
    expect(json.data.activeRole).toBe('superadmin');
  });
});
