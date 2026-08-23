import { beforeEach, describe, expect, it, vi } from 'vitest';

import { adminService } from '../adminService';

describe('admin bulk job retry contract', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('POSTs retry-bulk with the retryable status and active search', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ data: { retried: 3, skipped: 1 } }), { status: 200 }),
      );

    await expect(
      adminService.retryJobsBulk({ status: 'dead_letter', q: 'export' }),
    ).resolves.toMatchObject({
      ok: true,
      value: { retried: 3, skipped: 1 },
    });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/v1/admin/jobs/retry-bulk',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ status: 'dead_letter', q: 'export' }),
      }),
    );
  });
});
