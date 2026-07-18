import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
];

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
const appUrl = `http://127.0.0.1:${appPort}/`;

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

async function waitForJson(url, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // Chrome is still starting.
    }
    await wait(100);
  }
  throw new Error(`Chrome DevTools did not become ready: ${url}`);
}

function connectCdp(url) {
  return new Promise((resolvePromise, reject) => {
    const socket = new WebSocket(url);
    const pending = new Map();
    let id = 0;

    socket.addEventListener('open', () => {
      resolvePromise({
        call(method, params = {}) {
          id += 1;
          const currentId = id;
          socket.send(JSON.stringify({ id: currentId, method, params }));
          return new Promise((resolveCall, rejectCall) => {
            pending.set(currentId, { resolve: resolveCall, reject: rejectCall });
          });
        },
        close: () => socket.close(),
      });
    });

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !pending.has(message.id)) return;
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    });

    socket.addEventListener('error', () => reject(new Error('Chrome DevTools connection failed')));
  });
}

async function smokeViewport(viewport) {
  const debugPort = await getFreePort();
  const profile = mkdtempSync(join(tmpdir(), `lembar-${viewport.name}-`));
  const browser = spawn(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profile}`,
      `--window-size=${viewport.width},${viewport.height}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  try {
    const pages = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`);
    const page = pages.find((candidate) => candidate.type === 'page');
    if (!page) throw new Error('Chrome did not expose a page target');

    const cdp = await connectCdp(page.webSocketDebuggerUrl);
    try {
      await cdp.call('Emulation.setDeviceMetricsOverride', {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: viewport.name === 'mobile',
      });
      await cdp.call('Page.navigate', { url: appUrl });

      for (let attempt = 0; attempt < 40; attempt += 1) {
        const ready = await cdp.call('Runtime.evaluate', {
          expression: "document.readyState === 'complete'",
          returnByValue: true,
        });
        if (ready.result.value) break;
        await wait(100);
      }

      const evaluated = await cdp.call('Runtime.evaluate', {
        expression: `(() => {
          const html = document.documentElement;
          const body = document.body;
          return {
            wordmark: document.querySelector('.nav__wordmark')?.textContent?.trim(),
            heading: document.querySelector('h1')?.textContent?.trim(),
            lang: html.lang,
            innerWidth: window.innerWidth,
            clientWidth: html.clientWidth,
            scrollWidth: Math.max(html.scrollWidth, body.scrollWidth),
          };
        })()`,
        returnByValue: true,
      });
      const result = evaluated.result.value;
      const overflow = result.scrollWidth > result.innerWidth;
      const report = { viewport: viewport.name, ...result, overflow };
      console.log(JSON.stringify(report));

      if (result.wordmark !== 'lembar')
        throw new Error(`${viewport.name}: lowercase wordmark missing`);
      if (
        result.heading !==
        'Buat lembar soal siap cetak dalam hitungan menit — draf AI, tinjauan guru, hasil akhir.'
      ) {
        throw new Error(`${viewport.name}: Indonesian hero heading missing`);
      }
      if (result.lang !== 'id') throw new Error(`${viewport.name}: html lang must be id`);
      if (result.innerWidth !== viewport.width) {
        throw new Error(
          `${viewport.name}: expected width ${viewport.width}, got ${result.innerWidth}`,
        );
      }
      if (overflow) {
        throw new Error(
          `${viewport.name}: horizontal overflow ${result.scrollWidth}px > ${result.innerWidth}px`,
        );
      }
    } finally {
      cdp.close();
    }
  } finally {
    browser.kill('SIGTERM');
    rmSync(profile, { recursive: true, force: true });
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

try {
  const response = await waitForHttp(appUrl);
  console.log(JSON.stringify({ httpStatus: response.status, url: appUrl }));
  for (const viewport of viewports) await smokeViewport(viewport);
  console.log('Browser smoke passed at desktop and 390px.');
} catch (error) {
  console.error(serverOutput.trim());
  throw error;
} finally {
  server.kill('SIGTERM');
}
