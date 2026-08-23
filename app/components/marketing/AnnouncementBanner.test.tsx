import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnnouncementBanner from './AnnouncementBanner';

const announcement = {
  enabled: true,
  label: 'Info',
  message: 'Fitur review soal baru tersedia.',
  ctaLabel: 'Pelajari',
  ctaHref: '/generator-soal-ai',
  revision: 9,
};

describe('AnnouncementBanner', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('dismisses only the fetched announcement revision', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: announcement }), { status: 200 }),
    );
    const user = userEvent.setup();
    render(<AnnouncementBanner />);

    expect(await screen.findByText(/Fitur review soal baru tersedia/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tutup pengumuman' }));

    expect(screen.queryByText(/Fitur review soal baru tersedia/)).not.toBeInTheDocument();
    expect(window.localStorage.getItem('lembar.announcement.dismissed-revision')).toBe('9');
  });

  it('keeps a disabled server announcement hidden without showing the fallback first', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: { ...announcement, enabled: false } }), { status: 200 }),
    );
    render(<AnnouncementBanner />);

    expect(screen.queryByRole('complementary', { name: 'Pengumuman' })).not.toBeInTheDocument();
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledOnce());
    expect(screen.queryByRole('complementary', { name: 'Pengumuman' })).not.toBeInTheDocument();
  });

  it('shows a newer revision after an older revision was dismissed', async () => {
    window.localStorage.setItem('lembar.announcement.dismissed-revision', '8');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: announcement }), { status: 200 }),
    );
    render(<AnnouncementBanner />);

    expect(await screen.findByText(/Fitur review soal baru tersedia/)).toBeInTheDocument();
  });
});
