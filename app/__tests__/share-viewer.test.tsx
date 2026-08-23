import { describe, expect, it } from 'vitest';
import { GET } from '@/app/v1/shares/[token]/route';

describe('legacy share endpoint isolation', () => {
  it('does not expose assessment content or answer keys', async () => {
    const response = await GET();
    const body = (await response.json()) as {
      error?: { code?: string; message?: string };
      data?: unknown;
    };

    expect(response.status).toBe(410);
    expect(body.error?.code).toBe('LEGACY_SHARE_DISABLED');
    expect(body).not.toHaveProperty('data');
    expect(JSON.stringify(body)).not.toMatch(/answer|explanation|kunci/i);
  });
});
