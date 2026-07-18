# Brand Specification — `lembar`

Status: baseline untuk product design dan implementation. Final trademark/domain clearance
tetap D-001.

## Brand idea

`lembar` terasa seperti alat kerja guru yang tenang, teliti, dan siap dipakai. Bukan karakter AI,
bukan platform anak-anak, dan bukan dashboard korporat yang dingin.

Tiga sifat:

- **Jelas:** hierarchy dan copy membantu keputusan.
- **Terpercaya:** menunjukkan sumber, status draft, dan batas AI.
- **Praktis:** membawa pengguna ke hasil cetak, bukan demo teknologi.

## Name

- Public wordmark: lowercase `lembar`.
- Sentence start tetap boleh `Lembar` bila grammar memerlukan.
- Repository/package/internal code dapat memakai `lembar` lowercase.
- Jangan memakai `LembarAI`, `Lembar.AI`, `UjianSD`, atau singkatan baru tanpa keputusan.

## Logo concept

Konsep yang dipilih: monogram `L` berbentuk sudut lembar terlipat—batang vertikal merah dan
alas hitam—dipasangkan dengan wordmark lowercase hitam.

### Construction intent

- Bentuk harus dapat dibaca sebagai `L` pada 16–24 px.
- Sudut lipatan boleh memberi satu diagonal kecil; jangan menjadi ilustrasi origami kompleks.
- Ujung, ketebalan, dan optical alignment dibuat konsisten pada vector master.
- Wordmark memakai custom spacing; jangan mengetik `lembar` dengan font default lalu dianggap
  logo final.

### Lockups

1. Horizontal: mark + wordmark; default header/marketing.
2. Mark only: favicon, avatar aplikasi, loading mark.
3. Monochrome: satu warna untuk print/legal/small size.

### Clear space and minimum size

- Clear space minimal = ketebalan batang `L` di semua sisi.
- Horizontal lockup minimum 96 px digital.
- Mark minimum 16 px; gunakan simplified SVG tanpa fine detail.
- Jangan menambahkan tagline di bawah lockup kecil.

### Misuse

- tidak memutar, stretch, skew, bevel, glow, atau drop shadow;
- tidak mengubah mark menjadi gradient;
- tidak menaruh di shape acak sebagai badge;
- tidak memakai merah untuk seluruh wordmark;
- tidak menganimasikan seperti robot/magic sparkle;
- tidak memakai logo pemerintah/sekolah sebagai endorsement tanpa izin.

## Core palette

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#F7F3EC` | marketing/app background |
| Surface | `#FFFCF7` | card/panel |
| Ink | `#171717` | primary text/black logo segment |
| Muted ink | `#625D55` | secondary text |
| Line | `#D8D0C5` | borders/dividers |
| Lembar red | `#A3202B` | logo/accent/primary action |
| Red hover | `#851925` | primary hover |
| Red soft | `#F5E4E5` | selected/notice background |

Semantic colors hidup di `DESIGN-SYSTEM.md`; logo hanya memakai Ink, Lembar red, white, atau
monochrome.

## Typography character

- UI/body baseline: `Inter` with system fallback.
- Logo wordmark: custom vector; do not substitute UI font in production asset.
- Tabular numbers enabled for quota, dates, and metrics.
- Hindari uppercase tracking lebar untuk body, gradient text, dan display type yang ornamental.

## Imagery

Prioritas:

1. Output lembar nyata dengan dummy/synthetic content.
2. Close-up workflow guru yang punya consent dan release.
3. Diagram sederhana atau crop product UI.

Jangan memakai 3D blob, floating glass cards, AI brain, robot teacher, neon gradient, random
sparkle, atau stock classroom yang dipakai sebagai bukti pelanggan.

## Voice

- Gunakan Bahasa Indonesia natural, aktif, dan singkat.
- Sebut “buat draft”, “tinjau”, “finalkan”, dan “siap cetak”.
- Jangan menyebut AI sebagai sulap atau pengganti guru.
- Acknowledge uncertainty dengan tindakan yang jelas.
- Guru disapa netral pada product UI; nama/sapaan personal hanya jika data tersedia.

Contoh:

- Baik: `Buat draft 20 soal dari materi yang Anda pilih.`
- Buruk: `Biarkan kecerdasan ajaib kami merevolusi ujian Anda!`
- Baik: `3 soal perlu ditinjau karena dukungan sumbernya lemah.`
- Buruk: `AI gagal. Coba lagi.`

## Asset checklist

Sebelum F1 landing:

- vector master SVG horizontal dan mark-only;
- monochrome SVG;
- favicon 16/32, mask icon, Apple touch icon, OG mark;
- light/dark-on-image rules;
- copyright/owner metadata;
- visual regression snapshots pada 16, 24, 32, dan header size.

`references/visual/logo-concept.png` adalah eksplorasi, bukan production asset.

