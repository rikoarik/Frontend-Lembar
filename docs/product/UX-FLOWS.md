# UX, Information Architecture & Core Flows

## Prinsip UX

- Output-first: tunjukkan apa yang akan diterima guru.
- Progressive disclosure: form utama sederhana, komposisi lanjutan dapat dibuka.
- Teacher language: “jumlah soal”, “materi”, “kunci”; bukan token/model/context window.
- Trust through control: sumber, warning, review, dan status selalu terlihat.
- Draft is safe: mode Cepat bukan auto-final.
- Semua async state dapat ditinggalkan dan dilanjutkan.
- Empty/error state memberi tindakan yang jelas.

## Information architecture

### Publik

- Beranda
- Untuk Guru
- Untuk Sekolah
- Cara Kerja
- Harga (struktur tanpa nominal sampai diputuskan)
- FAQ
- Kebijakan Privasi
- Syarat Penggunaan
- Masuk / Coba Gratis

### Teacher app

- Dashboard
- Generate
- Riwayat
- Bank Soal
- Template
- Kelas
- Analitik
- Pengaturan account/workspace/subscription

### School admin `P1`

- Ringkasan
- Guru & akses
- Kuota & penggunaan
- Template/branding
- Bank sekolah
- Billing
- Pengaturan

### Superadmin

- Tenant/account
- Catalog kurikulum
- Plans/entitlements/quota
- Jobs/AI cost/quality
- Feature flags
- Support/audit/incidents

## Flow A — landing ke aktivasi guru

1. Pengunjung memahami hasil akhir pada hero.
2. Melihat contoh paket dan alur tiga langkah.
3. Memahami bahwa AI menghasilkan draft yang harus direview.
4. Memilih `Coba gratis`.
5. Register/login.
6. Personal workspace dibuat.
7. Onboarding singkat: nama, jenjang utama, kelas/mapel favorit opsional.
8. Masuk ke Generate atau dashboard dengan CTA paket pertama.

Success: pengguna memulai konfigurasi assessment pertama, bukan sekadar membuat akun.

## Flow B — Generate

1. Pilih source strategy.
2. Pilih kelas.
3. Sistem memuat kurikulum/mapel yang tersedia.
4. Pilih mapel dan minimal satu materi.
5. Pilih jenis lembar, kesulitan, jumlah, dan komposisi.
6. Pilih mode review.
7. Tambahkan fokus/contoh opsional.
8. Periksa ringkasan dan submit.
9. Lihat job progress; pengguna boleh pindah halaman.

Form menampilkan indikator kelengkapan, bukan progress palsu. Tombol generate disabled dengan
alasan yang dapat dibaca bila requirement belum lengkap.

## Flow C — Review

### Cepat

- Daftar seluruh soal dengan warning ringkas.
- Multi-select accept-as-reviewed diperbolehkan.
- Filter warning/unreviewed.
- Finalisasi tetap membutuhkan konfirmasi terpisah.

### Detail

- Satu soal per fokus.
- Stem, opsi, kunci, pembahasan, topik, indikator, kesulitan, sumber, dan warning.
- Aksi: edit, simpan, regenerate, delete, previous/next.
- Regenerate meminta alasan/fokus opsional agar perubahan terarah.

## Flow D — Finalisasi dan output

1. Sistem menunjukkan jumlah reviewed, warning tersisa, dan perubahan belum tersimpan.
2. Guru menyelesaikan blocker.
3. Guru mengonfirmasi tanggung jawab review.
4. Backend membuat final version immutable.
5. Output center menawarkan Print, PDF, dan Share Link.
6. Export/job status tetap dapat dilihat jika pengguna pergi.

## Flow E — School onboarding `P1`

1. Lead/demo dikualifikasi.
2. Operator membuat/menyetujui school workspace.
3. School admin menerima undangan.
4. Admin mengatur profil dan metode akses anggota.
5. Guru bergabung dengan account yang sama atau mengaktifkan credential sementara.
6. Guru memilih workspace pada login.

## Flow F — upload PDF

1. Guru memilih file dan melihat batas/privasi.
2. Upload progress tampil.
3. Scan/extraction berlangsung asinkron.
4. Preview metadata/halaman tersedia ketika ready.
5. Jika gagal, alasan aman dan tindakan retry/replace diberikan.
6. Source hanya dapat dipakai generate setelah status ready.

## Flow G — superadmin mengelola konten marketing

1. Superadmin membuka /ops/content dan melihat halaman, versi published, status draft,
   locale, serta waktu publish terakhir.
2. Superadmin membuat atau melanjutkan satu draft dari versi published.
3. Editor menggunakan field/block terstruktur; tidak ada input HTML/CSS/JavaScript bebas.
4. Sistem memvalidasi CTA, URL, required section, asset, dan aturan harga/klaim.
5. Superadmin membuka preview autentik pada desktop dan mobile tanpa mengekspos draft publik.
6. Publish meminta konfirmasi perubahan, revision terbaru, dan step-up authentication bila
   policy mewajibkan.
7. Public API menerbitkan version/ETag baru dan frontend melihat perubahan maksimal 60 detik.
8. Jika bermasalah, superadmin memilih versi lama; sistem membuat draft restore baru lalu
   mem-publish-nya dengan audit trail, bukan mengubah histori.

Failure states:

- conflict karena draft berubah;
- block/schema tidak lagi didukung frontend;
- URL CTA tidak aman;
- asset hilang/tidak siap;
- publish ditolak karena keputusan harga/klaim belum diterima;
- API publik gagal sehingga landing memakai fallback tervalidasi.

## Global screen states

Setiap data screen harus mempunyai:

- initial loading/skeleton;
- empty first-use;
- empty filter result;
- partial data;
- validation error;
- authorization denied;
- network/server failure;
- retry;
- stale/conflict;
- success confirmation;
- destructive confirmation bila relevan.

## Copy rules

- Gunakan “lembar” atau “paket soal”, bukan “artifact”.
- Gunakan “Sedang menyiapkan soal”, bukan nama provider/model.
- Jangan menjanjikan “100% akurat”, “anti salah”, atau “sesuai kurikulum otomatis” tanpa
  konteks review dan versi sumber.
- Tanggal menggunakan format Indonesia; tahun pelajaran tidak di-hardcode.
- Nama guru/sekolah berasal dari data, bukan contoh produksi.
