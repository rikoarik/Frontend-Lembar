import { resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { expect, test } from 'playwright/test';

const SCREENSHOTS_DIR = resolve(__dirname, '../../docs/frontend/screenshots/navbar-audit');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// Routes that SHOULD render the shared MarketingNavbar (header + nav links + CTA).
const NAV_ROUTES = [
  { name: 'home', path: '/' },
  { name: 'harga', path: '/harga' },
  { name: 'untuk-sekolah', path: '/untuk-sekolah' },
  { name: 'privasi', path: '/privasi' },
  { name: 'syarat', path: '/syarat' },
] as const;

for (const route of NAV_ROUTES) {
  test(`${route.name} nav header present`, async ({ page }, testInfo) => {
    await page.goto(route.path, { waitUntil: 'networkidle' });

    // Shared header must exist (MarketingNavbar / sub-page back-link fallback).
    const header = page.getByRole('banner').or(page.locator('header'));
    await expect(header.first()).toBeVisible();

    // Nav links: Beranda, Harga, Untuk Sekolah must be present.
    for (const label of ['Beranda', 'Harga', 'Untuk Sekolah']) {
      await expect(page.getByRole('link', { name: label, exact: true }).first()).toBeVisible();
    }

    // CTA buttons visible.
    await expect(page.getByRole('link', { name: 'Buat lembar gratis' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Masuk' }).first()).toBeVisible();

    await page.screenshot({
      path: resolve(SCREENSHOTS_DIR, `${route.name}.${testInfo.project.name}.png`),
      fullPage: false,
    });
  });
}
