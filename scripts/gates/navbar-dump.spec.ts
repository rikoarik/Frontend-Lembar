import { test } from 'playwright/test';

const ROUTES = ['/', '/harga', '/untuk-sekolah', '/privasi', '/syarat'];
test('count headers/navs', async ({ page }) => {
  for (const r of ROUTES) {
    await page.goto(r, { waitUntil: 'networkidle' });
    const h = await page.locator('header').count();
    const n = await page.locator('nav').count();
    console.log(`${r} => header=${h} nav=${n}`);
  }
});
