import { describe, expect, it } from 'vitest';

describe('unknown /v1/* paths', () => {
  it('answers 404 JSON instead of rendering the app shell', async () => {
    const { GET } = await import('./route');

    const response = GET(new Request('http://localhost/v1/jobs'));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.retryable).toBe(false);
  });

  it('answers 404 JSON for non-GET verbs too', async () => {
    const { POST } = await import('./route');

    const response = POST(new Request('http://localhost/v1/nope', { method: 'POST' }));

    expect(response.status).toBe(404);
    expect((await response.json()).error.code).toBe('NOT_FOUND');
  });
});
