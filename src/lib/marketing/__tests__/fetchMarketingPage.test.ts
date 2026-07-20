import { describe, expect, it, vi, afterEach } from 'vitest';
import { fetchMarketingPage } from '../fetchMarketingPage';

const SAMPLE_DOC = {
  slug: 'home' as const,
  locale: 'id-ID' as const,
  schemaVersion: 1,
  version: 1,
  blocks: [
    {
      id: 'b1',
      type: 'hero' as const,
      theme: 'light' as const,
      heading: 'Dari materi menjadi lembar ujian.',
    },
  ],
  seo: { title: 'lembar', description: 'Test', noIndex: false },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchMarketingPage', () => {
  it('returns page document on 200 response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ data: SAMPLE_DOC }), { status: 200 }),
    );

    const result = await fetchMarketingPage('home');
    expect(result).toEqual(SAMPLE_DOC);
  });

  it('returns null on 404', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('Not Found', { status: 404 }),
    );

    const result = await fetchMarketingPage('home');
    expect(result).toBeNull();
  });

  it('returns null on 500', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('Server Error', { status: 500 }),
    );

    const result = await fetchMarketingPage('harga');
    expect(result).toBeNull();
  });

  it('returns null when fetch throws (network error)', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('network error'));

    const result = await fetchMarketingPage('untuk-sekolah');
    expect(result).toBeNull();
  });

  it('returns null when fetch is aborted (timeout)', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(
      Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }),
    );

    const result = await fetchMarketingPage('home');
    expect(result).toBeNull();
  });
});
