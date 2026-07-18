#!/usr/bin/env bash
# scripts/gates/format-check.sh — prettier --check gate.
set -euo pipefail
cd "$(dirname "$0")/../.."

if command -v pnpm >/dev/null 2>&1; then
  pnpm run format:check
else
  npm run format:check
fi