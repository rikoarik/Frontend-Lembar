import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const evidenceDir = resolve('.figma-evidence');
mkdirSync(evidenceDir, { recursive: true });

const routes = [
  {
    name: 'home',
    path: '/',
    file: 'landing-local-desktop.png',
    heading: 'Dari materi menjadi lembar ujian yang siap ditinjau.',
    proofTitles: ['Pilih materi', 'Tinjau draft', 'Gunakan hasil'],
    finalButtons: ['Buat lembar gratis'],
    activeNavLabel: 'Produk',
  },
  {
    name: 'school',
    path: '/untuk-sekolah',
    file: 'untuk-sekolah-local-desktop.png',
    heading: 'Workspace Organisasi untuk Institusi Sekolah',
    finalButtons: ['Diskusikan kebutuhan sekolah'],
    activeNavLabel: 'Untuk Sekolah',
  },
  {
    name: 'pricing',
    path: '/harga',
    file: 'harga-local-desktop.png',
    heading: 'Pilih paket yang sesuai untuk kebutuhan mengajar Anda.',
    finalButtons: ['Daftar Sekarang'],
    activeNavLabel: 'Harga',
  },
];

const mobileRoutes = routes.map((route) => ({
  ...route,
  file: route.file.replace('-desktop.png', '-390.png'),
}));

function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : null;
      server.close(() => {
        if (port) resolvePort(port);
        else reject(new Error('Could not allocate a free port'));
      });
    });
  });
}

const appPort = await getFreePort();
const appUrl = `http://127.0.0.1:${appPort}`;

function wait(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function waitForHttp(url, attempts = 60) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // Server is still starting.
    }
    await wait(250);
  }
  throw new Error(`Server did not become ready: ${url}`);
}

async function smokeViewport(browser, viewport, routeList) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  try {
    for (const route of routeList) {
      await page.goto(`${appUrl}${route.path}`, { waitUntil: 'networkidle' });

      const result = await page.evaluate((expected) => {
        const html = document.documentElement;
        const body = document.body;
        const logo = document.querySelector('.nav__mark');
        const proofTitles = Array.from(document.querySelectorAll('.proof__title')).map((node) =>
          node.textContent.trim(),
        );
        const trust = document.querySelector('.trust__inner');
        const finalButtons = Array.from(
          document.querySelectorAll('.final-cta a, .pricing-final a, .school-final a'),
        ).map((node) => node.textContent.trim());
        const activeLink = document.querySelector('.nav__link--active');
        return {
          wordmark: document.querySelector('.nav__wordmark')?.textContent?.trim(),
          heading: document.querySelector('h1')?.textContent?.trim(),
          lang: html.lang,
          innerWidth: window.innerWidth,
          clientWidth: html.clientWidth,
          scrollWidth: Math.max(html.scrollWidth, body.scrollWidth),
          iconsaxSvgs: document.querySelectorAll('svg[viewBox="0 0 24 24"]').length,
          logoNaturalWidth: logo?.naturalWidth ?? 0,
          proofTitles,
          trustPresent: Boolean(trust),
          trustBg: trust ? getComputedStyle(trust).backgroundColor : null,
          finalButtons,
          activeNavLabel: activeLink?.textContent?.trim(),
        };
      }, route.heading);

      const screenshotPath = resolve(evidenceDir, route.file);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const overflow = result.scrollWidth > result.innerWidth;
      const report = {
        route: route.name,
        viewport: viewport.name,
        screenshot: screenshotPath,
        ...result,
        overflow,
      };
      console.log(JSON.stringify(report));

      if (result.wordmark !== 'lembar') throw new Error(`${route.name}: wordmark missing`);
      if (result.heading !== route.heading)
        throw new Error(`${route.name}: heading mismatch (${result.heading})`);
      if (result.lang !== 'id') throw new Error(`${route.name}: html lang must be id`);
      if (result.innerWidth !== viewport.width)
        throw new Error(`${route.name}: viewport width ${result.innerWidth} !== ${viewport.width}`);
      if (overflow)
        throw new Error(`${route.name}: overflow ${result.scrollWidth} > ${result.innerWidth}`);
      if (result.logoNaturalWidth <= 0)
        throw new Error(`${route.name}: logo naturalWidth must be > 0`);
      if (result.activeNavLabel !== route.activeNavLabel) {
        throw new Error(
          `${route.name}: expected active nav "${route.activeNavLabel}", got "${result.activeNavLabel}"`,
        );
      }
      if (route.proofTitles) {
        for (const expected of route.proofTitles) {
          if (!result.proofTitles.includes(expected))
            throw new Error(`${route.name}: proof missing "${expected}"`);
        }
      }
      if (route.name === 'home') {
        if (!result.trustPresent) throw new Error('home: trust block missing');
        if (!result.trustBg || !/rgb\(23, *23, *23\)|rgba\(23, *23, *23/.test(result.trustBg)) {
          throw new Error(`home: trust background must be ink #171717, got ${result.trustBg}`);
        }
      }
      for (const expected of route.finalButtons) {
        if (!result.finalButtons.some((label) => label.includes(expected)))
          throw new Error(`${route.name}: final CTA missing "${expected}"`);
      }
    }
  } finally {
    await context.close();
  }
}

const server = spawn(resolve('node_modules/.bin/next'), ['dev', '-p', String(appPort)], {
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '';
server.stdout.on('data', (chunk) => {
  serverOutput += chunk;
});
server.stderr.on('data', (chunk) => {
  serverOutput += chunk;
});

let browser;
try {
  const response = await waitForHttp(appUrl);
  console.log(JSON.stringify({ httpStatus: response.status, url: appUrl }));
  browser = await chromium.launch({ executablePath: chrome, headless: true });
  await smokeViewport(browser, { name: 'desktop', width: 1280, height: 800 }, routes);
  await smokeViewport(browser, { name: 'mobile', width: 390, height: 844 }, mobileRoutes);
  console.log('Playwright browser smoke passed for all routes at desktop and 390px.');
} catch (error) {
  console.error(serverOutput.trim());
  throw error;
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
