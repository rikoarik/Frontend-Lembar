# UI State Specification

Every screen must implement relevant states below before it is considered complete.

## Global state model

| State | UI behavior | User action | Logging |
| --- | --- | --- | --- |
| Initial loading | skeleton matching final geometry | wait/navigation allowed | timing only |
| Refreshing | retain stale safe data + subtle progress | continue reading | no content |
| Empty | explain why and next action | primary CTA | empty reason enum |
| Validation error | field + summary, preserve input | correct field | error code only |
| Recoverable server error | clear message/request ID | retry | request/error ID |
| Offline | keep local form if safe | retry when online | client connectivity |
| Permission denied | explain workspace/role | switch workspace/contact admin | no resource detail |
| Not found | safe generic state | back/history | request ID |
| Conflict | show stale/new state choices | reload/copy changes | conflict code |
| Rate limited | show retry time | retry later | rate bucket ID |
| Entitlement blocked | show usage and options | view plan/contact admin | entitlement code |
| Maintenance | readonly/temporary unavailable | retry/status | maintenance ID |

## Generate form states

- `pristine`: summary shows unresolved required fields, submit disabled with visible reasons.
- `editing`: downstream selector resets when parent changes; announce reset.
- `source_uploading`: file progress and cancel; other form values persist.
- `source_processing`: selected but generation disabled until ready.
- `source_failed`: failure category and replace/retry; never expose storage/provider error.
- `valid`: summary `5/5` and estimated allowance impact if policy approved.
- `submitting`: one idempotent request; prevent duplicate click without losing cancel/navigation.
- `submission_unknown`: poll by idempotency key before offering resubmit.

## Job states

| State | Headline | Actions |
| --- | --- | --- |
| queued | `Draft Anda masuk antrean` | leave safely |
| preparing | `Menyiapkan materi` | view configuration |
| generating | `Menyusun soal` | leave safely |
| validating | `Memeriksa kualitas draft` | leave safely |
| completed | `Draft siap ditinjau` | review |
| partially_failed | `Sebagian draft perlu dilengkapi` | review result/retry missing |
| failed_retryable | `Draft belum berhasil dibuat` | retry with same config |
| failed_terminal | `Materi atau konfigurasi perlu diperbaiki` | edit configuration |
| cancelled | `Pembuatan dibatalkan` | duplicate/restart |

Do not promise seconds remaining unless derived from reliable data. Page reload resumes by job
ID; closing browser does not cancel server work.

## Review states

- Question status: `unreviewed`, `accepted`, `edited`, `regenerating`, `needs_attention`,
  `rejected`.
- Autosave: `idle`, `dirty`, `saving`, `saved`, `failed`, `conflict`.
- Finalize disabled with count/reasons for unresolved question.
- Regenerate preserves previous version until replacement accepted.
- Keyboard focus returns to regenerated question heading when completed.
- Bulk accept requires confirmation when quality flags exist.

## Output states

- No final version: explain finalization requirement.
- Artifact queued/rendering: stage, safe navigation.
- Artifact ready: preview, print, download; both use same artifact version.
- Artifact expired: regenerate without re-finalizing content if version still valid.
- Render failed: retry and request ID; assessment remains final.
- Share disabled: no active token.
- Share active: scope/expiry/revoke/copy link.
- Share expired/revoked viewer: generic unavailable state without assessment metadata.

## Auth/invitation states

- invalid credentials do not reveal whether account exists;
- recovery confirmation is generic;
- invitation `valid`, `expired`, `revoked`, `already_used`, `wrong_account`;
- school activation code is one-time and never displayed again after use;
- session expired preserves non-sensitive draft locally and returns after login where safe;
- account with multiple workspaces must choose active workspace explicitly.

## Destructive action states

Delete/archive/revoke dialogs must state:

- object name/type;
- immediate effect;
- recoverability and retention;
- affected links/artifacts;
- whether action is blocked by final/legal state.

Never use generic `Apakah Anda yakin?` alone.

## Long and edge content

Test fixtures include:

- 80-character school/user names;
- long Indonesian material titles;
- 50 questions;
- options spanning multiple lines;
- missing optional metadata;
- dates across timezone boundary;
- zero and maximum quota;
- right-to-left text only if future language support is declared—not implied now.

## Accessibility announcements

- Async stage changes: polite live region, deduplicated.
- Form submit errors: focus summary, then links to fields.
- Toast is mirrored in accessible status.
- Modal open focuses title/first control; close returns trigger.
- Route navigation sets focus to main heading.

