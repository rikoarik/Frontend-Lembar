# Frontend-Lembar

Minimal `lembar` frontend foundation. Next.js 16 App Router, TypeScript strict, pnpm.

## Requirements

- Node `>=20.9 <23` (see `.nvmrc`)
- pnpm `>=9`

## Scripts

```bash
pnpm install
pnpm dev               # next dev -p 3000
pnpm typecheck         # tsc --noEmit
pnpm lint              # eslint . --ext .ts,.tsx
pnpm format:check      # prettier --check .
pnpm format            # prettier --write .
pnpm test              # vitest run
pnpm test:smoke        # Chrome smoke at 1280px and 390px
pnpm build             # next build
pnpm start             # next start -p 3000
```

## Scope

F0-01: minimal brand-correct home shell with the lowercase `lembar` wordmark, semantic
Indonesian placeholder copy, and DESIGN-SYSTEM tokens only. No backend, no auth, no AI,
no landing sections beyond the shell.

## Environment

Only `NEXT_PUBLIC_*` values belong in the browser bundle. See `.env.example`.
