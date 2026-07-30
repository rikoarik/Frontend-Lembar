import { afterEach, describe, expect, it, vi } from 'vitest';

import { schoolService } from '../schoolService';

const originalFetch = globalThis.fetch;

function mockFetch(response: Response) {
  globalThis.fetch = vi.fn(async () => response) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('schoolService', () => {
  it('returns typed API errors for failed members requests instead of mock members', async () => {
    mockFetch(
      Response.json(
        { error: { code: 'UNAUTHORIZED', message: 'Login diperlukan.', retryable: false } },
        { status: 401 },
      ),
    );

    const result = await schoolService.members({ q: 'siti' });

    expect(result).toEqual({
      ok: false,
      error: { code: 'UNAUTHORIZED', safeMessage: 'Login diperlukan.', retryable: false },
    });
  });

  it('returns typed API errors for failed dashboard requests instead of mock dashboard data', async () => {
    mockFetch(
      Response.json(
        { error: { code: 'FORBIDDEN', message: 'Akses sekolah ditolak.', retryable: false } },
        { status: 403 },
      ),
    );

    const result = await schoolService.dashboard();

    expect(result).toEqual({
      ok: false,
      error: { code: 'FORBIDDEN', safeMessage: 'Akses sekolah ditolak.', retryable: false },
    });
  });

  it('normalizes paginated meta totalPages to pages', async () => {
    mockFetch(
      Response.json({
        data: [],
        meta: { total: 12, page: 2, limit: 5, totalPages: 3 },
      }),
    );

    const result = await schoolService.members({ page: 2, limit: 5 });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('expected successful members result');
    expect(result.value.meta).toEqual({ total: 12, page: 2, limit: 5, pages: 3 });
  });
});
