# Design System — Web Baseline

Status: executable baseline. Perubahan token global membutuhkan design review; perubahan yang
mengubah brand membutuhkan owner approval.

## Design principles

1. **Output first:** tunjukkan lembar dan status pekerjaan lebih dahulu.
2. **Quiet hierarchy:** hierarchy berasal dari type, spacing, dan line—not decorative cards.
3. **Explicit state:** draft/final, source, job, save, quota, dan permission selalu jelas.
4. **Teacher control:** AI action dapat dibatalkan/di-review dan tidak menyamarkan uncertainty.
5. **Responsive utility:** 390 px bukan versi desktop yang diperkecil.

## Anti-slop constraints

- Tidak ada gradient mesh, aurora, glassmorphism, glowing orb, bento-card wall, atau sparkle.
- Maksimal satu primary CTA per region.
- Card hanya untuk grouping nyata; jangan membungkus setiap paragraf.
- Radius tidak boleh membuat semua elemen berbentuk pill.
- Icons informatif, bukan dekorasi berulang.
- Marketing animation tidak meniru progress/fakta palsu.
- Jangan membuat statistik/testimonial/logo customer tanpa evidence.

## Color tokens

```css
:root {
  --color-paper: #f7f3ec;
  --color-surface: #fffcf7;
  --color-surface-raised: #ffffff;
  --color-ink: #171717;
  --color-ink-muted: #625d55;
  --color-ink-subtle: #726c63;
  --color-line: #d8d0c5;
  --color-line-strong: #b9afa2;
  --color-accent: #a3202b;
  --color-accent-hover: #851925;
  --color-accent-soft: #f5e4e5;
  --color-focus: #1d4ed8;
  --color-success: #176b45;
  --color-success-soft: #e4f2ea;
  --color-warning: #8a5400;
  --color-warning-soft: #fff0cf;
  --color-danger: #9f1d2d;
  --color-danger-soft: #fae5e8;
  --color-info: #245a82;
  --color-info-soft: #e3eff7;
}
```

Do not encode status with color only. Text/icon/status label remains present.
Baseline normal-text pairs were contrast-checked against their listed soft/paper surfaces;
component implementation must recheck actual foreground/background and state combinations.

## Typography

Font stack:

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  sans-serif;
```

| Style      | Size/line | Weight | Use                       |
| ---------- | --------- | ------ | ------------------------- |
| Display    | 56/60     | 650    | desktop landing hero only |
| H1         | 40/46     | 650    | page marketing            |
| H2         | 32/38     | 650    | section                   |
| H3         | 24/30     | 620    | panel title               |
| App H1     | 28/34     | 650    | app page title            |
| Body large | 18/28     | 400    | hero/supporting text      |
| Body       | 16/24     | 400    | default                   |
| Body small | 14/20     | 400    | secondary UI              |
| Label      | 13/18     | 600    | form/table label          |
| Meta       | 12/16     | 500    | timestamp/status metadata |

Mobile display 40/44 and H1 32/38. Body never below 14 px; print uses separate spec.

## Spacing

4 px base scale:

```text
0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128
```

- Form control gap: 8.
- Field group: 20–24.
- App section: 32–48.
- Marketing section: 80–128 desktop, 56–80 mobile.
- Avoid arbitrary pixel values except optical logo/icon fixes.

## Radius and shadow

```text
radius-sm 6
radius-md 10
radius-lg 16
radius-round 999 only for avatar/tag/status where shape is semantic
shadow-sm 0 1px 2px rgb(23 23 23 / 0.06)
shadow-md 0 10px 30px rgb(23 23 23 / 0.08)
```

Most app panels use border without shadow. Modal/popover may use `shadow-md`.

## Layout

- Marketing max width: 1200 px, 12-column grid, 24 px gutter.
- App content max width: 1440 px; reading/form column 720–840 px.
- Sidebar desktop: 240 px expanded, 72 px compact only if labels stay accessible.
- Header: 64 px.
- Mobile horizontal padding: 16 px; tablet 24; desktop 32.
- Main breakpoint intent: 640, 768, 1024, 1280; component behavior drives CSS.
- Sticky elements must not cover focused controls or browser zoom content.

## Elevation/layers

```text
base 0
sticky 10
popover 30
modal 50
toast 70
```

No arbitrary z-index escalation. Modals trap focus and return it to trigger.

## Iconography

- One outline icon set, 1.75–2 px stroke.
- 16 px inline, 20 px controls, 24 px navigation.
- Icon-only button requires accessible name and tooltip where appropriate.
- Avoid magic-wand as generic AI icon; use neutral `generate`, `refresh`, or stage icon.

## Core components

### Button

Variants: primary, secondary, quiet, danger, link. Sizes 36/40/44 px; primary touch target at
least 44×44 on mobile. States: default, hover, active, focus-visible, disabled, loading.
Loading preserves width and label context: `Membuat draft…`, not spinner-only.

### Field

Label above control; optional/required explicit. Description before error. Error associated via
`aria-describedby`. Do not use placeholder as label. Select dependencies clear downstream
values with explanation.

### Choice card

Used for source, assessment type, review mode—not every option. Whole card is one radio/checkbox
target with visible selected and focus state. Title plus one-line description.

### Status badge

Compact label for Draft, Diproses, Perlu ditinjau, Final, Gagal, Kedaluwarsa. Badge does not
replace surrounding explanatory state.

### Panel/card

Panel groups one concept. Default surface transparent or Surface with 1 px Line. Nested card
depth limited to one.

### Table/list

Desktop table converts to structured list at narrow widths; never horizontal-scroll core
actions without alternative. Row menu is keyboard accessible. Empty state lives in table body.

### Dialog/drawer

Dialog for focused confirmation; drawer for supplemental editing. Destructive confirmation
names the object and consequence. No modal inside modal.

### Toast/inline feedback

Toast only for transient success. Errors that need action stay inline. Autosave uses quiet
status near page title: `Menyimpan`, `Tersimpan`, `Gagal menyimpan`.

### Progress

Generation stages are text-first. Determinate progress only when denominator is real. Never
animate fake percentage. Browser close/reopen recovery is stated.

## Forms

- Preserve entered values after validation or recoverable error.
- Required fields validated on submit/blur without aggressive error while typing.
- Summary shows unresolved fields and links/focuses them.
- Disabled reason visible near control; tooltip alone is insufficient.
- Default values are explicit and reversible.
- Free text counters display near limit, not from first character unless useful.

## Accessibility

- WCAG 2.2 AA intent.
- Visible focus ring: 2 px Focus with 2 px offset.
- Semantic headings, landmark navigation, skip link.
- No keyboard traps; logical DOM order.
- Minimum target 44×44 on touch workflows.
- 200% zoom and 320 CSS px reflow without lost action.
- `prefers-reduced-motion` disables nonessential animation.
- Announce async stage changes politely; errors assertively once.
- Charts/tables have text alternative; no color-only encoding.

## Motion

- 120–180 ms for control state, 180–240 ms for panel transition.
- Ease-out entering, ease-in exiting.
- No continuous ambient motion.
- Generation activity may use subtle indeterminate bar only when actual work is pending.
- Skeleton matches final geometry and stops when data/error resolves.

## Design component acceptance

Every component must demonstrate:

- default, hover, focus, disabled, loading/error where relevant;
- light baseline on Paper/Surface;
- 390 px behavior;
- keyboard and screen-reader label;
- long Indonesian copy;
- visual regression fixture;
- token-only color/spacing unless documented exception.

## Audit notes

- F0-04 (2026-07-19): added app-shell primitive baseline in `app/components/ui/*`:
  `Button`, `Field`/`TextField`, `ChoiceCard`, `StatusBadge`, and `Panel`.
- F0-04 verification currently uses Vitest + Testing Library semantic assertions, plus 390 px
  DOM snapshot fixtures for one `Button` and one `TextField` surface.
- ponytail: upgrade the semantic assertions to `axe-core` once the repo accepts the additional
  test dependency or provides a shared accessibility test helper.
- New primitive code should prefer `brand-*` tokens in Tailwind and the mirrored `--color-*`
  CSS variables in `app/globals.css`; legacy marketing token aliases remain for compatibility.
- `Field` is intentionally a wrapper primitive (not a monolithic form system) so existing auth
  forms can adopt it incrementally without rewriting control logic.
- `Panel` stays border-first by default; shadow is opt-in (`elevated`) for popover/modal-like
  surfaces only.
- `StatusBadge` labels are fixed to `Draft`, `Diproses`, `Perlu ditinjau`, `Final`, `Gagal`, and
  `Kedaluwarsa` per the accepted state vocabulary.

ponytail: visual fixtures are DOM snapshots at 390 px, not browser image diffs. Upgrade to
Playwright image snapshots when the repo adopts a stable screenshot baseline harness.
