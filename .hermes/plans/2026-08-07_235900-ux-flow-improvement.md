# Plan: UX & Flow Improvement — Lembar App
**Dibuat:** 2026-08-07  
**Berdasarkan:** UX Audit `.hermes/ux-audit-2026-08-07.md`  
**Branch target:** `dev`

---

## Konteks & Temuan Aktual

Audit browser + inspeksi codebase menghasilkan koreksi penting terhadap laporan awal:

| Temuan Audit | Kondisi Aktual di Codebase |
|---|---|
| FAQ kosong | ✅ Sudah ada 6 FAQ items di `faq/page.tsx` — mungkin rendering issue di production |
| Bantuan kosong | ✅ Sudah ada 3 guide cards di `bantuan/page.tsx` |
| `/contoh-hasil` tidak ada | ✅ `id="contoh-hasil"` sudah ada di `(marketing)/page.tsx` |
| Route core product 404 | ✅ Ada di `app/(app)/app/generate`, `review`, `output`, `jobs` — hanya protected (redirect ke `/masuk`) |
| `/undangan` 404 | ✅ `app/(auth)/undangan/[token]` sudah ada |
| Tidak ada route siswa | ✅ `app/(lms)/attempt/[assessmentId]` + `StudentRunner` sudah ada |

**Isu nyata yang ditemukan:**
1. `material-symbols-outlined` icon mungkin tidak load di production (font CSS missing/delayed)
2. Middleware tidak cover `/login` → `/masuk` redirect (301)
3. Middleware tidak cover `/register` → `/daftar` redirect (301)  
4. Page `<title>` halaman auth tidak deskriptif (`"lembar"` saja)
5. Form daftar: field `phone` wajib tanpa label/hint kenapa diminta
6. `AnnouncementBanner` tidak punya CTA link ke `/untuk-sekolah`
7. Halaman Harga: teks "Pricing Plans" (English) di tengah konten Indonesia
8. `reset-sandi` default state membingungkan (tidak ada feedback kalau token missing)
9. `StudentRunner` flow — belum diketahui apakah ada onboarding/identity form untuk guest attempt
10. Post-login: tidak ada onboarding state untuk user baru (setelah daftar langsung `/app` kosong)

---

## Scope Plan Ini

Fokus pada **UX flow yang berdampak langsung ke konversi dan pengalaman pengguna baru**, bukan polish visual. Dikelompokkan per area:

---

## Grup A — Route & Redirect (Critical, ~30 menit)

### A1. Redirect `/login` → `/masuk` dan `/register` → `/daftar`

**File:** `middleware.ts`

**Problem:** Middleware matcher hanya cover `/app/*`, `/school/*`, `/ops/*`, `/masuk`, `/daftar`. URL standar `/login` dan `/register` return 404 bukan redirect.

**Fix:**
```typescript
// middleware.ts — tambahkan di awal fungsi middleware, sebelum isApp/isSchool check
const LEGACY_REDIRECTS: Record<string, string> = {
  '/login': '/masuk',
  '/register': '/daftar',
  '/signup': '/daftar',
  '/signin': '/masuk',
};

if (LEGACY_REDIRECTS[pathname]) {
  return redirectTo(request, LEGACY_REDIRECTS[pathname]);
}
```

**Matcher update:**
```typescript
export const config = {
  matcher: ['/app/:path*', '/school/:path*', '/ops/:path*', '/masuk', '/daftar', '/login', '/register', '/signup', '/signin'],
};
```

**Verifikasi:** `curl -I https://app.lembar.web.id/login` → HTTP 307/308 ke `/masuk`

---

### A2. Material Symbols font — pastikan load di semua layout

**File:** `app/layout.tsx` atau `app/(marketing)/layout.tsx`

**Problem:** Icon `material-symbols-outlined` muncul sebagai raw text di production — kemungkinan font tidak dimuat atau dimuat terlambat.

**Cek:** Lihat apakah ada `<link>` Google Fonts untuk `Material+Symbols+Outlined` di root layout.

**Fix jika missing:**
```html
<!-- app/layout.tsx di <head> -->
<link
  rel="preconnect"
  href="https://fonts.googleapis.com"
/>
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
/>
```

**Verifikasi:** Buka `/faq` → icon `expand_more` muncul sebagai chevron, bukan teks "expand_more"

---

## Grup B — Auth UX (High, ~45 menit)

### B1. Page titles deskriptif untuk semua halaman auth

**Files:**
- `app/(auth)/masuk/page.tsx`
- `app/(auth)/daftar/page.tsx`
- `app/(auth)/lupa-sandi/page.tsx`
- `app/(auth)/reset-sandi/page.tsx`

**Problem:** `<title>` semua halaman auth adalah `"lembar"` saja — tidak deskriptif untuk tab browser, bookmark, dan screen reader.

**Fix — tambahkan `export const metadata` ke setiap page:**
```typescript
// masuk/page.tsx
export const metadata = {
  title: 'Masuk — lembar',
  description: 'Masuk ke akun lembar Anda untuk mulai membuat asesmen.',
};

// daftar/page.tsx
export const metadata = {
  title: 'Buat Akun — lembar',
  description: 'Daftar gratis dan buat asesmen AI pertama Anda dalam 2 menit.',
};

// lupa-sandi/page.tsx
export const metadata = { title: 'Lupa Sandi — lembar' };

// reset-sandi/page.tsx
export const metadata = { title: 'Atur Ulang Sandi — lembar' };
```

---

### B2. Phone field hint di form daftar

**File:** `app/(auth)/daftar/page.tsx` (atau komponen PhoneInput/IdentityInput yang dipakai)

**Problem:** Field nomor telepon wajib diisi tapi tidak ada penjelasan kenapa — friction untuk pengguna.

**Fix — tambahkan helper text di bawah field:**
```tsx
<PhoneInput
  value={phone}
  onChange={setPhone}
  error={localErrors.phone ?? fieldError(submit.fieldErrors, 'phone')}
  helperText="Untuk verifikasi akun dan notifikasi penting dari sekolah."
/>
```

Atau jika komponen tidak support `helperText`, tambahkan `<p>` di bawah field:
```tsx
<p className="text-secondary text-caption mt-1">
  Untuk verifikasi akun dan notifikasi dari sekolah.
</p>
```

---

### B3. Reset sandi — feedback state jika token invalid/missing

**File:** `app/(auth)/reset-sandi/page.tsx`

**Problem:** Halaman default state membingungkan jika dibuka tanpa token query param.

**Fix:**
```tsx
// Di awal komponen, cek token
const searchParams = useSearchParams();
const token = searchParams.get('token');

if (!token) {
  return (
    <AuthShell>
      <div className="text-center p-8">
        <p className="text-secondary">Link reset sandi tidak valid atau sudah kedaluwarsa.</p>
        <Link href="/lupa-sandi" className="text-burgundy underline mt-4 inline-block">
          Minta link baru
        </Link>
      </div>
    </AuthShell>
  );
}
```

---

## Grup C — Marketing & Onboarding UX (Medium, ~60 menit)

### C1. AnnouncementBanner — tambahkan CTA

**File:** `app/components/marketing/AnnouncementBanner.tsx`

**Problem:** Banner "Uji coba gratis kini tersedia untuk institusi pendidikan" tidak punya link.

**Fix:**
```tsx
// Setelah teks pengumuman, tambahkan:
<Link
  href="/untuk-sekolah"
  className="underline font-semibold ml-2 hover:opacity-80 transition-opacity"
>
  Pelajari lebih lanjut →
</Link>
```

---

### C2. Harga page — ganti "Pricing Plans" ke Bahasa Indonesia

**File:** `app/(marketing)/harga/page.tsx`

**Problem:** Teks "Pricing Plans" dalam bahasa Inggris.

**Fix:** Cari dan ganti semua instance "Pricing Plans" → "Paket Harga" atau "Pilih Paket".

---

### C3. Post-register onboarding state

**File:** `app/(app)/app/onboarding/` (sudah ada route-nya)

**Problem:** User baru setelah daftar langsung masuk `/app` yang mungkin kosong — tidak ada guidance.

**Cek:** Apakah `app/(app)/app/onboarding/page.tsx` sudah ada dan ditampilkan untuk user baru?

**Fix jika belum:**
- Setelah register sukses, redirect ke `/app/onboarding` bukan `/app`
- Di `authService.register` success handler, ubah redirect target:
  ```typescript
  // useAuthSubmit success callback
  router.replace('/app/onboarding');
  ```
- Onboarding page: 3 langkah singkat — (1) pilih mata pelajaran utama, (2) generate soal pertama, (3) selesai → `/app/generate`

---

## Grup D — Student Flow (High, ~45 menit)

### D1. Verifikasi dan perkuat StudentRunner identity form

**File:** `src/features/lms/StudentRunner.tsx`

**Problem:** Audit tidak bisa verifikasi apakah flow siswa (guest attempt via link publik) sudah punya identity form yang jelas.

**Checklist yang perlu diverifikasi:**
- [ ] Ada form identitas (nama, kelas) sebelum mulai attempt untuk guest
- [ ] Ada validasi — tidak bisa lanjut tanpa isi nama
- [ ] Setelah attempt, ada halaman konfirmasi/sukses yang jelas
- [ ] Error state jika `assessmentId` tidak valid

**Jika identity form belum ada, tambahkan:**
```tsx
// Di StudentRunner.tsx — state machine: 'identity' | 'attempt' | 'done'
const [phase, setPhase] = useState<'identity' | 'attempt' | 'done'>('identity');
const [identity, setIdentity] = useState({ name: '', kelas: '' });

if (phase === 'identity') {
  return <StudentIdentityForm onSubmit={(id) => { setIdentity(id); setPhase('attempt'); }} />;
}
```

---

### D2. Share URL yang jelas untuk guru

**File:** `app/(app)/app/output/` atau komponen share assessment

**Problem:** Audit tidak bisa verifikasi apakah guru mendapat URL share yang jelas setelah publish.

**Yang harus ada:**
- URL format: `https://app.lembar.web.id/attempt/{assessmentId}`
- Tombol copy URL dengan feedback "Tersalin!"
- Opsional: QR code untuk ditampilkan di proyektor

---

## Grup E — Quick Wins (Low, ~20 menit)

### E1. Navbar "Produk" link — perbaiki atau relabel

**File:** `app/components/marketing/` (navbar/footer component)

**Problem:** Link "Produk" di navbar dan footer mengarah ke `/` (homepage).

**Fix opsi A (cepat):** Ubah label "Produk" → "Beranda"  
**Fix opsi B (proper):** Buat `/produk` halaman dengan detail fitur, atau arahkan ke `/untuk-sekolah`

---

### E2. Statistik di `/tentang` — tambahkan konteks waktu

**File:** `app/(marketing)/tentang/page.tsx`

**Problem:** "2.500+ Guru aktif" dll tanpa tanggal.

**Fix:**
```tsx
// Tambahkan subtitle di bawah statistik:
<p className="text-secondary text-caption">Per Agustus 2026 · sejak beta launch</p>
```

---

## Urutan Eksekusi

```
A1 → A2 → B1 → B2 → B3 → C1 → C2 → D1 (verify) → D2 (verify) → C3 → E1 → E2
```

Grup A dan B harus dikerjakan duluan — ini yang paling berdampak ke user pertama kali datang.

---

## Files yang Akan Berubah

| File | Perubahan |
|---|---|
| `middleware.ts` | Tambah legacy redirect + matcher |
| `app/layout.tsx` | Pastikan Material Symbols font load |
| `app/(auth)/masuk/page.tsx` | Tambah metadata title |
| `app/(auth)/daftar/page.tsx` | Tambah metadata title + phone hint |
| `app/(auth)/lupa-sandi/page.tsx` | Tambah metadata title |
| `app/(auth)/reset-sandi/page.tsx` | Tambah metadata + token missing state |
| `app/components/marketing/AnnouncementBanner.tsx` | Tambah CTA link |
| `app/(marketing)/harga/page.tsx` | Ganti "Pricing Plans" |
| `app/(marketing)/tentang/page.tsx` | Tambah konteks waktu statistik |
| `app/components/marketing/[navbar].tsx` | Fix link "Produk" |
| `src/features/lms/StudentRunner.tsx` | Verify/tambah identity form |

---

## Tidak Dalam Scope Plan Ini

- Desain ulang visual/branding
- Tambah konten FAQ/Bantuan baru (sudah ada, mungkin issue rendering saja)
- Backend changes (plan ini frontend-only)
- Halaman `/produk` baru (defer)

---

## Verification Steps Setelah Implementasi

```bash
# 1. Build pass
cd /home/hermes/Projects/Frontend-Lembar && npm run build

# 2. Route redirects
curl -I https://app.lembar.web.id/login      # → 307/308 ke /masuk
curl -I https://app.lembar.web.id/register   # → 307/308 ke /daftar

# 3. Visual check
# Buka /faq → icon expand_more harus render sebagai chevron
# Buka /masuk → title tab "Masuk — lembar"
# Buka /reset-sandi (tanpa token) → muncul pesan error + link lupa-sandi
# Buka /attempt/[id] → muncul form identitas sebelum soal
```
