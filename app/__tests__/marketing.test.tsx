import { describe, expect, it, vi } from 'vitest';

vi.mock('@/src/lib/api/marketingSession', () => ({
  getMarketingSession: vi.fn().mockResolvedValue(null),
}));
import { act, render, screen, within } from '@testing-library/react';
import MarketingLayout from '../(marketing)/layout';

// Render the built-in marketing pages instead of CMS-provided blocks.
vi.mock('@/src/lib/marketing/fetchMarketingPage', () => ({
  fetchMarketingPage: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/app/components/marketing/JsonLd', () => ({
  default: () => null,
}));

// Pricing has no production fallback, so this test supplies a verified catalog response.
vi.mock('@/src/lib/api/plans', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/src/lib/api/plans')>();

  return {
    ...original,
    fetchPublicPlans: vi.fn().mockResolvedValue([
      {
        key: 'free',
        displayName: 'Free',
        priceAmount: 0,
        currency: 'IDR',
        billingPeriod: null,
        tokenMonthlyLimit: 1000,
        features: ['Fitur dasar'],
      },
      {
        key: 'pro',
        displayName: 'Pro',
        priceAmount: 100000,
        currency: 'IDR',
        billingPeriod: 'monthly',
        tokenMonthlyLimit: 50000,
        features: ['Fitur lengkap'],
      },
    ]),
  };
});

import HomePage from '../(marketing)/page';
import SchoolPage from '../(marketing)/untuk-sekolah/page';
import PricingPage from '../(marketing)/harga/page';

async function renderWithLayout(Page: () => Promise<React.ReactElement>) {
  const content = await Page();
  const layout = await MarketingLayout({ children: content });
  let result: ReturnType<typeof render> | undefined;

  await act(async () => {
    result = render(layout);
  });

  return result!;
}

describe('marketing routes — baseline', () => {
  it('home page renders hero, three steps, Masuk link, Coba Gratis CTA, foreign-host logo', async () => {
    await renderWithLayout(HomePage);

    const hero = await screen.findByRole('heading', {
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
      await screen.findByRole('heading', {
        level: 1,
        name: /Pilih paket yang sesuai dengan cara Anda mengajar\./i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Gratis' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Pro' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Plus' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Sekolah & Institusi' })).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Pertanyaan umum' })).toBeInTheDocument();
    expect(screen.getByText('Populer')).toBeInTheDocument();
  });
});
