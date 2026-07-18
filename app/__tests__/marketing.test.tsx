import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('marketing routes', () => {
  it('home page renders lowercase lembbar wordmark and Figma hero heading', () => {
    renderWithLayout(HomePage);
    const brand = screen.getByText(/^lembar$/, { selector: '.nav__wordmark' });
    expect(brand).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /lembar ujian yang siap ditinjau/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Pilih materi')).toBeInTheDocument();
    expect(screen.getByText('Tinjau draft')).toBeInTheDocument();
    expect(screen.getByText('Gunakan hasil')).toBeInTheDocument();
  });

  it('untuk-sekolah page renders Figma 130:533 hero and pilot copy', () => {
    renderWithLayout(SchoolPage);
    const brand = screen.getByText(/^lembar$/, { selector: '.nav__wordmark' });
    expect(brand).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Workspace Organisasi untuk Institusi Sekolah/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Program Sekolah (Pilot)')).toBeInTheDocument();
    expect(screen.getByText('Konsultasi Kebutuhan')).toBeInTheDocument();
  });

  it('harga page renders Figma 130:741 plans, transparency, and FAQ', () => {
    renderWithLayout(PricingPage);
    const brand = screen.getByText(/^lembar$/, { selector: '.nav__wordmark' });
    expect(brand).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Pilih paket yang sesuai untuk kebutuhan mengajar Anda\./i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Coba Gratis', { selector: '.plan__name' })).toBeInTheDocument();
    expect(screen.getByText('Guru Pro', { selector: '.plan__name' })).toBeInTheDocument();
    expect(
      screen.getByText('Sekolah & Institusi', { selector: '.plan__name' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Catatan Transparansi')).toBeInTheDocument();
    expect(screen.getByText('Pertanyaan Seputar Tagihan')).toBeInTheDocument();
    expect(screen.getByText('PALING POPULER')).toBeInTheDocument();
  });
});
