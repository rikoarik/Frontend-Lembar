# Print and PDF Product Specification

This document defines user-visible output. Backend rendering details are in
`backend/EXPORT-PDF-SPEC.md`.

## Canonical artifact rule

For a finalized assessment version, print and download use the same immutable PDF artifact
identified by assessment version, output options, renderer version, and content hash.

- `Cetak` opens/prints that artifact.
- `Unduh PDF` downloads that artifact.
- Do not maintain a second browser-only exam renderer for final output.
- Draft preview can be approximate and labeled `Pratinjau draft`.

## Page geometry

- Paper: ISO A4 portrait, `210 × 297 mm`.
- Default margins: top 14 mm, right 14 mm, bottom 14 mm, left 14 mm.
- Printable content box: `182 × 269 mm`.
- Header/footer safety: never depend on browser-added headers/footers.
- PDF embeds/subsets fonts permitted by font license.
- All dimensions use physical units for print CSS.

Landscape and alternate paper sizes are Later unless an accepted task adds them.

## Output packages

One artifact may contain selected sections in this order:

1. Lembar soal siswa.
2. Lembar jawaban.
3. Page break.
4. Kunci jawaban.
5. Pembahasan, if enabled and entitlement permits.

UI explicitly shows what is included. A teacher-only key must not appear in a public student
share package by default.

## Student sheet header

Default header fields:

- school name/logo only when workspace config and permission exist;
- assessment title/type;
- subject;
- class/phase;
- academic year/semester if configured;
- duration if supplied;
- `Nama`, `No.`, `Kelas`, and optional `Tanggal` blank lines.

No AI/provider/model/prompt label in student output. Optional “Dibuat dengan lembar” mark is a
packaging decision, not forced watermark.

## Question layout

### Multiple choice baseline

- Body font 10.5–11 pt; line height 1.35–1.45.
- Question number column stable; stem and options align.
- Options use A–D initially; E only if contract supports it.
- Each option has hanging indent and at least 2.5 mm vertical separation.
- Avoid widows: do not leave question stem at page bottom without first option.
- Prefer keeping a question together; split only if one question exceeds available page height.
- Tables/images stay within content box and include print-safe contrast.
- URLs are not printed unless educationally necessary.

### One or two columns

- One column is default for longer stems and accessibility.
- Two columns may be offered for short MCQ after layout heuristic/preview.
- Never squeeze below readable type or split source passage unpredictably to save pages.

### Passage/source material

- Passage appears before related questions.
- Label and reference number are clear; source citation follows permission/product policy.
- Keep title and first lines together.
- Long passage can span pages with `lanjutan` indicator.
- Images require usable resolution and rights metadata.

## Answer sheet

Baseline answer sheet includes:

- assessment title/version short code;
- name/class fields;
- numbered rows matching included questions;
- A–D/E bubbles or simple boxes optimized for pen, not machine scanning;
- no claim of optical scanning in MVP.

Question count drives grid; labels remain at least 9 pt and targets at least 4.5 mm.

## Answer key and explanation

- Starts on a new page with clear `Kunci Jawaban` teacher-only heading.
- Compact key table: number, answer, optional objective/material.
- Explanations follow in question order and can span pages.
- Source references included only as allowed; signed/private URLs never printed.
- If shared package excludes teacher material, key pages are omitted at artifact creation—not
  merely hidden with CSS.

## Pagination and headers/footers

- Footer: page `x dari y`, assessment short title, version/date if useful.
- Repeated table headers on page breaks.
- No blank trailing page.
- Section start can force page break when it prevents answer key leaking onto student sheet.
- Rendering produces deterministic page count for identical renderer/input/font versions.

## Indonesian typography

- Use correct punctuation and curly/straight quote policy consistently.
- Do not uppercase long headings.
- Prevent option labels from separating from option text.
- Long words/URLs wrap safely; no content clipping.
- Math/science notation requires font/glyph validation before subject is released.

## Browser/viewer print

- The output center opens a same-origin authenticated artifact/viewer or time-bounded safe URL.
- `Cetak` triggers the browser print dialog only from an explicit user gesture.
- Instructions tell users to choose A4, scale 100%/fit as tested, and disable browser headers if
  viewer cannot control them.
- Download remains available if popups/print dialog are blocked.

## Golden fixtures

Minimum fixtures:

1. 20 short MCQ, one column.
2. 20 short MCQ, two columns if supported.
3. Long Indonesian stems/options.
4. Passage spanning pages.
5. 50-question maximum.
6. School logo/name maximum safe size.
7. Answer sheet + key + explanation.
8. Special characters and math pilot content.
9. No optional metadata.
10. Mobile output center opening artifact.

Compare page count, clipping, overflow, missing glyphs, section boundaries, and visual snapshot.

## Accessibility

- PDF accessibility/tagging level is decided in output spike; do not claim accessible PDF until
  validated.
- Web share is semantic HTML and remains the accessible alternative.
- Text should remain selectable/searchable unless source content requires raster image.
- Color is not needed to understand answer/key.

## Acceptance

- Exact same artifact/version for print and download.
- A4 print at 100% has no clipped content on supported environment.
- No question/key cross-package leakage.
- No private URL, internal ID, prompt, provider, or source text beyond selected output.
- Identical input and renderer version produce deterministic hash/page count or documented
  nondeterminism.
- Failure does not alter final assessment and can be safely retried.
