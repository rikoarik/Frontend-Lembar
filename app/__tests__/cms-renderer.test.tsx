import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the fetcher — must be declared before any async component imports
const mockFetch = vi.fn();
vi.mock('@/src/lib/marketing/fetchMarketingPage', () => ({
  fetchMarketingPage: (...args: unknown[]) => mockFetch(...args),
}));

import { BlockRenderer } from '@/app/components/marketing/BlockRenderer';
import type { components } from '@/src/lib/api/schema';

type MarketingBlock = components['schemas']['MarketingBlock'];
type MarketingCta = components['schemas']['MarketingCta'];

// --- Contract fixtures ---

const CTA_PRIMARY: MarketingCta = {
  id: 'cta-1',
  label: 'Coba Gratis',
  href: '/daftar',
  variant: 'primary',
  placement: 'hero',
  audience: 'all',
  trackingKey: 'hero_cta_primary',
  enabled: true,
  external: false,
};

const CTA_SECONDARY: MarketingCta = {
  id: 'cta-2',
  label: 'Lihat Demo',
  href: 'https://demo.lembar.id',
  variant: 'secondary',
  placement: 'hero',
  audience: 'all',
  trackingKey: 'hero_cta_secondary',
  enabled: true,
  external: true,
};

const CTA_DISABLED: MarketingCta = {
  id: 'cta-3',
  label: 'Hidden',
  href: '/hidden',
  variant: 'primary',
  placement: 'hero',
  audience: 'all',
  trackingKey: 'hidden_cta',
  enabled: false,
  external: false,
};

const HERO_BLOCK: MarketingBlock = {
  id: 'block-hero',
  type: 'hero',
  eyebrow: 'Workspace asesmen',
  heading: 'Dari materi menjadi lembar ujian yang siap ditinjau.',
  body: 'Susun draft soal dari Buku Siswa atau PDF Anda.',
  theme: 'light',
  ctas: [CTA_PRIMARY, CTA_SECONDARY, CTA_DISABLED],
};

const WORKFLOW_BLOCK: MarketingBlock = {
  id: 'block-workflow',
  type: 'workflow',
  heading: 'Tiga langkah sederhana',
  theme: 'dark',
  items: [
    { id: 'w1', title: 'Pilih materi', body: 'Unggah PDF atau pilih kurikulum.' },
    { id: 'w2', title: 'Tinjau draft', body: 'AI menyusun soal, guru memeriksa.' },
    { id: 'w3', title: 'Gunakan hasil', body: 'Cetak, download, atau bagikan.' },
  ],
};

const FAQ_BLOCK: MarketingBlock = {
  id: 'block-faq',
  type: 'faq',
  heading: 'Pertanyaan Umum',
  theme: 'light',
  items: [
    { id: 'f1', title: 'Apakah gratis?', body: 'Ya, ada paket gratis selamanya.' },
    { id: 'f2', title: 'Apakah aman?', body: 'Data dienkripsi dan tidak dibagikan.' },
  ],
};

const FINAL_CTA_BLOCK: MarketingBlock = {
  id: 'block-final-cta',
  type: 'final_cta',
  heading: 'Mulai dari satu lembar.',
  body: 'Buat ruang kerja pribadi Anda hari ini.',
  theme: 'accent',
  ctas: [CTA_PRIMARY],
};

const PRICING_BLOCK: MarketingBlock = {
  id: 'block-pricing',
  type: 'pricing',
  heading: 'Pilih paket Anda',
  theme: 'light',
  items: [
    { id: 'p1', title: 'Coba Gratis', body: 'Tanpa kartu kredit.' },
    { id: 'p2', title: 'Guru Pro', body: 'Untuk guru aktif.' },
  ],
};

// --- BlockRenderer unit tests ---

describe('F1-06 BlockRenderer — contract fixtures', () => {
  it('renders hero block with heading, eyebrow, body, and enabled CTAs', () => {
    render(<BlockRenderer blocks={[HERO_BLOCK]} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Dari materi menjadi lembar ujian yang siap ditinjau.',
    );
    expect(screen.getByText('Workspace asesmen')).toBeInTheDocument();
    expect(screen.getByText('Susun draft soal dari Buku Siswa atau PDF Anda.')).toBeInTheDocument();

    // Enabled CTAs rendered
    expect(screen.getByRole('link', { name: 'Coba Gratis' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Lihat Demo' })).toBeInTheDocument();

    // Disabled CTA not rendered
    expect(screen.queryByRole('link', { name: 'Hidden' })).not.toBeInTheDocument();
  });

  it('renders external CTA with target=_blank and rel=noopener', () => {
    render(<BlockRenderer blocks={[HERO_BLOCK]} />);
    const externalLink = screen.getByRole('link', { name: 'Lihat Demo' });
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders workflow block with all three step items', () => {
    render(<BlockRenderer blocks={[WORKFLOW_BLOCK]} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Tiga langkah sederhana');
    expect(screen.getByText('Pilih materi')).toBeInTheDocument();
    expect(screen.getByText('Tinjau draft')).toBeInTheDocument();
    expect(screen.getByText('Gunakan hasil')).toBeInTheDocument();
  });

  it('renders faq block as dt/dd pairs', () => {
    render(<BlockRenderer blocks={[FAQ_BLOCK]} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Pertanyaan Umum');
    expect(screen.getByText('Apakah gratis?')).toBeInTheDocument();
    expect(screen.getByText('Ya, ada paket gratis selamanya.')).toBeInTheDocument();
    expect(screen.getByText('Apakah aman?')).toBeInTheDocument();
  });

  it('renders final_cta block with heading and CTA', () => {
    render(<BlockRenderer blocks={[FINAL_CTA_BLOCK]} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Mulai dari satu lembar.');
    expect(screen.getByRole('link', { name: 'Coba Gratis' })).toBeInTheDocument();
  });

  it('renders pricing block via generic items renderer', () => {
    render(<BlockRenderer blocks={[PRICING_BLOCK]} />);

    expect(screen.getByText('Coba Gratis')).toBeInTheDocument();
    expect(screen.getByText('Guru Pro')).toBeInTheDocument();
  });

  it('renders multiple blocks in order with correct data-block-type attributes', () => {
    render(<BlockRenderer blocks={[HERO_BLOCK, WORKFLOW_BLOCK, FAQ_BLOCK, FINAL_CTA_BLOCK]} />);

    const sections = document.querySelectorAll('[data-block-type]');
    expect(sections[0]).toHaveAttribute('data-block-type', 'hero');
    expect(sections[1]).toHaveAttribute('data-block-type', 'workflow');
    expect(sections[2]).toHaveAttribute('data-block-type', 'faq');
    expect(sections[3]).toHaveAttribute('data-block-type', 'final_cta');
  });
});

// --- fetchMarketingPage integration tests live in src/lib/marketing/__tests__/
// BlockRenderer is the focus of this file; fetcher is tested separately.

