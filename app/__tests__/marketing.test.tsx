import { describe, expect, it, vi } from 'vitest';
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
  return render(<MarketingLayout>{content}</MarketingLayout>);
}

describe('marketing routes — baseline', () => {
  it('home page renders hero, three steps, Masuk link, Coba Gratis CTA, foreign-host logo', async () => {
    await renderWithLayout(HomePage);

    const hero = screen.getByRole('heading', {
      level: 1,
      name: /lembar ujian yang siap ditinjau/i,
    });
    expect(hero).toBeInTheDocument();

    expect(screen.getByText('Pilih materi')).toBeInTheDocument();
    expect(screen.getByText('Tinjau draft')).toBeInTheDocument();
    expect(screen.getByText('Gunakan hasil')).toBeInTheDocument();

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
      within(planCards[0] as HTMLElement).getByRole('heading', { name: 'Coba Gratis' }),
    ).toBeInTheDocument();
    expect(
      within(planCards[1] as HTMLElement).getByRole('heading', { name: 'Guru Pro' }),
    ).toBeInTheDocument();
    expect(
      within(planCards[2] as HTMLElement).getByRole('heading', { name: 'Sekolah & Institusi' }),
    ).toBeInTheDocument();

    expect(screen.getByText('Catatan Transparansi')).toBeInTheDocument();
    expect(screen.getByText('Pertanyaan Seputar Tagihan')).toBeInTheDocument();
    expect(screen.getByText('PALING POPULER')).toBeInTheDocument();
  });
});
