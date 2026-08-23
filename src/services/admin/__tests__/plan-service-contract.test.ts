import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminService } from '../adminService';

describe('admin plan route/method contract', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('GETs the canonical admin plan route', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ data: [] }), { status: 200 }));
    await adminService.listPlans();
    expect(fetchSpy).toHaveBeenCalledWith(
      '/v1/admin/plans',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('PATCHes a plan with If-Match revision', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ data: { key: 'free', revision: 3 } }), { status: 200 }),
      );
    await adminService.updatePlan('free', { tokenMonthlyLimit: 70000 }, 2);
    expect(fetchSpy).toHaveBeenCalledWith(
      '/v1/admin/plans/free',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ 'If-Match': '2' }),
        body: JSON.stringify({ tokenMonthlyLimit: 70000 }),
      }),
    );
  });
});
