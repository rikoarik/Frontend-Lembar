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
const PAGES_ROOT = join(process.cwd(), 'app', '(marketing)');

/**
 * Files that carry a public page's own copy (`generateMetadata` strings and
 * `<JsonLd>` payloads) rather than reusing a message namespace. They are copied
 * from the same hypothesis as the message files and drift the same way, so the
 * same rules apply. `documented-copy.ts` is the published catalogue of the
 * strings the *backend* should own (docs/frontend/LANDING-PAGE-SPEC.md) — it is
 * deliberately not rendered, so it is out of scope here.
 */
function publicCopySources(): string[] {
  return readdirSync(PAGES_ROOT, { recursive: true, encoding: 'utf8' })
    .filter((entry) => entry.endsWith('.tsx') || entry.endsWith('.ts'))
    .map((entry) => join(PAGES_ROOT, entry))
    .filter((file) => !file.endsWith('documented-copy.ts'))
    .sort();
}

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
type FileFinding = { file: string; label: string; text: string };

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

/** Same rules, applied to the source of the public pages themselves. */
function scanSources(files: readonly string[]): FileFinding[] {
  const found: FileFinding[] = [];
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
      for (const { label, pattern } of FORBIDDEN) {
        if (pattern.test(line)) {
          found.push({
            file: `${file.replace(`${process.cwd()}/`, '')}:${index + 1}`,
            label,
            text: line.trim(),
          });
        }
      }
    });
  }
  return found;
}

function describeFileFinding(finding: FileFinding): string {
  return `${finding.file} [${finding.label}]: ${finding.text}`;
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

  it('never hardcodes commercial data in the public page sources', () => {
    // The pages render prices from the catalog and quotas from the catalog —
    // the metadata strings and JSON-LD payloads alongside them are copy, and
    // copy is exactly where the hypothesis figure reappeared last time.
    const findings = scanSources(publicCopySources());

    expect(
      findings.map(describeFileFinding),
      'Page-level copy and structured data must not carry a price, quota figure or model name either',
    ).toEqual([]);
  });
});
