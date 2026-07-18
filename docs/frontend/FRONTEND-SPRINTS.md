# Frontend Execution Plan

Sprints adalah queue, bukan izin auto-start. Hanya satu task frontend `in_progress`.

## F0 — Repository foundation

| Task  | Outcome                                                            | Depends on             |
| ----- | ------------------------------------------------------------------ | ---------------------- |
| F0-01 | Bootstrap accepted frontend/TS stack, pnpm, CI, health/home shell | D-014/D-015 accepted   |
| F0-02 | Env boundary, config validation, security headers baseline         | F0-01 accepted         |
| F0-03 | Test stack: Vitest/RTL/MSW/Playwright/a11y smoke                   | F0-01 accepted         |
| F0-04 | Implement design tokens and accessible component baseline          | DESIGN-SYSTEM accepted |
| F0-05 | OpenAPI codegen PoC against baseline artifact                      | BE contract available  |

## F1 — Landing and acquisition

| Task  | Outcome                                                  |
| ----- | -------------------------------------------------------- |
| F1-01 | Header, hero, real product specimen, responsive baseline |
| F1-02 | How it works, trust, outputs, teacher/school sections    |
| F1-03 | Pricing placeholder, FAQ, policy/footer                  |
| F1-04 | School lead form integration and states                  |
| F1-05 | Performance, SEO, a11y, analytics, visual QA             |
| F1-06 | Published CMS renderer, ETag cache, typed fallback, visible-content QA |

## F2 — Identity, workspace, dashboard

- F2-01 Auth pages and session states.
- F2-02 Onboarding and personal workspace entry.
- F2-03 App shell/workspace switcher.
- F2-04 Teacher dashboard states.
- F2-05 Contract/e2e integration gate.

## F3 — Generate and sources

- F3-01 Catalog-dependent form.
- F3-02 PDF upload/extraction UI.
- F3-03 Configuration/summary/composition.
- F3-04 Submit idempotency and async job progress.
- F3-05 Error/retry/partial failure and integration gate.

## F4 — Review and finalization

- F4-01 Quick review.
- F4-02 Detail question editor.
- F4-03 Regenerate/delete/reorder and conflict handling.
- F4-04 Finalization blockers/confirmation.
- F4-05 Accessibility/usability/integration gate.

## F5 — Output and library

- F5-01 A4 preview and print.
- F5-02 PDF export state/download.
- F5-03 Share link management.
- F5-04 History, bank private, templates.
- F5-05 Visual PDF and security integration gate.

## F6 — Commerce and operations UI

- F6-01 Plan/entitlement/quota UI after pricing accepted.
- F6-02 Superadmin minimum UI.
- F6-03 School admin shell/members/usage P1.
- F6-04 Production hardening and pilot feedback.
- F6-05 Superadmin structured CMS editor/preview/publish/version history.

## Task acceptance minimum

Setiap task mencakup relevant loading, empty, error, permission, responsive, keyboard,
analytics, tests, and screenshots. Handoff berhenti pada `READY_FOR_OWNER_REVIEW`.
