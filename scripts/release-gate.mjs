#!/usr/bin/env node
// Release gate for the landing marketing surfaces.
// Runs: typecheck, lint, test, build, format:check, axe-core smoke,
// console-error guard, prefers-reduced-motion check.
// Emits a markdown summary at docs/frontend/release-gate-report.md.

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const reportPath = resolve(repoRoot, 'docs/frontend/release-gate-report.md');

const chrome =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const AXE_VERSION = '4.10.3';
const AXE_CDN = `https://cdn.jsdelivr.net/npm/axe-core@${AXE_VERSION}/axe.min.js`;
const AXE_LOCAL_PATH = resolve(repoRoot, `node_modules/axe-core/axe.min.js`);

const staticChecks = [
  { name: 'typecheck', cmd: 'npm', args: ['run', 'typecheck'] },
  { name: 'lint', cmd: 'npm', args: ['run', 'lint'] },
  { name: 'test', cmd: 'npm', args: ['run', 'test'] },
  { name: 'build', cmd: 'npm', args: ['run', 'build'] },
  { name: 'format:check', cmd: 'npm', args: ['run', 'format:check'] },
];

const runtimeRoutes = [
  { name: 'home', path: '/' },
  { name: 'school', path: '/untuk-sekolah' },
  { name: 'pricing', path: '/harga' },
];

const results = []; // { check, status: 'pass'|'fail'|'skip', summary, detail }

function logResult(check, status, summary, detail) {
  results.push({ check, status, summary, detail });
  const tag = status === 'pass' ? 'PASS' : status === 'skip' ? 'SKIP' : 'FAIL';
  console.log(`[${tag}] ${check} — ${summary}`);
}

function runStatic(check) {
  return new Promise((resolveRun) => {
    const child = spawn(check.cmd, check.args, {
      cwd: repoRoot,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    let err = '';
    child.stdout.on('data', (b) => {
      out += b;
    });
    child.stderr.on('data', (b) => {
      err += b;
    });
    child.on('close', (code) => {
      const combined = (out + err).trim();
      const lastLines = combined.split('\n').slice(-20).join('\n');
      if (code === 0) {
        logResult(check.name, 'pass', 'exit 0', lastLines);
      } else {
        logResult(check.name, 'fail', `exit ${code}`, lastLines);
      }
      resolveRun();
    });
  });
}

function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close(() => (port ? resolvePort(port) : reject(new Error('no port'))));
    });
  });
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForHttp(url, attempts = 90) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const r = await fetch(url);
      if (r.ok) return r;
    } catch {
      /* still starting */
    }
    await wait(300);
  }
  throw new Error(`server not ready: ${url}`);
}

async function fetchAxeSource() {
  if (existsSync(AXE_LOCAL_PATH)) {
    return { ok: true, source: readFileSync(AXE_LOCAL_PATH, 'utf8'), sourceFrom: 'local' };
  }
  try {
    const res = await fetch(AXE_CDN);
    if (!res.ok) return { ok: false, sourceFrom: 'cdn', error: `HTTP ${res.status}` };
    const text = await res.text();
    return { ok: true, source: text, sourceFrom: 'cdn' };
  } catch (err) {
    return { ok: false, sourceFrom: 'cdn', error: err.message ?? String(err) };
  }
}

async function runRuntimeChecks() {
  const axe = await fetchAxeSource();
  if (!axe.ok) {
    logResult(
      'axe-core smoke',
      'fail',
      `could not load axe-core from CDN (${AXE_CDN})`,
      axe.error ?? 'unknown error',
    );
    return;
  }
  logResult('axe-core load', 'pass', `axe-core ${AXE_VERSION} loaded from ${axe.sourceFrom}`, '');

  const port = await getFreePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn(resolve(repoRoot, 'node_modules/.bin/next'), ['start', '-p', String(port)], {
    cwd: repoRoot,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let serverOutput = '';
  server.stdout.on('data', (b) => {
    serverOutput += b;
  });
  server.stderr.on('data', (b) => {
    serverOutput += b;
  });

  let browser;
  try {
    await waitForHttp(baseUrl);

    if (!existsSync(chrome)) {
      logResult(
        'runtime checks (axe, console, reduced-motion)',
        'fail',
        `chrome binary not found at ${chrome}`,
        'set CHROME_PATH to a local chromium-compatible binary.',
      );
      return;
    }

    browser = await chromium.launch({ executablePath: chrome, headless: true });

    for (const route of runtimeRoutes) {
      const reducedCtx = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        reducedMotion: 'reduce',
      });
      const reducedPage = await reducedCtx.newPage();
      const consoleErrors = [];
      reducedPage.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));
      reducedPage.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(`console.error: ${msg.text()}`);
      });

      await reducedPage.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle' });
      await reducedPage.waitForTimeout(500);

      const motionState = await reducedPage.evaluate(() => {
        const all = Array.from(document.querySelectorAll('*'));
        const running = all.filter((el) => {
          const cs = getComputedStyle(el);
          return (
            cs.animationName !== 'none' &&
            cs.animationPlayState === 'running' &&
            parseFloat(cs.animationDuration || '0') > 0
          );
        });
        const h1 = document.querySelector('h1');
        return {
          h1Text: h1?.textContent?.trim() ?? null,
          lang: document.documentElement.lang,
          runningAnimations: running.length,
        };
      });

      await reducedPage.addScriptTag({ content: axe.source });
      const axeViolations = await reducedPage.evaluate(async () => {
        const results = await window.axe.run(document, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
        });
        return results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.length,
        }));
      });

      await reducedCtx.close();

      const criticalOrSerious = axeViolations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );

      if (consoleErrors.length > 0) {
        logResult(
          `console guard — ${route.name}`,
          'fail',
          `${consoleErrors.length} console error(s)`,
          consoleErrors.join('\n'),
        );
      } else {
        logResult(
          `console guard — ${route.name}`,
          'pass',
          'no console errors',
          `h1="${motionState.h1Text}" lang=${motionState.lang}`,
        );
      }

      if (motionState.runningAnimations > 0) {
        logResult(
          `prefers-reduced-motion — ${route.name}`,
          'fail',
          `${motionState.runningAnimations} animation(s) still running`,
          'route should respect prefers-reduced-motion: reduce',
        );
      } else {
        logResult(
          `prefers-reduced-motion — ${route.name}`,
          'pass',
          'all animations halted',
          `lang=${motionState.lang}`,
        );
      }

      if (criticalOrSerious.length > 0) {
        logResult(
          `axe-core — ${route.name}`,
          'fail',
          `${criticalOrSerious.length} critical/serious violation(s)`,
          criticalOrSerious
            .map((v) => `${v.id} (${v.impact}) — ${v.help} [${v.nodes} node(s)]`)
            .join('\n'),
        );
      } else {
        logResult(
          `axe-core — ${route.name}`,
          'pass',
          `${axeViolations.length} total violation(s) (0 critical/serious)`,
          `wcag2a + wcag2aa tags; ${axeViolations.length} total`,
        );
      }
    }
  } catch (err) {
    logResult('runtime checks', 'fail', err.message ?? String(err), serverOutput.slice(-1500));
  } finally {
    if (browser) await browser.close();
    server.kill('SIGTERM');
  }
}

function buildMarkdownReport() {
  const lines = [];
  lines.push('# Release Gate Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  const pass = results.filter((r) => r.status === 'pass').length;
  const fail = results.filter((r) => r.status === 'fail').length;
  const skip = results.filter((r) => r.status === 'skip').length;
  lines.push(`**Summary:** ${pass} pass, ${fail} fail, ${skip} skip`);
  lines.push('');
  lines.push('| Check | Status | Summary |');
  lines.push('| --- | --- | --- |');
  for (const r of results) {
    const status = r.status.toUpperCase();
    lines.push(`| ${r.check} | ${status} | ${r.summary.replace(/\|/g, '\\|')} |`);
  }
  lines.push('');
  lines.push('## Detail');
  lines.push('');
  for (const r of results) {
    lines.push(`### ${r.check} — ${r.status.toUpperCase()}`);
    lines.push('');
    lines.push(`Summary: ${r.summary}`);
    lines.push('');
    lines.push('```');
    lines.push(r.detail || '(no detail)');
    lines.push('```');
    lines.push('');
  }
  return lines.join('\n');
}

async function main() {
  mkdirSync(dirname(reportPath), { recursive: true });

  for (const check of staticChecks) {
    await runStatic(check);
  }

  const buildFailed = results.find((r) => r.check === 'build')?.status === 'fail';
  if (buildFailed) {
    logResult(
      'runtime checks',
      'skip',
      'skipped because build failed',
      'runtime gates require a successful production build',
    );
  } else {
    await runRuntimeChecks();
  }

  writeFileSync(reportPath, buildMarkdownReport(), 'utf8');
  console.log(`\nReport written to ${reportPath}`);

  const anyFail = results.some((r) => r.status === 'fail');
  process.exit(anyFail ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
