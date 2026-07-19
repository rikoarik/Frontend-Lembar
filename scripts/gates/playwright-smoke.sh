#!/usr/bin/env bash
# scripts/gates/playwright-smoke.sh — Playwright smoke (build + serve).
set -euo pipefail
cd "$(dirname "$0")/../.."

if command -v pnpm >/dev/null 2>&1; then
  pnpm exec playwright install --with-deps chromium || pnpm exec playwright install chromium
  pnpm exec playwright test --project=desktop --project=mobile
else
  npx playwright install --with-deps chromium || npx playwright install chromium
  npx playwright test --project=desktop --project=mobile
fi