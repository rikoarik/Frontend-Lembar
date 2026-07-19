import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

let fixtureRoot: string;
const scriptPath = resolve('scripts/secret-scan.mjs');

function writeFixture(relativePath: string, contents: string) {
  const fullPath = join(fixtureRoot, relativePath);
  mkdirSync(fullPath.split('/').slice(0, -1).join('/'), { recursive: true });
  writeFileSync(fullPath, contents);
}

function runScan() {
  return spawnSync(process.execPath, [scriptPath], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  });
}

beforeEach(() => {
  fixtureRoot = mkdtempSync(join(tmpdir(), 'secret-scan-'));
});

afterEach(() => {
  rmSync(fixtureRoot, { recursive: true, force: true });
});

describe('secret-scan CLI', () => {
  it('passes when no fixtures contain secrets', () => {
    writeFixture('src/clean.ts', 'export const greeting = "hello";\n');
    writeFixture('app/clean.tsx', 'export default function Page() { return null; }\n');

    const result = runScan();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('secret-scan: ok');
  });

  it('fails when known secret patterns appear across scanned roots', () => {
    writeFixture(
      'src/leak.ts',
      [
        'const openai = "sk-abcdefghijklmnopqrstuvwxyz1234";',
        'const gh = "ghp_abcdefghijklmnopqrstuvwxyz0123456789";',
        'const aws = "AKIAIOSFODNN7EXAMPLE";',
      ].join('\n'),
    );
    writeFixture(
      'app/leak.tsx',
      [
        'const slack = "xoxb-1234567890-abcdef";',
        'const gcp = "AIzaSyA-aBcDeFgHiJkLmNoPqRsTuVwXyZ012345";',
      ].join('\n'),
    );

    const result = runScan();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('openai:');
    expect(result.stderr).toContain('github-pat:');
    expect(result.stderr).toContain('aws-access-key-id:');
    expect(result.stderr).toContain('google-api-key:');
    expect(result.stderr).toContain('slack-token:');
  });

  it('does not scan unrelated directories', () => {
    writeFixture('docs/spec.md', 'AKIAIOSFODNN7EXAMPLE');

    const result = runScan();
    expect(result.status).toBe(0);
  });
});
