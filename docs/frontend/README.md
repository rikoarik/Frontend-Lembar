# Frontend-Lembar Documentation Pack

Repository purpose: landing page dan seluruh antarmuka web `lembar`.

## Frontend owns

- Web application, routes, rendering, accessibility, responsive behavior, and UI states.
- Design tokens/components and Figma-to-code fidelity.
- Safe consumption of generated API client.
- Browser-side analytics contract and frontend observability.
- Print preview UI in coordination with backend export contract.

## Frontend does not own

- Database, migrations, tenant authorization, quota truth, or business policy.
- AI provider/model/prompt, source extraction, PDF worker, or secret keys.
- Handwritten API response types that duplicate OpenAPI.
- Final pricing, role policy, curriculum claims, or entitlement decisions.

## Required context before a task

1. Root `AGENTS.md`.
2. Product PRD/FRD snapshot.
3. `SOURCE-OF-TRUTH.md`.
4. Relevant frontend document.
5. Pinned backend OpenAPI artifact.
6. Exact task contract.

Only work on an explicitly started frontend task ID. Return
`READY_FOR_OWNER_REVIEW`, then stop.
