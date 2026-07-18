# Figma and Design Source Mapping

## Source

Figma file:

`https://www.figma.com/design/BYP7ePqTbF0am6Vg0yw8lj/LembarSaaS?node-id=0-1&t=hShUsPerxf78SLgu-1`

File key: `BYP7ePqTbF0am6Vg0yw8lj`  
Entry node: `0:1`

Known Stitch exploration IDs:

- Landing exploration: `8e44c8c8959e66f33e38413`
- `lembar — Untuk Sekolah`: `dc1c2f13fc5640af83d957f27ffbcc14`
- `lembar — Harga`: `306f21af12e04562bf7093e80fab2c2b`

Stitch IDs are references only. Agent must not claim MCP availability or fetch them unless the
current environment exposes the configured server.

## Authority

When sources conflict:

1. accepted owner decision/ADR;
2. PRD/FRD and business rules;
3. executable OpenAPI;
4. design system and screen spec;
5. current Figma frame;
6. Stitch/prototype/screenshot.

Figma controls visual intent where it does not conflict. It cannot decide price, roles,
permissions, data model, provider, or roadmap.

## Current conflict rules

- Pricing values in any `Harga` frame remain hidden/placeholder until D-009 Accepted.
- Public bank language is superseded by P-007 private-by-default.
- `Auto-terima` is superseded by P-006 teacher review/finalization.
- UI that shows unsupported classes/subjects is exploration, not catalog availability.
- Social proof/customer logos are invalid without evidence/permission.
- Missing error/loading/mobile states must be supplied by these docs.

## Required Figma pages

Recommended structure:

```text
00 Cover & decisions
01 Foundations
02 Components
03 Marketing
04 Identity
05 Teacher app
06 School admin
07 Superadmin
08 Print & output
09 Prototypes
10 Archive
```

## Frame naming

```text
<route> / <viewport> / <state> / <version>
```

Examples:

- `landing / 1440 / default / v1`
- `generate / 390 / source-processing / v1`
- `review / 1280 / save-conflict / v1`
- `output / 390 / artifact-ready / v1`

Do not use `final-final-2` or agent-generated random names.

## Route-to-frame register

Populate exact node IDs after Figma audit; do not invent them.

| Route/component | Desktop node | Mobile node | Required states | Status |
| --- | --- | --- | --- | --- |
| `/` landing | TBD | TBD | default, menu open | Needs mapping |
| `/untuk-sekolah` | TBD | TBD | default, lead success/error | Needs mapping |
| `/harga` | TBD | TBD | price unresolved/resolved, FAQ open | Needs mapping |
| `/masuk` | TBD | TBD | default, invalid, loading | Missing |
| `/app` dashboard | TBD | TBD | new, populated, error | Needs mapping |
| `/app/generate` | TBD | TBD | pristine, upload, valid, errors | Partial prototype |
| job progress | TBD | TBD | all terminal/retry states | Missing |
| review | TBD | TBD | quick, detail, conflict, flags | Missing |
| output | TBD | TBD | render, ready, share, expired | Missing |
| history/bank/template | TBD | TBD | empty/populated/error | Missing |
| school admin | TBD | TBD | empty/populated/invite | Missing |
| superadmin | TBD | N/A/limited | operational states | Missing |

## Design token sync

- `DESIGN-SYSTEM.md` is implementation baseline until Figma variables are audited.
- Figma variables should mirror semantic tokens, not raw one-off names.
- A token change proposal includes old/new value, affected components, contrast check, and
  screenshot diff.
- Code token export/generation is adopted only after one-way ownership is decided; do not
  manually edit generated token files.

## Component mapping checklist

Each reusable Figma component defines:

- variants/states matching code component;
- auto-layout and min/max behavior;
- text wrapping with Indonesian fixtures;
- keyboard/focus behavior described in annotation;
- responsive/slot contract;
- semantic token bindings;
- accessibility name/role notes where useful.

## MCP workflow for agents

1. Read design docs and exact task.
2. Inspect only relevant Figma nodes/components.
3. Record exact file/node IDs in task notes.
4. Compare business claims against decisions.
5. Implement one state/section at a time using tokens/components.
6. Capture 390/768/1280 evidence and compare.
7. Do not write back to Figma unless task explicitly authorizes design changes.

MCP connection does not grant permission to redesign unrelated frames.

## Handoff

Design handoff includes:

- exact route and node links;
- viewport/state list;
- token/component dependencies;
- accepted deviations and reason;
- copy source;
- assets with license/source;
- screenshots/visual diff;
- accessibility behavior;
- unresolved product decision.
