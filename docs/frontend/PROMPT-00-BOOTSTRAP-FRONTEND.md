# Prompt F0-01 — Bootstrap Frontend-Lembar

Precondition: D-014 and D-015 are `Accepted` with the values used below. If not, stop and return
`BLOCKED_BY_DECISION`; do not bootstrap a framework from this proposed prompt.

Paste this prompt into the coding agent only when the owner is ready to start `F0-01`.

```md
START F0-01 — Bootstrap the Frontend-Lembar repository foundation.

Project context:

- Product: `lembar`, an AI-assisted assessment production workspace for Indonesian teachers.
- This repository is FRONTEND ONLY.
- Backend lives in the separate `rikoarik/Backend-Lembar` repository.
- Backend is a modular monolith; that detail must not cause backend code to be created here.
- MVP targets responsive web for SD grade 5–6 teachers.

Read and follow, in precedence order:

1. AGENTS.md
2. docs/product/PRD.md
3. docs/product/FRD-MVP.md
4. docs/frontend/FRONTEND-ARCHITECTURE.md
5. docs/frontend/DESIGN-SYSTEM.md and docs/frontend/SCREEN-INVENTORY.md
6. exact F0-01 task contract

Outcome:
A clean Next.js App Router + TypeScript strict repository that boots locally, renders a minimal
brand-correct home shell, and has reproducible baseline tooling. This task is foundation only.

Implement only:

- current stable Next.js App Router selected at execution time;
- pnpm and supported Node LTS pin;
- TypeScript strict and path aliases;
- minimal route/layout with lowercase `lembar` and semantic Indonesian placeholder copy;
- CSS token entrypoint with only accepted baseline tokens;
- lint, formatting, typecheck, build, and basic unit/smoke test scripts;
- `.gitignore`, `.editorconfig`, safe `.env.example`, and concise README;
- CI baseline if the exact F0-01 contract includes it.

Do not implement:

- backend/API server, database, auth, AI, upload, queue, PDF, billing, dashboard features;
- Figma landing page sections beyond the minimal shell;
- price, testimonial, customer logo, or invented product claims;
- OpenAI/Gemini/9Router SDK or any secret;
- F0-02 or any later task.

Rules:

- Inspect the repository before editing and preserve existing owner work.
- Use official current framework docs when version-sensitive.
- Do not request production secrets.
- Do not silently change an open decision.
- Keep exactly F0-01 in progress.

Acceptance evidence must include exact repository scripts for install, typecheck, lint, format
check, tests, production build, and a browser smoke at desktop plus 390px without horizontal
overflow.

Return the standard handoff with status READY_FOR_OWNER_REVIEW, then STOP. Do not start F0-02.
```
