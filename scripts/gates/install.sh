#!/usr/bin/env bash
# scripts/gates/install.sh — install frozen lockfile (pnpm or npm fallback).
set -euo pipefail

cd "$(dirname "$0")/../.."

if command -v pnpm >/dev/null 2>&1 && [ -f pnpm-lock.yaml ]; then
  pnpm install --frozen-lockfile
else
  npm ci
fi