import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';

/**
 * FE-I18N-04 DoD: "halaman marketing ID/EN lengkap".
 *
 * The global vitest setup mocks `next-intl/server` against the `id` catalog.
 * This suite re-mocks it against `en` so every marketing route is asserted to
 * actually render English copy — a namespace that is filled but never wired
 * would otherwise pass the whole test suite unnoticed.
 */
vi.mock('next-intl/server', async () => {
  const { loadMessages } = await import('@/src/i18n/messages');
  const messages = loadMessages('en');
  const resolve = (path: string): unknown =>
    path
      .split('.')
      .reduce<unknown>(
        (node, segment) =>
          node && typeof node === 'object' ? (node as Record<string, unknown>)[segment] : undefined,
        messages,
      );
  return {
    getLocale: async () => 'en',
    getMessages: async () => messages,
    getFormatter: async () => ({
      dateTime: (value: Date | number, options?: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat('en-US', options).format(value),
      number: (value: number | bigint, options?: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat('en-US', options).format(value),
    }),
    getTranslations:
      async (namespace?: string) => (key: string, values?: Record<string, unknown>) => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        const value = resolve(fullKey);
        if (typeof value !== 'string') return fullKey;
        if (!values) return value;
        return value.replace(/\{(\w+)\}/g, (_, name: string) =>
          String(values[name] ?? `{${name}}`),
        );
      },
  };
});

vi.mock('@/src/lib/marketing/fetchMarketingPage', () => ({
  fetchMarketingPage: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/src/lib/api/plans', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/src/lib/api/plans')>();
  return { ...original, fetchPublicPlans: vi.fn().mockResolvedValue([]) };
});

vi.mock('@/src/lib/api/marketingSession', () => ({
  getMarketingSession: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/app/components/marketing/JsonLd', () => ({ default: () => null }));

import PrivasiPage from '../(marketing)/privasi/page';
import SyaratPage from '../(marketing)/syarat/page';
import UntukSekolahPage from '../(marketing)/untuk-sekolah/page';
import BantuanPage from '../(marketing)/bantuan/page';
import FaqPage from '../(marketing)/faq/page';
import KeamananDataPage from '../(marketing)/keamanan-data/page';
import TentangPage from '../(marketing)/tentang/page';
import KontakPage from '../(marketing)/kontak/page';
import HomePage from '../(marketing)/page';

/** Resolve the async page and its async hero layout, then mount the result. */
async function mountSubPage(Page: () => Promise<React.ReactElement>) {
  const page = await Page();
  const props = (page as React.ReactElement<React.ComponentProps<typeof MarketingSubPageLayout>>)
    .props;
  return render(await MarketingSubPageLayout(props));
}

describe('marketing routes render English copy', () => {
  it('/privasi', async () => {
    await mountSubPage(PrivasiPage);
    expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByText(/Data we collect/i)).toBeInTheDocument();
    expect(screen.getByText(/Last updated: 18 July 2026/)).toBeInTheDocument();
  });

  it('/syarat', async () => {
    await mountSubPage(SyaratPage);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Terms & Conditions' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Content ownership/i)).toBeInTheDocument();
  });

  it('/untuk-sekolah', async () => {
    const { container } = await mountSubPage(UntukSekolahPage);
    expect(
      screen.getByRole('heading', { level: 1, name: /Organisation Workspace/i }),
    ).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Workspace Organisasi untuk Institusi Sekolah/);
  });

  it('/bantuan', async () => {
    await mountSubPage(BantuanPage);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Create your first assessment/i)).toBeInTheDocument();
  });

  it('/faq', async () => {
    await mountSubPage(FaqPage);
    expect(screen.getByText(/What is lembar\?/i)).toBeInTheDocument();
  });

  it('/keamanan-data', async () => {
    await mountSubPage(KeamananDataPage);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Browser session/i)).toBeInTheDocument();
  });

  it('/tentang', async () => {
    await mountSubPage(TentangPage);
    expect(screen.getByText(/Teachers should not/i)).toBeInTheDocument();
    expect(screen.getByText(/Active teachers/i)).toBeInTheDocument();
  });

  it('/kontak', async () => {
    await mountSubPage(KontakPage);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Follow-up route/i)).toBeInTheDocument();
  });

  it('/ (home)', async () => {
    const { container } = render(await HomePage());
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Buat soal ujian otomatis/);
  });
});
