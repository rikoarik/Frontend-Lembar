#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

if [[ "${CI:-}" != "true" ]]; then
  pnpm exec playwright install chromium
fi

pnpm exec playwright test --project=desktop --project=mobile
