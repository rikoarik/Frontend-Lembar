# Maestro web smoke tests

Maestro web support is Beta and needs a display. On headless Linux, run through Xvfb:

```bash
xvfb-run -a maestro test maestro/01-smoke-landing.yaml
xvfb-run -a maestro test maestro/02-smoke-login-validation.yaml
xvfb-run -a maestro test -e QA_EMAIL="$QA_EMAIL" -e QA_PASSWORD="$QA_PASSWORD" maestro/03-smoke-auth-flow.yaml
```

Requirements: Java 17+, Maestro CLI 2.8+, Chromium download access, and `xvfb-run` on headless hosts.

Credentials are passed only at runtime; never commit them.

Known Maestro Web Beta limitation: accessibility text may be stale after Next.js client-side navigation. The authenticated flow uses `openLink` for route checks as a deliberate workaround.
