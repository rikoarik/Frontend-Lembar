import { chromium } from 'playwright';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
await context.addCookies([{ name: 'lembar_session', value: 'teacher', url: baseURL }]);
const page = await context.newPage();

try {
  await page.goto(`${baseURL}/app/generate`, { waitUntil: 'networkidle' });
  const before = await page.evaluate(() => {
    const main = document.querySelector('#konten-utama');
    const sidebar = document.querySelector('nav[aria-label="Navigasi utama"]');
    if (!(main instanceof HTMLElement) || !(sidebar instanceof HTMLElement)) {
      throw new Error('App shell elements not found');
    }
    return {
      viewportHeight: window.innerHeight,
      rootScrollHeight: document.documentElement.scrollHeight,
      mainClientHeight: main.clientHeight,
      mainScrollHeight: main.scrollHeight,
      mainOverflowY: getComputedStyle(main).overflowY,
      sidebarTop: sidebar.getBoundingClientRect().top,
    };
  });

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.locator('#konten-utama').evaluate((main) => {
    main.scrollTop = main.scrollHeight;
  });
  const after = await page.evaluate(() => ({
    windowScrollY: window.scrollY,
    mainScrollTop: document.querySelector('#konten-utama')?.scrollTop ?? 0,
    sidebarTop: document
      .querySelector('nav[aria-label="Navigasi utama"]')
      ?.getBoundingClientRect().top,
  }));

  if (
    before.rootScrollHeight !== before.viewportHeight ||
    before.mainScrollHeight <= before.mainClientHeight ||
    before.mainOverflowY !== 'auto' ||
    after.windowScrollY !== 0 ||
    after.mainScrollTop <= 0 ||
    after.sidebarTop !== before.sidebarTop
  ) {
    throw new Error(`App shell scroll regression: ${JSON.stringify({ before, after })}`);
  }

  console.log(JSON.stringify({ before, after }));
} finally {
  await browser.close();
}
