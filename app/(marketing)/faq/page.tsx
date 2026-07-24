import type { Metadata } from 'next';
import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';
import JsonLd from '@/app/components/marketing/JsonLd';
import Link from 'next/link';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id'),
  title: 'FAQ lembar — Pertanyaan Umum tentang Generator Soal AI',
  description:
    'Jawaban atas pertanyaan paling sering tentang lembar: cara kerja AI, harga, keamanan data, kurikulum yang didukung, dan cara mulai membuat soal dalam 2 menit.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ lembar — Pertanyaan Umum tentang Generator Soal AI',
    description:
      'Semua yang perlu Anda tahu tentang lembar: AI, harga, keamanan, dan kurikulum.',
    url: '/faq',
    siteName: 'lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ lembar — Pertanyaan Umum',
    description: 'Jawaban langsung tentang generator soal AI lembar.',
    images: ['/og-image.svg'],
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    q: 'Apa itu lembar?',
    a: 'Platform pembuatan asesmen berbasis AI untuk guru Indonesia. Masukkan topik, pilih tingkat kesulitan — AI menyusun draft soal yang bisa Anda revisi dan ekspor ke Word/PDF.',
  },
  {
    q: 'Berapa biayanya?',
    a: 'Ada paket Gratis untuk mulai mencoba tanpa batas waktu. Paket Pro mulai Rp79.000/bulan untuk fitur lengkap seperti AI tak terbatas dan ekspor massal.',
  },
  {
    q: 'Bagaimana AI-nya bekerja?',
    a: 'AI kami dilatih dengan ribuan soal berkualitas dari berbagai mata pelajaran dan jenjang Indonesia. Cukup berikan topik dan level taksonomi Bloom, sisanya AI yang handle.',
  },
  {
    q: 'Apakah data soal saya aman?',
    a: 'Sangat. Enkripsi AES-256, audit trail lengkap, dan infrastruktur ISO 27001. Soal Anda 100% milik sekolah Anda — kami tidak pernah menjual atau melihat isinya.',
  },
  {
    q: 'Kurikulum apa yang didukung?',
    a: 'Kurikulum Merdeka dan K-13. Anda juga bisa menyesuaikan soal untuk kebutuhan khusus sekolah, ujian mandiri, atau olimpiade.',
  },
  {
    q: 'Berapa lama untuk mulai menggunakan?',
    a: 'Kurang dari 2 menit. Daftar akun gratis, pilih mata pelajaran, dan langsung buat lembar soal pertama Anda.',
  },
  {
    q: 'Format ekspor apa saja yang tersedia?',
    a: 'Ekspor ke Word (.docx) dan PDF siap cetak. Format sudah sesuai standar layout soal ujian Indonesia dengan nomor soal dan kunci jawaban terpisah.',
  },
  {
    q: 'Bisakah saya menggunakan lembar untuk ujian nasional atau ANBK?',
    a: 'Ya. lembar mendukung pembuatan soal berbasis AKM (Asesmen Kompetensi Minimum) yang digunakan dalam ANBK, termasuk soal literasi dan numerasi.',
  },
  {
    q: 'Apakah ada batas jumlah soal yang bisa dibuat?',
    a: 'Paket Gratis memiliki kuota terbatas per bulan. Paket Pro tidak ada batas — buat sebanyak yang Anda butuhkan untuk seluruh semester.',
  },
  {
    q: 'Bisa digunakan untuk sekolah atau institusi besar?',
    a: 'Ya. Paket Sekolah & Institusi mendukung banyak akun guru dalam satu dasbor, manajemen kolaboratif, dan laporan penggunaan per departemen.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
};

export default function FAQPage() {
  return (
    <>
      <JsonLd schema={faqSchema} />
      <MarketingSubPageLayout
        title="Pertanyaan Umum"
        description="Jawaban langsung tanpa basa-basi."
        badge="FAQ"
      >
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-3xl mx-auto flex flex-col gap-unit-4">
            <div className="flex flex-col gap-unit-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="bg-paper border border-border-strong rounded-xl overflow-hidden group"
                >
                  <summary className="flex items-center justify-between cursor-pointer px-unit-6 py-unit-5 font-label-semibold text-body-default text-ink hover:bg-surface-container transition-colors select-none">
                    {faq.q}
                    <span className="material-symbols-outlined text-secondary text-[20px] group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4">
                      expand_more
                    </span>
                  </summary>
                  <div className="px-unit-6 pb-unit-5 text-secondary text-body-default leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-unit-8 p-unit-8 bg-paper border border-border-strong rounded-xl text-center">
              <p className="font-label-semibold text-body-default text-ink mb-unit-2">
                Masih ada pertanyaan?
              </p>
              <p className="text-secondary text-body-sm mb-unit-6">
                Tim kami siap membantu via email atau WhatsApp.
              </p>
              <Link
                href="/kontak"
                className="inline-flex items-center gap-2 bg-burgundy text-white font-label-semibold px-unit-6 py-unit-3 rounded-lg hover:bg-burgundy/90 active:scale-95 transition-all duration-200"
              >
                Hubungi kami
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>
      </MarketingSubPageLayout>
    </>
  );
}
