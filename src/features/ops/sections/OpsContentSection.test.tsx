import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OpsContentSection } from './OpsContentSection';

const mocks = vi.hoisted(() => ({
  marketingPage: vi.fn().mockResolvedValue({
    ok: true,
    value: {
      summary: {
        slug: 'home',
        state: 'draft',
        revision: 3,
        locale: 'id-ID',
        publishedVersion: null,
        updatedAt: '2026-01-01',
      },
      draft: { schemaVersion: 1, seo: { title: 'Home', description: '' }, blocks: [] },
    },
  }),
  saveMarketingDraft: vi.fn().mockResolvedValue({
    ok: true,
    value: {
      summary: { slug: 'home', state: 'draft', revision: 4 },
      draft: { schemaVersion: 1, seo: {}, blocks: [] },
    },
  }),
  announcement: vi.fn().mockResolvedValue({
    ok: true,
    value: {
      enabled: true,
      label: 'Beta',
      message: 'Lembar sedang disempurnakan bersama guru Indonesia.',
      ctaLabel: 'Mulai mencoba',
      ctaHref: '/daftar',
      revision: 7,
      updatedAt: '2026-08-23T00:00:00.000Z',
    },
  }),
  updateAnnouncement: vi.fn().mockResolvedValue({
    ok: true,
    value: {
      enabled: true,
      label: 'Beta',
      message: 'Pesan baru untuk guru.',
      ctaLabel: 'Mulai mencoba',
      ctaHref: '/daftar',
      revision: 8,
      updatedAt: '2026-08-23T01:00:00.000Z',
    },
  }),
}));

vi.mock('@/src/services/admin/adminService', () => ({
  adminService: { ...mocks, publishPage: vi.fn(), unpublishPage: vi.fn() },
}));

describe('OpsContentSection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('only exposes public marketing slugs and saves a structured draft with revision', async () => {
    const user = userEvent.setup();
    render(<OpsContentSection setToast={vi.fn()} />);
    expect(await screen.findByRole('button', { name: 'Beranda' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Harga' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Untuk sekolah' })).toBeInTheDocument();
    expect(screen.queryByText(/Draft baru/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Simpan draft' }));
    expect(mocks.saveMarketingDraft).toHaveBeenCalledWith('home', expect.any(Object), 3);
  });

  it('loads and saves the global announcement with its current revision', async () => {
    const user = userEvent.setup();
    render(<OpsContentSection setToast={vi.fn()} />);

    const message = await screen.findByLabelText('Pesan');
    await user.clear(message);
    await user.type(message, 'Pesan baru untuk guru.');
    await user.click(screen.getByRole('button', { name: 'Simpan pengumuman' }));

    expect(mocks.updateAnnouncement).toHaveBeenCalledWith(
      {
        enabled: true,
        label: 'Beta',
        message: 'Pesan baru untuk guru.',
        ctaLabel: 'Mulai mencoba',
        ctaHref: '/daftar',
      },
      7,
    );
    expect(await screen.findByText('Revisi 8')).toBeInTheDocument();
  });
});
