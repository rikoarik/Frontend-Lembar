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

describe('DELETE /v1/classes/[classId]', () => {
  it('forwards class deletion to the backend', async () => {
    const route = await import('./route');
    backendFetch.mockResolvedValue(new Response(null, { status: 204 }));

    const response = await route.DELETE(
      new Request('http://localhost/v1/classes/class-1', { method: 'DELETE' }) as never,
      {
        params: Promise.resolve({ classId: 'class-1' }),
      },
    );

    expect(backendFetch).toHaveBeenCalledWith(
      '/v1/classes/class-1',
      expect.objectContaining({ method: 'DELETE', token: 'jwt' }),
    );
    expect(response.status).toBe(204);
  });
});
