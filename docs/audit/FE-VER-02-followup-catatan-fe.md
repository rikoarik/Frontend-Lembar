# FE-VER-02 follow-up — catatan FE (t_90a72c5f)

Kartu: `t_90a72c5f` · Laporan induk: `docs/audit/E2E-VER-02-live-2026-09-30.md`

Berkas ini mencatat status akhir tiap temuan FE-VER-02 setelah perbaikan, termasuk dua
temuan yang DoD-nya "dokumentasikan" dan dua yang butuh koordinasi BE.

Ringkasan: F-3/F-4/F-5/F-6/F-7/F-9 **diperbaiki dan diverifikasi live**; F-8 **menunggu BE**;
F-12 **bukan bug**, hanya dokumentasi.

## F-3 — `/ops/profile` identitas palsu (termasuk shell chrome)

Diperbaiki di dua tempat:

1. `OpsProfileSection.tsx` membaca `/v1/me` (identitas + role + permissions) dan
   `/v1/me/session` (klaim `iat`/`exp` JWT) — literal `Ops Superadmin`,
   `ops@lembar.id`, `FULL_CONTROL`, `Selamanya`, dan `new Date()` saat mount dibuang.
2. **Shell chrome** (`AdminAppShell.tsx` + `AdminChrome.tsx`): footer sidebar dan menu
   profil masih merender literal `Ops Superadmin · platform · least privilege` di setiap
   halaman `/ops/*` (termasuk `/ops/profile`), jadi perbaikan kartu profil saja tidak
   cukup. Sekarang lewat `useActorIdentity()` (`/v1/me`) dan fallback-nya hanya label
   peran netral (`Superadmin` / `Platform`) — tidak ada lagi nama akun fiktif.

Bukti live (`/ops/profile`, sesi `allroles@test.com`, build worktree):
`Ops Superadmin` = 0 kemunculan, `platform · least privilege` = 0; sidebar + menu profil
menampilkan `All Roles` / `allroles@test.com`.

## F-8 — `GET /v1/school/settings` tanpa guard peran (BE)

**Tidak ada perubahan FE.** Endpoint ini milik BFF `app/v1/school/[...slug]/route.ts`
yang meneruskan apa adanya ke `GET /v1/school/settings` di backend; FE `/school/*`
sendiri sudah 307 → `/app` untuk teacher (dibuktikan di laporan induk dan diulang di
sesi ini), jadi tidak ada permukaan UI yang bocor.

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

Bukti HTML awal (build worktree, sesi nyata) — ketiganya memuat skeleton
`aria-busy="true"` + `animate-pulse` di `<main id="konten-utama">`:

| Route                       | HTTP | Skeleton di HTML awal                                                             |
| --------------------------- | ---- | --------------------------------------------------------------------------------- |
| `/app/review/{id}`          | 200  | `<div class="flex flex-col gap-3" aria-busy="true" aria-label="Memuat tinjauan">` |
| `/app/output/{id}`          | 200  | `<div class="h-48 animate-pulse rounded-md bg-brand-line" aria-busy="true">`      |
| `/app/review/{id}/finalize` | 200  | `<div class="h-40 animate-pulse rounded-md bg-brand-line" aria-busy="true">`      |

Konsekuensi yang perlu diketahui (bukan cacat): konten tidak ada di HTML pertama, jadi
SEO/`curl`-only check tidak akan melihat isi halaman. Semua route ini sudah
`robots: noindex` (area aplikasi ber-sesi), jadi tidak ada risiko indeks.

Tidak ada perubahan kode untuk F-12 — hanya dokumentasi ini.

## Catatan sisa (di luar DoD kartu ini)

- `/ops/accounts/<id-tak-dikenal>` (mis. `/ops/accounts/zzz`) tetap **200** dan merender
  "Detail Akun / ID: zzz" kosong. `isKnownAdminSection` sengaja mengizinkan prefix
  `accounts/` (sub-route detail valid), jadi slug non-UUID tidak tertangkap 404. Tidak
  ada kebocoran data (fetch detail gagal dan dirender sebagai kosong), tapi kalau mau
  ketat, validasi UUID di cabang detail. Bukan bagian dari F-5.
