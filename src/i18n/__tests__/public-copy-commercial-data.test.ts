import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Commercial-data guard (docs/product/BUSINESS-ROLES-PERMISSIONS.md,
 * docs/product/PRD.md §16, docs/frontend/LANDING-PAGE-SPEC.md, D-009).
 *
 *   "tidak ada nominal hipotesis pada UI produksi; agent tidak boleh mengubah
 *    placeholder menjadi angka"
 *   "Harga belum diputuskan. UI hanya boleh memakai 'Coba gratis' atau
 *    'Hubungi kami' sampai keputusan harga diterima."
 *
 * Prices, quota figures and model names are commercial decisions owned by the
 * plan catalog in the backend, not copy. A message file is the wrong home for
 * them: whatever ships there is a hypothesis, and it silently drifts from the
 * catalog the page claims to read. This guard fails the build if any of them
 * reappears in a teacher- or public-facing namespace.
 *
 * Scope: every namespace except the operator consoles. `ops` and `admin` are
 * deliberately excluded — there the catalog numbers and model identifiers are
 * the actual subject matter an operator is editing, not leaked copy.
 */

const MESSAGES_ROOT = join(process.cwd(), 'messages');
const LOCALES = ['id', 'en'] as const;
const OPERATOR_NAMESPACES = ['ops', 'admin'] as const;

type Json = Record<string, unknown>;

function publicNamespaces(): string[] {
  return readdirSync(join(MESSAGES_ROOT, 'id'))
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replace(/\.json$/, ''))
    .filter((namespace) => !(OPERATOR_NAMESPACES as readonly string[]).includes(namespace))
    .sort();
}

function readNamespace(locale: string, namespace: string): Json {
  return JSON.parse(readFileSync(join(MESSAGES_ROOT, locale, `${namespace}.json`), 'utf8')) as Json;
}

/** Flatten to `key.path` → string leaves so a finding names its exact location. */
function flattenLeaves(value: unknown, prefix = ''): Array<[string, string]> {
  if (typeof value === 'string') return [[prefix, value]];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value as Json).flatMap(([key, child]) =>
    flattenLeaves(child, prefix ? `${prefix}.${key}` : key),
  );
}

/**
 * Patterns that must never appear in public copy.
 *
 * The currency rule is intentionally narrow (`Rp`/`IDR`/`$` immediately followed
 * by a digit) so legitimate numerals — dates, percentages, ISO 27001, `AES-256` —
 * keep passing. The model rule is word-bounded for the same reason: `grok`
 * inside `grok-imagine-image` in an operator console is a real product default,
 * while `GPT-5.6 Sol` in marketing copy is a leaked specification.
 */
const FORBIDDEN: ReadonlyArray<{ label: string; pattern: RegExp }> = [
  { label: 'price nominal', pattern: /(?:Rp|IDR|\$)\s?\d/ },
  { label: 'hardcoded quota figure', pattern: /\d[\d.,]*\s*tokens?\b/i },
  {
    label: 'model name',
    pattern:
      /\b(?:gpt(?:-|\s?\d)|claude|kimi|glm|gemini|llama|qwen|deepseek|mistral|sonnet|opus|grok)\b/i,
  },
];

type Finding = { locale: string; namespace: string; key: string; label: string; value: string };

function scan(locales: readonly string[], namespaces: readonly string[]): Finding[] {
  const found: Finding[] = [];
  for (const locale of locales) {
    for (const namespace of namespaces) {
      for (const [key, value] of flattenLeaves(readNamespace(locale, namespace))) {
        for (const { label, pattern } of FORBIDDEN) {
          if (pattern.test(value)) found.push({ locale, namespace, key, label, value });
        }
      }
    }
  }
  return found;
}

/** `id/marketing.json#pricing.plans.pro.subtitle [price nominal]: Rp149.000/…` */
function describeFinding(finding: Finding): string {
  return `${finding.locale}/${finding.namespace}.json#${finding.key} [${finding.label}]: ${finding.value}`;
}

describe('public copy carries no commercial data', () => {
  it('has public namespaces to check', () => {
    const namespaces = publicNamespaces();
    expect(namespaces.length).toBeGreaterThan(0);
    // The two namespaces this guard exists for must actually be in scope; a
    // rename that quietly drops them would otherwise make the suite vacuous.
    expect(namespaces).toContain('marketing');
    expect(namespaces).toContain('subscription');
  });

  it('never hardcodes a price, a quota figure, or a model name', () => {
    const findings = scan(LOCALES, publicNamespaces());

    expect(
      findings.map(describeFinding),
      'Commercial data must come from the plan catalog (GET /v1/public/plans), not from message files',
    ).toEqual([]);
  });

  it('catches a price nominal in the pricing subtitle', () => {
    // Negative control: the guard's own rule must fire on the exact string this
    // card removed, so a future regression cannot pass unnoticed.
    const regression = 'Rp149.000/bulan, 300.000 token, memakai GPT-5.6 Sol terbaru.';
    const hits = FORBIDDEN.filter(({ pattern }) => pattern.test(regression)).map((f) => f.label);

    expect(hits).toContain('price nominal');
    expect(hits).toContain('hardcoded quota figure');
    expect(hits).toContain('model name');
  });
});
