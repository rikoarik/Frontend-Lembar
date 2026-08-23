import { beforeEach, describe, expect, it, vi } from 'vitest';

const { backendFetch, liveClaims } = vi.hoisted(() => ({
  backendFetch: vi.fn(),
  liveClaims: vi.fn(),
}));

vi.mock('@/src/lib/api/session', () => ({ backendFetch }));
vi.mock('@/src/lib/api/liveAssessment', () => ({ liveClaims }));

beforeEach(() => {
  vi.clearAllMocks();
  liveClaims.mockResolvedValue({ token: 'jwt', claims: { workspaceId: 'workspace-1' } });
});

describe('DELETE /v1/shares/[token]/revoke', () => {
  it('forwards revoke with the backend method and response body', async () => {
    const route = await import('./route');
    backendFetch.mockResolvedValue(
      new Response(JSON.stringify({ data: { token: 'tok-1', revokedAt: '2026-08-10' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );

    const response = await route.DELETE(
      new Request('http://localhost/v1/shares/tok-1/revoke', { method: 'DELETE' }) as never,
      {
        params: Promise.resolve({ token: 'tok-1' }),
      },
    );

    expect(backendFetch).toHaveBeenCalledWith(
      '/v1/shares/tok-1/revoke',
      expect.objectContaining({
        method: 'DELETE',
        headers: { 'x-workspace-id': 'workspace-1' },
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ data: { token: 'tok-1' } });
  });
});
