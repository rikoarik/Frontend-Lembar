import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Locale } from '@/src/i18n/config';
import { loadMessages } from '@/src/i18n/messages';

/**
 * Locale-aware next-intl double: unlike vitest.setup.ts (which pins `id`),
 * this test drives the active locale so we can prove the app shell actually
 * re-renders in the selected language.
 */
const state = vi.hoisted(() => ({ locale: 'id' as string }));

vi.mock('next-intl', async () => {
  const { loadMessages: load } = await import('@/src/i18n/messages');

  const resolve = (messages: unknown, path: string): unknown =>
    path
      .split('.')
      .reduce<unknown>(
        (node, segment) =>
          node && typeof node === 'object' ? (node as Record<string, unknown>)[segment] : undefined,
        messages,
      );

  return {
    useLocale: () => state.locale,
    useTranslations: (namespace?: string) => {
      const messages = load(state.locale);
      const translate = (key: string, values?: Record<string, unknown>): string => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        const value = resolve(messages, fullKey);
        if (typeof value !== 'string') return fullKey;
        if (!values) return value;
        return value.replace(/\{(\w+)\}/g, (_, name: string) =>
          values[name] !== undefined ? String(values[name]) : `{${name}}`,
        );
      };
      (translate as unknown as { rich: unknown }).rich = translate;
      return translate;
    },
  };
});

import { LeftRail } from '../LeftRail';
import { AccountMenu } from '../AccountMenu';
import { WorkspaceSwitcher } from '../WorkspaceSwitcher';

vi.mock('next/navigation', () => ({
  usePathname: () => '/app',
  useRouter: () => ({ replace: vi.fn() }),
}));

const setLocale = (locale: Locale) => {
  state.locale = locale;
};

describe('app shell follows the active locale', () => {
  it('renders Indonesian navigation copy for the id locale', () => {
    setLocale('id');
    render(<LeftRail activeWorkspaceKind="school" activeRole="school_admin" />);

    expect(screen.getByRole('link', { name: 'Beranda' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bank soal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Admin sekolah' })).toBeInTheDocument();
    expect(screen.getByText('Pustaka')).toBeInTheDocument();
  });

  it('renders English navigation copy for the en locale', () => {
    setLocale('en');
    render(<LeftRail activeWorkspaceKind="school" activeRole="school_admin" />);

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Question bank' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'School admin' })).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Beranda' })).not.toBeInTheDocument();
  });

  it('translates the account menu and workspace switcher', () => {
    setLocale('en');
    render(
      <>
        <AccountMenu displayName="Budi" planLabel="Free plan" />
        <WorkspaceSwitcher
          activeWorkspaceId="ws-1"
          onSelect={() => true}
          workspaces={[
            { id: 'ws-1', name: 'Personal', kind: 'personal', activeRole: 'teacher' },
            { id: 'ws-2', name: 'Demo School', kind: 'school', activeRole: 'school_admin' },
          ]}
        />
      </>,
    );

    expect(screen.getByRole('button', { name: 'Profile menu Budi' })).toBeInTheDocument();
    // aria-labelledby wins over aria-label for the accessible name.
    expect(screen.getByRole('button', { name: 'Workspace Personal' })).toBeInTheDocument();
  });

  it('keeps both locale catalogs structurally in sync for the shell namespaces', () => {
    const paths = (node: unknown, prefix = ''): string[] => {
      if (!node || typeof node !== 'object') return [prefix];
      return Object.entries(node as Record<string, unknown>).flatMap(([key, value]) =>
        paths(value, prefix ? `${prefix}.${key}` : key),
      );
    };

    for (const namespace of ['appShell', 'commonUi'] as const) {
      const idKeys = paths(loadMessages('id')[namespace]).sort();
      const enKeys = paths(loadMessages('en')[namespace]).sort();
      expect(enKeys).toEqual(idKeys);
      expect(idKeys.length).toBeGreaterThan(0);
    }
  });
});
