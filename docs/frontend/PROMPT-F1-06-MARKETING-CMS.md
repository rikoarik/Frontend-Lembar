# START F1-06 — Published CMS renderer and fallback

Work only in Frontend-Lembar after B1-06 OpenAPI artifact is available. Read only:

1. exact F1-06 contract in TASK-REGISTRY.yaml;
2. docs/frontend/MARKETING-CMS-FRONTEND.md;
3. docs/frontend/LANDING-PAGE-SPEC.md;
4. pinned executable OpenAPI artifact.

Implement server-side published content loading for /, /untuk-sekolah, and /harga through a
fixed local block registry. Keep one shared marketing layout/navbar/footer. Add validated
Figma-approved seed fallback, ETag/revalidation integration, and section-local unknown-block
handling.

Content must be visible by default. Motion is progressive enhancement; no-JS,
prefers-reduced-motion, timeout, 5xx, and invalid schema must not create a blank page.

Do not build the superadmin editor, change backend, invent endpoints/content/pricing, or add a
CMS vendor/state library. Run contract, visibility, desktop/390, screenshot, a11y, build, and
existing gates.

Commit locally. Do not push, merge, or start F6-05. Return <= 500-word handoff and
READY_FOR_OWNER_REVIEW.
