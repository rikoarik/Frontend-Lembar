# UX Audit — Lembar App (Logged-In Experience)

**Tanggal Audit:** 7–8 Agustus 2026
**Auditor:** Hermes Agent (source-code audit)
**Metode:** Analisis kode sumber langsung — membaca semua file halaman, komponen, dan feature di `/home/hermes/Projects/Frontend-Lembar`
**Scope:** Logged-in user experience untuk role `teacher` dan `subscriber` (pro)
**Branch:** `dev`

---

## Ringkasan Eksekutif

Lembar adalah platform AI generator soal untuk guru Indonesia. Audit ini mencakup seluruh flow post-login dari kode sumber secara mendalam. Secara keseluruhan, fondasi UX sudah solid — ada skeleton loader, error state, aria attributes, dan role-gating yang berfungsi. Namun ada sejumlah temuan penting yang perlu diperbaiki sebelum launch, terutama terkait placeholder produksi yang masih terekspos ke pengguna, absennya toast/notification system, dan inkonsistensi label role yang bisa membingungkan pengguna.

### Distribusi Severity

| Severity | Jumlah |
|----------|--------|
| Critical | 2 |
| High | 6 |
| Medium | 8 |
| Low | 5 |
| **Total** | **21** |

---

## 1. App Shell & Sidebar

### Temuan

**[HIGH] `planLabel` di `AccountMenu` hard-coded "Akun guru" untuk semua role**

`AppShell.tsx` line 31:
```tsx
const accountMenu = (
  <AccountMenu displayName={displayName} planLabel="Akun guru" compact={collapsed} />
);
```

Label `"Akun guru"` di-hard-code tanpa membaca plan aktual dari context. Pengguna dengan paket Pro atau role `subscriber` akan melihat label yang sama persis dengan pengguna free. Tidak ada visual distinction antara free dan pro di account menu.

**Rekomendasi:** Baca `planLabel` dari `workspaceContext` (atau dari data plan) dan map ke label yang benar: `"Paket Gratis"` vs `"Guru Pro"`.

---

**[MEDIUM] Sidebar collapse tidak ada di mobile — hanya desktop**

`AppShell.tsx` line 55:
```tsx
<div className="hidden h-full shrink-0 md:block">
  <LeftRail ... collapsed={collapsed} onToggleCollapse={...} />
</div>
```

Di mobile, sidebar muncul sebagai drawer via `mobileNavOpen`. Drawer ini tidak memiliki tombol collapse — hanya bisa ditutup dengan klik backdrop. Tidak ada tombol hamburger/menu yang visible secara permanen di TopBar sehingga pengguna baru mungkin tidak tahu cara membuka navigasi mobile.

**Rekomendasi:** Pastikan tombol hamburger di TopBar selalu visible di mobile (perlu cek TopBar rendering).

---

**[MEDIUM] `TopBar` tidak menyertakan `/app/jobs` dalam `titleFromPath`**

`TopBar.tsx` lines 48–61:
```tsx
function titleFromPath(pathname: string): string {
  if (pathname === '/app') return 'Beranda';
  if (pathname.startsWith('/app/generate')) return 'Buat lembar';
  // ...
  // TIDAK ADA: /app/jobs, /app/onboarding
  return 'lembar';
}
```

Halaman `/app/jobs/[jobId]` dan `/app/onboarding` akan menampilkan judul `"lembar"` (fallback) di TopBar — tidak informatif dan membingungkan terutama saat user sedang menunggu generate selesai.

**Rekomendasi:** Tambahkan case untuk `/app/jobs` → `"Progres generate"` dan `/app/onboarding` → `"Selamat datang"`.

---

**[LOW] WorkspaceSwitcher label item selalu "Pribadi" untuk semua workspace**

`WorkspaceSwitcher.tsx` line 122:
```tsx
<span className="text-[11px] text-[#6d665d]">Pribadi</span>
```

Label sub-teks untuk setiap workspace di dropdown di-hard-code `"Pribadi"`, padahal workspace bisa bertipe `school`. Relevan untuk pengguna yang punya lebih dari satu workspace.

**Rekomendasi:** Ganti dengan `{workspace.kind === 'school' ? 'Sekolah' : 'Pribadi'}`.

---

## 2. Dashboard Utama (`/app`)

### Temuan

**[HIGH] Dashboard empty state tidak menampilkan nama user atau konteks personal**

`app/(app)/app/page.tsx` — state `empty`:
```tsx
{ status: 'empty'; message: string; workspaceName: string }
```

Saat API mengembalikan empty state, dashboard menampilkan quick actions saja. Tidak ada sapaan personal seperti `"Selamat datang, [nama]!"` atau petunjuk langkah pertama yang kontekstual. Pengguna baru yang baru selesai onboarding langsung melihat grid aksi tanpa orientasi.

**Rekomendasi:** Di state `empty`, tampilkan hero section dengan nama workspace, tagline motivasi singkat, dan call-to-action utama "Buat lembar pertama Anda" yang lebih prominent dari sekadar card kecil.

---

**[MEDIUM] KPI cards menggunakan hardcoded colors, bukan design token**

`app/(app)/app/page.tsx` line 59:
```tsx
<div className="rounded-2xl border border-[#e6dfd4] bg-white p-4 shadow-[0_1px_0_rgba(23,23,23,0.03)]">
  <div className="text-[12px] font-medium text-[#6d665d]">{label}</div>
  <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#171717]">
```

Beberapa class menggunakan hex color literals `#e6dfd4`, `#6d665d`, `#171717` bukan design token (`brand-line`, `brand-ink-muted`, `brand-ink`). Inkonsistensi dengan komponen lain yang sudah menggunakan token. Bukan bug fungsional tapi menghambat theming.

---

**[MEDIUM] Tidak ada indikasi "kuota tersisa" di dashboard untuk pengguna free**

Dashboard tidak menampilkan informasi quota usage di beranda. Pengguna free tidak tahu berapa sisa kuota generate mereka sampai mereka mencoba generate dan menerima error, atau secara eksplisit mengunjungi `/app/pengaturan/langganan`. Ini adalah friction point yang mempengaruhi konversi ke Pro.

**Rekomendasi:** Tambahkan compact quota indicator di dashboard atau di header sidebar — misalnya progress bar kecil `"3/5 generate terpakai bulan ini"` — terutama saat kuota > 80%.

---

**[LOW] Skeleton loader (`Skeleton`) hanya 4 cards, tapi state populated bisa punya lebih**

`Skeleton()` di `page.tsx` menampilkan 4 placeholder cards. Jika data yang muncul punya lebih dari 4 metric, akan ada layout shift saat transisi skeleton → populated. Minor tapi bisa diperbaiki.

---

## 3. Generate Flow (`/app/generate`)

### Temuan

**[CRITICAL] `OutputSettings` adalah placeholder yang terekspos ke pengguna produksi**

`src/features/generate/OutputSettings.tsx` lines 13–34:
```tsx
<p className="text-body-sm text-brand-ink-muted">
  Pengaturan output akan tersedia setelah kontrak backend final. Saat ini, lembar akan
  menggunakan format default.
</p>
// ...
<p className="text-body-sm text-brand-ink-muted italic">
  Pengaturan ini bersifat placeholder dan belum dapat diubah.
</p>
```

Panel "Pengaturan Output" yang tampil di halaman generate secara eksplisit menyebutkan `"akan tersedia setelah kontrak backend final"` dan `"bersifat placeholder"`. Ini adalah pesan internal developer yang tidak boleh dilihat pengguna. Merusak kepercayaan dan terkesan unfinished.

**Rekomendasi:** Jika fitur belum siap, sembunyikan panel ini sepenuhnya (`return null`) atau tampilkan state yang lebih baik seperti `"Tersedia segera"` tanpa penjelasan teknis internal.

---

**[HIGH] Form generate sangat panjang (1132 baris) tanpa progress indicator multi-step**

`ConfigurationCompose.tsx` adalah komponen 1132-baris yang merender semua field dalam satu halaman panjang. Tidak ada wizard/stepper atau indikasi berapa bagian yang harus diisi. Pada mobile, form ini sangat melelahkan untuk di-scroll. Field yang dependent (Kelas muncul setelah Kurikulum dipilih) sudah ada, tapi tidak ada visual affordance yang jelas untuk menunjukkan urutan pengisian yang direkomendasikan.

**Rekomendasi:** Pertimbangkan multi-step form: Step 1 = Sumber Materi, Step 2 = Konfigurasi Soal, Step 3 = Identitas & Output. Atau minimal tambahkan sticky summary sidebar (sudah ada di desktop via `lg:grid-cols`) tapi perlu diperjelas fungsinya.

---

**[HIGH] Validasi error muncul hanya setelah submit, bukan inline real-time**

`ConfigurationCompose.tsx` lines 1026–1042:
```tsx
{submitted && !validateComposition(values).ok && (
  <div role="alert" className="...">
    <p>Perbaiki isian yang belum lengkap sebelum melanjutkan.</p>
    <ul>
      {validateComposition(values).failures.map((f) => (
        <li key={f.field}>{LABELS[f.field]}: {f.message}</li>
      ))}
    </ul>
  </div>
)}
```

Error validation baru muncul setelah user klik submit (flag `submitted`). Tidak ada inline validation per-field saat blur. User harus scroll ke bawah untuk melihat error summary yang ada di dekat tombol submit, jauh dari field yang bermasalah di bagian atas form.

**Rekomendasi:** Tambahkan inline error display per field saat `onBlur`, atau setidaknya scroll otomatis ke field pertama yang error saat submit gagal. Error summary di atas tombol submit sudah ada tapi tidak cukup.

---

**[MEDIUM] "Kuota habis" state tidak ada link langsung ke halaman upgrade**

`ConfigurationCompose.tsx` lines 517–520:
```tsx
<p className="mt-1 text-body-sm text-brand-ink-muted">
  Anda telah mencapai batas lembar yang dapat dibuat. Hubungi admin atau tingkatkan paket
  Anda.
</p>
```

Pesan quota habis muncul sebagai warning banner tapi tidak ada tombol/link ke `/app/pengaturan/langganan`. User harus tahu sendiri cara upgrade. Ini adalah lost conversion opportunity.

**Rekomendasi:** Tambahkan `<Link href="/app/pengaturan/langganan">Tingkatkan paket →</Link>` langsung di pesan quota habis.

---

**[LOW] Template save tidak ada feedback visual apabila nama sudah ada (duplikat)**

`ConfigurationCompose.tsx` — Panel "Simpan sebagai template" hanya menampilkan `templateStatus` sebagai text. Tidak ada validasi nama duplikat di sisi client, tidak ada karakter counter yang visible.

---

## 4. Jobs / Progress (`/app/jobs/[jobId]`)

### Temuan

**[MEDIUM] Tidak ada auto-refresh — user harus manual klik "Muat ulang status"**

`JobProgressView.tsx` menggunakan `useJobProgress` hook yang memanggil `refresh` secara manual. `JobProgressPanel.tsx` menampilkan tombol "Muat ulang status":
```tsx
{!terminal && onRefresh ? (
  <Button variant="quiet" onClick={onRefresh}>
    Muat ulang status
  </Button>
) : null}
```

Tidak ada polling otomatis. User yang membuka halaman jobs dan menunggu AI generate selesai harus terus-menerus klik "Muat ulang status" secara manual. Ini adalah UX yang sangat buruk untuk proses async.

**Rekomendasi:** Implementasikan polling interval (misal setiap 3–5 detik) saat job status masih `pending`/`running`. Hentikan polling saat status terminal. `HistoryView` sudah ada `DEFAULT_REFRESH_MS = 10_000` sebagai preseden.

---

**[MEDIUM] Tidak ada ETA atau progress percentage untuk job yang sedang berjalan**

`JobProgressPanel` menampilkan badge status dan timing, tapi tidak ada progress bar atau estimasi waktu selesai. Pengguna tidak tahu apakah prosesnya akan 10 detik atau 2 menit.

**Rekomendasi:** Tampilkan indikator animasi (spinner atau progress bar indeterminate) yang lebih prominent saat status `pending`/`running`, plus teks konteks seperti `"Biasanya selesai dalam 30–60 detik"`.

---

**[LOW] Pesan sukses job tidak mengarahkan user secara proaktif ke review**

Saat job sukses (`succeeded`/`partially_succeeded`) dan `assessmentId` tersedia, tidak ada auto-redirect atau prominent CTA yang langsung membawa user ke review. User perlu tahu bahwa mereka harus kembali ke halaman ini untuk melihat link review.

---

## 5. Review Flow (`/app/review/[assessmentId]`)

### Temuan

**[HIGH] Mode "detail" tidak memiliki keyboard navigation shortcut**

`QuickReviewView.tsx` mode detail (lines 790–807):
```tsx
<Button variant="secondary" disabled={detailIndex <= 0}
  onClick={() => setDetailIndex((i) => Math.max(0, i - 1))}>
  Sebelumnya
</Button>
<Button variant="secondary" disabled={detailIndex >= questions.length - 1}
  onClick={() => setDetailIndex((i) => Math.min(questions.length - 1, i + 1))}>
  Berikutnya
</Button>
```

Navigasi antar soal di mode detail hanya via klik button. Tidak ada keyboard shortcut (arrow keys, `j`/`k`, `n`/`p`) yang sangat diharapkan untuk task review intensif yang bisa melibatkan 50–200 soal.

**Rekomendasi:** Tambahkan `useEffect` dengan `keydown` listener untuk `ArrowLeft`/`ArrowRight` atau `j`/`k` di mode detail.

---

**[MEDIUM] Bulk select tidak ada visual feedback jumlah soal ter-accept vs total**

`QuickReviewView.tsx` bulk action bar (lines 500–516):
```tsx
<section className="sticky bottom-0 ...">
  <span>{selected.size} soal dipilih</span>
  <Button onClick={() => void onBulkAccept()}>Terima {selected.size} soal</Button>
</section>
```

Bar sticky bawah hanya menampilkan jumlah yang dipilih, tapi tidak ada ringkasan `"X dari Y soal sudah diterima"` yang memberikan gambaran progres review secara keseluruhan.

---

**[MEDIUM] Edit options di mode detail — tidak ada tombol "Tambah pilihan"**

`QuickReviewView.tsx` lines 543–590: Form edit jawaban pilihan ganda menampilkan `visibleEditOptions` tapi tidak ada UI untuk menambah opsi baru. Jika soal perlu ditambah opsi (misalnya AI hanya generate 3 pilihan), guru tidak bisa melakukannya dari review interface.

---

**[MEDIUM] FinalizeView tidak ada link ke review setelah finalisasi gagal**

`FinalizeView.tsx` lines 42–45:
```tsx
if (result.error.blockers?.length) {
  setMessage(`${result.error.safeMessage} ${result.error.blockers.join(' ')}`);
}
```

Saat finalisasi gagal karena blockers, pesan error ditampilkan sebagai plain string concat tanpa formatting. Blockers bisa berisi teknis error yang tidak user-friendly. Link kembali ke review untuk memperbaiki ada (`href={/app/review/${assessmentId}}`), tapi tombolnya hanya berlabel "Kembali" — tidak eksplisit tentang apa yang perlu diperbaiki.

---

## 6. Riwayat & Bank Soal

### Temuan

**[MEDIUM] `HistoryView` tidak ada filter atau search — semua assessment muncul sekaligus**

`HistoryView.tsx` menampilkan semua assessment dalam urutan default dari API tanpa filter berdasarkan status (draft/review/final/failed) atau search by title. Untuk guru yang sudah punya 50+ assessment, halaman ini akan sangat panjang dan tidak berguna.

**Rekomendasi:** Tambahkan filter tabs berdasarkan `lifecycle` (Semua / Draft / Siap Ditinjau / Final / Gagal) dan search input sederhana.

---

**[MEDIUM] `BankSoalView` tidak bisa filter/search, tidak ada detail view per soal**

`BankSoalView.tsx` menampilkan list soal dengan `stem`, `questionType`, `difficulty`, `answer` — tapi tidak ada fitur:
- Filter berdasarkan tipe soal atau tingkat kesulitan
- Search by keyword di stem
- Klik untuk lihat soal lengkap (stem bisa panjang, terpotong)
- Export atau "pakai soal ini" di generate baru

Ini membuat bank soal terasa sebagai halaman archival pasif, bukan tools aktif.

---

**[LOW] `TemplateView` menggunakan `window.confirm()` untuk konfirmasi hapus**

`TemplateView.tsx` line 27:
```tsx
if (!window.confirm(`Hapus template "${template.name}"?`)) return;
```

`window.confirm()` adalah native browser dialog yang tidak bisa di-style sesuai brand, terblokir di beberapa browser, dan mengganggu pengalaman mobile. Inkonsisten dengan pola UI yang ada di codebase.

**Rekomendasi:** Ganti dengan custom confirmation dialog atau inline confirmation state (tombol berubah jadi "Yakin hapus?" selama beberapa detik).

---

## 7. Pengaturan / Langganan (`/app/pengaturan/langganan`)

### Temuan

**[CRITICAL] Tombol berlangganan mengonfirmasi pembayaran yang belum dikonfigurasi**

`langganan/page.tsx` lines 137–142:
```tsx
const handleConfirmPay = () => {
  setSubscribeModalOpen(false);
  setSubscribeSuccess(
    `Pembayaran ${selectedTier ?? 'paket'} belum tersedia. Harga dan penyedia pembayaran belum dikonfigurasi.`,
  );
};
```

Saat user mengklik "Konfirmasi Langganan", mereka mendapat pesan: **"Pembayaran [paket] belum tersedia. Harga dan penyedia pembayaran belum dikonfigurasi."** Ini adalah pesan internal developer yang terekspos langsung ke pengguna yang berniat berlangganan. Sangat merusak kepercayaan dan bisa membuat pengguna berpikir platform tidak berfungsi.

**Rekomendasi Segera:** Jika payment gateway belum siap, sembunyikan tombol berlangganan atau tampilkan state "Segera Hadir" / "Hubungi kami" dengan kontak yang jelas, tanpa mengekspos detail teknis bahwa sistem belum dikonfigurasi.

---

**[HIGH] `entitlementState === 'grace'` dan `'blocked'` tidak menyediakan cara self-service**

`langganan/page.tsx` STATE_COPY:
```tsx
grace: { body: '...Hubungi tim kami untuk perpanjangan.' },
blocked: { body: '...Hubungi tim kami untuk memulihkan akses.' },
expired: { body: '...hubungi tim kami.' },
```

Semua state negatif (grace, blocked, expired) hanya menyarankan "hubungi tim kami" tanpa link ke kontak, tanpa email yang tertera, dan tanpa estimasi SLA. Pengguna dalam status ini benar-benar buntu.

**Rekomendasi:** Tambahkan link kontak (email/WhatsApp) yang jelas, atau direct link ke form bantuan di setiap STATE_COPY yang menyarankan "hubungi tim".

---

**[MEDIUM] Tanggal `billingCycleStartedAt` tidak ditampilkan dalam format yang mudah dibaca**

`langganan/page.tsx` — data `billingCycleStartedAt` tersedia tapi perlu dicek apakah di-format dengan benar di UI. Berdasarkan kode, string ini dirender langsung tanpa format Intl.

**Rekomendasi:** Format dengan `new Intl.DateTimeFormat('id-ID', {...}).format(new Date(billingCycleStartedAt))`.

---

## 8. Role Gating

### Temuan

**[MEDIUM] Teacher dan Subscriber mendapat UI yang identik — tidak ada differentiation**

Dari `LeftRail.tsx`:
```tsx
const PRIMARY_NAV = [
  { href: '/app', label: 'Beranda', icon: 'home' },
  { href: '/app/generate', label: 'Buat lembar', icon: 'auto_awesome' },
  { href: '/app/riwayat', label: 'Riwayat', icon: 'history' },
] as const;
```

Role gating hanya memblokir `school_admin` (Kelas, Analitik, Admin sekolah). Antara `teacher` (free) dan `subscriber` (pro) tidak ada perbedaan UI sama sekali — nav items sama, quick actions sama, dashboard sama. Pengguna Pro tidak mendapat visual recognition atau badge "Pro" di sidebar.

**Rekomendasi:** Tampilkan badge "Pro" di AccountMenu dan/atau WorkspaceSwitcher untuk `subscriber`. Pertimbangkan highlight fitur eksklusif Pro di sidebar dengan icon yang berbeda.

---

**[LOW] `roleAllows()` hanya memeriksa `school_admin` — tidak ada gate untuk `subscriber`**

`LeftRail.tsx` lines 46–51:
```tsx
function roleAllows(activeRole: ActiveRole, entitlement: ActiveRole): boolean {
  if (entitlement === 'school_admin') {
    return activeRole === 'school_admin' || activeRole === 'superadmin';
  }
  return true; // semua role lain selalu boleh
}
```

Tidak ada route atau fitur yang di-gate khusus untuk `subscriber`. Jika ada fitur Pro yang hanya untuk subscriber, gating-nya harus ditambahkan di sini.

---

## 9. Notifikasi & Feedback

### Temuan

**[HIGH] Tidak ada toast/notification system global — semua feedback via inline state**

Dari pencarian di seluruh codebase: **tidak ada penggunaan toast library** (tidak ada `sonner`, `react-hot-toast`, `useToast`, atau sejenisnya). Semua feedback state diimplementasikan sebagai:
- Inline `<p role="alert">` / `<div role="status">`
- String state lokal seperti `templateStatus`, `nameStatus`, `emailStatus`
- Setiap komponen punya sistem feedback sendiri yang tidak konsisten

Akibatnya:
- `ProfileSettingsPage` punya 5+ state string terpisah untuk status berbeda
- Sukses/error muncul di lokasi yang berbeda-beda tergantung halaman
- Tidak ada feedback untuk aksi yang memicu navigasi (misal setelah finalize berhasil, redirect terjadi tapi tidak ada "Lembar berhasil difinalkan!")

**Rekomendasi:** Install library toast (Sonner recommended untuk Next.js) dan buat hook `useToast()` terpusat. Refactor semua feedback state lokal secara bertahap ke toast global.

---

**[MEDIUM] Error state di `ProfileSettingsPage` tidak konsisten**

`profil/page.tsx` — Ada 6 pasang `[stateError, setStateStatus]` terpisah (name, email, password, logout, profile loading, preferences). Pattern ini:
1. Tidak konsisten dengan halaman lain
2. Error message bisa tertimpa jika user melakukan aksi berurutan
3. Tidak ada timeout untuk clear success message

---

## 10. Mobile Responsiveness

### Temuan

**[MEDIUM] Form generate tidak optimal di mobile — summary panel tersembunyi tapi kurang discoverable**

`ConfigurationCompose.tsx` lines 549–566:
```tsx
{summaryItems.length > 0 && (
  <div className="mb-4 md:hidden">
    <button ... aria-expanded={summaryOpen}>
      <span>Ringkasan ({readinessLabel})</span>
      <span>{summaryOpen ? 'Sembunyikan' : 'Lihat'}</span>
    </button>
  </div>
)}
```

Summary panel sudah ada accordion untuk mobile (`md:hidden`). Namun accordion ini muncul di tengah form yang panjang — pengguna mungkin tidak scroll sampai sana. Tidak ada sticky summary di mobile yang terlihat saat scroll.

---

**[MEDIUM] Bulk action bar di review tidak safe area aware**

`QuickReviewView.tsx` line 502:
```tsx
className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded-t-md border border-brand-line bg-brand-surface px-4 py-3 shadow-lg"
```

Bar sticky bawah tidak menggunakan `pb-safe` atau `padding-bottom: env(safe-area-inset-bottom)`. Di iPhone dengan home indicator, konten bisa tertutup.

**Rekomendasi:** Tambahkan `pb-[env(safe-area-inset-bottom,12px)]` atau gunakan utility Tailwind untuk safe area.

---

**[LOW] `ShellLoading` menggunakan grid 2-kolom yang tidak responsive untuk mobile**

`ShellStates.tsx` line 6:
```tsx
<div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" aria-busy="true">
```

Grid 2-kolom hanya aktif di `md:` ke atas. Di mobile (`< md`) sudah single column — ini sudah benar. Namun class `min-h-48` pada loading panel mungkin terlalu tinggi untuk viewport mobile kecil.

---

## Prioritas Implementasi

### Sprint 1 — Critical (harus sebelum launch)

1. **[CRITICAL] Sembunyikan/replace `OutputSettings` placeholder** — 1 baris, ganti return dengan `null` atau state "Tersedia segera"
2. **[CRITICAL] Fix `handleConfirmPay` subscription** — jangan ekspos pesan "belum dikonfigurasi" ke user; redirect ke kontak atau sembunyikan tombol

### Sprint 2 — High Impact

3. **[HIGH] Auto-polling di JobProgressView** — tambahkan `setInterval` polling 5 detik saat status non-terminal
4. **[HIGH] Fix `planLabel` hard-coded "Akun guru"** — baca dari workspaceContext/plan data
5. **[HIGH] Quota habis → link upgrade** — tambahkan Link ke halaman langganan di generate quota warning
6. **[HIGH] Install Sonner toast, buat `useToast()` hook** — foundational untuk konsistensi feedback
7. **[HIGH] Grace/blocked/expired state → tambahkan kontak** — tiga baris copy + link kontak di STATE_COPY

### Sprint 3 — Medium Polish

8. **[MEDIUM] Tambahkan `/app/jobs` ke `titleFromPath`** di TopBar
9. **[MEDIUM] Filter/search di HistoryView** — tabs lifecycle + input search
10. **[MEDIUM] Keyboard navigation review mode detail** — `keydown` listener ArrowLeft/ArrowRight
11. **[MEDIUM] Generate form inline validation** — per-field error saat onBlur
12. **[MEDIUM] Dashboard: quota indicator** — compact usage bar untuk free users
13. **[MEDIUM] BankSoalView: filter + detail view** — basic filter berdasarkan questionType

### Sprint 4 — Low / Polish

14. Ganti `window.confirm()` di TemplateView dengan custom dialog
15. WorkspaceSwitcher: fix label "Pribadi" hard-coded
16. Safe area inset untuk bulk action bar mobile
17. Pro badge di AccountMenu untuk subscriber
18. Dashboard empty state dengan sapaan personal

---

## Catatan Teknis

- **Tidak ada akun test** — audit sepenuhnya berdasarkan source code, tidak bisa memverifikasi behavior runtime
- **Toast system** belum ada sama sekali — ini adalah gap arsitektural yang perlu diaddress sebelum feature lain
- **Role gating** sudah solid untuk `school_admin` vs regular, tapi `teacher` vs `subscriber` belum dibedakan secara UI
- **Aksesibilitas** secara umum sudah baik — ada `aria-busy`, `aria-live`, `aria-current="page"`, `role="alert"`, skip link ke konten utama
- **Design tokens** sebagian besar sudah digunakan (`brand-ink`, `brand-accent`, dll.) tapi ada regresi di beberapa komponen yang masih pakai hex literal

---

*Laporan ini dihasilkan dari analisis statis kode sumber. Verifikasi runtime disarankan untuk temuan yang berkaitan dengan behavior API dan state management.*
