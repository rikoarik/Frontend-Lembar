import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarketingLayout from '../(marketing)/layout';
import FaqPage from '../(marketing)/faq/page';
import PricingPage from '../(marketing)/harga/page';

function renderWithLayout(Page: () => React.ReactElement) {
  return render(
    <MarketingLayout>
      <Page />
    </MarketingLayout>,
  );
}

describe('marketing routes — F1-03 FAQ & placeholder harga', () => {
  it('faq page renders correct heading and product FAQ category', () => {
    renderWithLayout(FaqPage);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Pertanyaan yang sering ditanyakan/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Produk dan penggunaan/i)).toBeInTheDocument();
    // First FAQ entry must be present and not contain fabricated security claims.
    expect(
      screen.getByText(/Apakah hasil generate langsung final\?/i),
    ).toBeInTheDocument();
  });

  it('faq page omits invented prices and unverifiable security claims', () => {
    renderWithLayout(FaqPage);

    expect(screen.queryByText(/Rp\d/)).not.toBeInTheDocument();
    expect(screen.queryByText(/AES-256/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ISO 27001/)).not.toBeInTheDocument();
  });

  it('harga page renders honest placeholder: heading, plans, FAQ, no nominal prices', () => {
    renderWithLayout(PricingPage);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Pilih paket yang sesuai untuk kebutuhan mengajar Anda\./i,
      }),
    ).toBeInTheDocument();
    // Plan labels (no nominals).
    expect(screen.getByRole('heading', { level: 2, name: 'Coba Gratis' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Guru Pro' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Untuk Sekolah' }),
    ).toBeInTheDocument();
    // Pricing FAQ section is present.
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /Pertanyaan seputar paket dan penagihan/i,
      }),
    ).toBeInTheDocument();

    // No nominal prices, no fabricated popular badges.
    expect(screen.queryByText(/Rp\d/)).not.toBeInTheDocument();
    expect(screen.queryByText(/PALING POPULER/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Catatan Transparansi/)).not.toBeInTheDocument();
    // Final CTA preserved per smoke contract.
    expect(screen.getAllByText(/Daftar Sekarang/i).length).toBeGreaterThan(0);
  });
});
