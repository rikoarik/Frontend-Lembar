# Audit Flow Live — Library, Kelas, Analitik, LMS, Share

Task: `t_4777aedf` · Plan: `FE-AUD-03` (`docs/audit/PLAN-FE-2026-09-28.md`)
Role: `lembar-qa` · Tanggal: 2026-09-28 · Lingkungan: live (`app.lembar.web.id` → BFF → `127.0.0.1:4000`)
Branch audit: `wt/audit-flow-live-library-kelas-analitik-l` @ `d2927bc`

Scope: `/app/bank-soal`, `/app/template`, `/app/kelas`, `/app/analitik`, `/app/bantuan`, `/app/gates`, `/attempt/[token]`, `/bagikan/[token]`

---

## 1. Metode

- **Kode**: baca route + view + BFF handler di worktree audit.
- **Live HTTP**: probe dengan cookie jar nyata dari `POST /v1/auth/login`.
- **Akun test (seed DB, bukan akun owner)**:
  - `siti.nurhaliza@sdncontoh.sch.id` / `Lembar123!` → role `teacher`, workspace **personal** `105f43bf-a27c-43fb-b344-7e94a892fceb`
  - `allroles@test.com` / `Test1234!` → role `superadmin` (semua role), workspace **school** `e96e9772-d9e4-4cdf-a960-8c82b68bc1c6` (berisi assessment `final` + bank soal)
- **Bukti DB**: `psql` langsung ke Postgres backend untuk verifikasi tulis-baca.

---

## 2. Ringkasan per route

| Route | Kode | HTTP live (sesi) | HTTP live (tanpa sesi) | Status | Catatan |
|---|---|---|---|---|---|
| `/app/bank-soal` | `BankSoalView` | 200 | 307 → `/masuk` | **LIVE** | GET `/v1/bank/questions` 200; data nyata per workspace |
| `/app/template` | `TemplateView` | 200 | 307 → `/masuk` | **LIVE** | list/create/delete nyata; lihat BUG-02 |
| `/app/kelas` | `app/(app)/app/kelas/page.tsx` (inline, 253 L) | 200 | 307 → `/masuk` | **LIVE** | CRUD kelas + siswa nyata; lihat BUG-04 |
| `/app/analitik` | `CreatorAnalyticsView` | 200 | 307 → `/masuk` | **LIVE (derivasi client)** | Tidak ada endpoint analitik; agregasi di client dari `/v1/assessments` |
| `/app/bantuan` | `HelpCenterView` | 200 | 307 → `/masuk` | **LIVE** | 4 topik statis + form laporan nyata (`/v1/quality-reports` 201) |
| `/app/gates` | `IntegrationGatesView` | 200 | 307 → `/masuk` | **MOCK / PLACEHOLDER** | Konten hardcoded "mock evidence"; tidak ada data live |
| `/attempt/[token]` | `StudentRunner` | 200 | **200** (publik, benar) | **LIVE** | Siklus penuh terverifikasi; lihat BUG-03 |
| `/bagikan/[token]` | redirect shim | **307 → `/attempt/<token>`** | 307 | **LEGACY SHIM** | Bukan halaman; hanya redirect |

Tidak ada route dalam scope yang 404. Route non-scope yang tersentuh: `/school` untuk `teacher` → 307 `/app` (guard benar), `/app/tidak-ada` → 200 (catch-all `[...slug]`).

---

## 3. Detail temuan per surface

### 3.1 `/app/bank-soal` — LIVE

- View: `src/features/library/BankSoalView.tsx` (78 L). Fetch `GET /v1/bank/questions` dengan `credentials: 'include'`.
- BFF: `app/v1/bank/questions/route.ts` → BE `/v1/bank/questions?limit=100`, kirim `x-workspace-id`.
- Bukti live:
  - teacher personal → `{"data":{"questions":[]}}` (200) — empty state benar.
  - allroles school → `count 3` soal nyata (stem, options, answer, explanation, `versionMetadata.providerModelId: "ngoding"`).
- State: loading, error (`role="alert"`), empty + CTA ke `/app/generate` — lengkap.
- **Tidak ada mock.** Tidak ada filter/pencarian/paginasi (keterbatasan fungsional, bukan bug).

### 3.2 `/app/template` — LIVE (dengan 2 bug)

- View: `src/features/library/TemplateView.tsx` (160 L). `GET/POST /v1/templates`, `DELETE /v1/templates/:id`.
- BFF: `app/v1/templates/route.ts`, `app/v1/templates/[templateId]/route.ts` → BE `src/modules/templates/adapters/http/templateRoutes.ts`.
- Bukti live: create 201 (`{"id":"99d9cb9e-…","name":"QA template",…}`), list menampilkan 1 item, delete 204, list kembali kosong.
- Konfirmasi hapus inline (bukan `confirm()`), disabled state saat busy — baik.

### 3.3 `/app/kelas` — LIVE

- **View inline di `app/(app)/app/kelas/page.tsx`** (253 L) — satu-satunya route scope yang tidak memakai folder `src/features/*`. Inkonsistensi arsitektur.
- BFF: `app/v1/classes/route.ts`, `[classId]/route.ts`, `[classId]/students/route.ts`.
- Bukti live (teacher, workspace personal):
  - `POST /v1/classes` → 201 `{"id":"73cc0f37-…","name":"QA 5A","gradeLabel":"Kelas 5","schoolYear":"2026/2027","studentCount":0}`
  - `POST /v1/classes/<id>/students` → 201 `{"id":"ed4860ff-…","name":"Siswa QA","studentNumber":"QA-001"}`
  - `GET /v1/classes` → `studentCount` naik 0 → 1
  - DB: `teacher_classes` 1 baris (workspace personal guru) + `class_students` 1 baris — konsisten.
- Empty state, error alert, `confirm()` untuk hapus kelas — ada.
- Tidak ada edit kelas / edit siswa / hapus siswa dari UI (DELETE di BFF ada, tidak dipakai).

### 3.4 `/app/analitik` — LIVE tapi derivasi client

- View: `src/features/analytics/CreatorAnalyticsView.tsx` (151 L).
- **Tidak ada endpoint analitik.** Data diambil dari `assessmentService.list()` (`GET /v1/assessments`) lalu difilter/diagregasi di browser: rentang 7d/30d/183d, hitung `final`/`review`/total soal, distribusi mapel.
- Konsekuensi: agregasi hanya mencakup halaman assessment yang dikembalikan endpoint (tidak ada paginasi eksplisit) → angka bisa **under-count** pada workspace besar tanpa peringatan apa pun. Label "Analitik pembuat" + "Ringkasan dari assessment workspace aktif" menyesatkan kalau dianggap server-side analytics.
- Empty state dan error state ada. Bukan mock, tapi bukan analitik sungguhan.

### 3.5 `/app/bantuan` — LIVE

- View: `src/features/help/HelpCenterView.tsx` (148 L). `HELP_TOPICS` = 4 panel statis (generate, review, output, privasi).
- Form laporan: `POST /v1/quality-reports` → BFF `app/v1/quality-reports/route.ts` → BE `/v1/admin/quality-reports`.
- Bukti live:
  - allroles → 201 `{"reportId":"6246221c-…","assessmentId":"41a74fd1-…"}`
  - teacher → 201 `{"reportId":"e5b7fab5-…"}`
  - DB `admin_quality_reports`: 2 baris baru, `status='open'`, `reason='kualitas_soal'`.
- Copy aman (tidak mengirim stem utuh) sesuai desain. Topik bantuan **hardcoded di komponen** (belum i18n, belum dari CMS).

### 3.6 `/app/gates` — MOCK / PLACEHOLDER (bukan live)

- View: `src/features/gates/IntegrationGatesView.tsx` (100 L).
- Isi: array `CHECKS` hardcoded 5 gate (`F2-05`, `F3-05`, `F4-04`, `F5-05`, `F6-04`) dengan status `pass`/`partial` dan bukti berupa string literal.
- Judul halaman sendiri menyatakan: **"Integration gates (mock evidence)"** dan deskripsi "Bukti frontend mock-first."
- Tidak ada fetch, tidak ada endpoint, tidak ada data live. `F5-05` mengklaim "Share create/copy/revoke **mock**" — padahal `ShareManager` sekarang sudah live (lihat §3.8), jadi klaim gate ini **stale dan salah**.
- Link "Output sample" → `/app/output/asm_ipas_02` (ID fiktif).
- Route tidak ada di `LeftRail` maupun `TopBar` (judul fallback `'lembar'`) → surface yatim, hanya reachable via URL langsung.
- **Rekomendasi: hapus dari produksi, atau ubah jadi halaman internal non-produksi.**

### 3.7 `/attempt/[token]` — LIVE (publik, benar)

- View: `src/features/lms/StudentRunner.tsx` (694 L). Metadata `robots: noindex,nofollow`.
- BFF publik (tanpa auth — benar): `app/v1/public/shares/[token]/route.ts`, `.../attempts/route.ts`, `.../attempts/[attemptId]/answers/route.ts` (PUT), `.../submit/route.ts` (POST).
- Bukti live siklus penuh (share baru dari `POST /v1/shares`, token `5c12cb8e…`):
  1. `GET /v1/public/shares/<t>` → 200, `questions` terisi (1 soal, opsi A–D)
  2. `POST .../attempts` `{guestName,guestClass}` → 201 `{"id":"f4d7f147-…","status":"in_progress"}`
  3. `PUT .../attempts/<a>/answers` → 200, `answers` tersimpan, `lastSavedAt` berubah
  4. `POST .../attempts/<a>/submit` → 200 `{"status":"submitted","rawScore":1,"maxScore":1}`
  5. DB `assessment_attempts`: `guest_name='Siswa QA'`, `status='submitted'`, `raw_score=1`, `submitted_at` terisi
  6. `DELETE /v1/shares/<t>/revoke` → 200 `revokedAt` terisi
  7. `GET /v1/public/shares/<t>` setelah revoke → **410** `{"code":"RESOURCE_NOT_FOUND","message":"Share link has been revoked."}`
- Autosave: debounce + queue serialisasi + `sessionStorage` resume + timer durasi + auto-submit. Solid.

### 3.8 Share manager (di dalam `/app/output/[assessmentId]`)

- `src/features/share/ShareManager.tsx` (177 L) — **LIVE**, pakai `/v1/shares`, `/v1/shares/:token/revoke`. Dipasang di `OutputCenterView.tsx:200`.
- `src/features/share/mockShareStore.ts` (92 L) — **dead mock store**: satu-satunya referensi non-test adalah file testnya sendiri (`__tests__/share-store.test.ts`). Tidak diimpor produksi mana pun. Kandidat hapus.

---

## 4. Daftar fitur: mock/placeholder vs live

### LIVE (endpoint nyata + bukti)

| Fitur | Endpoint | Bukti |
|---|---|---|
| Bank soal pribadi | `GET /v1/bank/questions` | 3 soal nyata (school ws), empty (personal ws) |
| Template list | `GET /v1/templates` | 200 `[]` → 1 item setelah create |
| Template create | `POST /v1/templates` | 201 + row DB |
| Template delete | `DELETE /v1/templates/:id` | 204, list kosong lagi |
| Kelas list/create | `GET/POST /v1/classes` | 201 + `teacher_classes` row |
| Siswa list/create | `GET/POST /v1/classes/:id/students` | 201 + `class_students` row |
| Analitik (derivasi client) | `GET /v1/assessments` | tidak ada endpoint analitik |
| Bantuan: laporan kualitas | `POST /v1/quality-reports` | 201 ×2 + `admin_quality_reports` |
| Share create | `POST /v1/shares` | 201 token |
| Share list | `GET /v1/shares?assessmentId=` | 200 (termasuk yang revoked) |
| Share revoke | `DELETE /v1/shares/:token/revoke` | 200 `revokedAt` |
| Public share read | `GET /v1/public/shares/:token` | 200 / **410** setelah revoke |
| Attempt start/save/submit | `POST/PUT /v1/public/shares/:t/attempts…` | 201/200/200 + `assessment_attempts` |

### MOCK / PLACEHOLDER

| Item | Lokasi | Bukti |
|---|---|---|
| Seluruh halaman `/app/gates` | `src/features/gates/IntegrationGatesView.tsx` | array `CHECKS` hardcoded, 0 fetch |
| Klaim gate `F5-05` "Share create/copy/revoke mock" | idem L43 | **stale** — share sudah live |
| Link "Output sample" `/app/output/asm_ipas_02` | idem L88 | assessment ID fiktif |
| `mockShareStore` | `src/features/share/mockShareStore.ts` | dead code, hanya dipakai test |
| `GET /v1/lms/attempts` (mock store + live branch) | `app/v1/lms/attempts/route.ts` | **orphan**: 0 referensi di produksi maupun test |
| `GET /v1/quality-reports` | `app/v1/quality-reports/route.ts` L~130 | selalu `mockNotFound()` |
| `GET /v1/shares/[token]` | `app/v1/shares/[token]/route.ts` | selalu 410 `LEGACY_SHARE_DISABLED` (by design) |
| Topik bantuan | `HelpCenterView.tsx` L7–28 | hardcoded di komponen |

---

## 5. Bug bernomor

**BUG-01 · P1 · `/app/gates` menampilkan bukti mock sebagai gate yang lulus, termasuk klaim yang sudah tidak benar.**
`IntegrationGatesView` menampilkan 5 gate dengan status `pass` dan teks "Share create/copy/revoke **mock**", padahal share sudah live sejak `ShareManager` memakai `/v1/shares`. Halaman ini juga tidak ada di navigasi (yatim), tapi tetap 200 di produksi. → Hapus dari produksi atau beri banner tegas + pindahkan ke route non-produksi.

**BUG-02 · P1 · BFF `/v1/templates` menerjemahkan error validasi jadi 500 INTERNAL_ERROR.**
`POST /v1/templates` dengan config tidak lengkap → `500 {"code":"INTERNAL_ERROR","message":"Konfigurasi template tidak valid","retryable":true}`. Akar: BE `templateRoutes.ts` memanggil `throwApiError('validation_error', …)` / `throwApiError('conflict', …)`, tapi `codeMap` di `src/common/errors/apiError.ts` tidak punya kunci `validation_error` maupun `conflict` → jatuh ke default `INTERNAL_ERROR`. Nama duplikat juga jadi 500, bukan 409. Dampak: klien tidak bisa membedakan input salah dari server rusak, dan `retryable:true` mengundang retry sia-sia. → Tambahkan `validation_error → VALIDATION_FAILED`, `conflict → STATE_CONFLICT`, `not_found → RESOURCE_NOT_FOUND` ke `codeMap`.

**BUG-03 · P2 · `/attempt/[token]` mengembalikan HTTP 200 untuk token tidak valid/kedaluwarsa/dicabut.**
`curl /attempt/<token-revoked>` → **200** (bukan 404/410). `curl /attempt/doesnotexist` → **200**. Halaman merender shell lalu menampilkan error di client. Untuk halaman publik tanpa auth, status HTTP yang benar penting untuk crawler/monitoring. → Pertimbangkan status 404/410 saat token tidak resolve, atau pastikan `robots: noindex` (sudah ada) sebagai mitigasi minimum.

**BUG-04 · P2 · Route `/app/kelas` dan `/app/analitik` bergantung pada `activeRole` untuk visibilitas nav, tapi tidak ada guard di level route.**
`LeftRail` menyembunyikan `Kelas`/`Analitik` kecuali `school_admin`/`superadmin` dan workspace `school` (`LeftRail.tsx:130–133`). Namun `proxy.ts` tidak memblokir path-nya: user `teacher` di workspace **personal** mendapat **200** untuk `/app/kelas` dan `/app/analitik`, dan **`GET /v1/classes` juga 200** — teacher berhasil membuat kelas di workspace pribadinya (bukti DB di §3.3). Ini konsisten dengan BFF `classes` yang hanya cek auth, bukan entitlement. → Tegaskan keputusan produk: kalau kelas memang fitur sekolah, tambahkan guard di `proxy.ts` + cek entitlement di BFF; kalau kelas untuk semua guru, perbaiki `LeftRail` supaya tidak menyembunyikannya.

**BUG-05 · P3 · Tautan "Buat template baru" tidak melakukan apa yang dijanjikan.**
`TemplateView.tsx:80` menaut ke `/app/generate?saveTemplate=1`, tetapi `ConfigurationCompose.tsx` hanya membaca `templateId` (`L137`), bukan `saveTemplate`. Parameter diabaikan sepenuhnya: user mendarat di form generate tanpa fokus/scroll ke panel "Simpan sebagai template". → Hapus parameter, atau implementasikan perilakunya.

**BUG-06 · P3 · `/v1/lms/attempts` adalah endpoint orphan dengan mock store mati.**
`app/v1/lms/attempts/route.ts` (GET/POST/PUT) berisi `mockAttempts` Map + cabang `isMockApiMode()`, tapi **nol referensi** di seluruh repo (produksi maupun test). Ini endpoint BFF yang bisa dipanggil siapa pun dan akan mem-proxy ke BE tanpa auth untuk GET (`backendFetch('/v1/assessments/:id/print')`). → Hapus, atau dokumentasikan sebagai endpoint yang benar-benar dipakai.

**BUG-07 · P3 · Analitik mengagregasi di client tanpa peringatan cakupan.**
`CreatorAnalyticsView` memakai `assessmentService.list()` lalu memfilter di browser. Tidak ada indikasi kalau daftar terpotong/paginasi, sehingga KPI ("Lembar dibuat", "Soal tersimpan") bisa lebih kecil dari kenyataan tanpa peringatan. → Tambahkan endpoint agregasi BE, atau minimal tampilkan catatan cakupan data.

**BUG-08 · P3 · `mockShareStore.ts` dead code.**
92 baris store mock yang hanya dipakai file testnya sendiri. Membingungkan pembaca yang mengira share masih mock. → Hapus store + testnya, atau pindahkan ke folder test fixtures.

---

## 6. Baseline & artefak

- Akun test dipakai: 2 (teacher personal, allroles school). Tidak ada akun owner disentuh.
- Data uji yang dibuat: 1 kelas (`73cc0f37-…`, workspace personal guru) + 1 siswa (`ed4860ff-…`), 1 share (dibuat lalu **dicabut**), 1 attempt (submitted), 2 quality report, 1 template (dibuat lalu **dihapus**). Semua di workspace test, bukan workspace produksi owner.
- Bukti mentah probe tersimpan di `~/.hermes/profiles/lembar-qa/cache/scratch/` (`cj.txt`, `cj2.txt`, `cj3.txt`, `token.txt`, `aid.txt`).
- Tidak ada perubahan kode di repo pada task ini (audit-only).

---

## 7. Verifikasi ulang (2026-09-28 12:56 UTC)

Run verifikasi independen terhadap temuan §1–§5, dengan probe live baru. Semua temuan lama **terkonfirmasi**; tidak ada yang sudah diperbaiki di `dev` sejak audit pertama.

| # | Yang diuji | Hasil | Verdict |
|---|---|---|---|
| R1 | `curl` tanpa sesi ke 6 route `/app/*` dalam scope | semua **307 → `/masuk`** | guard auth benar |
| R2 | Login teacher (`siti.nurhaliza@sdncontoh.sch.id`) | **200**, cookie jar baru | ok |
| R3 | `GET /v1/bank/questions?limit=5` (teacher personal) | **200** `{"data":{"questions":[],"nextCursor":null}}` | LIVE, empty state benar |
| R4 | `GET /v1/templates` (teacher) | **200** `{"data":[]}` | LIVE |
| R5 | `POST /v1/templates` body `{"name":"QA probe","config":{"foo":1}}` | **500** `INTERNAL_ERROR` `"Konfigurasi template tidak valid"` `retryable:true` | **BUG-02 terkonfirmasi** |
| R6 | `POST /v1/templates` body `{"config":{}}` (tanpa nama) | **500** `INTERNAL_ERROR` `"Nama template wajib diisi"` | **BUG-02 terkonfirmasi** (harusnya 400/422) |
| R7 | `POST /v1/templates` nama duplikat → `23505` | BE `throwApiError('conflict', …)` → `codeMap` tidak punya `conflict` → **500** (harusnya 409) | **BUG-02, akar terkonfirmasi di kode** |
| R8 | `codeMap` di `Backend-Lembar/src/common/errors/apiError.ts:16–37` | 20 kunci; **tidak ada** `validation_error`, `conflict`, `not_found` → jatuh ke default `INTERNAL_ERROR` | akar BUG-02 sah |
| R9 | `GET /app/gates` dengan sesi | **200**, body memuat literal `Integration gates (mock evidence)`, `F5-05`, `asm_ipas_02`, `Bukti frontend mock-first` | **BUG-01 terkonfirmasi di produksi** |
| R10 | `grep gates` di `LeftRail.tsx` / `TopBar` / workspace shell | **0 hasil** | route yatim, hanya via URL langsung |
| R11 | `curl /attempt/doesnotexist` | **200**, body memuat `noindex` + teks "tidak ditemukan" | **BUG-03 terkonfirmasi** |
| R12 | `curl /bagikan/abc123` | **307 → `/attempt/abc123`** | shim legacy, sesuai |
| R13 | `GET /app/kelas` + `/app/analitik` sebagai **teacher workspace personal** | keduanya **200** | **BUG-04 terkonfirmasi** |
| R14 | `GET /v1/classes` sebagai teacher personal | **200**, mengembalikan kelas `73cc0f37-…` (`studentCount:1`) yang dibuat di run sebelumnya | **BUG-04 terkonfirmasi**: kelas benar-benar bisa dibuat di workspace pribadi guru |
| R15 | `LeftRail.tsx:29,31` | `Kelas` & `Analitik` diberi `entitlement: 'school_admin'` | nav tersembunyi, route tidak dijaga — kontradiksi sah |
| R16 | `grep -n "saveTemplate"` seluruh repo | hanya `ConfigurationCompose.tsx:419` (nama callback) + `:1208` + `TemplateView.tsx:80` (URL param). `:137` hanya membaca `templateId` | **BUG-05 terkonfirmasi**: param `saveTemplate=1` tidak pernah dibaca |
| R17 | `grep -rn "mockShareStore"` | 1 hasil, hanya `src/features/share/__tests__/share-store.test.ts:8` | **BUG-08 terkonfirmasi**: dead code |
| R18 | `grep -rn "lms/attempts"` | **0 hasil** di produksi maupun test; file `app/v1/lms/attempts/route.ts` ada (5066 B, `mockAttempts` Map) | **BUG-06 terkonfirmasi**: endpoint orphan |
| R19 | `app/v1/quality-reports/route.ts:116–117` | `GET` → `return mockNotFound()` tanpa syarat | mock permanen, sesuai catatan §4 |
| R20 | `app/v1/shares/[token]/route.ts` | selalu `410 LEGACY_SHARE_DISABLED` | by design, sesuai |
| R21 | `grep "kelas\|analitik\|bank-soal\|template" proxy.ts` | **0 hasil** — tidak ada guard path di proxy | akar BUG-04 sah |

### Perubahan status sejak audit pertama

Tidak ada. 8 bug (§5) masih terbuka semua pada `d2927bc`. Ringkasan prioritas yang masih menunggu task perbaikan W4:

- **P1**: BUG-01 (`/app/gates` mock di produksi), BUG-02 (error validasi template jadi 500)
- **P2**: BUG-03 (`/attempt/[token]` 200 untuk token mati), BUG-04 (kelas/analitik tanpa guard entitlement)
- **P3**: BUG-05 (`saveTemplate` param diabaikan), BUG-06 (`/v1/lms/attempts` orphan), BUG-07 (analitik derivasi client), BUG-08 (`mockShareStore` dead code)

### Catatan tambahan (bukan bug baru, untuk W4)

- **BUG-02 berlaku juga untuk `not_found`**: `DELETE /v1/templates/<id-tidak-ada>` → BE `throwApiError('not_found', …)` → `codeMap` tidak punya `not_found` → juga **500**, bukan 404. Satu perbaikan `codeMap` menutup ketiganya (`validation_error`, `conflict`, `not_found`).
- **BUG-04 punya dimensi BE**: guard tidak bisa hanya di FE. `app/v1/classes/route.ts` hanya cek auth; entitlement harus ditegakkan di BFF dan/atau BE sebelum route FE ditutup, kalau keputusan produknya "kelas = fitur sekolah".
- **Data uji tertinggal**: kelas `73cc0f37-…` + siswa `ed4860ff-…` masih ada di workspace personal teacher. Perlu dibersihkan setelah W4, atau dibiarkan sebagai fixture QA.
