# AGENTS.md — Frontend-Lembar

## Project boundary

This repository contains only the `lembar` web frontend. Do not implement backend services,
database migrations, AI providers, workers, PDF generation services, or secret management here.

Read the exact task contract first, then at most three directly relevant documents named by
that contract. Do not preload the complete PRD/design pack. The pinned OpenAPI artifact counts
as one document when the task consumes an API.

## Operating rule

- Work only after the owner sends `START <FRONTEND-TASK-ID>`.
- Keep exactly one frontend task `in_progress`.
- Do not start the next task after a handoff.
- A handoff status is `READY_FOR_OWNER_REVIEW`, never self-approved `COMPLETED`.
- Stop when scope requires an open product/architecture decision.
- Do not spawn subagents or reviewers unless the owner explicitly requests parallel work.
- Keep handoff under 500 words unless a failure requires additional evidence.

## Source precedence

Owner accepted decisions > PRD > FRD > published OpenAPI > frontend architecture > design
spec > Figma/prototype > task notes.

Figma controls visual intent only. It cannot introduce prices, roles, permissions, API fields,
or product claims.

## Architecture constraints

- Use the frontend framework and TypeScript policy only after D-014/D-015 are `Accepted`.
- Backend OpenAPI is authoritative; generate client/types and do not duplicate them manually.
- Backend enforces authorization/entitlement; UI guards are presentation only.
- Cache keys include workspace context and clear safely on switch.
- Secrets and provider keys never enter browser or repository.
- AI is presented as neutral generation stages; never expose provider/model/prompt.
- Do not add a state library, UI framework, third-party script, or provider without task need.

## Design constraints

- Brand is lowercase `lembar`.
- Quiet editorial utility; output-first; no AI-slop decoration.
- Build loading, empty, error, disabled, permission, conflict, and mobile states.
- Meet WCAG 2.2 AA intent and visible keyboard focus.
- Never invent testimonials, logos, statistics, prices, or claims.

## Quality gates

Run exact scripts defined by the repository. Baseline gates must cover install, typecheck, lint,
format, unit/component tests, production build, secret scan, and Playwright smoke. Do not weaken
gates or exclude tests to make them pass without documenting and obtaining approval.

## Change discipline

- Preserve user changes and avoid unrelated rewrites.
- Generated files are changed through their generator.
- New env vars require schema, example, docs, and usage owner.
- Contract breaking change starts in backend/cross-repo proposal, not frontend improvisation.
- Logs/analytics/tests must not contain sensitive content.

## Handoff

Use `docs/contracts/HANDOFF-TEMPLATE.md`. Include exact commands, contract version, screenshots
where useful, known limitations, and explicit non-scope. Then stop.
