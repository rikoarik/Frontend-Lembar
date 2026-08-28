import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { loadMessages } from './src/i18n/messages';

// Global next-intl test double: resolves keys against the id catalog so
// component tests do not need an explicit NextIntlClientProvider wrapper.
vi.mock('next-intl', async () => {
  const messages = loadMessages('id');

  const resolve = (path: string): unknown =>
    path
      .split('.')
      .reduce<unknown>(
        (node, segment) =>
          node && typeof node === 'object' ? (node as Record<string, unknown>)[segment] : undefined,
        messages,
      );

  const format = (template: string, values?: Record<string, unknown>): string => {
    if (!values) return template;
    return template.replace(/\{(\w+)\}/g, (_, name: string) =>
      values[name] !== undefined ? String(values[name]) : `{${name}}`,
    );
  };

  return {
    useLocale: () => 'id',
    useTranslations: (namespace?: string) => {
      const translate = (key: string, values?: Record<string, unknown>): string => {
        const fullKey = namespace ? `${namespace}.${key}` : key;
        const value = resolve(fullKey);
        if (typeof value !== 'string') return fullKey;
        return format(value, values);
      };
      const rich = (key: string, values?: Record<string, unknown>): React.ReactNode =>
        translate(key, values as Record<string, unknown>);
      const raw = (key: string): unknown => resolve(key);
      (translate as unknown as { rich: unknown }).rich = rich;
      (translate as unknown as { raw: unknown }).raw = raw;
      return translate;
    },
    NextIntlClientProvider: ({ children }: { children?: React.ReactNode }) => children ?? null,
  };
});

vi.mock('next-intl/server', async () => {
  const messages = loadMessages('id');

  const resolve = (path: string): unknown =>
    path
      .split('.')
      .reduce<unknown>(
        (node, segment) =>
          node && typeof node === 'object' ? (node as Record<string, unknown>)[segment] : undefined,
        messages,
      );

  const format = (template: string, values?: Record<string, unknown>): string => {
    if (!values) return template;
    return template.replace(/\{(\w+)\}/g, (_, name: string) =>
      values[name] !== undefined ? String(values[name]) : `{${name}}`,
    );
  };

  return {
    getLocale: async () => 'id',
    getMessages: async () => messages,
    getTranslations: async (namespace?: string | object) => {
      const ns = typeof namespace === 'string' ? namespace : undefined;
      return (key: string, values?: Record<string, unknown>) => {
        const fullKey = ns ? `${ns}.${key}` : key;
        const value = resolve(fullKey);
        if (typeof value !== 'string') return fullKey;
        return format(value, values);
      };
    },
  };
});

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin = '';
  readonly scrollMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

(
  globalThis as unknown as { IntersectionObserver: typeof IntersectionObserver }
).IntersectionObserver = MockIntersectionObserver;

if (typeof window !== 'undefined') {
  const store = new Map<string, string>();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
    },
  });

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
