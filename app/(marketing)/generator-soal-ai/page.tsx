import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/app/components/marketing/JsonLd';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id'),
  title: 'Generator Soal AI untuk Guru Indonesia — lembar',
  description:
    'Generator soal berbasis AI yang memahami konteks kurikulum Indonesia. Buat soal Kurikulum Merdeka, K-13, dan AKM/ANBK otomatis dengan taksonomi Bloom yang tepat.',
  alternates: { canonical: '/generator-soal-ai' },
  openGraph: {
    title: 'Generator Soal AI untuk Guru Indonesia — lembar',
    description:
      'AI yang memahami Kurikulum Merdeka, K-13, dan ANBK. Buat soal berkualitas otomatis — Bloom, HOTS, AKM semua tersedia.',
    url: '/generator-soal-ai',
    siteName: 'lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generator Soal AI — lembar',
    description: 'Soal Kurikulum Merdeka, K-13, AKM/ANBK otomatis dengan AI.',
    images: ['/og-image.svg'],
  },
  robots: { index: true, follow: true },
};

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Generator Soal AI untuk Guru Indonesia',
  description:
    'Generator soal berbasis AI yang memahami kurikulum Indonesia — Merdeka, K-13, dan AKM/ANBK.',
  url: 'https://lembar.id/generator-soal-ai',
  isPartOf: { '@type': 'WebSite', url: 'https://lembar.id' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: 'https://lembar.id' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Generator Soal AI',
        item: 'https://lembar.id/generator-soal-ai',
      },
    ],
  },
};

const capabilities = [
  {
    icon: 'school',
    title: 'Kurikulum Merdeka',
    desc: 'Soal berbasis Capaian Pembelajaran (CP) dan Alur Tujuan Pembelajaran (ATP) yang relevan.',
  },
  {
    icon: 'menu_book',
    title: 'K-13',
    desc: 'Kompetensi Dasar (KD) dan Indikator Pencapaian Kompetensi (IPK) sudah tertanam dalam model.',
  },
  {
    icon: 'psychology',
    title: 'Taksonomi Bloom',
    desc: 'Atur level kognitif: C1 Mengingat hingga C6 Mencipta — soal menyesuaikan secara otomatis.',
  },
  {
    icon: 'trending_up',
    title: 'HOTS & MOTS',
    desc: 'Soal Higher Order Thinking Skills untuk melatih penalaran analitis dan kritis siswa.',
  },
  {
    icon: 'grid_view',
    title: 'AKM / ANBK',
    desc: 'Format literasi membaca dan numerasi sesuai standar Asesmen Nasional Berbasis Komputer.',
  },
  {
    icon: 'translate',
    title: 'Lintas mata pelajaran',
    desc: 'Matematika, IPA, IPS, Bahasa Indonesia, Bahasa Inggris, PPKN, dan lainnya.',
  },
];

const differentiators = [
  {
    label: 'Konteks Indonesia',
    value: 'Model dilatih dengan ribuan soal dari guru Indonesia, bukan dataset generik.',
  },
  {
    label: 'Revisi mudah',
    value: 'Edit soal, pilihan jawaban, atau kunci jawaban langsung di editor sebelum ekspor.',
  },
  {
    label: 'Tidak ada hallusinasi kritis',
    value:
      'Soal divalidasi konteks — AI tidak mengarang fakta yang tidak sesuai materi yang dimasukkan.',
  },
  {
    label: 'Output siap pakai',
    value: 'Ekspor ke Word/PDF dalam format lembar soal standar Indonesia — langsung cetak.',
  },
];

export default function GeneratorSoalAiPage() {
  return (
    <>
      <JsonLd schema={pageSchema} />
      <div className="min-h-screen">
        {/* Hero */}
        <header className="py-unit-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
          <div className="inline-block px-unit-3 py-unit-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-label-semibold text-caption mb-unit-6">
            AI untuk Guru Indonesia
          </div>
          <h1 className="font-h1 text-h1 text-ink mb-unit-4 max-w-3xl mx-auto">
            Generator soal AI yang paham kurikulum Indonesia
          </h1>
          <p className="text-secondary text-body-lg max-w-2xl mx-auto mb-unit-8">
            Bukan sekadar chatbot yang diminta buat soal — lembar adalah platform yang dibangun
            khusus untuk kurikulum Merdeka, K-13, dan format ANBK. Soal langsung relevan, tidak
            perlu diedit besar-besaran.
          </p>
          <div className="flex flex-col sm:flex-row gap-unit-3 justify-center">
            <Link
              href="/daftar"
              className="inline-flex items-center justify-center gap-2 bg-burgundy text-white font-label-semibold px-unit-8 py-unit-4 rounded-xl hover:bg-burgundy/90 active:scale-95 transition-all duration-200 text-body-default"
            >
              Coba gratis
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center gap-2 border border-border-strong text-ink font-label-semibold px-unit-8 py-unit-4 rounded-xl hover:bg-surface-container active:scale-95 transition-all duration-200 text-body-default"
            >
              Lihat FAQ
            </Link>
          </div>
        </header>

        {/* Kemampuan AI */}
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface-container">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-h2 text-h2 text-ink text-center mb-unit-4">
              AI yang mengerti konteks pendidikan Indonesia
            </h2>
            <p className="text-secondary text-body-default text-center max-w-xl mx-auto mb-unit-12">
              Dari Capaian Pembelajaran hingga level Bloom — semua parameter kurikulum sudah
              dipahami model, bukan sekadar diisi teks prompt.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-unit-6">
              {capabilities.map((c, i) => (
                <div
                  key={i}
                  className="bg-paper border border-border-strong rounded-xl p-unit-6"
                >
                  <span className="material-symbols-outlined text-burgundy text-[28px] mb-unit-3 block">
                    {c.icon}
                  </span>
                  <p className="font-label-semibold text-body-default text-ink mb-unit-2">
                    {c.title}
                  </p>
                  <p className="text-secondary text-body-sm">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Diferensiasi */}
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-h2 text-h2 text-ink text-center mb-unit-12">
              Kenapa bukan sekadar ChatGPT?
            </h2>
            <div className="flex flex-col gap-unit-4">
              {differentiators.map((d, i) => (
                <div
                  key={i}
                  className="bg-paper border border-border-strong rounded-xl p-unit-6 flex gap-unit-4"
                >
                  <span className="material-symbols-outlined text-success text-[20px] flex-shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <div>
                    <p className="font-label-semibold text-body-default text-ink mb-unit-1">
                      {d.label}
                    </p>
                    <p className="text-secondary text-body-sm">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-h2 text-h2 text-ink mb-unit-4">Siap coba sendiri?</h2>
            <p className="text-secondary text-body-default mb-unit-8">
              Daftar gratis, tidak perlu kartu kredit. Buat soal pertama Anda dalam 2 menit.
            </p>
            <Link
              href="/daftar"
              className="inline-flex items-center justify-center gap-2 bg-burgundy text-white font-label-semibold px-unit-8 py-unit-4 rounded-xl hover:bg-burgundy/90 active:scale-95 transition-all duration-200 text-body-default"
            >
              Mulai gratis
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
