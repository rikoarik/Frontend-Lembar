import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/app/components/marketing/JsonLd';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id'),
  title: 'Generator Soal Otomatis untuk Guru — lembar',
  description:
    'Buat soal pilihan ganda, isian singkat, dan esai secara otomatis. Generator soal berbasis AI lembar menyusun soal sesuai kurikulum Merdeka dan K-13 dalam hitungan detik.',
  alternates: { canonical: '/generator-soal' },
  openGraph: {
    title: 'Generator Soal Otomatis untuk Guru — lembar',
    description:
      'Generator soal AI untuk guru Indonesia. Pilih topik, tingkat kesulitan, dan taksonomi Bloom — soal siap dalam hitungan detik.',
    url: '/generator-soal',
    siteName: 'lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generator Soal Otomatis — lembar',
    description: 'Buat soal otomatis sesuai kurikulum Merdeka dan K-13.',
    images: ['/og-image.svg'],
  },
  robots: { index: true, follow: true },
};

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Generator Soal Otomatis untuk Guru',
  description:
    'Buat soal pilihan ganda, isian singkat, dan esai secara otomatis dengan AI lembar.',
  url: 'https://lembar.id/generator-soal',
  isPartOf: { '@type': 'WebSite', url: 'https://lembar.id' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://lembar.id' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Generator Soal',
        item: 'https://lembar.id/generator-soal',
      },
    ],
  },
};

const steps = [
  {
    icon: 'edit_note',
    title: 'Masukkan topik',
    desc: 'Ketik topik pelajaran, pilih jenjang dan mata pelajaran.',
  },
  {
    icon: 'tune',
    title: 'Pilih parameter',
    desc: 'Atur jumlah soal, tipe, tingkat kesulitan, dan level Bloom.',
  },
  {
    icon: 'auto_awesome',
    title: 'AI menyusun soal',
    desc: 'Soal lengkap dengan kunci jawaban tersedia dalam detik.',
  },
  {
    icon: 'download',
    title: 'Ekspor & gunakan',
    desc: 'Unduh ke Word atau PDF siap cetak, langsung pakai.',
  },
];

const features = [
  { icon: 'quiz', title: 'Pilihan ganda', desc: 'A–E dengan pengecoh kontekstual' },
  { icon: 'short_text', title: 'Isian singkat', desc: 'Satu kata hingga satu kalimat' },
  { icon: 'subject', title: 'Esai / uraian', desc: 'Lengkap dengan rubrik penilaian' },
  { icon: 'checklist', title: 'Benar / salah', desc: 'Cepat untuk kuis formatif' },
  { icon: 'drag_indicator', title: 'Menjodohkan', desc: 'Pasangkan konsep dan definisi' },
  { icon: 'hub', title: 'AKM / literasi', desc: 'Siap untuk format ANBK' },
];

export default function GeneratorSoalPage() {
  return (
    <>
      <JsonLd schema={pageSchema} />
      <div className="min-h-screen">
        {/* Hero */}
        <header className="py-unit-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
          <div className="inline-block px-unit-3 py-unit-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-label-semibold text-caption mb-unit-6">
            Generator Soal
          </div>
          <h1 className="font-h1 text-h1 text-ink mb-unit-4 max-w-3xl mx-auto">
            Buat soal otomatis dalam hitungan detik
          </h1>
          <p className="text-secondary text-body-lg max-w-2xl mx-auto mb-unit-8">
            Masukkan topik pelajaran, pilih tipe soal dan tingkat kesulitan — AI lembar menyusun
            soal lengkap dengan kunci jawaban, siap ekspor ke Word atau PDF.
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
              Lihat harga
            </Link>
          </div>
        </header>

        {/* Cara kerja */}
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface-container">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-h2 text-h2 text-ink text-center mb-unit-12">
              Cara kerja generator soal
            </h2>
            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-unit-6">
              {steps.map((step, i) => (
                <li key={i} className="bg-paper border border-border-strong rounded-xl p-unit-6">
                  <div className="flex items-center gap-unit-3 mb-unit-3">
                    <div className="w-8 h-8 rounded-full bg-burgundy/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-label-semibold text-caption text-burgundy">
                        {i + 1}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-burgundy text-[20px]">
                      {step.icon}
                    </span>
                  </div>
                  <p className="font-label-semibold text-body-default text-ink mb-unit-1">
                    {step.title}
                  </p>
                  <p className="text-secondary text-body-sm">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Tipe soal */}
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-h2 text-h2 text-ink text-center mb-unit-4">
              Semua tipe soal dalam satu platform
            </h2>
            <p className="text-secondary text-body-default text-center max-w-xl mx-auto mb-unit-12">
              Dari pilihan ganda hingga esai berstruktur — semuanya bisa dibuat otomatis dan
              diekspor bersama dalam satu lembar soal.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-unit-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-paper border border-border-strong rounded-xl p-unit-6 flex gap-unit-4"
                >
                  <span className="material-symbols-outlined text-burgundy text-[24px] flex-shrink-0 mt-0.5">
                    {f.icon}
                  </span>
                  <div>
                    <p className="font-label-semibold text-body-default text-ink mb-unit-1">
                      {f.title}
                    </p>
                    <p className="text-secondary text-body-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA bottom */}
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-h2 text-h2 text-ink mb-unit-4">
              Mulai buat soal sekarang, gratis
            </h2>
            <p className="text-secondary text-body-default mb-unit-8">
              Tidak perlu kartu kredit. Daftar dalam 30 detik dan langsung akses generator soal.
            </p>
            <Link
              href="/daftar"
              className="inline-flex items-center justify-center gap-2 bg-burgundy text-white font-label-semibold px-unit-8 py-unit-4 rounded-xl hover:bg-burgundy/90 active:scale-95 transition-all duration-200 text-body-default"
            >
              Daftar gratis
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
