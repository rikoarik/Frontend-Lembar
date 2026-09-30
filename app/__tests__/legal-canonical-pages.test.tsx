import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';
import PrivasiPage, { generateMetadata as privasiMetadata } from '../(marketing)/privasi/page';
import SyaratPage, { generateMetadata as syaratMetadata } from '../(marketing)/syarat/page';

/**
 * Marketing sub-pages are async server components that delegate their hero to
 * the async `MarketingSubPageLayout`. Resolve both levels before rendering so
 * the tree contains real elements instead of unresolved promises.
 */
async function renderSubPage(Page: () => Promise<ReactElement>) {
  const page = await Page();
  const props = (page as ReactElement<React.ComponentProps<typeof MarketingSubPageLayout>>).props;
  render(await MarketingSubPageLayout(props));
}

describe('canonical legal pages — F1-08', () => {
  it('/privasi renders Kebijakan Privasi h1 title', async () => {
    await renderSubPage(PrivasiPage);
    expect(
      screen.getByRole('heading', { level: 1, name: /kebijakan privasi/i }),
    ).toBeInTheDocument();
  });

  it('/syarat renders Syarat & Ketentuan h1 title', async () => {
    await renderSubPage(SyaratPage);
    expect(
      screen.getByRole('heading', { level: 1, name: /syarat & ketentuan/i }),
    ).toBeInTheDocument();
  });

  it('PrivasiPage exports correct metadata', async () => {
    const metadata = await privasiMetadata();
    expect(metadata).toBeDefined();
    expect(metadata.title).toContain('Kebijakan Privasi - lembar');
    expect(metadata.description).toContain('privasi lembar');
  });

  it('SyaratPage exports correct metadata', async () => {
    const metadata = await syaratMetadata();
    expect(metadata).toBeDefined();
    expect(metadata.title).toContain('Syarat & Ketentuan - lembar');
    expect(metadata.description).toContain('platform lembar');
  });
});
