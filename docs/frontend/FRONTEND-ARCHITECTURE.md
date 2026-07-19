# Frontend Architecture — Frontend-Lembar

## Goals

- Cepat dan ringan pada koneksi/perangkat guru yang beragam.
- Landing SEO-friendly dan app tetap responsif.
- Contract-safe terhadap backend repo terpisah.
- Accessible by default.
- UI state predictable untuk job asinkron.
- Tidak menyimpan business truth atau secret backend.

## Proposed stack direction

This table is a recommendation. Framework/language rows become binding only after D-014/D-015
are `Accepted`; individual libraries still require the task that introduces them.

| Area              | Direction                                                         |
| ----------------- | ----------------------------------------------------------------- |
| Runtime/framework | Proposed stable Node LTS + stable Next.js App Router; D-015       |
| Language          | Proposed TypeScript strict; D-014                                 |
| Package manager   | pnpm                                                              |
| Styling           | Tailwind CSS + CSS variables/design tokens                        |
| Primitives        | Accessible headless primitives; wrapper milik `lembar`            |
| Forms             | React Hook Form + Zod untuk UX validation                         |
| Server data       | Generated OpenAPI client + TanStack Query untuk interactive cache |
| Local UI state    | React state; state machine/reducer hanya untuk flow kompleks      |
| Test              | Vitest, Testing Library, MSW, Playwright                          |
| Visual/a11y       | Playwright screenshots + axe checks pada flow kritis              |
| Analytics         | Provider adapter; event contract tanpa konten sensitif            |

Dependency major version dikunci pada bootstrap melalui lockfile. Agent tidak memilih canary
atau mengganti framework tanpa task/ADR.

## Repository layout

```text
app/
  (marketing)/
  (auth)/
  (app)/
  (admin)/
components/
  ui/
  marketing/
  assessment/
features/
  auth/
  workspace/
  catalog/
  sources/
  assessment/
  review/
  output/
lib/
  api/generated/
  api/client/
  analytics/
  auth/
  config/
  formatting/
styles/
tests/
docs/
```

Route group adalah organisasi UI, bukan authorization boundary. Backend tetap memverifikasi
semua permission.

## Rendering strategy

- Marketing: server-render published structured CMS content with validated local seed fallback;
  minim JavaScript.
- Authenticated shell: server-render initial session/workspace bila topology memungkinkan.
- Interactive forms/review/job tracking: client components pada boundary terkecil.
- Jangan menjadikan seluruh dashboard satu client component.
- Jangan men-cache data tenant lintas account/workspace.
- Mutation selalu melalui generated client/wrapper yang memasukkan CSRF, workspace, dan
  idempotency sesuai kontrak.

### Marketing CMS boundary

- app/(marketing)/layout owns one shared navbar/footer for every public route.
- Editable copy, CTA, navigation, footer, FAQ, SEO, and media references enter through one
  typed marketing-content boundary; page JSX does not scatter these strings.
- A local component registry maps supported block types to code-owned components. Network
  content cannot select an arbitrary module/component.
- Public page fetch is server-side, bounded by timeout, schema-validated, and keyed by
  slug + locale + content version.
- Bundled Figma-approved seed is required and validated in CI. API timeout, 5xx, or unknown
  schema falls back safely instead of returning a blank page.
- Preview data is authenticated and no-store; it never enters public metadata or cache.
- See MARKETING-CMS-FRONTEND.md for the complete contract.

## API integration

- Backend adalah owner OpenAPI.
- CI mengambil versi kontrak yang dipin dan menjalankan codegen deterministik.
- Generated code tidak diedit manual.
- Wrapper menangani base URL, credentials, request ID, error envelope, dan unknown enum.
- Query keys selalu memasukkan workspace ID untuk data tenant.
- Saat switch workspace: cancel request lama, clear/rekey cache, lalu render workspace baru.

Topology produksi yang direkomendasikan adalah same-origin gateway/reverse proxy:

```text
browser -> app domain /api/v1/* -> Backend-Lembar /v1/*
```

Ini menyederhanakan cookie, CSRF, dan CORS. Jika hosting memilih `api.` origin terpisah,
backend harus memakai explicit CORS allowlist dan credential policy; keputusan dicatat ADR.

## State model

### Remote state

TanStack Query menyimpan data dari API. Tidak memindahkan business rules ke query callbacks.

### Form state

Form schema frontend memberi feedback cepat, tetapi backend validation authoritative.
Mapping `fieldErrors` ke form harus aman terhadap field baru.

### Job state

Job UI memetakan stage backend ke copy netral. Polling baseline; SSE/WebSocket hanya setelah
ada kebutuhan terukur. Polling berhenti pada terminal state, tab hidden memperlambat interval,
dan reconnect melanjutkan job yang sama.

### Draft state

Optimistic update hanya dipakai jika rollback jelas. Editor memakai version/ETag atau
revision number untuk mencegah silent overwrite.

## Environment boundary

Contoh frontend-only:

```env
APP_ENV=development
WEB_PORT=3000
PUBLIC_APP_URL=http://localhost:3000
PUBLIC_API_BASE_URL=/api
PUBLIC_ANALYTICS_ENABLED=false
```

Aturan:

- Prefix public hanya untuk nilai yang benar-benar aman dilihat browser.
- Tidak ada `DATABASE_URL`, `OPENAI_API_KEY`, storage secret, queue secret, atau auth secret.
- Build tidak memerlukan secret produksi.
- Runtime server-only config divalidasi terpisah dari public config.

## Error handling

- Expected error tampil pada boundary terdekat dan mempertahankan input pengguna.
- `401`: jalur re-auth dengan return path yang aman.
- `403`: permission state, bukan “resource missing” generik jika aman.
- `409`: conflict UI dan refresh/reconcile, bukan retry buta.
- `429`: cooldown/retry hint.
- `5xx` retryable: tombol retry dan request ID.
- Unexpected error: route/global error boundary dengan logging yang disanitasi.

## Security

- Tidak menyimpan session di localStorage.
- HTML dari AI/source tidak dirender mentah.
- Share/signed token tidak masuk analytics atau referrer.
- External link aman dan URL yang tampil berasal dari allowlisted/escaped data.
- CSP, security headers, dependency scanning, dan no-source-map-secret check menjadi gate.
- Middleware/proxy frontend hanya UX gate, bukan authorization truth.

## Performance budgets

- Marketing JS awal dijaga minimal; library dashboard tidak masuk bundle landing.
- Public CMS content uses ETag/conditional fetch and at most 60-second revalidation for MVP;
  no polling or client data library is required on public routes.
- Tidak ada horizontal overflow pada 360px.
- Hero tidak bergantung pada video berat.
- Font self-host/subset bila lisensi mengizinkan.
- Gambar memakai size/responsive loading.
- Core Web Vitals diukur pada preview dan produksi.
- Budget numerik final ditetapkan saat F0 setelah baseline Lighthouse/WebPageTest.

## Package and reuse policy

- Prefer platform/Next primitives and small local modules over broad UI/state libraries.
- A shared abstraction must remove duplication across at least two real consumers or enforce
  a security/contract invariant; do not create speculative generic layers.
- Feature modules may import shared primitives/contracts, never another feature's internal
  implementation.
- Generated API code is isolated behind feature adapters so contract regeneration does not
  spread throughout component code.
- Public marketing, authenticated app, and ops bundles remain separate route boundaries.
