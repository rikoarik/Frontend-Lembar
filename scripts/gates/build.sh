#!/usr/bin/env bash
# scripts/gates/build.sh — production build (Next.js).
set -euo pipefail
cd "$(dirname "$0")/../.."

if command -v pnpm >/dev/null 2>&1; then
  pnpm run build
else
  npm run build
fi