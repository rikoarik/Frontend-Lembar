import { describe, expect, it, vi } from 'vitest';

vi.mock('@/src/lib/api/marketingSession', () => ({
  getMarketingSession: vi.fn().mockResolvedValue(null),
}));
import { render, screen, within } from '@testing-library/react';
import MarketingLayout from '../(marketing)/layout';

// Force seed fallback in all three pages by returning null from the fetcher
vi.mock('@/src/lib/marketing/fetchMarketingPage', () => ({
  fetchMarketingPage: vi.fn().mockResolvedValue(null),
}));

import HomePage from '../(marketing)/page';
import SchoolPage from '../(marketing)/untuk-sekolah/page';
import PricingPage from '../(marketing)/harga/page';

async function renderWithLayout(Page: () => Promise<React.ReactElement>) {
  const content = await Page();
  const layout = await MarketingLayout({ children: content });
  return render(layout);
}

describe('marketing routes — baseline', () => {
  it('home page renders hero, three steps, Masuk link, Coba Gratis CTA, foreign-host logo', async () => {
    await renderWithLayout(HomePage);

    const hero = screen.getByRole('heading', {
      level: 1,
      name: /Buat soal ujian otomatis/i,
    });
    expect(hero).toBeInTheDocument();

    expect(screen.getByText(/Pilih materi/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate draft/i)).toBeInTheDocument();
    expect(screen.getByText(/Tinjau & finalkan/i)).toBeInTheDocument();

    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Masuk' })).toBeInTheDocument();
    expect(within(header).getByRole('link', { name: 'Coba Gratis' })).toBeInTheDocument();

    const logoLink = within(header).getByRole('link', { name: /lembar — beranda/i });
    const logo = logoLink.querySelector('img');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('alt', '');
    expect(logo).toHaveAttribute('src');
  });

  it('untuk-sekolah page renders pilot h1 and lead CTA', async () => {
    await renderWithLayout(SchoolPage);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Workspace Organisasi untuk Institusi Sekolah/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Program Sekolah (Pilot)')).toBeInTheDocument();
    expect(screen.getByText('Konsultasi Kebutuhan')).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: 'Diskusikan kebutuhan sekolah' }).length,
    ).toBeGreaterThan(0);
  });

  it('harga page renders plans, transparency note, billing FAQ, popular badge', async () => {
    await renderWithLayout(PricingPage);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Pilih paket yang sesuai untuk kebutuhan mengajar Anda\./i,
      }),
    ).toBeInTheDocument();

    const planCards = document.querySelectorAll('.bento-card');
    expect(planCards.length).toBe(3);
    expect(
      within(planCards[0] as HTMLElement).getByRole('heading', { name: 'Free' }),
    ).toBeInTheDocument();
    expect(
      within(planCards[1] as HTMLElement).getByRole('heading', { name: 'Pro' }),
    ).toBeInTheDocument();
    expect(
      within(planCards[2] as HTMLElement).getByRole('heading', { name: 'Sekolah & Institusi' }),
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Pertanyaan umum' })).toBeInTheDocument();
    expect(screen.getByText('Populer')).toBeInTheDocument();
  });
});
