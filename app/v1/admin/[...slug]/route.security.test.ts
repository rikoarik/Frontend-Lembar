import { beforeEach, describe, expect, it, vi } from 'vitest';

const { cookieGet, backendFetch } = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  backendFetch: vi.fn(),
}));

vi.mock('next/headers', () => ({ cookies: vi.fn(async () => ({ get: cookieGet })) }));
vi.mock('@/src/lib/api/session', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/src/lib/api/session')>();
  return { ...original, backendFetch };
});
vi.mock('@/src/lib/mock-api/preview', () => ({ isMockApiMode: () => false }));

describe('admin BFF logging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cookieGet.mockReturnValue(undefined);
  });

  it('does not log an authentication token while proxying an admin request', async () => {
    const { GET } = await import('./route');
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    backendFetch.mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 }));

    const request = new Request('http://localhost/v1/admin/schools', {
      headers: { authorization: 'Bearer sensitive-token-must-not-be-logged' },
    }) as never;
    Object.defineProperty(request, 'nextUrl', { value: new URL(request.url) });
    const response = await GET(request, { params: Promise.resolve({ slug: ['schools'] }) });

    expect(response.status).toBe(200);
    expect(log).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
