# Application Shell and Dashboard Specification

## Shell goals

- Make active workspace, current role, plan/usage, and navigation unambiguous.
- Keep the primary teacher flow—Generate → Review → Output—within one click from dashboard.
- Preserve context on mobile without hiding essential actions behind hover.

## Desktop composition

Left navigation:

```text
[lembar logo]
Dashboard
Riwayat
Bank Soal
Template
Generate
Kelas          P1
Analitik       P1
---
[workspace switcher]
[account menu]
```

- `Generate` is visually prominent but stays within nav hierarchy.
- Active route uses left marker/background and text, not color only.
- Workspace switcher shows personal/school type and active role.
- Account menu contains profile, plan/usage, help, and logout.
- Logout is not adjacent to destructive account deletion.

Top region:

- mobile menu trigger;
- breadcrumb where depth >1;
- page title and autosave/status;
- contextual action at right;
- no redundant global search until search use cases are implemented.

## Mobile composition

- Top bar: mark, page title/context, menu.
- Navigation drawer groups teacher, school admin, settings.
- Primary screen action may use sticky bottom bar only if it does not cover content/focus.
- Workspace switch requires confirmation when unsaved/conflicting work exists.
- Tables become structured lists.

## Workspace switch

Switching performs:

1. permission check;
2. unsaved work guard;
3. active workspace change server-side/session-bound;
4. tenant-scoped client cache clear;
5. route validation/redirect;
6. focus and announcement `Workspace aktif: …`.

Never reuse data from prior workspace while new context loads.

## Teacher dashboard

### Header

- Academic year/semester only if configured from trusted catalog/workspace setting.
- Greeting uses safe display name; fallback `Selamat datang`.
- Date formatted `id-ID`, timezone from workspace/user setting.
- Avoid dynamic greeting if it creates awkward or incorrect tone.

### Activity summary

P0 metrics:

- lembar tersimpan;
- final;
- draft/perlu ditinjau;
- recent activity count/trend only if event definition exists.

Zero state is useful, not broken chart. A seven-day chart is optional and must have a text/table
alternative; do not add for decoration.

### Core action section

Order:

1. Generate Lembar — primary.
2. Riwayat — reopen/print/duplicate.
3. Bank Soal — private saved items.
4. Template — rerun configuration.

Each item has one sentence and one action. Do not state generated questions are automatically
public; private is default.

### Last sheet

Show only when available:

- title/subject/grade/type;
- material summary collapsed after sensible length;
- updated date/status;
- actual thumbnail or structured placeholder without rendering private text to analytics;
- context actions based on state: review, output, duplicate.

### Curriculum context

If a ready curriculum/subject combination exists, show selected version/phase and short CP
summary with source link. If unavailable/stale, show update/unavailable—not fake auto-config.

### Recent list

Maximum five items and link to history. Desktop table/mobile list. Actions reflect state.

## Navigation states

- Feature not released: hidden unless early-access flag and explanatory state.
- Entitlement unavailable: visible only when discovery/upgrade path is useful; otherwise hidden.
- Permission unavailable: do not show school/ops nav to teacher.
- Current route access lost: redirect to safe home and explain.

## Shell loading/error

- Load account/workspaces before tenant data.
- If account loads but workspace fails, show workspace recovery—not entire app crash.
- Session expiry redirects with safe return URL.
- Global fatal error includes request ID and support action; no raw stack/provider error.

## Dashboard acceptance

- Active workspace cannot be mistaken.
- Teacher reaches generate in one keyboard/mobile action.
- No data flashes from previous workspace.
- Zero/new user and populated fixtures both reviewed.
- Metrics match backend definitions.
- 390 px supports all actions without overflow.
- Account/logout menu is keyboard and screen-reader usable.
