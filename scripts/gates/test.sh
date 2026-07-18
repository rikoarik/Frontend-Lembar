#!/usr/bin/env bash
# scripts/gates/test.sh — vitest unit/component tests.
set -euo pipefail
cd "$(dirname "$0")/../.."

if command -v pnpm >/dev/null 2>&1; then
  pnpm run test
else
  npm run test
fi