/**
 * FE-I18N-07 — CI gate: no new hard-coded Indonesian copy.
 *
 * Migrated surfaces (see `MIGRATED_SURFACES`) render every user-facing string through
 * `next-intl`; copy lives in `messages/{id,en}/*.json`. This gate parses each `.ts`/`.tsx`
 * file in those surfaces and rejects Indonesian copy that is written inline:
 *
 *   1. `jsx-text`      — a JSX text node with Indonesian words, e.g. `<p>Simpan perubahan</p>`
 *   2. `jsx-attribute` — a copy-bearing attribute on an intrinsic element, e.g.
 *                        `<input placeholder="Nama siswa" />` (placeholder / aria-label /
 *                        title / alt / aria-description)
 *
 * `no-hardcoded-copy.config.json` (next to this script) carries the two editable lists:
 *   - `surfaces`: directories whose copy already goes through next-intl. Add a path here once
 *     its namespace is filled and its literals are migrated.
 *   - `exceptions`: the explicit baseline — literals that were already present when the gate
 *     landed and are deliberately not migrated yet. A finding matches an exception only on the
 *     exact file + normalized text pair, so renaming or rewording a string still trips the gate.
 *     Exceptions that no longer match anything are reported as stale so the list can be pruned.
 *
 * Rules that never need an exception (they are not copy):
 *   - Material Symbols glyph names (`className` contains `material-symbols`)
 *   - the brand wordmark, identical in both locales (`lembar`)
 *   - identifiers, e-mails, URLs and numeric-only labels
 *
 * Usage:
 *   node scripts/gates/no-hardcoded-copy.ts              # scan, exit 1 on violations
 *   node scripts/gates/no-hardcoded-copy.ts --json       # machine-readable report
 *   node scripts/gates/no-hardcoded-copy.ts --list       # include allowed findings
 *   node scripts/gates/no-hardcoded-copy.ts --strict     # stale exceptions also fail the gate
 *   node scripts/gates/no-hardcoded-copy.ts --root DIR --config FILE.json
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));

/** Baseline exceptions live next to this script so the list is reviewable as data. */
export const DEFAULT_CONFIG_PATH = join(SCRIPT_DIR, 'no-hardcoded-copy.config.json');

export type Rule = 'jsx-text' | 'jsx-attribute';

export type Finding = {
  file: string;
  line: number;
  rule: Rule;
  attribute?: string;
  text: string;
};

export type CopyException = {
  file: string;
  text: string;
  reason: string;
};

export type GateConfig = {
  surfaces: string[];
  exceptions: CopyException[];
};

/**
 * Load the gate configuration (surfaces + baseline exceptions). Defaults to the JSON file that
 * lives next to this script; `--config` can point at an alternate file.
 */
export function loadConfig(configPath: string = DEFAULT_CONFIG_PATH): GateConfig {
  if (!existsSync(configPath)) {
    throw new Error(`no-hardcoded-copy: config not found at ${configPath}`);
  }
  const parsed = JSON.parse(readFileSync(configPath, 'utf8')) as Partial<GateConfig>;
  return {
    surfaces: parsed.surfaces ?? [],
    exceptions: parsed.exceptions ?? [],
  };
}

/** Default configuration, resolved once at import so tests can assert on the shipped lists. */
export const GATE_CONFIG: GateConfig = loadConfig();

/** JSX attributes that render to the user and therefore must be translated. */
const COPY_ATTRIBUTES = new Set(['placeholder', 'aria-label', 'title', 'alt', 'aria-description']);

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);
const SKIPPED_DIRECTORIES = new Set(['node_modules', '.next', '__tests__', '.git']);
const SKIPPED_FILE = /\.(test|spec)\.tsx?$/;

/**
 * Indonesian function words plus the high-frequency UI vocabulary that appears in
 * `messages/id/*.json` but never in `messages/en/*.json`. A literal is treated as Indonesian
 * when at least one of its words is in this set, so English-only copy ("Review", "PDF") is not
 * flagged. Refresh the list when a namespace introduces new vocabulary.
 */
const INDONESIAN_MARKERS = new Set(
  `ada adalah agar akan akun alamat anda antara apa apakah aplikasi asesmen atas atau bagian bahasa bantuan baru batas bayar belum benar beranda berapa berbagi berhasil berlaku bisa boleh buat bukan bulan butir cara catatan cetak coba contoh cukup dalam dapat dari data daftar dengan detail dibuat digunakan dihapus dikirim dimuat diperlukan ditinjau dokumen edit fitur gagal guru gratis halaman hasil hubungi identitas informasi ini isian itu jadwalkan jika juga jumlah kalau kami kamu karena kapan kartu kata katalog keamanan kebutuhan kelas kelola kembali kemampuan kemudian kepada keputusan ketentuan kirim kode konfirmasi konfigurasi kontak konten konteks kuota kurikulum lagi lain lalu lama langkah langsung lanjut laporan layanan lembar lengkap lihat lupa masuk mata materi melalui memakai membuat memilih memuat menampilkan mencari menggunakan menjadi menit menjaga metode minta muat mulai nama namun nilai nomor notifikasi oleh pada paket paling pantau panduan pelajaran pembayaran pembaruan pembuatan pemulihan penggunaan pengguna pengaturan pendidikan penawaran periksa perlu permintaan persetujuan pertanyaan pesan pilih populer pribadi pulihkan ringkasan ruang saat sandi sebelum sebelumnya sebentar sedang sekarang sekolah selamanya sementara sering sesuai setelah setiap siap simpan soal sudah syarat tambahan tanpa tautan telepon terbaru terdaftar terhubung terisi terlalu tersedia tidak tim tunggu tutup ulang untuk undangan valid verifikasi waktu wajib yang yakin`.split(
    /\s+/,
  ),
);

/** Words that are identical in both locales and never need translation. */
const BRAND_ONLY_WORDS = new Set(['lembar']);

export function normalizeCopy(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function looksIndonesian(text: string): boolean {
  return tokenize(text).some((word) => INDONESIAN_MARKERS.has(word));
}

export function isBrandOnly(text: string): boolean {
  const words = tokenize(text);
  return words.length > 0 && words.every((word) => BRAND_ONLY_WORDS.has(word));
}

/** Identifiers, e-mails, URLs, file paths and numeric-only labels are not copy. */
export function isNonCopy(text: string): boolean {
  const value = normalizeCopy(text);
  if (value.length < 3) return true;
  if (!/[A-Za-z]/.test(value)) return true;
  if (value.includes('@')) return true;
  if (/^https?:\/\//i.test(value)) return true;
  if (/^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(value)) return true;
  if (/^[a-z0-9-]+(\/[a-z0-9-]+)+$/.test(value)) return true;
  return false;
}

function walkSources(dir: string, root: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (SKIPPED_DIRECTORIES.has(entry)) continue;
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      walkSources(full, root, out);
      continue;
    }
    if (!SOURCE_EXTENSIONS.has(extname(full))) continue;
    if (SKIPPED_FILE.test(entry)) continue;
    out.push(relative(root, full).split(sep).join('/'));
  }
  return out;
}

function enclosingJsxElement(node: ts.Node): ts.JsxElement | ts.JsxSelfClosingElement | null {
  let current: ts.Node | undefined = node;
  while (current) {
    if (ts.isJsxElement(current) || ts.isJsxSelfClosingElement(current)) return current;
    current = current.parent;
  }
  return null;
}

function elementAttributes(element: ts.JsxElement | ts.JsxSelfClosingElement): ts.JsxAttributes {
  return ts.isJsxElement(element) ? element.openingElement.attributes : element.attributes;
}

function elementTagName(element: ts.JsxElement | ts.JsxSelfClosingElement): string {
  return (ts.isJsxElement(element) ? element.openingElement.tagName : element.tagName).getText();
}

/** True for a Material Symbols icon host, whose JSX text is a glyph name and not copy. */
function isIconHost(element: ts.JsxElement | ts.JsxSelfClosingElement): boolean {
  return elementAttributes(element).properties.some(
    (property) =>
      ts.isJsxAttribute(property) &&
      property.name.getText() === 'className' &&
      property.initializer !== undefined &&
      ts.isStringLiteral(property.initializer) &&
      property.initializer.text.includes('material-symbols'),
  );
}

export function scanSource(filePath: string, source: string): Finding[] {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const findings: Finding[] = [];

  const visit = (node: ts.Node): void => {
    if (node.kind === ts.SyntaxKind.JsxText) {
      const element = enclosingJsxElement(node);
      const text = normalizeCopy(node.getText(sourceFile));
      if (
        element &&
        /^[a-z]/.test(elementTagName(element)) &&
        !isIconHost(element) &&
        !isNonCopy(text) &&
        !isBrandOnly(text) &&
        looksIndonesian(text)
      ) {
        findings.push({
          file: filePath,
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
          rule: 'jsx-text',
          text,
        });
      }
    }

    if (ts.isJsxAttribute(node) && node.initializer !== undefined) {
      const name = node.name.getText(sourceFile);
      if (COPY_ATTRIBUTES.has(name) && ts.isStringLiteral(node.initializer)) {
        const element = enclosingJsxElement(node);
        const text = normalizeCopy(node.initializer.text);
        if (
          element &&
          /^[a-z]/.test(elementTagName(element)) &&
          !isNonCopy(text) &&
          !isBrandOnly(text) &&
          looksIndonesian(text)
        ) {
          findings.push({
            file: filePath,
            line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
            rule: 'jsx-attribute',
            attribute: name,
            text,
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return findings;
}

export function scanForHardcodedCopy(rootDir: string, config: GateConfig): Finding[] {
  const root = resolve(rootDir);
  const files = config.surfaces.flatMap((surface) => walkSources(join(root, surface), root));
  return [...new Set(files)]
    .sort()
    .flatMap((file) => scanSource(file, readFileSync(join(root, file), 'utf8')));
}

export type ScanResult = {
  findings: Finding[];
  violations: Finding[];
  allowed: Finding[];
  staleExceptions: CopyException[];
};

export function partitionFindings(findings: Finding[], exceptions: CopyException[]): ScanResult {
  const allowedKeys = new Set(exceptions.map((entry) => `${entry.file}\u0000${entry.text}`));
  const matched = new Set<string>();
  const allowed: Finding[] = [];
  const violations: Finding[] = [];

  for (const finding of findings) {
    const key = `${finding.file}\u0000${finding.text}`;
    if (allowedKeys.has(key)) {
      matched.add(key);
      allowed.push(finding);
      continue;
    }
    violations.push(finding);
  }

  return {
    findings,
    violations,
    allowed,
    staleExceptions: exceptions.filter((entry) => !matched.has(`${entry.file}\u0000${entry.text}`)),
  };
}

function parseArgs(argv: string[]): {
  root: string;
  config?: string;
  json: boolean;
  list: boolean;
  strict: boolean;
} {
  const options = {
    root: process.cwd(),
    config: undefined as string | undefined,
    json: false,
    list: false,
    strict: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') {
      options.root = resolve(argv[index + 1] ?? '');
      index += 1;
    } else if (arg === '--config') {
      options.config = resolve(argv[index + 1] ?? '');
      index += 1;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--list') {
      options.list = true;
    } else if (arg === '--strict') {
      options.strict = true;
    }
  }
  return options;
}

function describe(finding: Finding): string {
  const location = `${finding.file}:${finding.line}`;
  const detail =
    finding.rule === 'jsx-attribute' ? `${finding.attribute}="${finding.text}"` : finding.text;
  return `${location}  [${finding.rule}]  ${detail}`;
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const config: GateConfig = options.config ? loadConfig(options.config) : GATE_CONFIG;

  const result = partitionFindings(scanForHardcodedCopy(options.root, config), config.exceptions);
  const failed =
    result.violations.length > 0 || (options.strict && result.staleExceptions.length > 0);

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          surfaces: config.surfaces,
          violationCount: result.violations.length,
          allowedCount: result.allowed.length,
          staleCount: result.staleExceptions.length,
          strict: options.strict,
          passed: !failed,
          violations: result.violations,
          allowed: result.allowed,
          staleExceptions: result.staleExceptions,
        },
        null,
        2,
      ),
    );
    process.exit(failed ? 1 : 0);
  }

  for (const entry of result.staleExceptions) {
    console.warn(
      `no-hardcoded-copy: stale exception (no matching literal) — ${entry.file} :: ${entry.text}`,
    );
  }

  if (result.violations.length === 0) {
    console.log(
      `no-hardcoded-copy: ok (${config.surfaces.length} surface(s), ${result.allowed.length} allowed literal(s))`,
    );
    if (options.list) {
      for (const finding of result.allowed) console.log(`  allowed  ${describe(finding)}`);
    }
    if (failed) {
      console.error(
        `no-hardcoded-copy: --strict and ${result.staleExceptions.length} stale exception(s); prune no-hardcoded-copy.config.json.`,
      );
      process.exit(1);
    }
    process.exit(0);
  }

  console.error(
    `no-hardcoded-copy: ${result.violations.length} new hard-coded Indonesian string(s) in migrated surfaces.`,
  );
  console.error('Move the copy into messages/{id,en}/*.json and read it via next-intl.');
  for (const finding of result.violations) {
    console.error(`  ${describe(finding)}`);
  }
  console.error(
    `If a literal must stay, add an explicit entry to scripts/gates/no-hardcoded-copy.config.json.`,
  );
  process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
