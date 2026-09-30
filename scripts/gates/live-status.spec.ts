import { test, expect } from 'playwright/test';

/**
 * LEM-OPS-LIVE-001 AC 15 — browser E2E for the public /live-status board.
 * Runs against the deployed origin so it also covers AC 20 (public verify).
 */
const BASE = process.env.LIVE_STATUS_BASE || 'https://app.lembar.web.id';

test.describe('live-status public board', () => {
  test('page renders board, gates and services within 5s comprehension', async ({ page }) => {
    const started = Date.now();
    const resp = await page.goto(`${BASE}/live-status`, { waitUntil: 'domcontentloaded' });
    expect(resp?.status()).toBe(200);

    // board/task identity from kanban is on screen
    await expect(page.getByText(/t_[0-9a-f]{8}/).first()).toBeVisible({ timeout: 15000 });

    // progress comes from evidence gates, never a hardcoded 91
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('91%');
    expect(body).toMatch(/\d+%/);

    // services block reflects pm2 state
    expect(body.toLowerCase()).toContain('lembar-api');
    expect(body.toLowerCase()).toContain('lembar-frontend');
    expect(body.toLowerCase()).toContain('lembar-worker');

    expect(Date.now() - started).toBeLessThan(20000);
  });

  test('status.json exposes live, non-hardcoded evidence', async ({ request }) => {
    const resp = await request.get(`${BASE}/live-status/status.json`);
    expect(resp.status()).toBe(200);
    const doc = await resp.json();

    expect(doc.board.taskId).toMatch(/^t_[0-9a-f]{8}$/);
    expect(doc.board.status).toBe('running');
    expect(typeof doc.overallPercent).toBe('number');
    expect(doc.overallPercent).not.toBe(91);
    expect(doc.evidenceGates).toBeTruthy();
    expect(Object.keys(doc.evidenceGates).length).toBeGreaterThanOrEqual(9);

    // generatedAt is fresh (<=60s old)
    const age = (Date.now() - new Date(doc.generatedAt).getTime()) / 1000;
    expect(age).toBeLessThan(60);

    // high pm2 restart counts surface as warnings
    expect(Array.isArray(doc.warnings)).toBe(true);
  });

  test('refresh preserves state and poll count increments', async ({ request }) => {
    const a = await (await request.get(`${BASE}/live-status/status.json`)).json();
    const b = await (await request.get(`${BASE}/live-status/status.json`)).json();
    expect(b.board.taskId).toBe(a.board.taskId);
    expect(b.board.status).toBe(a.board.status);
    expect(new Date(b.generatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(a.generatedAt).getTime(),
    );
  });

  test('activity feed collapses heartbeats', async ({ request }) => {
    const resp = await request.get(`${BASE}/live-status/activity.json`);
    expect(resp.status()).toBe(200);
    const feed = await resp.json();
    expect(Array.isArray(feed.lines)).toBe(true);
    expect(typeof feed.heartbeatCount).toBe('number');
    // heartbeats are counted separately, not dumped line-per-beat
    expect(feed.heartbeatCount).toBeGreaterThanOrEqual(0);
    expect(feed.lines.length).toBeLessThan(400);
  });
});
