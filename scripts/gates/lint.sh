#!/usr/bin/env bash
# scripts/gates/lint.sh — repo lint gate.
set -euo pipefail
cd "$(dirname "$0")/../.."

if command -v pnpm >/dev/null 2>&1; then
  pnpm run lint
else
  npm run lint
fi