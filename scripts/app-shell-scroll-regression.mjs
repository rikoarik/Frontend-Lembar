import { chromium } from 'playwright';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
await context.addCookies([{ name: 'lembar_session', value: 'teacher', url: baseURL }]);
const page = await context.newPage();

try {
  await page.goto(`${baseURL}/app/generate`, { waitUntil: 'networkidle' });
  if (new URL(page.url()).pathname !== '/app/generate') {
    throw new Error(`Route redirected to ${page.url()}`);
  }

  const before = await page.evaluate(() => {
    const html = document.documentElement;
    const body = document.body;
    const main = document.querySelector('#konten-utama');
    const sidebar = document.querySelector('nav[aria-label="Navigasi utama"]');
    if (!(main instanceof HTMLElement) || !(sidebar instanceof HTMLElement)) {
      throw new Error('App shell elements not found');
    }
    const overflowOwners = [html, body, ...body.querySelectorAll('*')]
      .filter((node) => node instanceof HTMLElement && node.scrollHeight > node.clientHeight)
      .map((node) => ({
        tag: node.tagName,
        id: node.id,
        className: node.className,
        clientHeight: node.clientHeight,
        scrollHeight: node.scrollHeight,
        overflowY: getComputedStyle(node).overflowY,
      }));
    return {
      viewportHeight: window.innerHeight,
      windowScrollY: window.scrollY,
      html: { clientHeight: html.clientHeight, scrollHeight: html.scrollHeight },
      body: { clientHeight: body.clientHeight, scrollHeight: body.scrollHeight },
      main: { clientHeight: main.clientHeight, scrollHeight: main.scrollHeight, overflowY: getComputedStyle(main).overflowY },
      sidebarTop: sidebar.getBoundingClientRect().top,
      overflowOwners,
    };
  });

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const afterWindowScroll = await page.evaluate(() => ({
    windowScrollY: window.scrollY,
    sidebarTop: document.querySelector('nav[aria-label="Navigasi utama"]')?.getBoundingClientRect().top,
  }));

  await page.locator('#konten-utama').evaluate((main) => { main.scrollTop = main.scrollHeight; });
  const afterMainScroll = await page.evaluate(() => ({
    windowScrollY: window.scrollY,
    mainScrollTop: document.querySelector('#konten-utama')?.scrollTop,
    sidebarTop: document.querySelector('nav[aria-label="Navigasi utama"]')?.getBoundingClientRect().top,
  }));

  console.log(JSON.stringify({ before, afterWindowScroll, afterMainScroll }, null, 2));

  const bodyDoesNotScroll = before.html.scrollHeight === before.viewportHeight && before.body.scrollHeight === before.viewportHeight;
  const mainOwnsOverflow = before.main.scrollHeight > before.main.clientHeight && before.main.overflowY === 'auto';
  const sidebarStaysPut = afterMainScroll.sidebarTop === before.sidebarTop && afterMainScroll.windowScrollY === 0;
  if (!bodyDoesNotScroll || !mainOwnsOverflow || !sidebarStaysPut) {
    throw new Error(`Scroll regression: ${JSON.stringify({ bodyDoesNotScroll, mainOwnsOverflow, sidebarStaysPut })}`);
  }
} finally {
  await browser.close();
}
