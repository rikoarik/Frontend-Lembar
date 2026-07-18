# Marketing CMS Frontend Contract

## Responsibilities

Frontend owns layout, components, design tokens, motion, accessibility, responsive behavior,
route composition, schema adapters, fallback content, and public cache integration. Backend
owns published content, authoring state, permissions, versions, and audit.

## Route structure

- app/(marketing)/layout.tsx: one shared navbar/footer.
- app/(marketing)/page.tsx: Produk.
- app/(marketing)/untuk-sekolah/page.tsx.
- app/(marketing)/harga/page.tsx.
- app/(ops)/ops/content/*: authenticated superadmin authoring UI.

Use a shared component registry, never component names delivered from the network:

- hero;
- product-proof;
- workflow;
- audience;
- trust;
- pricing;
- faq;
- final-cta.

## Data flow

1. Server component requests the public page and global content with a bounded timeout.
2. Validate the response using generated contract types plus runtime schema.
3. Render known blocks through a local registry.
4. On timeout/invalid response, render the bundled, validated seed for that route.
5. Cache public content by locale + slug + content version. Never mix it with account or
   workspace cache.

Public content is safe to cache. Preview content is authenticated, no-store, and must never be
included in static generation, analytics payloads, or public metadata.

## Reusable architecture

- features/marketing-content/api: generated-client wrapper.
- features/marketing-content/model: adapters and runtime validation.
- features/marketing-content/renderer: fixed block registry.
- features/marketing-content/fallback: Figma-approved seed.
- features/cms-admin: list/editor/preview/version/publish UI.
- components/marketing: shared visual primitives.

Page JSX must not scatter editable copy. Global nav/footer/CTA and page documents come from a
typed content boundary. This enables CMS without coupling the frontend to a vendor.

## Visibility invariant

CMS or motion failure must never hide page content. Server-rendered HTML is visible by default.
Motion progressively enhances visible content after hydration. No-JS and reduced-motion modes
render every core section immediately.

## Admin UI

- Page/version list with published/draft/conflict state.
- Structured block editor, not free-form HTML.
- CTA fields with safe URL feedback.
- Desktop/mobile preview.
- Diff summary, publish confirmation, version history, restore-as-draft.
- Permission denied, stale revision, validation, and network failure states.

## Tests

- Contract fixtures: valid, unknown block, missing required slot, stale version.
- Public fallback under timeout/5xx/schema mismatch.
- No-JS/reduced-motion visibility.
- Shared navbar/footer and active route across all public pages.
- Superadmin-only route and mutations.
- Preview response never cached publicly.
- Desktop/390 screenshots and no horizontal overflow.
