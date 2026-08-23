import { readFile } from 'node:fs/promises';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import GeneratorSoalAiPage, { metadata } from './(marketing)/generator-soal-ai/page';
import JsonLd from './components/marketing/JsonLd';
import robots from './robots';
import sitemap from './sitemap';

describe('SEO and AI discovery surfaces', () => {
  it('renders a crawlable generator page with factual schema and internal links', () => {
    const { container } = render(<GeneratorSoalAiPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Generator soal AI untuk guru Indonesia' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Mulai membuat soal' })[0]).toHaveAttribute(
      'href',
      '/daftar',
    );
    expect(screen.getByRole('link', { name: 'Pelajari keamanan data' })).toHaveAttribute(
      'href',
      '/keamanan-data',
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent ?? '{}') as {
      '@graph'?: Array<{ '@type'?: string }>;
    };
    expect(jsonLd['@graph']?.map((item) => item['@type'])).toEqual(
      expect.arrayContaining([
        'Organization',
        'WebSite',
        'SoftwareApplication',
        'WebPage',
        'HowTo',
        'FAQPage',
      ]),
    );
  });

  it('escapes HTML-significant characters in JSON-LD script content', () => {
    const { container } = render(
      <JsonLd schema={{ '@context': 'https://schema.org', name: '</script>' }} />,
    );
    const content = container.querySelector('script')?.textContent ?? '';

    expect(content).toContain('\\u003c/script>');
    expect(content).not.toContain('</script>');
  });

  it('publishes focused metadata and includes the landing page in the sitemap', () => {
    expect(metadata.title).toBe('Generator Soal AI untuk Guru Indonesia | Lembar');
    expect(metadata.alternates).toMatchObject({ canonical: '/generator-soal-ai' });
    expect(sitemap()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: 'https://app.lembar.web.id/generator-soal-ai',
          priority: 0.9,
        }),
      ]),
    );
  });

  it('allows search and AI crawlers on public content while blocking private routes', () => {
    const policy = JSON.stringify(robots());
    for (const crawler of ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'GPTBot', 'PerplexityBot']) {
      expect(policy).toContain(crawler);
    }
    expect(policy).toContain('/generator-soal-ai');
    expect(policy).toContain('/workspace');
    expect(policy).toContain('/v1');
  });

  it('provides concise and full factual references for AI systems', async () => {
    const [shortReference, fullReference] = await Promise.all([
      readFile('public/llms.txt', 'utf8'),
      readFile('public/llms-full.txt', 'utf8'),
    ]);

    expect(shortReference).toContain('https://app.lembar.web.id/generator-soal-ai');
    expect(shortReference).toContain('AI output is a draft');
    expect(fullReference).toContain('Teacher review remains necessary');
    expect(fullReference).toContain('Inappropriate unsupported statements');
  });
});
