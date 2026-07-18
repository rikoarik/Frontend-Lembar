#!/usr/bin/env bash
# scripts/gates/secret-scan.sh — light secret scan over tracked source.
# Only runs if gitleaks is installed; otherwise exits 0 with a note.
set -euo pipefail
cd "$(dirname "$0")/../.."

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks not installed; skipping secret scan (install gitleaks to enable this gate)."
  exit 0
fi

gitleaks detect --source . --no-banner --redact