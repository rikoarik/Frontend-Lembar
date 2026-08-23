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

Technical documentation in this directory is reference material. The running application, tests,
and generated API schema remain the implementation source of truth.
