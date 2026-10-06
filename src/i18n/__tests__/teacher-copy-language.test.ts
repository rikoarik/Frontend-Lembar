import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Copy rule guard (docs/product/UX-FLOWS.md, docs/frontend/CONTENT-DESIGN.md):
 *
 *   "Teacher language: 'jumlah soal', 'materi', 'kunci'; bukan token/model/context window."
 *
 * The teacher- and public-facing surface must never expose implementation
 * vocabulary: the quota allowance is "kuota pembuatan soal", not "token".
 *
 * Scope: the public/marketing surface, the app shell, and the teacher-facing
 * auth/output surfaces. Operator consoles (`ops`, `admin`) are excluded on
 * purpose — there the provider/model vocabulary is the subject matter, not a
 * leaked implementation detail.
 *
 * NOTE: this guard is deliberately narrower than the copy rule it enforces.
 * `messages/{id,en}/subscription.json` still describes usage in token terms in
 * several states; it is not listed here so the guard cannot pass by accident
 * while that copy is still leaking. Widen GUARDED_NAMESPACES once those strings
 * are rewritten.
 */

const MESSAGES_ROOT = join(process.cwd(), 'messages');
const LOCALES = ['id', 'en'] as const;
const GUARDED_NAMESPACES = ['marketing', 'appShell', 'auth', 'errors', 'output'] as const;

/** Words a teacher (or the public) must never read. Case-insensitive, word-bounded. */
const FORBIDDEN_TERMS: ReadonlyArray<{ label: string; pattern: RegExp }> = [
  { label: 'token', pattern: /\btokens?\b/i },
  { label: 'context window', pattern: /context window/i },
  { label: 'provider', pattern: /\bproviders?\b/i },
  { label: 'inference', pattern: /\binference\b/i },
  { label: 'prompt', pattern: /\bprompts?\b/i },
  { label: 'model name', pattern: /\b(gpt-|claude|gemini|kimi|glm|llama)\S*/i },
  // Bare "context" is legitimate prose ("konteks kurikulum"); only the technical
  // "context window" is forbidden.
];

type Json = Record<string, unknown>;

function readNamespace(locale: string, namespace: string): Json {
  return JSON.parse(readFileSync(join(MESSAGES_ROOT, locale, `${namespace}.json`), 'utf8')) as Json;
}

function flattenLeaves(value: unknown, prefix = ''): Array<[string, string]> {
  if (typeof value === 'string') return [[prefix, value]];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value as Json).flatMap(([key, child]) =>
    flattenLeaves(child, prefix ? `${prefix}.${key}` : key),
  );
}

function guardedLeaves(): Array<{ locale: string; namespace: string; key: string; value: string }> {
  return LOCALES.flatMap((locale) =>
    GUARDED_NAMESPACES.flatMap((namespace) =>
      flattenLeaves(readNamespace(locale, namespace)).map(([key, value]) => ({
        locale,
        namespace,
        key,
        value,
      })),
    ),
  );
}

describe('teacher-facing copy never leaks implementation vocabulary', () => {
  const leaves = guardedLeaves();

  it('has teacher copy to check', () => {
    expect(leaves.length).toBeGreaterThan(200);
  });

  it.each(FORBIDDEN_TERMS)('never says "$label"', ({ pattern }) => {
    const offenders = leaves
      .filter((leaf) => pattern.test(leaf.value))
      .map((leaf) => `${leaf.locale}/${leaf.namespace}.json#${leaf.key} :: ${leaf.value}`);

    expect(offenders).toEqual([]);
  });

  it('never names the quota keys with the internal billing unit', () => {
    for (const locale of LOCALES) {
      const copy = readNamespace(locale, 'marketing') as { pricing: Json };
      const offenders = Object.keys(
        flattenLeaves(copy.pricing).reduce<Json>((acc, [key]) => {
          for (const segment of key.split('.')) acc[segment] = true;
          return acc;
        }, {}),
      ).filter((segment) => /\btokens?\b/i.test(segment.replace(/([A-Z])/g, ' $1')));

      expect(offenders).toEqual([]);
    }
  });

  it('describes the plan quota without a billing unit', () => {
    const expected = { id: /kuota/i, en: /quota/i } as const;

    for (const locale of LOCALES) {
      const copy = readNamespace(locale, 'marketing') as {
        pricing: { quotaPerMonth: string; quotaFromCatalog: string };
      };

      expect(copy.pricing.quotaPerMonth).toMatch(expected[locale]);
      expect(copy.pricing.quotaFromCatalog).toMatch(expected[locale]);
      expect(copy.pricing.quotaPerMonth).not.toMatch(/\btokens?\b/i);
      expect(copy.pricing.quotaFromCatalog).not.toMatch(/\btokens?\b/i);
    }
  });

  it('never exposes a raw price or model name in the pro plan subtitle', () => {
    for (const locale of LOCALES) {
      const copy = readNamespace(locale, 'marketing') as {
        pricing: { plans: { pro: { subtitle: string } } };
      };
      const subtitle = copy.pricing.plans.pro.subtitle;

      expect(subtitle).not.toMatch(/Rp\s?[0-9]/);
      expect(subtitle).not.toMatch(/[0-9][0-9.,]*\s*(token|unit)/i);
    }
  });
});
