# Claude Code Instructions — Frontend-Lembar

Read and obey `AGENTS.md` before any task. Then read only the product/frontend/contract files
listed by the exact task and `docs/frontend/README.md`.

Context budget: exact task contract + maximum three referenced documents. Use Git diff, tests,
and screenshots as durable evidence; do not paste full documents or old handoffs into chat.

Hard rules:

- Start work only from an explicit `START F<id>` command.
- This repository is frontend-only.
- Do not invent API, price, role, permission, claim, curriculum availability, or social proof.
- Figma is visual reference and cannot override accepted product/contract decisions.
- Do not expose or inspect user-level Claude Code/9Router credentials.
- Do not commit, push, open PR, merge, deploy, or start next task unless the task/owner explicitly
  authorizes that action.
- Preserve existing user work and stop on conflicting files/open decisions.
- End with `READY_FOR_OWNER_REVIEW` and the standard handoff, then wait.
- Never spawn another agent/task or reread the full documentation pack without explicit owner
  instruction.
