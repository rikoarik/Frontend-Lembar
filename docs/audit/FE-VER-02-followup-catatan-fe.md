# FE-VER-02 follow-up — catatan FE (t_90a72c5f)

Kartu: `t_90a72c5f` · Laporan induk: `docs/audit/E2E-VER-02-live-2026-09-30.md`

Berkas ini menutup dua temuan yang DoD-nya "dokumentasikan" dan satu yang butuh
koordinasi BE, supaya tidak hilang saat follow-up berikutnya.

## F-8 — `GET /v1/school/settings` tanpa guard peran (BE)

**Tidak ada perubahan FE.** Endpoint ini milik BFF `app/v1/school/[...slug]/route.ts`
yang meneruskan apa adanya ke `GET /v1/school/settings` di backend; FE `/school/*`
sendiri sudah 307 → `/app` untuk teacher (dibuktikan di laporan induk), jadi tidak ada
permukaan UI yang bocor.

Yang harus berubah ada di **backend**: samakan guard GET dengan `dashboard`/`billing`
(`403 PERMISSION_DENIED` untuk non-`school_admin`). Setelah guard BE aktif, FE tidak
perlu penyesuaian — `schoolService.settings()` sudah menangani 403 lewat `Result` error
dan menampilkan pesan aman.

Status: **menunggu BE.** Kartu follow-up BE belum dibuat karena laporan induk sudah
mencatatnya sebagai rekomendasi; angkat ke kartu `lembar-backend` bila akan dikerjakan.

## F-12 — SSR `/app/review`, `/app/output`, `/app/review/*/finalize` hanya shell

**Bukan bug, dan sudah ada loading state yang terlihat.** Halaman-halaman ini adalah
client component yang mengambil data lewat BFF setelah mount, jadi HTML pertama memang
hanya berisi shell + skeleton — perilaku yang disengaja, bukan render kosong.

Bukti HTML awal (build worktree, sesi teacher nyata) — ketiganya memuat skeleton
`aria-busy="true"` + `animate-pulse` di `<main id="konten-utama">`:

| Route | HTTP | Skeleton di HTML awal |
|---|---|---|
| `/app/review/{id}` | 200 | `<div class="flex flex-col gap-3" aria-busy="true" aria-label="Memuat tinjauan">` |
| `/app/output/{id}` | 200 | `<div class="h-48 animate-pulse rounded-md bg-brand-line" aria-busy="true">` |
| `/app/review/{id}/finalize` | 200 | `<div class="h-40 animate-pulse rounded-md bg-brand-line" aria-busy="true">` |

Konsekuensi yang perlu diketahui (bukan cacat): konten tidak ada di HTML pertama, jadi
SEO/`curl`-only check tidak akan melihat isi halaman. Semua route ini sudah
`robots: noindex` (area aplikasi ber-sesi), jadi tidak ada risiko indeks.

Tidak ada perubahan kode untuk F-12 — hanya dokumentasi ini.
