import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';

const OUT = '/home/hermes/dogfood-output/lembar-full-qa-2026-08-04/playwright-screenshots';
const APP = 'https://app.lembar.web.id';
const CREDS = JSON.parse(readFileSync('/tmp/lembar-role-creds.json', 'utf8'));
const TEACHER = CREDS.find(c => c.role === 'teacher');
const SUBSCRIBER = CREDS.find(c => c.role === 'subscriber');

await mkdir(OUT, { recursive: true });

const results = [];
let screenshotIndex = 0;

async function shot(page, label) {
  const fname = `${String(++screenshotIndex).padStart(2,'0')}-${label}.png`;
  const p = path.join(OUT, fname);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`  [SHOT] ${fname}`);
  return p;
}

async function runRole(roleLabel, email, password) {
  console.log(`\n=== Playwright: ${roleLabel} ===`);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const consoleErrs = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()); });
  page.on('pageerror', e => consoleErrs.push(e.message));

  const step = async (name, fn) => {
    try {
      const r = await fn();
      results.push({ role: roleLabel, step: name, pass: true, note: r ?? '' });
      console.log(`  [PASS] ${name}`);
    } catch(e) {
      results.push({ role: roleLabel, step: name, pass: false, note: e.message.slice(0,300) });
      console.log(`  [FAIL] ${name}: ${e.message.slice(0,120)}`);
      await shot(page, `${roleLabel.toLowerCase()}-FAIL-${name.replace(/\s+/g,'-')}`).catch(()=>{});
    }
  };

  // ── login
  await step('navigate login', async () => {
    await page.goto(`${APP}/masuk`, { waitUntil: 'networkidle' });
    return page.url();
  });
  await shot(page, `${roleLabel.toLowerCase()}-01-login-page`);

  await step('fill credentials', async () => {
    await page.locator('input:not([type="password"]):visible').first().fill(email);
    await page.locator('input[type="password"]:visible').first().fill(password);
    await page.getByRole('button', { name: /^masuk$/i }).click();
    await page.waitForURL(url => url.pathname.startsWith('/app'), { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    return page.url();
  });
  await shot(page, `${roleLabel.toLowerCase()}-02-post-login`);

  // ── dashboard
  await step('dashboard visible', async () => {
    await page.goto(`${APP}/app`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Buat lembar', { timeout: 10000 });
    return 'ok';
  });
  await shot(page, `${roleLabel.toLowerCase()}-03-dashboard`);

  // ── generate form loads
  await step('generate page loads', async () => {
    await page.goto(`${APP}/app/generate`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    return page.url();
  });
  await shot(page, `${roleLabel.toLowerCase()}-04-generate-form`);

  // ── fill kurikulum (native select via JS)
  await step('select curriculum', async () => {
    // Wait for any select element that has curriculum options
    await page.locator('#compose-curriculumVersionId').waitFor({ state: 'visible', timeout: 8000 });
    const sel = page.locator('#compose-curriculumVersionId');
    const opts = await sel.locator('option').allTextContents();
    console.log(`    curriculum opts: ${opts.slice(0,5).join(', ')}`);
    // Pick first non-empty option
    const val = 'k13';
    await sel.selectOption(val);
    return `selected: ${val}`;
  });

  // ── grade select (wait for it to enable after curriculum loads)
  await step('select grade', async () => {
    await page.waitForTimeout(1500);
    await page.waitForTimeout(500);
    const select = page.locator('#compose-gradeId');
    const options = await select.locator('option').all();
    let gradeVal = null;
    for (const option of options) {
      const text = await option.textContent();
      if (/Kelas 7 SMP/i.test(text || '')) { gradeVal = await option.getAttribute('value'); break; }
    }
    if (!gradeVal) gradeVal = await select.locator('option').nth(1).getAttribute('value');
    if (gradeVal) await select.selectOption(gradeVal);
    if (!gradeVal) throw new Error('grade select not found or no options');
    return `grade: ${gradeVal}`;
  });

  // ── subject select
  await step('select subject', async () => {
    await page.waitForTimeout(1500);
    const select = page.locator('#compose-subjectId');
    await page.waitForFunction(() => !document.querySelector('#compose-subjectId')?.disabled, { timeout: 15000 });
    await page.waitForFunction(() => document.querySelector('#compose-subjectId')?.options.length > 1, { timeout: 15000 });
    const subjectVal = await select.locator('option').nth(1).getAttribute('value');
    if (subjectVal) await select.selectOption(subjectVal);
    if (!subjectVal) throw new Error('subject select not found');
    await page.waitForFunction(() => document.querySelectorAll('[aria-label="Pilih materi"] input[type="checkbox"]').length > 0);
    await page.locator('[aria-label="Pilih materi"] input[type="checkbox"]').first().check();
    return `subject: ${subjectVal}`;
  });

  await shot(page, `${roleLabel.toLowerCase()}-05-generate-filled`);

  // ── submit
  await step('submit generate', async () => {
    // Click the primary submit / generate button
    const btn = page.locator('button[type="submit"]');
    await btn.scrollIntoViewIfNeeded();
    await btn.waitFor({ state: 'visible', timeout: 10000 });
    const isDisabled = await btn.evaluate(b => b.disabled);
    console.log('  [INFO] submit button disabled:', isDisabled);
    if (isDisabled) throw new Error('submit button is disabled — form validation incomplete');
    await btn.click();
    // Wait for job page or error
    await Promise.race([
      page.waitForURL(/\/(jobs|output|riwayat|app\/generate)/, { timeout: 30000 }),
      page.waitForSelector('[data-testid="job-progress"], [data-testid="error-message"], text=sedang dibuat', { timeout: 30000 }),
    ]);
    return page.url();
  });
  await shot(page, `${roleLabel.toLowerCase()}-06-post-submit`);

  // ── poll job page (if redirected)
  await step('job progress or completion', async () => {
    const url = page.url();
    // If on a job/progress page, wait for terminal state
    if (/jobs|output/.test(url)) {
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(3000);
        const txt = await page.locator('body').innerText().catch(() => '');
        if (/selesai|completed|gagal|failed|error/i.test(txt)) {
          return `terminal: ${url}`;
        }
        await shot(page, `${roleLabel.toLowerCase()}-07-job-poll-${i+1}`).catch(()=>{});
      }
      return 'poll timeout 60s';
    }
    return `stayed at: ${url}`;
  });
  await shot(page, `${roleLabel.toLowerCase()}-07-job-final`);

  // ── riwayat
  await step('riwayat page', async () => {
    await page.goto(`${APP}/app/riwayat`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    const txt = await page.locator('body').innerText().catch(() => '');
    if (!/riwayat/i.test(txt)) throw new Error('riwayat header not found');
    return 'ok';
  });
  await shot(page, `${roleLabel.toLowerCase()}-08-riwayat`);

  // ── langganan
  await step('langganan page', async () => {
    await page.goto(`${APP}/app/pengaturan/langganan`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    return page.url();
  });
  await shot(page, `${roleLabel.toLowerCase()}-09-langganan`);

  // ── ops guard
  await step('ops/jobs guard redirect', async () => {
    await page.goto(`${APP}/ops/jobs`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const url = page.url();
    if (/ops\/jobs/.test(url)) throw new Error(`NOT redirected — still at ${url}`);
    return `redirected to ${url}`;
  });
  await shot(page, `${roleLabel.toLowerCase()}-10-ops-guard`);

  // capture any console errors
  if (consoleErrs.length) {
    results.push({ role: roleLabel, step: 'console errors', pass: false, note: consoleErrs.slice(0,5).join(' | ') });
    console.log(`  [WARN] ${consoleErrs.length} console error(s)`);
  }

  await browser.close();
}

try { await runRole('teacher', TEACHER.email, TEACHER.password); } catch(e) { console.error('teacher run crashed:', e.message); }
try { await runRole('subscriber', SUBSCRIBER.email, SUBSCRIBER.password); } catch(e) { console.error('subscriber run crashed:', e.message); }

import { writeFileSync } from 'fs';
const total = results.length;
const passed = results.filter(r => r.pass).length;
writeFileSync('/home/hermes/dogfood-output/lembar-full-qa-2026-08-04/playwright-results.json', JSON.stringify({ summary: { total, passed, failed: total - passed }, results }, null, 2));
console.log(`\n=== LAYER 2 DONE: ${passed}/${total} PASS ===`);
const bugs = results.filter(r => !r.pass);
for (const b of bugs) console.log(`  BUG: [${b.role}] ${b.step} — ${b.note.slice(0,100)}`);
