import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/app/components/marketing/JsonLd';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id'),
  title: 'Buat Soal Ujian Otomatis — lembar',
  description:
    'Buat soal ujian lengkap: UH, UTS, UAS, PAS, dan ujian mandiri. lembar menyusun soal sesuai kisi-kisi, ekspor ke Word/PDF siap cetak dalam hitungan detik.',
  alternates: { canonical: '/buat-soal-ujian' },
  openGraph: {
    title: 'Buat Soal Ujian Otomatis — lembar',
    description:
      'UH, UTS, UAS, PAS, ujian mandiri — buat soal ujian lengkap dengan kunci jawaban, siap ekspor ke Word/PDF.',
    url: '/buat-soal-ujian',
    siteName: 'lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buat Soal Ujian Otomatis — lembar',
    description: 'Soal UH, UTS, UAS, PAS otomatis. Ekspor Word/PDF siap cetak.',
    images: ['/og-image.svg'],
  },
  robots: { index: true, follow: true },
};

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Buat Soal Ujian Otomatis',
  description:
    'Platform pembuatan soal ujian otomatis — UH, UTS, UAS, PAS, dan ujian mandiri — untuk guru Indonesia.',
  url: 'https://lembar.id/buat-soal-ujian',
  isPartOf: { '@type': 'WebSite', url: 'https://lembar.id' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://lembar.id' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Buat Soal Ujian',
        item: 'https://lembar.id/buat-soal-ujian',
      },
    ],
  },
};

const examTypes = [
  {
    icon: 'quiz',
    title: 'Ulangan Harian (UH)',
    desc: 'Soal formatif singkat per KD/materi — cepat dibuat, cepat dinilai.',
    badge: 'Paling sering dipakai',
  },
  {
    icon: 'assignment',
    title: 'UTS / PTS',
    desc: 'Ujian Tengah Semester dengan cakupan multi-bab dan variasi tipe soal.',
    badge: null,
  },
  {
    icon: 'fact_check',
    title: 'UAS / PAS',
    desc: 'Penilaian Akhir Semester dengan kisi-kisi lengkap dan distribusi soal merata.',
    badge: null,
  },
  {
    icon: 'workspace_premium',
    title: 'Ujian Mandiri & Olimpiade',
    desc: 'Soal pengayaan untuk siswa berprestasi atau persiapan kompetisi.',
    badge: null,
  },
  {
    icon: 'monitor_heart',
    title: 'Diagnostik & Remidial',
    desc: 'Soal pemetaan pemahaman awal dan tindak lanjut bagi siswa yang belum tuntas.',
    badge: null,
  },
  {
    icon: 'grade',
    title: 'Penilaian Projek (P5)',
    desc: 'Rubrik penilaian Projek Penguatan Profil Pelajar Pancasila sesuai Kurikulum Merdeka.',
    badge: 'Kurikulum Merdeka',
  },
];

const outputs = [
  {
    icon: 'description',
    title: 'Soal + kunci terpisah',
    desc: 'Lembar soal untuk siswa dan lembar kunci untuk guru dalam satu ekspor.',
  },
  {
    icon: 'print',
    title: 'PDF siap cetak',
    desc: 'Layout A4 dengan header sekolah, kolom nama/kelas, dan nomor soal otomatis.',
  },
  {
    icon: 'edit_document',
    title: 'Word (.docx) editable',
    desc: 'Masih perlu tweak? Edit di Microsoft Word atau Google Docs sebelum cetak.',
  },
  {
    icon: 'grid_on',
    title: 'Tabel skor',
    desc: 'Lembar penilaian dengan bobot per soal untuk rekap nilai kelas.',
  },
];

export default function BuatSoalUjianPage() {
  return (
    <>
      <JsonLd schema={pageSchema} />
      <div className="min-h-screen">
        {/* Hero */}
        <header className="py-unit-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
          <div className="inline-block px-unit-3 py-unit-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-label-semibold text-caption mb-unit-6">
            Pembuat Soal Ujian
          </div>
          <h1 className="font-h1 text-h1 text-ink mb-unit-4 max-w-3xl mx-auto">
            Buat soal ujian lengkap, bukan cuma draft
          </h1>
          <p className="text-secondary text-body-lg max-w-2xl mx-auto mb-unit-8">
            UH, UTS, UAS, PAS — semua jenis ujian bisa dibuat otomatis dengan lembar. Soal
            lengkap, kunci jawaban terpisah, ekspor Word/PDF siap cetak. Tidak perlu mulai dari
            nol.
          </p>
          <div className="flex flex-col sm:flex-row gap-unit-3 justify-center">
            <Link
              href="/daftar"
              className="inline-flex items-center justify-center gap-2 bg-burgundy text-white font-label-semibold px-unit-8 py-unit-4 rounded-xl hover:bg-burgundy/90 active:scale-95 transition-all duration-200 text-body-default"
            >
              Mulai gratis
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link
              href="/generator-soal"
              className="inline-flex items-center justify-center gap-2 border border-border-strong text-ink font-label-semibold px-unit-8 py-unit-4 rounded-xl hover:bg-surface-container active:scale-95 transition-all duration-200 text-body-default"
            >
              Lihat cara kerja
            </Link>
          </div>
        </header>

        {/* Jenis ujian */}
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface-container">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-h2 text-h2 text-ink text-center mb-unit-4">
              Semua jenis ujian, satu platform
            </h2>
            <p className="text-secondary text-body-default text-center max-w-xl mx-auto mb-unit-12">
              Dari ulangan harian sederhana hingga ujian akhir semester multi-bab — lembar
              menangani semuanya.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-unit-6">
              {examTypes.map((exam, i) => (
                <div
                  key={i}
                  className="bg-paper border border-border-strong rounded-xl p-unit-6 flex flex-col gap-unit-3"
                >
                  <div className="flex items-start justify-between gap-unit-2">
                    <span className="material-symbols-outlined text-burgundy text-[28px]">
                      {exam.icon}
                    </span>
                    {exam.badge && (
                      <span className="text-caption font-label-semibold text-burgundy bg-burgundy/10 px-unit-2 py-0.5 rounded-full whitespace-nowrap">
                        {exam.badge}
                      </span>
                    )}
                  </div>
                  <p className="font-label-semibold text-body-default text-ink">{exam.title}</p>
                  <p className="text-secondary text-body-sm">{exam.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Output */}
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-h2 text-h2 text-ink text-center mb-unit-4">
              Output siap pakai, bukan file mentah
            </h2>
            <p className="text-secondary text-body-default text-center max-w-xl mx-auto mb-unit-12">
              Setiap ekspor sudah diformat sesuai standar lembar soal ujian Indonesia — tinggal
              cetak atau bagikan ke siswa.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-unit-6 max-w-3xl mx-auto">
              {outputs.map((o, i) => (
                <div
                  key={i}
                  className="bg-paper border border-border-strong rounded-xl p-unit-6 flex gap-unit-4"
                >
                  <span className="material-symbols-outlined text-burgundy text-[24px] flex-shrink-0 mt-0.5">
                    {o.icon}
                  </span>
                  <div>
                    <p className="font-label-semibold text-body-default text-ink mb-unit-1">
                      {o.title}
                    </p>
                    <p className="text-secondary text-body-sm">{o.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison callout */}
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface-container">
          <div className="max-w-3xl mx-auto">
            <div className="bg-paper border border-border-strong rounded-2xl p-unit-8 md:p-unit-12">
              <h2 className="font-h2 text-h2 text-ink mb-unit-6 text-center">
                Berapa jam yang Anda hemat?
              </h2>
              <div className="grid grid-cols-2 gap-unit-4 mb-unit-8">
                <div className="bg-surface-container rounded-xl p-unit-6 text-center">
                  <p className="font-label-semibold text-caption text-secondary uppercase tracking-wider mb-unit-2">
                    Cara lama
                  </p>
                  <p className="font-h2 text-h2 text-ink mb-unit-1">2–4 jam</p>
                  <p className="text-secondary text-body-sm">buat soal UTS manual</p>
                </div>
                <div className="bg-burgundy/10 border border-burgundy/20 rounded-xl p-unit-6 text-center">
                  <p className="font-label-semibold text-caption text-burgundy uppercase tracking-wider mb-unit-2">
                    Pakai lembar
                  </p>
                  <p className="font-h2 text-h2 text-burgundy mb-unit-1">&lt; 5 menit</p>
                  <p className="text-secondary text-body-sm">soal siap, tinggal review</p>
                </div>
              </div>
              <p className="text-secondary text-body-sm text-center">
                Estimasi berdasarkan rata-rata guru membuat soal UTS 40 butir secara manual.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-h2 text-h2 text-ink mb-unit-4">
              Ujian berikutnya, siap dalam 5 menit
            </h2>
            <p className="text-secondary text-body-default mb-unit-8">
              Daftar gratis dan buat soal ujian pertama Anda sekarang. Tidak perlu kartu kredit.
            </p>
            <div className="flex flex-col sm:flex-row gap-unit-3 justify-center">
              <Link
                href="/daftar"
                className="inline-flex items-center justify-center gap-2 bg-burgundy text-white font-label-semibold px-unit-8 py-unit-4 rounded-xl hover:bg-burgundy/90 active:scale-95 transition-all duration-200 text-body-default"
              >
                Coba gratis sekarang
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                href="/harga"
                className="inline-flex items-center justify-center gap-2 border border-border-strong text-ink font-label-semibold px-unit-8 py-unit-4 rounded-xl hover:bg-surface-container active:scale-95 transition-all duration-200 text-body-default"
              >
                Lihat paket harga
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
