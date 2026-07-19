import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'playwright/test';

const SCREENSHOTS_DIR = resolve(__dirname, '../../docs/frontend/screenshots');
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const ROUTES = [
  {
    name: 'home',
    path: '/',
    heading: /lembar ujian yang siap ditinjau/i,
    cta: /Buat lembar gratis/i,
  },
  {
    name: 'untuk-sekolah',
    path: '/untuk-sekolah',
    heading: /Workspace Organisasi untuk Institusi Sekolah/i,
    cta: /Diskusikan kebutuhan sekolah/i,
  },
  {
    name: 'harga',
    path: '/harga',
    heading: /Pilih paket yang sesuai untuk kebutuhan mengajar Anda\./i,
    cta: /Daftar Sekarang/i,
  },
] as const;

for (const route of ROUTES) {
  test(`${route.name} renders`, async ({ page }, testInfo) => {
    await page.goto(route.path, { waitUntil: 'networkidle' });

    await expect(page.getByLabel(/lembar.*beranda/i)).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(route.heading);
    await expect(page.getByRole('link', { name: route.cta })).toBeVisible();

    const lang = await page.evaluate(() => document.documentElement.lang);
    expect(lang).toBe('id');

    const hasOverflow = await page.evaluate(() => {
      const html = document.documentElement;
      const body = document.body;
      return Math.max(html.scrollWidth, body.scrollWidth) > window.innerWidth;
    });
    expect(hasOverflow, `${route.name} should not overflow at ${testInfo.project.name}`).toBe(
      false,
    );

    await page.screenshot({
      path: resolve(SCREENSHOTS_DIR, `${route.name}.${testInfo.project.name}.png`),
      fullPage: true,
    });
  });
}
