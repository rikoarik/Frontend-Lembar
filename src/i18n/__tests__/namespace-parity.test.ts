import { describe, expect, it } from 'vitest';
import { loadMessages } from '@/src/i18n/messages';

/** Namespaces migrated by the i18n workstream; each must stay fully bilingual. */
const MIGRATED_NAMESPACES = ['generate', 'jobs', 'review', 'output', 'library'] as const;

function flatten(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('namespace catalog parity', () => {
  it.each(MIGRATED_NAMESPACES)('%s has identical key sets in id and en', (namespace) => {
    const idMessages = loadMessages('id') as Record<string, unknown>;
    const enMessages = loadMessages('en') as Record<string, unknown>;

    const idKeys = new Set(flatten(idMessages[namespace], namespace));
    const enKeys = new Set(flatten(enMessages[namespace], namespace));

    expect(
      [...idKeys].filter((key) => !enKeys.has(key)),
      'missing in en',
    ).toEqual([]);
    expect(
      [...enKeys].filter((key) => !idKeys.has(key)),
      'missing in id',
    ).toEqual([]);
  });

  it.each(MIGRATED_NAMESPACES)('%s is not empty', (namespace) => {
    const idMessages = loadMessages('id') as Record<string, unknown>;
    expect(flatten(idMessages[namespace], namespace).length).toBeGreaterThan(0);
  });
});
