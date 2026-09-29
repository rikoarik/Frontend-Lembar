import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const MESSAGES_ROOT = join(process.cwd(), 'messages');
const LOCALES = ['id', 'en'] as const;

/**
 * Namespaces owned by FE-I18N-05 (ops/admin/school/analytics/lms/share/catalog/
 * leads/onboarding/dashboard). The remaining empty namespaces belong to the
 * sibling FE-I18N-01…04 tasks; once those land, drop this list and assert that
 * every file under messages/<locale> is non-empty.
 */
const FILLED_NAMESPACES = [
  'admin',
  'analytics',
  'catalog',
  'dashboard',
  'leads',
  'lms',
  'onboarding',
  'ops',
  'school',
  'share',
] as const;

type Json = Record<string, unknown>;

function readNamespace(locale: string, file: string): Json {
  return JSON.parse(readFileSync(join(MESSAGES_ROOT, locale, file), 'utf8')) as Json;
}

function flatten(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [prefix];
  return Object.entries(value as Json).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  );
}

function namespaceFiles(locale: string): string[] {
  return readdirSync(join(MESSAGES_ROOT, locale))
    .filter((file) => file.endsWith('.json'))
    .sort();
}

describe('messages catalog', () => {
  it.each(LOCALES)('%s has at least one namespace file', (locale) => {
    expect(namespaceFiles(locale).length).toBeGreaterThan(0);
  });

  it('both locales ship the same namespace files', () => {
    expect(namespaceFiles('id')).toEqual(namespaceFiles('en'));
  });

  it.each(LOCALES)('every %s namespace file carries real copy', (locale) => {
    const empty = namespaceFiles(locale).filter(
      (file) => flatten(readNamespace(locale, file)).length === 0,
    );

    // FE-I18N-05 namespaces must all be filled; the rest are tracked by the
    // sibling i18n tasks (FE-I18N-01…04).
    const unfilledInScope = empty.filter((file) =>
      (FILLED_NAMESPACES as readonly string[]).includes(file.replace(/\.json$/, '')),
    );

    expect(unfilledInScope).toEqual([]);
  });

  it.each(LOCALES)('%s FE-I18N-05 namespaces exist and are non-trivial', (locale) => {
    const files = namespaceFiles(locale);

    for (const namespace of FILLED_NAMESPACES) {
      const file = `${namespace}.json`;
      expect(files, `${locale}: ${file} missing`).toContain(file);
      const raw = readFileSync(join(MESSAGES_ROOT, locale, file), 'utf8');
      // A 3-byte `{}` is the "still empty" marker this task removes.
      expect(raw.trim(), `${locale}/${file} is still the empty stub`).not.toBe('{}');
      expect(flatten(readNamespace(locale, file)).length).toBeGreaterThan(0);
    }
  });

  it.each(LOCALES)('every %s namespace is registered in the catalog loader', async (locale) => {
    const { loadMessages } = await import('../messages');
    const loaded = loadMessages(locale) as Json;

    for (const file of namespaceFiles(locale)) {
      const namespace = file.replace(/\.json$/, '');
      const keys = Object.keys(readNamespace(locale, file));

      for (const key of keys) {
        expect(loaded, `${locale}: namespace "${namespace}" not merged`).toHaveProperty(key);
      }
    }
  });

  it('id and en namespaces expose identical key paths', () => {
    for (const file of namespaceFiles('id')) {
      const idKeys = flatten(readNamespace('id', file)).sort();
      const enKeys = flatten(readNamespace('en', file)).sort();

      expect(enKeys, `key parity drift in ${file}`).toEqual(idKeys);
    }
  });

  it('id and en leaves are non-empty strings', () => {
    for (const locale of LOCALES) {
      for (const file of namespaceFiles(locale)) {
        for (const key of flatten(readNamespace(locale, file))) {
          const leaf = key
            .split('.')
            .reduce<unknown>(
              (node, segment) =>
                node && typeof node === 'object'
                  ? (node as Record<string, unknown>)[segment]
                  : undefined,
              readNamespace(locale, file),
            );
          expect(typeof leaf, `${locale}/${file}#${key}`).toBe('string');
          expect((leaf as string).trim(), `${locale}/${file}#${key}`).not.toBe('');
        }
      }
    }
  });
});
