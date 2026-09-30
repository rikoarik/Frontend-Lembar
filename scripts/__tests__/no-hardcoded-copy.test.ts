import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  isBrandOnly,
  isNonCopy,
  looksIndonesian,
  normalizeCopy,
  partitionFindings,
  scanSource,
} from '../gates/no-hardcoded-copy';

let fixtureRoot: string;
const scriptPath = resolve('scripts/gates/no-hardcoded-copy.ts');

function writeFixture(relativePath: string, contents: string) {
  const fullPath = join(fixtureRoot, relativePath);
  mkdirSync(fullPath.split('/').slice(0, -1).join('/'), { recursive: true });
  writeFileSync(fullPath, contents);
}

function writeConfig(surfaces: string[], exceptions: unknown[] = []) {
  const configPath = join(fixtureRoot, 'gate.config.json');
  writeFileSync(configPath, JSON.stringify({ surfaces, exceptions }));
  return configPath;
}

function runGate(configPath: string, extraArgs: string[] = []) {
  return spawnSync(
    process.execPath,
    [scriptPath, '--root', fixtureRoot, '--config', configPath, ...extraArgs],
    {
      encoding: 'utf8',
    },
  );
}

beforeEach(() => {
  fixtureRoot = mkdtempSync(join(tmpdir(), 'no-hardcoded-copy-'));
});

afterEach(() => {
  rmSync(fixtureRoot, { recursive: true, force: true });
});

describe('Indonesian detection helpers', () => {
  it('flags Indonesian copy and ignores English-only copy', () => {
    expect(looksIndonesian('Simpan perubahan')).toBe(true);
    expect(looksIndonesian('Nama siswa')).toBe(true);
    expect(looksIndonesian('Review')).toBe(false);
    expect(looksIndonesian('PDF')).toBe(false);
    expect(looksIndonesian('Generate')).toBe(false);
  });

  it('treats the brand wordmark as brand-only', () => {
    expect(isBrandOnly('Lembar')).toBe(true);
    expect(isBrandOnly('lembar')).toBe(true);
    expect(isBrandOnly('Lembar Ajaib')).toBe(false);
  });

  it('never treats identifiers, e-mails, URLs or numbers as copy', () => {
    expect(isNonCopy('user_id')).toBe(true);
    expect(isNonCopy('a@b.com')).toBe(true);
    expect(isNonCopy('https://lembar.web.id')).toBe(true);
    expect(isNonCopy('42')).toBe(true);
    expect(isNonCopy('x')).toBe(true);
    expect(isNonCopy('Simpan perubahan')).toBe(false);
  });

  it('normalizes whitespace before comparison', () => {
    expect(normalizeCopy('  Simpan\n  perubahan ')).toBe('Simpan perubahan');
  });
});

describe('scanSource', () => {
  it('reports a JSX text node with Indonesian copy', () => {
    const findings = scanSource('app/x.tsx', 'export const X = () => <p>Simpan pengaturan</p>;\n');
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ rule: 'jsx-text', text: 'Simpan pengaturan' });
  });

  it('reports copy-bearing attributes', () => {
    const findings = scanSource(
      'app/x.tsx',
      'export const X = () => <input placeholder="Nama siswa" />;\n',
    );
    expect(findings).toHaveLength(1);
    expect(findings[0]).toMatchObject({ rule: 'jsx-attribute', attribute: 'placeholder' });
  });

  it('skips English-only copy', () => {
    expect(scanSource('app/x.tsx', 'export const X = () => <p>Review</p>;\n')).toHaveLength(0);
  });

  it('skips Material Symbols glyph hosts', () => {
    const source =
      'export const X = () => <span className="material-symbols-outlined">history</span>;\n';
    expect(scanSource('app/x.tsx', source)).toHaveLength(0);
  });

  it('skips dynamic attribute expressions', () => {
    const source = 'export const X = ({ label }) => <input placeholder={label} />;\n';
    expect(scanSource('app/x.tsx', source)).toHaveLength(0);
  });
});

describe('partitionFindings', () => {
  it('moves exact file+text matches to allowed and leaves the rest as violations', () => {
    const findings = scanSource(
      'app/x.tsx',
      'export const X = () => (<><p>Simpan perubahan</p><p>Hapus data</p></>);\n',
    );
    const result = partitionFindings(findings, [
      { file: 'app/x.tsx', text: 'Simpan perubahan', reason: 'baseline' },
    ]);
    expect(result.allowed.map((f) => f.text)).toEqual(['Simpan perubahan']);
    expect(result.violations.map((f) => f.text)).toEqual(['Hapus data']);
    expect(result.staleExceptions).toHaveLength(0);
  });

  it('reports exceptions that no longer match any literal as stale', () => {
    const result = partitionFindings(
      [],
      [{ file: 'app/gone.tsx', text: 'Sudah dipindah', reason: 'baseline' }],
    );
    expect(result.staleExceptions).toHaveLength(1);
  });

  it('does not match a reworded literal against an exception', () => {
    const findings = scanSource(
      'app/x.tsx',
      'export const X = () => <p>Simpan perubahan baru</p>;\n',
    );
    const result = partitionFindings(findings, [
      { file: 'app/x.tsx', text: 'Simpan perubahan', reason: 'baseline' },
    ]);
    expect(result.violations).toHaveLength(1);
    expect(result.staleExceptions).toHaveLength(1);
  });
});

describe('CLI', () => {
  it('passes against the real repository surface (runs in `pnpm test`)', () => {
    // No --root/--config: the gate uses its shipped config against the repo working tree.
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: resolve('.'),
      encoding: 'utf8',
    });
    expect(result.stderr).not.toContain('new hard-coded Indonesian string');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('no-hardcoded-copy: ok');
  });

  it('passes when every literal is baselined', () => {
    writeFixture('app/surface/page.tsx', 'export const P = () => <p>Simpan perubahan</p>;\n');
    const config = writeConfig(
      ['app/surface'],
      [{ file: 'app/surface/page.tsx', text: 'Simpan perubahan', reason: 'baseline' }],
    );

    const result = runGate(config);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('no-hardcoded-copy: ok');
  });

  it('fails on a new hard-coded Indonesian string', () => {
    writeFixture('app/surface/page.tsx', 'export const P = () => <p>Hapus data siswa</p>;\n');
    const config = writeConfig(['app/surface']);

    const result = runGate(config);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('new hard-coded Indonesian string');
    expect(result.stderr).toContain('Hapus data siswa');
  });

  it('passes with stale exceptions by default but fails under --strict', () => {
    writeFixture('app/surface/page.tsx', 'export const P = () => null;\n');
    const config = writeConfig(
      ['app/surface'],
      [{ file: 'app/surface/page.tsx', text: 'Sudah dipindah', reason: 'baseline' }],
    );

    expect(runGate(config).status).toBe(0);

    const strict = runGate(config, ['--strict']);
    expect(strict.status).toBe(1);
    expect(strict.stderr).toContain('stale exception');
  });

  it('emits a machine-readable report with --json', () => {
    writeFixture('app/surface/page.tsx', 'export const P = () => <p>Hapus data</p>;\n');
    const config = writeConfig(['app/surface']);

    const result = runGate(config, ['--json']);
    expect(result.status).toBe(1);
    const report = JSON.parse(result.stdout);
    expect(report).toMatchObject({ violationCount: 1, passed: false, strict: false });
    expect(report.violations[0].text).toBe('Hapus data');
  });
});
