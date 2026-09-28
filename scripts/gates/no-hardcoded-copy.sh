#!/usr/bin/env bash
# scripts/gates/no-hardcoded-copy.sh — i18n gate: reject new Indonesian string literals in
# surfaces whose copy already goes through next-intl (FE-I18N-07).
set -euo pipefail
cd "$(dirname "$0")/../.."

if command -v pnpm >/dev/null 2>&1; then
  pnpm run i18n:no-hardcoded-copy
else
  npm run i18n:no-hardcoded-copy
fi
