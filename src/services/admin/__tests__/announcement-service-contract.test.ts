import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminService } from '../adminService';

const announcement = {
  enabled: true,
  label: 'Beta',
  message: 'Lembar sedang disempurnakan bersama guru Indonesia.',
  ctaLabel: 'Mulai mencoba',
  ctaHref: '/daftar',
  revision: 4,
  updatedAt: '2026-08-23T00:00:00.000Z',
};

describe('admin announcement route contract', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('reads the superadmin announcement route', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ data: announcement }), { status: 200 }));

    const result = await adminService.announcement();

    expect(result).toEqual({ ok: true, value: announcement });
    expect(fetchSpy).toHaveBeenCalledWith(
      '/v1/admin/announcement',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('updates the announcement with If-Match revision locking', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ data: { ...announcement, revision: 5 } }), { status: 200 }),
      );
    const payload = {
      enabled: announcement.enabled,
      label: announcement.label,
      message: announcement.message,
      ctaLabel: announcement.ctaLabel,
      ctaHref: announcement.ctaHref,
    };

    await adminService.updateAnnouncement(payload, 4);

    expect(fetchSpy).toHaveBeenCalledWith(
      '/v1/admin/announcement',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({ 'If-Match': '4' }),
        body: JSON.stringify(payload),
      }),
    );
  });
});
