import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Regression gate for the Next.js 16 lint migration.
 *
 * Next.js 16 REMOVED `next lint` (node_modules/next/dist/docs/01-app/03-api-reference/
 * 05-config/03-eslint.md → "next lint removal"). The old command did not fail loudly —
 * it resolved `lint` as a project directory and exited 0, so the gate silently stopped
 * running while CI stayed green. These assertions make that regression impossible to
 * reintroduce without a red test.
 */

const root = resolve(__dirname, '../..');

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(resolve(root, relativePath), 'utf8')) as T;
}

function readText(relativePath: string): string {
  return readFileSync(resolve(root, relativePath), 'utf8');
}

describe('lint gate is the ESLint CLI, not `next lint`', () => {
  const pkg = readJson<{ scripts: Record<string, string> }>('package.json');

  it('does not reference the removed `next lint` command in any script', () => {
    for (const [name, command] of Object.entries(pkg.scripts)) {
      expect(command, `script "${name}" must not call the removed \`next lint\``).not.toMatch(
        /\bnext\s+lint\b/,
      );
    }
  });

  it('runs the ESLint CLI directly and fails the process on errors', () => {
    expect(pkg.scripts.lint).toBeDefined();
    expect(pkg.scripts.lint).toMatch(/\beslint\b/);
    // A lint gate that swallows its exit code is not a gate.
    expect(pkg.scripts.lint).not.toMatch(
      /--exit-code|--no-error-on-unmatched-pattern|;\s*true|\|\|\s*true/,
    );
  });

  it('keeps the ESLint CLI reachable as a direct devDependency', () => {
    const deps = readJson<{ devDependencies: Record<string, string> }>('package.json');
    expect(deps.devDependencies.eslint).toBeDefined();
    expect(deps.devDependencies['eslint-config-next']).toBeDefined();
  });

  it('wires the umbrella `check` script to the lint gate', () => {
    expect(pkg.scripts.check).toMatch(/run lint|eslint/);
  });
});

describe('eslint.config.mjs uses the Next 16 flat-config entry points', () => {
  const config = readText('eslint.config.mjs');

  it('loads the core-web-vitals ruleset so Web-Vitals rules are errors', () => {
    expect(config).toMatch(/eslint-config-next\/core-web-vitals/);
  });

  it('loads the TypeScript ruleset so unused vars / explicit any are reported', () => {
    // The bare `eslint-config-next` entry point enables NO @typescript-eslint rules,
    // which is how the previous config silently stopped catching that class of bug.
    expect(config).toMatch(/eslint-config-next\/typescript/);
  });

  it('ignores build output and sibling worktrees', () => {
    expect(config).toMatch(/\.next\/\*\*/);
    expect(config).toMatch(/\.worktrees\/\*\*/);
  });
});

describe('ci.yml gates pull requests to dev', () => {
  const ci = readText('.github/workflows/ci.yml');

  it('triggers on pull_request targeting dev', () => {
    expect(ci).toMatch(/pull_request:/);
    expect(ci).toMatch(/branches:\s*\[[^\]]*\bdev\b[^\]]*\]/);
  });

  it('runs typecheck, lint and unit tests', () => {
    expect(ci).toMatch(/run:\s*pnpm run typecheck/);
    expect(ci).toMatch(/run:\s*pnpm run lint/);
    expect(ci).toMatch(/run:\s*pnpm run test\b/);
  });

  it('never invokes the removed `next lint` command', () => {
    expect(ci).not.toMatch(/\bnext\s+lint\b/);
  });
});

describe('deploy-frontend.yml refuses to deploy an unverified commit', () => {
  const deploy = readText('.github/workflows/deploy-frontend.yml');

  it('polls the ci workflow for the pushed SHA before deploying', () => {
    expect(deploy).toMatch(/actions\/workflows\/ci\.yml\/runs/);
    expect(deploy).toMatch(/completed\/success/);
  });
});
