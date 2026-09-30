import { defineConfig, devices } from 'playwright/test';

/**
 * Standalone config for the live-status browser E2E (LEM-OPS-LIVE-001 AC 15).
 * Targets a real origin (default: the deployed public board) instead of
 * building+starting a local server, so it doubles as the AC 20 public check.
 *
 *   pnpm exec playwright test --config playwright.live-status.config.ts
 *   LIVE_STATUS_BASE=http://127.0.0.1:3111 pnpm exec playwright test --config ...
 */
export default defineConfig({
  testDir: './scripts/gates',
  testMatch: /live-status\.spec\.ts/,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.LIVE_STATUS_BASE || 'https://app.lembar.web.id',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
