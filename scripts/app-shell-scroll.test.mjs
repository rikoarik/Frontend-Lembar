import { chromium } from 'playwright';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
await context.addCookies([{ name: 'lembar_session', value: 'teacher', url: baseURL }]);
const page = await context.newPage();

try {
  await page.goto(`${baseURL}/app/generate`, { waitUntil: 'networkidle' });
  const before = await page.evaluate(() => {
    const shell = document.querySelector('[data-app-shell]');
    const main = document.querySelector('#konten-utama');
    const sidebar = document.querySelector('nav[aria-label="Navigasi utama"]');
    if (
      !(shell instanceof HTMLElement) ||
      !(main instanceof HTMLElement) ||
      !(sidebar instanceof HTMLElement)
    ) {
      throw new Error('App shell elements not found');
    }
    const shellRect = shell.getBoundingClientRect();
    return {
      viewportHeight: window.innerHeight,
      rootScrollHeight: document.documentElement.scrollHeight,
      shellTop: shellRect.top,
      shellBottom: shellRect.bottom,
      shellHeight: shellRect.height,
      mainClientHeight: main.clientHeight,
      mainScrollHeight: main.scrollHeight,
      mainOverflowY: getComputedStyle(main).overflowY,
      sidebarTop: sidebar.getBoundingClientRect().top,
    };
  });

  const detailReviewMode = page.getByRole('radio', { name: /Detail/i });
  await detailReviewMode.scrollIntoViewIfNeeded();
  await detailReviewMode.click();
  const afterReviewModeChange = await page.evaluate(() => {
    const shell = document.querySelector('[data-app-shell]');
    const detail = document.querySelector('input[name="reviewMode"][value="detail"]');
    if (!(shell instanceof HTMLElement) || !(detail instanceof HTMLInputElement)) {
      throw new Error('Review mode controls not found');
    }
    const shellRect = shell.getBoundingClientRect();
    return {
      windowScrollY: window.scrollY,
      viewportHeight: window.innerHeight,
      shellTop: shellRect.top,
      shellBottom: shellRect.bottom,
      shellHeight: shellRect.height,
      detailChecked: detail.checked,
    };
  });

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.locator('#konten-utama').evaluate((main) => {
    main.scrollTop = main.scrollHeight;
  });
  const after = await page.evaluate(() => ({
    windowScrollY: window.scrollY,
    mainScrollTop: document.querySelector('#konten-utama')?.scrollTop ?? 0,
    sidebarTop: document.querySelector('nav[aria-label="Navigasi utama"]')?.getBoundingClientRect()
      .top,
  }));

  const shellFillsViewport = (snapshot) =>
    Math.abs(snapshot.shellTop) <= 1 &&
    Math.abs(snapshot.shellBottom - snapshot.viewportHeight) <= 1 &&
    Math.abs(snapshot.shellHeight - snapshot.viewportHeight) <= 1;

  if (
    before.rootScrollHeight !== before.viewportHeight ||
    !shellFillsViewport(before) ||
    before.mainScrollHeight <= before.mainClientHeight ||
    before.mainOverflowY !== 'auto' ||
    afterReviewModeChange.windowScrollY !== 0 ||
    !shellFillsViewport(afterReviewModeChange) ||
    !afterReviewModeChange.detailChecked ||
    after.windowScrollY !== 0 ||
    after.mainScrollTop <= 0 ||
    after.sidebarTop !== before.sidebarTop
  ) {
    throw new Error(
      `App shell scroll regression: ${JSON.stringify({ before, afterReviewModeChange, after })}`,
    );
  }

  console.log(JSON.stringify({ before, afterReviewModeChange, after }));
} finally {
  await browser.close();
}
