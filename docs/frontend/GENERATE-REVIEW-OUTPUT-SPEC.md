# Generate, Review, and Output Experience

This is the core P0 workflow. Labels are Indonesian UI copy; enum keys live in the contract.

## Generate page anatomy

### Page header

- Back: `Kembali ke Dashboard` or previous safe location.
- H1: `Generate Lembar (AI)`.
- Supporting copy: default count and type from current configuration—not hard-coded when changed.
- Context chips show selected curriculum/phase, subject, and type only after values exist.

### Section A — Materi Ujian

`Sumber materi` radio choices:

1. `Buku/katalog yang tersedia`
2. `PDF saya saja`
3. `Buku/katalog + PDF saya`

Use `Buku Siswa` only for sources with clear license/catalog identity. URL/web source is hidden
until D-011 and security gate are accepted.

Dependent fields:

- `Kelas`
- `Kurikulum` (may auto-select only from trusted active mapping)
- `Mata Pelajaran`
- `Materi` multi-select, minimum one
- `PDF` upload/selection when source mode needs it

Changing class clears incompatible subject/material and announces what changed.

### Section B — Pengaturan Soal

`Jenis Lembar` choices:

- Latihan Soal — asesmen mandiri/drill
- Ulangan Harian — asesmen formatif
- UTS — sumatif tengah semester
- UAS — sumatif akhir semester
- TKA — only when verified template is available

`Tingkat Kesulitan`: mudah, sedang, sulit, campuran. `Campuran` opens optional composition
control with percentages/counts that must total question count.

`Jumlah Soal`: baseline default 20, allowed range from entitlement/assessment rules. Never let
client-only range substitute backend validation.

`Mode Review`:

- `Cepat` — all generated, then one review queue; never auto-final.
- `Detail` — guided one-by-one review; generation still can be batched.

The former prototype phrase `Auto-terima 20 soal` is prohibited because P-006 requires teacher
finalization. Use `Tinjau dalam satu daftar`.

### Section C — Konteks & Referensi

`Fokus / Tujuan Guru` optional, 500 characters, guidance not printed.

Prompt helpers may insert editable phrases:

- `Fokus pada: …`
- `Kesalahan umum: …`
- `Buat soal kontekstual tentang: …`
- `Hubungkan dengan: …`

`Contoh Soal` optional, length/rights warning. It guides style, does not guarantee copying.
Never send these free-text values to analytics.

### Sticky configuration summary

Desktop right rail; mobile collapsible summary before submit:

- readiness count;
- class, curriculum, subject;
- type, materials count;
- difficulty/composition;
- source and ready PDF count;
- review mode;
- question count;
- allowance impact if approved.

Missing value links/focuses its field. The summary never uses `BI` if abbreviation can be
ambiguous; use configured subject short label with accessible full name.

### Submit

Primary: `Buat draft 20 soal` with dynamic count. Supporting sentence: AI creates a draft
aligned to selected context; teacher reviews before final.

Submission sends an idempotency key. Double-click, retry, or uncertain network must not create
two billable jobs.

## Source upload

- PDF only for P0, file/page/size limits from server config.
- Show file name locally; redact in telemetry.
- States: uploading, scanning, extracting, ready, failed, deleted.
- Generation can start only with required sources ready.
- Encrypted/image-only/insufficient-text PDF gets specific actionable category.
- User can remove a file; explain effects on drafts and retention.

## Progress page

Shows:

- assessment configuration summary;
- real stage from `JOB-STATE-MACHINE.md`;
- safe navigation: `Anda boleh meninggalkan halaman ini`;
- cancellation only if state supports it;
- retry/edit action based on failure category;
- no provider/model/prompt/internal chain-of-thought.

Use polling baseline with backoff or SSE after accepted decision. The UX contract is transport
neutral and reload-safe.

## Review page

### Header

- title, status, version, autosave state;
- progress `x dari n ditinjau`;
- switch Quick/Detail only when it preserves work;
- finalize action with unresolved reason.

### Question card/editor

Display:

- number and review status;
- stem;
- options with correct answer marked for teacher only;
- explanation;
- difficulty/cognitive tag if quality-approved;
- source reference (source title class + page/passage, permission-aware);
- quality flags and confidence category—not fake percentage;
- actions: accept, edit, regenerate, delete.

Edit validates one correct answer, nonempty unique options, length, and source references.
Regenerate asks what to change (language, difficulty, distractors, source adherence) and keeps
old version until replacement accepted.

### Quick mode

Scrollable list with filters: unresolved, flagged, edited, accepted. Bulk acceptance is allowed
only for unflagged questions and still requires finalization confirmation.

### Detail mode

One question at a time with previous/next and persistent overview. Keyboard shortcuts must not
conflict with text editing and need discoverable help.

### Conflict/autosave

Mutations carry assessment/question version. On conflict:

- stop overwrite;
- preserve local copy;
- show server version/time;
- offer reload, copy local changes, or compare where supported.

## Finalization

Preconditions:

- required question count or explicit accepted shortfall;
- every included question has valid answer/options;
- unresolved blocking quality flags cleared;
- latest version saved;
- entitlement and workspace permission valid.

Confirmation states final version is immutable; later edits create a new draft version. Finalize
is idempotent and audited.

## Output center

Sections:

1. Final version metadata.
2. PDF artifact preview/status.
3. `Cetak` opens the same canonical PDF artifact used for download.
4. `Unduh PDF` downloads versioned artifact.
5. Controlled web link: create, scope, expiry, copy, revoke.
6. Optional packages: student sheet, answer sheet, answer key/explanation.

Direct print and download must not be separate renderers. Draft preview may be approximate and
must say so.

## Share link

- random high-entropy token, not assessment ID;
- default read-only and no-index;
- optional expiry and passcode only after security decision;
- owner can revoke immediately;
- viewer sees only explicitly shared package;
- no workspace/account/source metadata leakage;
- no student response collection in MVP.

## End-to-end acceptance

- All form values survive recoverable errors and navigation guard.
- One submit produces one assessment/job/quota reservation.
- Job resumes after reload.
- Every final question was reviewable and source support visible where applicable.
- Final version cannot be silently mutated.
- Print/download use identical artifact version/hash.
- Revoked share link stops access.
- 390 px journey works without horizontal overflow.
- No secret/content leakage in URL, logs, analytics, or error copy.
