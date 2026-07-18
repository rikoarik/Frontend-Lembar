# Frontend Quality, Testing & Release

## Marketing CMS gates

- Public route tests cover CMS success, timeout, 5xx, invalid schema, and unknown block.
- Fallback keeps hero, primary CTA, navigation, and footer visibly rendered.
- Assertions verify non-empty bounding box, computed opacity/visibility, and non-concealing
  clip-path after load and scroll; DOM text presence alone is insufficient.
- No-JS and prefers-reduced-motion runs show all core content.
- Preview/draft responses are never cached or exposed to visitor sessions.
- Shared navbar/footer and active route are tested on /, /untuk-sekolah, and /harga at 390
  and desktop widths.

## Test pyramid

### Static

- Type policy accepted in D-014 (recommended TypeScript strict).
- ESLint framework/security/a11y rules yang kompatibel.
- Formatting check.
- Generated API client drift check.
- Secret scan dan dependency audit.

### Unit/component

- Formatting, mapping error/status, permission presentation.
- Form dependency and validation.
- Components dengan keyboard/focus behavior.
- MSW fixtures berasal dari OpenAPI examples bila memungkinkan.

### E2E

Critical flows:

- landing → register entry;
- auth expired/recovery entry;
- switch workspace without stale data;
- generate valid/invalid/failed/retry;
- upload processing/failed;
- quick/detail review and conflict;
- finalize and output;
- share link states;
- school admin permission boundaries.

Test mobile 390px dan desktop. Minimal satu test menjamin tidak ada horizontal overflow.

### Visual

- Landing key sections.
- Generate form.
- Question review.
- A4 preview.
- Empty/error states.

Snapshot hanya untuk area stabil; perubahan visual memerlukan review manusia.

## Accessibility gate

- Automated axe pada route kritis.
- Keyboard-only manual pass.
- Screen-reader spot check untuk form, progress, dialog, dan review question.
- 200% zoom dan reduced motion.

## Performance gate

- Bundle analysis untuk marketing/app boundary.
- Lighthouse/Web Vitals budget disepakati pada F0.
- Third-party script membutuhkan owner/security approval.
- Analytics/chat widget tidak boleh memblokir interaksi awal.

## Observability

Capture:

- route/error boundary failures;
- API error code/status/request ID;
- job UI duration/stage transitions;
- Web Vitals;
- feature usage event yang telah disetujui.

Never capture prompt, question text, source content, token, signed URL, cookie, or secret.

## CI baseline

1. Install frozen lockfile.
2. OpenAPI/codegen drift check.
3. Secret scan.
4. Typecheck.
5. Lint/format.
6. Unit/component tests.
7. Production build.
8. Playwright smoke/e2e.
9. Upload only sanitized test artifacts.

The CI workflow is defined in `.github/workflows/ci.yml` and runs the gates listed below.
Playwright smoke is gated on the static-and-build job so flaky browser runs do not hide
real failures.

### Local-equivalent commands

Run each gate locally with the script under `scripts/gates/`. They mirror what CI executes
so a failing CI job is reproducible on a developer machine.

```bash
./scripts/gates/install.sh        # pnpm install --frozen-lockfile (npm ci fallback)
./scripts/gates/lint.sh           # pnpm run lint
./scripts/gates/typecheck.sh      # pnpm run typecheck
./scripts/gates/format-check.sh   # pnpm run format:check
./scripts/gates/test.sh           # pnpm run test  (vitest run)
./scripts/gates/build.sh          # pnpm run build (next build)
./scripts/gates/secret-scan.sh    # gitleaks detect (skips if gitleaks absent)
./scripts/gates/playwright-smoke.sh   # pnpm exec playwright test
```

Vitest is configured via `vitest.config.ts` (jsdom, globals, `vitest.setup.ts`, excludes
`scripts/gates/**` so Playwright specs are not picked up by unit tests).

Playwright is configured via `playwright.config.ts`:

- Two projects: `desktop` (1280×800) and `mobile` (390×844).
- Single spec: `scripts/gates/playwright-smoke.spec.ts`.
- Routes covered: `/`, `/untuk-sekolah`, `/harga`.
- For each route × viewport, the spec asserts: `lembar` wordmark, `html[lang="id"]`,
  `h1` heading, primary CTA, no horizontal overflow, and captures a full-page screenshot
  to `docs/frontend/screenshots/<route>.<project>.png`.
- `webServer` runs `next build && next start -p 3100` so smoke hits a production server,
  matching the contract that Playwright must not be run against a `next dev` server.

## Release checklist

- Pinned backend contract version recorded.
- Environment public/server variables validated.
- Auth/cookie/CSRF smoke on target topology.
- Analytics consent/policy respected.
- Error tracking source map access controlled.
- Rollback artifact available.
- Owner accepts UX outcome.
