import { describe, expect, it, vi } from 'vitest';

const mockFetchMarketingPage = vi.fn();
vi.mock('../fetchMarketingPage', () => ({
  fetchMarketingPage: (...args: unknown[]) => mockFetchMarketingPage(...args),
}));

import { marketingMetadata } from '../marketingMetadata';

const fallback = {
  title: 'Harga lembar — paket untuk guru dan sekolah',
  description: 'Bandingkan paket untuk guru dan sekolah.',
  canonical: '/harga',
};

describe('marketingMetadata', () => {
  it('uses validated CMS SEO for title, description, social cards, and noindex', async () => {
    mockFetchMarketingPage.mockResolvedValueOnce({
      seo: {
        title: 'Paket terbaru lembar',
        description: 'Bandingkan paket terbaru untuk kebutuhan mengajar.',
        noIndex: true,
      },
    });

    const metadata = await marketingMetadata('harga', fallback);

    expect(metadata.title).toBe('Paket terbaru lembar');
    expect(metadata.description).toBe('Bandingkan paket terbaru untuk kebutuhan mengajar.');
    expect(metadata.openGraph).toMatchObject({
      title: 'Paket terbaru lembar',
      description: 'Bandingkan paket terbaru untuk kebutuhan mengajar.',
      url: '/harga',
    });
    expect(metadata.twitter).toMatchObject({
      title: 'Paket terbaru lembar',
      description: 'Bandingkan paket terbaru untuk kebutuhan mengajar.',
    });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('retains page defaults when the public CMS is unavailable', async () => {
    mockFetchMarketingPage.mockResolvedValueOnce(null);

    const metadata = await marketingMetadata('harga', fallback);

    expect(metadata.title).toBe(fallback.title);
    expect(metadata.description).toBe(fallback.description);
    expect(metadata.robots).toEqual({ index: true, follow: true });
  });
});
