import { describe, expect, it, vi } from 'vitest';

const payload = {
  name: 'Ibu Sari',
  email: 'sari@sekolah.sch.id',
  school: 'SDN Contoh 01',
  role: 'guru',
  teacherCount: 12,
  consent: true,
};

describe('/v1/leads/school route', () => {
  it('accepts school leads in local mock mode for preview/prod verification', async () => {
    const route = await import('../v1/leads/school/route');
    const response = await route.POST(
      new Request('http://localhost/v1/leads/school', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: { leadId: 'lead_demo' },
    });
  });

  it('does not become a live backend contract', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_MODE', 'live');
    const route = await import('../v1/leads/school/route');
    const response = await route.POST(
      new Request('http://localhost/v1/leads/school', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(404);
    vi.unstubAllEnvs();
  });
});
