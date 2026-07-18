# Landing Page Specification

Runtime marketing copy and CTA use the structured CMS contract in
MARKETING-CMS-FRONTEND.md. This file owns visual/content intent; the CMS cannot alter layout,
motion, breakpoint, or component implementation.

Scope: `/`, `/untuk-sekolah`, `/harga`.  
Goal: explain workflow and produce qualified teacher signup or school lead.  
Visual source: Figma is reference; product/decision docs control claims and price.

## Landing thesis

The hero is not “AI makes education magical.” It shows the outcome: a structured assessment
sheet ready to review and print. AI appears as the mechanism, not the identity.

## `/` — teacher landing

### Header

- Horizontal `lembar` lockup.
- Nav: `Cara kerja`, `Hasil`, `Untuk sekolah`, `Harga`, `Masuk`.
- Primary CTA: `Mulai gratis` only if free entitlement is approved; otherwise `Coba lembar`.
- Mobile: compact header + menu drawer; CTA remains reachable without duplicate banners.
- Header becomes solid Paper on scroll; no glass blur dependency.

### Hero

Composition: copy left/top and one concrete A4 output/workflow preview right/below.

Draft copy direction:

```text
Eyebrow: Workspace asesmen untuk guru
H1: Dari materi menjadi lembar soal yang siap ditinjau dan dicetak.
Body: Pilih kelas, mapel, materi, dan jenis asesmen. lembar membantu membuat draft,
      lalu Anda memeriksa setiap soal sebelum hasilnya difinalkan.
Primary: Buat lembar pertama
Secondary: Lihat contoh hasil
Trust note: Draft AI selalu ditinjau guru. Materi pribadi tetap private.
```

Copy is draft and must be content-reviewed. Do not say “otomatis sesuai Kurikulum Merdeka”;
state available combinations based on catalog readiness.

Output preview requirements:

- clearly synthetic/non-active exam content;
- one sheet, answer sheet snippet, and key tab—not a wall of floating cards;
- shows `Draft` or `Contoh`, never implies customer data;
- readable hierarchy at 1280 and meaningful crop at 390;
- no fake cursor/type animation.

### Proof without fabricated social proof

Until real evidence exists, use product facts only:

- `Review sebelum final`
- `Print dan PDF dari versi yang sama`
- `Sumber materi dapat ditelusuri`
- `Private by default`

Do not show numbers, school logos, ratings, or quotations before written evidence/permission.

### How it works

Three anchored stages:

1. `Tentukan konteks` — kelas, mapel, materi, source, type, difficulty.
2. `Tinjau draft` — check source support, answer, distractors, language.
3. `Gunakan hasil` — final version, print/PDF, controlled web link, save/duplicate.

Each stage uses one real interface crop and one sentence. Avoid generic feature cards.

### Source and trust section

Explain catalog source and private PDF without claiming every book is available. Include:

- provenance per question where supported;
- teacher remains final decision maker;
- no auto-public bank;
- user PDF is not a public/training source by default;
- link to privacy details when ready.

### Workflow depth

Show history, private bank, templates, and duplicate as continuation after first output. Avoid
presenting every roadmap feature as shipped; feature flags/status drive copy.

### Teacher/school split

Two text blocks, not two giant pricing cards:

- `Untuk guru` → personal workspace and self-serve CTA.
- `Untuk sekolah` → admin, seats, pooled usage, controlled onboarding; CTA to school page.

### Packaging teaser

If D-009 remains open:

- labels `Teacher Free`, `Teacher Pro`, `Untuk sekolah` may be shown as packaging concepts;
- price slot says `Harga sedang disiapkan` or omitted;
- CTA `Mulai gratis` only when entitlement exists; `Kabari saya` requires consent.

Never display hypothesis price or crossed-out fake price.

### FAQ

Minimum questions:

- Apakah hasil langsung final?
- Materi apa yang dapat dipakai?
- Apakah PDF saya disimpan atau dibagikan?
- Apakah semua kelas/mapel tersedia?
- Apa bedanya print, PDF, dan tautan web?
- Apakah siswa perlu akun?
- Bagaimana sekolah mengelola guru?

Answers must reflect actual release, not roadmap.

### Final CTA/footer

One concise outcome CTA. Footer includes product, school, help/contact, privacy/terms, and
copyright. No social icons without maintained accounts.

Navigation, footer, and global CTA are one versioned global content set shared by /,
/untuk-sekolah, and /harga. Route-specific pages must not duplicate or drift these elements.
The frontend seed matches the approved Figma content until a published CMS version replaces it.

## `/untuk-sekolah`

Audience: principal, curriculum lead, IT/admin, procurement.

Sections:

1. School outcome: give teachers a controlled workspace, not replace pedagogy.
2. Admin flow: create workspace → invite/activate → assign seat/usage → monitor aggregate.
3. Governance: roles, private-by-default content, audit, versioned catalog.
4. Pilot scope: who it is for, current cohort/limitations, onboarding support.
5. Procurement FAQ: data, security, retention, support, billing—only approved answers.
6. Lead form: name, work email/phone only when necessary, school, role, approximate teachers,
   goal, consent. Avoid asking student data.

CTA: `Ajukan pilot` or `Bicara dengan tim lembar`; never `Beli sekarang` before process exists.

## `/harga`

The page may ship before nominal price only if it helps explain packaging honestly.

Requirements:

- compare entitlement dimensions, not a decorative three-card clone;
- distinguish individual subscription from application role;
- show included usage in human terms once approved;
- explain failed-job quota refund policy;
- show tax/billing period/renewal when payment is live;
- school uses custom/pilot CTA;
- FAQ includes downgrade, cancellation, remaining allowance, and data retention.

## SEO and metadata

- Unique title/description per public route in Indonesian.
- Canonical URL from production config.
- Structured data only for facts that qualify; no fake rating/price.
- OG image uses brand + output sample, not screenshot with private content.
- Semantic HTML and descriptive links.
- Sitemap excludes app, token, ops, preview, and noncanonical routes.

## Performance budget

- Hero works without JS.
- No autoplay video required for understanding.
- Above-fold image responsive, dimensioned, compressed, and non-blocking.
- Target Core Web Vitals tracked on real devices; initial lab budget in quality doc.
- Third-party analytics/lead tools need consent/privacy review and performance owner.

## Responsive behavior

- 390: single column, copy then meaningful output crop; no horizontal overflow.
- 768: 6/6 hero or stacked based on content fit.
- 1280+: 5/7 composition, maximum reading width ~620 px.
- FAQ, nav, and comparison fully keyboard accessible.
- Long Indonesian copy does not truncate critical meaning.

## Landing acceptance

- Every claim maps to accepted decision or shipped capability.
- Price/social proof placeholders cannot reach production accidentally.
- Primary CTA destination exists and handles auth state.
- 390/768/1280 screenshots reviewed against anti-slop constraints.
- Keyboard, focus, contrast, reduced motion, and no-JS core content pass.
- Analytics carries no form free text except to approved first-party endpoint.
