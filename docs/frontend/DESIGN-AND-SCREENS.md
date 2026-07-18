# Product Design Overview — Web

This legacy overview remains useful for orientation. For implementation, the authoritative
design files are `BRAND.md`, `DESIGN-SYSTEM.md`, `SCREEN-INVENTORY.md`, `UI-STATES.md`, and the
route-specific specifications in this folder.

## 1. Design thesis

`lembar` harus terasa seperti alat kerja editorial yang tenang: jelas, dapat dipercaya, dan
siap dipakai setiap hari. Bukan dashboard futuristik dan bukan katalog efek AI.

Tiga kata uji: **tenang, tajam, berguna**.

Visual menonjolkan hasil nyata—lembar soal, review, sumber, dan output—bukan robot, bola
gradient, mesh aurora, sparkles, atau ilustrasi generik “AI”.

## 2. Brand baseline

- Wordmark: lowercase `lembar`.
- Logo direction: bentuk `L` sederhana dari lembar terlipat; harus terbaca pada 16–24px.
- Primary ink: near-black.
- Accent: merah tua hangat, bukan merah neon.
- Canvas: off-white hangat.
- Border: tipis dan tenang.
- Radius: sedang; bukan semua elemen pill.
- Shadow: jarang, lembut, hanya untuk elevasi nyata.

Logo/reference visual lama boleh dipakai sebagai exploration aid, tetapi file final harus
melalui optical adjustment, monochrome test, favicon test, dan clearance merek.

## 3. Anti-AI-slop rules

Dilarang tanpa alasan produk:

- hero dengan headline gradient;
- glow/aurora/blob sebagai fokus utama;
- icon sparkles berulang pada setiap fitur;
- mockup browser miring mengambang;
- testimonial atau logo pelanggan fiktif;
- angka statistik tanpa sumber;
- copy “revolusioner”, “100% akurat”, atau “dalam hitungan detik” tanpa bukti;
- layout setiap section berupa tiga kartu identik;
- animasi terus-menerus yang tidak menjelaskan state.

Gunakan white space, hierarchy, specimen produk, dan copy yang spesifik.

## 4. Token direction

Nilai executable baseline berada di `DESIGN-SYSTEM.md`. Figma variables harus diselaraskan
dengan baseline tersebut atau diubah melalui design decision yang tercatat.

### Color

- `canvas`, `surface`, `surface-muted`.
- `ink`, `ink-muted`, `ink-subtle`.
- `border`, `border-strong`.
- `brand`, `brand-hover`, `brand-contrast`.
- `success`, `warning`, `danger`, `info` beserta surface/foreground.
- Tidak memakai warna sebagai satu-satunya indikator.

### Typography

- Sans yang sangat terbaca untuk UI.
- Display boleh memiliki karakter editorial ringan, tetapi tidak mengorbankan glyph Indonesia.
- Body default minimal 16px marketing; app dapat 14–16px sesuai density.
- Line-height long-form 1.5–1.7.
- Maksimal 3 level weight dominan per screen.

### Spacing and layout

- Base spacing 4px dengan rhythm utama 8px.
- Marketing max width sekitar 1200px; reading width lebih sempit.
- App shell memakai sidebar desktop dan navigation pattern mobile yang diuji.
- Form menggunakan grouping dan divider, bukan kartu untuk setiap field.

## 5. Component inventory

Fondasi:

- Button, IconButton, Link.
- Input, Textarea, Select/Combobox, Checkbox, Radio, Switch.
- FormField, FieldMessage, CharacterCount.
- Dialog, AlertDialog, Drawer, Popover, Tooltip.
- Tabs, Breadcrumb, Pagination, Table/DataList.
- Badge/Status, Alert, Toast.
- Skeleton, EmptyState, ErrorState.
- AppShell, Sidebar, Topbar, WorkspaceSwitcher.
- FileUploader, UploadProgress, SourceCard.
- JobStatus, ConfigurationSummary.
- QuestionCard, QuestionEditor, QualityWarning.
- A4Preview, OutputAction, ShareLinkDialog.

Setiap component mempunyai default, hover, focus-visible, active, disabled, loading, error,
high contrast, mobile, dan keyboard behavior yang relevan.

## 6. Landing page

### Header

- Logo kiri.
- Nav: Cara Kerja, Untuk Guru, Untuk Sekolah, Harga/FAQ sesuai keputusan.
- Aksi: Masuk dan Coba Gratis.
- Sticky hanya jika tidak mengganggu viewport mobile.

### Hero — output first

- Eyebrow ringkas: workspace asesmen untuk guru.
- Headline berbasis outcome, bukan AI.
- Supporting copy menyebut draft, review guru, dan print/PDF.
- CTA primer guru; CTA sekunder sekolah.
- Visual utama adalah specimen lembar + panel review/sumber yang realistis.
- Tidak menampilkan data/testimonial palsu.

### Proof strip

Menunjukkan alur: Materi → Draft terstruktur → Review → Print/PDF/Link.

### Product story

1. Pilih materi dan konteks kelas.
2. AI menyiapkan draft/kisi-kisi.
3. Guru memeriksa tiap soal.
4. Hasil siap dipakai.

### Trust section

- Private by default.
- Guru tetap menyetujui hasil.
- Sumber dan versi dapat dilacak.
- Hindari klaim compliance yang belum direview.

### Teacher/school split

Teacher: cepat mulai, workspace pribadi, reuse.  
School: anggota, kuota, template, dan bank internal.

### Pricing

Sebelum harga diterima, boleh ada struktur plan tetapi nominal menjadi “Segera diumumkan” atau
CTA trial/contact. Jangan menaruh angka hipotesis.

### FAQ

Minimal membahas akurasi, kewajiban review, privasi PDF, kurikulum, kuota, dan sekolah.

### Final CTA/footer

CTA mengulang outcome, bukan urgensi palsu. Footer memuat kebijakan dan kontak.

## 7. App shell

Desktop navigation:

- Dashboard
- Riwayat
- Bank Soal
- Template
- Generate (visual priority)
- Kelas
- Analitik

Footer sidebar: identity/workspace, settings, logout.

Mobile tidak mengecilkan sidebar. Gunakan top bar + drawer/bottom pattern yang menjaga
Generate dan job status mudah dicapai.

## 8. Dashboard teacher

Urutan:

1. Greeting dan tahun pelajaran dari data.
2. Ringkasan aktivitas yang benar-benar tersedia.
3. Aksi inti: Generate, Riwayat, Bank, Template.
4. Lembar terakhir.
5. Ringkasan CP/source bila relevan.
6. Riwayat terbaru.

Jangan menampilkan grafik kosong semata agar terlihat “dashboard”. Empty state pengguna baru
harus langsung membawa ke paket pertama.

## 9. Generate screen

Desktop: form utama kiri, summary sticky kanan.  
Mobile: summary menjadi collapsible review sebelum CTA submit.

Urutan field:

1. Sumber materi.
2. Kelas.
3. Kurikulum.
4. Mata pelajaran.
5. Materi.
6. Jenis lembar.
7. Kesulitan.
8. Jumlah dan komposisi.
9. Mode review.
10. Fokus/contoh.

Dependent field disabled dengan explanation. File upload memiliki scan/extraction states.
Submit menampilkan cost/quota implication dalam unit produk jika diperlukan.

## 10. Job progress

- Tampilkan stage, bukan progress palsu.
- Jelaskan pengguna boleh meninggalkan halaman.
- Sediakan link kembali dari global job indicator.
- Failure membedakan retryable dan input/source problem.
- Partial failure menjelaskan jumlah yang berhasil serta pilihan melanjutkan.

## 11. Review screens

Quick mode memakai list/table responsif dengan status dan warning. Bulk action selalu reversible
sebelum finalisasi.

Detail mode memakai split layout pada desktop: navigator kiri, editor utama, metadata/source
kanan atau drawer. Mobile menjadi satu kolom dengan sticky previous/next/save.

Answer key tidak hanya ditandai warna. Warning memiliki severity, alasan, dan tindakan.

## 12. Output center

- A4 preview dominan.
- Toggle inclusion untuk kunci/pembahasan jika valid.
- Primary actions: Print, Download PDF, Create/Manage Link.
- Export progress dan history artifact jelas.
- Share dialog menunjukkan expiry, isi yang terlihat, copy, revoke, dan security warning.

## 13. Admin screens

School admin fokus pada anggota, seat, quota, template, dan bank sekolah. Jangan mengekspos
isi personal workspace.

Superadmin memakai density lebih tinggi, reason-code dialog, audit visibility, dan safe
operations. Tidak mengejar visual marketing.

### Superadmin marketing CMS

- /ops/content: page/locale list, published version, draft state, editor, dan audit summary.
- /ops/content/[slug]: structured section editor dengan fixed block types.
- Preview desktop/mobile memakai renderer marketing yang sama, bukan preview buatan kedua.
- CTA editor: label, target, variant, placement, audience, tracking key, enabled.
- Publish confirmation menunjukkan changed fields, validation, revision, dan target page.
- Version history menyediakan restore-as-draft; tidak ada tombol yang mengubah versi lama.
- Tidak ada arbitrary HTML/CSS/JavaScript, drag-and-drop layout, atau visual page builder.
- Permission denied, conflict, unsupported schema, missing asset, dan publish failure adalah
  first-class states.

## 14. Responsive

Target minimum: 360px phone, tablet portrait, laptop 1280, desktop lebar.

- Tidak ada horizontal overflow global.
- Table berubah menjadi data list/card bila kolom tidak muat.
- A4 preview dapat zoom/fit tanpa mengubah file final.
- Sticky element tidak menutupi CTA/keyboard.
- Touch target sekitar 44px pada aksi utama.

## 15. Accessibility

- Semantic heading/landmark.
- Visible focus dan logical tab order.
- Form label + description + error association.
- Dialog focus trap/restore.
- Status async diumumkan dengan live region secukupnya.
- Drag-and-drop memiliki input file alternatif.
- Chart memiliki table/summary.
- Reduced motion dihormati.
- Contrast diuji, bukan diasumsikan dari token.

## 16. Motion

Motion hanya untuk orientation dan state transition:

- 120–220ms UI feedback.
- 250–400ms section reveal opsional.
- Tidak ada parallax berat atau infinite decorative loop.
- Loading menggunakan skeleton/progress yang tenang.
- PDF/job completion dapat memakai satu subtle confirmation.
- Marketing content visible by default in server HTML. Reveal motion may use mask/transform,
  but cannot make content permanently hidden when hydration, JavaScript, observer, or motion
  initialization fails.
- Visual smoke asserts real bounding boxes/computed visibility and screenshot pixels; finding
  text in the DOM alone is not acceptance.

## 17. Figma handoff

Setiap screen/frame wajib memiliki:

- desktop dan mobile critical state;
- loading/empty/error/permission/conflict state;
- component variant names;
- token/style binding;
- annotation untuk API field dan permission;
- prototype untuk happy path dan satu failure path;
- content yang realistis namun bukan data sensitif.

Figma link eksplorasi yang tersedia:
`https://www.figma.com/design/BYP7ePqTbF0am6Vg0yw8lj/LembarSaaS`

Frame lama adalah reference, bukan authority. PRD/FRD dan keputusan owner selalu menang.

## 18. Design definition of done

- Requirement dan role state terpetakan.
- Tidak ada content/claim/harga fiktif.
- Responsive critical widths selesai.
- Keyboard, focus, contrast, copy, empty/error state direview.
- Design memakai component/token, bukan style acak.
- Product owner menerima flow dan designer/frontend menerima implementability.
