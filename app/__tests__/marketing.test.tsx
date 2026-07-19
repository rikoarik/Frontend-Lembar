import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import MarketingLayout from '../(marketing)/layout';
import HomePage from '../(marketing)/page';
import SchoolPage from '../(marketing)/untuk-sekolah/page';
import PricingPage from '../(marketing)/harga/page';

function renderWithLayout(Page: () => React.ReactElement) {
  return render(
    <MarketingLayout>
      <Page />
    </MarketingLayout>,
  );
}

describe('marketing routes — baseline', () => {
  it('home page renders hero, three steps, Masuk link, Coba Gratis CTA, foreign-host logo', () => {
    renderWithLayout(HomePage);

    // Hero h1 contains the required substring from the baseline copy.
    const hero = screen.getByRole('heading', {
      level: 1,
      name: /lembar ujian yang siap ditinjau/i,
    });
    expect(hero).toBeInTheDocument();

    // Three anchored workflow stages.
    expect(screen.getByText('Pilih materi')).toBeInTheDocument();
    expect(screen.getByText('Tinjau draft')).toBeInTheDocument();
    expect(screen.getByText('Gunakan hasil')).toBeInTheDocument();

    // Header: Masuk link + Coba Gratis CTA.
    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Masuk' })).toBeInTheDocument();
    expect(within(header).getByRole('link', { name: 'Coba Gratis' })).toBeInTheDocument();

    // Logo accessibility is on the wrapping home link; the image is decorative.
    const logoLink = within(header).getByRole('link', { name: /lembar — beranda/i });
    const logo = logoLink.querySelector('img');
    expect(logo).toHaveAttribute('src');
    const src = logo?.getAttribute('src') ?? '';
    expect(src.startsWith('http')).toBe(true);
    expect(new URL(src).host).not.toMatch(/^localhost|^127\.0\.0\.1|^[^.]+$/);
  });

  it('untuk-sekolah page renders pilot h1 and lead CTA', () => {
    renderWithLayout(SchoolPage);

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

  it('harga page renders plans, transparency note, billing FAQ, popular badge', () => {
    renderWithLayout(PricingPage);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Pilih paket yang sesuai untuk kebutuhan mengajar Anda\./i,
      }),
    ).toBeInTheDocument();

    // Plan names are h3 inside each bento-card; use heading role.
    const planCards = document.querySelectorAll('.bento-card');
    expect(planCards.length).toBe(3);
    expect(within(planCards[0] as HTMLElement).getByRole('heading', { name: 'Coba Gratis' })).toBeInTheDocument();
    expect(within(planCards[1] as HTMLElement).getByRole('heading', { name: 'Guru Pro' })).toBeInTheDocument();
    expect(within(planCards[2] as HTMLElement).getByRole('heading', { name: 'Sekolah & Institusi' })).toBeInTheDocument();

    expect(screen.getByText('Catatan Transparansi')).toBeInTheDocument();
    expect(screen.getByText('Pertanyaan Seputar Tagihan')).toBeInTheDocument();
    expect(screen.getByText('PALING POPULER')).toBeInTheDocument();
  });
});
