#!/usr/bin/env bash
# scripts/gates/typecheck.sh — TypeScript type-check gate.
set -euo pipefail
cd "$(dirname "$0")/../.."

if command -v pnpm >/dev/null 2>&1; then
  pnpm run typecheck
else
  npm run typecheck
fi