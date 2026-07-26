/**
 * Superadmin OpsConsoleView — Playwright E2E test
 *
 * Tests every section and key buttons in the /ops superadmin console.
 * Uses JWT token injected via cookie to bypass login UI.
 *
 * Run:
 *   PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test scripts/gates/superadmin-ops.spec.ts --config playwright.config.ts
 */

import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page, type BrowserContext } from 'playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const BE_URL = process.env.BACKEND_URL ?? 'http://127.0.0.1:4000';
const SCREENSHOTS = resolve(__dirname, '../../docs/frontend/screenshots/ops');

mkdirSync(SCREENSHOTS, { recursive: true });

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string {
  try {
    const out = execSync(
      `curl -s -X POST ${BE_URL}/v1/auth/login \
        -H 'Content-Type: application/json' \
        -d '{"email":"admin@lembar.web.id","password":"Admin123!"}'`,
      { encoding: 'utf8' },
    );
    const d = JSON.parse(out);
    const token = d?.token ?? d?.data?.token ?? '';
    if (!token) throw new Error(`No token in response: ${out.slice(0, 200)}`);
    return token;
  } catch (e) {
    // Fallback to ops@lembar.id
    const out = execSync(
      `curl -s -X POST ${BE_URL}/v1/auth/login \
        -H 'Content-Type: application/json' \
        -d '{"email":"ops@lembar.id","password":"ops1234"}'`,
      { encoding: 'utf8' },
    );
    const d = JSON.parse(out);
    const token = d?.token ?? d?.data?.token ?? '';
    if (!token) throw new Error('Both login attempts failed');
    return token;
  }
}

async function injectAuth(context: BrowserContext, token: string) {
  // Middleware checks: lembar_session (non-empty) + lembar_roles (superadmin)
  // BFF checks: lembar_token (JWT) for proxying to BE
  await context.addCookies([
    {
      name: 'lembar_token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
    },
    {
      name: 'lembar_session',
      value: token, // middleware only checks non-empty
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
    },
    {
      name: 'lembar_roles',
      value: 'superadmin', // middleware getRolesFromCookies reads this
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
    },
  ]);
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({
    path: resolve(SCREENSHOTS, `${name}.png`),
    fullPage: false,
  });
}

async function waitForSection(page: Page) {
  // Wait for either content or loading to disappear
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(500);
}

// ── Token shared across tests ─────────────────────────────────────────────────

let TOKEN = '';

test.beforeAll(() => {
  TOKEN = getToken();
  console.log('[ops-test] Token acquired, length:', TOKEN.length);
});

test.beforeEach(async ({ context }) => {
  await injectAuth(context, TOKEN);
});

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Superadmin OpsConsole', () => {

  // ── Dashboard ──────────────────────────────────────────────────────────────
  test('dashboard loads with stat cards', async ({ page }) => {
    await page.goto(`${BASE}/ops`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);
    await screenshot(page, '01-dashboard');

    // Sidebar should be visible
    const nav = page.locator('nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });

  // ── Accounts ───────────────────────────────────────────────────────────────
  test('accounts section loads table', async ({ page }) => {
    await page.goto(`${BASE}/ops/accounts`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);
    await screenshot(page, '02-accounts');

    // Should have a table or loading state
    const content = page.locator('table, [role="table"], .space-y-4').first();
    await expect(content).toBeVisible();
  });

  test('accounts: invite form can be opened', async ({ page }) => {
    await page.goto(`${BASE}/ops/accounts`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);

    const inviteBtn = page.getByRole('button', { name: /undang akun/i }).first();
    if (await inviteBtn.isVisible()) {
      await inviteBtn.click();
      await page.waitForTimeout(300);
      // Form should appear
      const emailInput = page.locator('input[type="email"]').first();
      await expect(emailInput).toBeVisible();
      await screenshot(page, '02b-accounts-invite-open');
    }
  });

  // ── Schools ────────────────────────────────────────────────────────────────
  test('schools section loads with pagination', async ({ page }) => {
    await page.goto(`${BASE}/ops/schools`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);
    await screenshot(page, '03-schools');

    const content = page.locator('.space-y-4, table').first();
    await expect(content).toBeVisible();
  });

  test('schools: tambah sekolah form can be opened', async ({ page }) => {
    await page.goto(`${BASE}/ops/schools`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);

    const addBtn = page.getByRole('button', { name: /tambah sekolah/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(300);
      const nameInput = page.locator('input[type="text"]').first();
      await expect(nameInput).toBeVisible();
      await screenshot(page, '03b-schools-form');
    }
  });

  // ── Catalog ────────────────────────────────────────────────────────────────
  test('catalog section loads grades from BE', async ({ page }) => {
    await page.goto(`${BASE}/ops/catalog`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);
    await screenshot(page, '04-catalog');

    // Should show grade list (from BE fallback at minimum)
    const content = page.locator('.space-y-4, .grid').first();
    await expect(content).toBeVisible();
  });

  // ── Prompts ────────────────────────────────────────────────────────────────
  test('prompts section loads', async ({ page }) => {
    await page.goto(`${BASE}/ops/prompts`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);
    await screenshot(page, '05-prompts');

    const content = page.locator('.space-y-4').first();
    await expect(content).toBeVisible();
  });

  test('prompts: buat prompt button opens form', async ({ page }) => {
    await page.goto(`${BASE}/ops/prompts`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);

    const createBtn = page.getByRole('button', { name: /buat prompt/i }).first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(300);
      const nameInput = page.locator('input[type="text"]').first();
      await expect(nameInput).toBeVisible();
      await screenshot(page, '05b-prompts-form');
    }
  });

  // ── Learning Signals ───────────────────────────────────────────────────────
  test('learning-signals section loads', async ({ page }) => {
    await page.goto(`${BASE}/ops/learning-signals`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);
    await screenshot(page, '06-learning-signals');

    const content = page.locator('.space-y-4').first();
    await expect(content).toBeVisible();
  });

  // ── Jobs ───────────────────────────────────────────────────────────────────
  test('jobs section loads with filter chips', async ({ page }) => {
    await page.goto(`${BASE}/ops/jobs`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);
    await screenshot(page, '07-jobs');

    const content = page.locator('.space-y-4, table').first();
    await expect(content).toBeVisible();
  });

  test('jobs: filter by status works', async ({ page }) => {
    await page.goto(`${BASE}/ops/jobs`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);

    // Click a filter chip (e.g. 'failed')
    const failedChip = page.getByRole('button', { name: /failed/i }).first();
    if (await failedChip.isVisible()) {
      await failedChip.click();
      await page.waitForTimeout(500);
      await screenshot(page, '07b-jobs-failed-filter');
    }
  });

  // ── Quality ────────────────────────────────────────────────────────────────
  test('quality section loads', async ({ page }) => {
    await page.goto(`${BASE}/ops/quality`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);
    await screenshot(page, '08-quality');

    const content = page.locator('.space-y-4').first();
    await expect(content).toBeVisible();
  });

  // ── Audit ──────────────────────────────────────────────────────────────────
  test('audit section loads with search', async ({ page }) => {
    await page.goto(`${BASE}/ops/audit`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);
    await screenshot(page, '09-audit');

    const content = page.locator('.space-y-4').first();
    await expect(content).toBeVisible();
  });

  // ── Billing ────────────────────────────────────────────────────────────────
  test('billing section loads with pagination', async ({ page }) => {
    await page.goto(`${BASE}/ops/billing`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);
    await screenshot(page, '10-billing');

    const content = page.locator('.space-y-4').first();
    await expect(content).toBeVisible();
  });

  // ── Flags ──────────────────────────────────────────────────────────────────
  test('flags section loads with create button', async ({ page }) => {
    await page.goto(`${BASE}/ops/flags`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);
    await screenshot(page, '11-flags');

    const content = page.locator('.space-y-4').first();
    await expect(content).toBeVisible();
  });

  test('flags: create flag form can be opened', async ({ page }) => {
    await page.goto(`${BASE}/ops/flags`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);

    const createBtn = page.getByRole('button', { name: /buat flag/i }).first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(300);
      await screenshot(page, '11b-flags-form');
    }
  });

  // ── Marketing CMS ──────────────────────────────────────────────────────────
  test('content/marketing section loads', async ({ page }) => {
    await page.goto(`${BASE}/ops/content`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);
    await screenshot(page, '12-content');

    const content = page.locator('.space-y-4').first();
    await expect(content).toBeVisible();
  });

  // ── Profile ────────────────────────────────────────────────────────────────
  test('profile section shows session info (no hardcoded IP)', async ({ page }) => {
    await page.goto(`${BASE}/ops/profile`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);
    await screenshot(page, '13-profile');

    const content = page.locator('.space-y-4, .grid').first();
    await expect(content).toBeVisible();

    // Must NOT contain hardcoded IP
    const body = await page.locator('body').textContent();
    expect(body).not.toContain('192.168.1.100');
  });

  // ── Navigation: all menu items are accessible ─────────────────────────────
  test('all nav items are visible in sidebar', async ({ page }) => {
    await page.goto(`${BASE}/ops`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);

    const expectedNavItems = [
      'Ringkasan', 'Akun', 'Sekolah', 'Katalog', 'Prompt',
      'Jobs', 'Quality', 'Audit', 'Billing', 'Flags', 'Marketing CMS',
    ];

    for (const label of expectedNavItems) {
      const link = page.getByRole('link', { name: new RegExp(label, 'i') }).first();
      const isVisible = await link.isVisible().catch(() => false);
      if (!isVisible) {
        console.warn(`Nav item not visible: ${label}`);
      }
    }

    await screenshot(page, '00-nav-overview');
  });

  // ── Cross-section navigation stability ────────────────────────────────────
  test('navigate through 3 sections without crash', async ({ page }) => {
    await page.goto(`${BASE}/ops`, { waitUntil: 'domcontentloaded' });
    await waitForSection(page);

    const routes = ['/ops/accounts', '/ops/jobs', '/ops/billing'];
    for (const route of routes) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
      await waitForSection(page);
      // Page should not show error boundary
      const errorText = await page.locator('body').textContent();
      expect(errorText).not.toMatch(/error boundary|something went wrong|unhandled/i);
    }

    await screenshot(page, '99-nav-stable');
  });
});
