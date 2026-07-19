import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id'),
  title: 'Pertanyaan Umum — lembar',
  description:
    'Jawaban singkat untuk pertanyaan yang sering diajukan seputar produk, paket, dan keamanan data lembar.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Pertanyaan Umum — lembar',
    description: 'Jawaban singkat untuk pertanyaan yang sering diajukan seputar lembar.',
    url: '/faq',
    siteName: 'lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pertanyaan Umum — lembar',
    description: 'Jawaban singkat untuk pertanyaan yang sering diajukan seputar lembar.',
  },
};

const faqs = [
  {
    q: 'Apa itu lembar?',
    a: 'Workspace asesmen untuk guru dan sekolah di Indonesia. Masukkan topik, pilih tingkat kelas, dan AI membantu menyusun draft soal yang Anda tinjau sebelum memfinalkan.',
  },
  {
    q: 'Paket apa yang tersedia?',
    a: 'Paket dan harga dapat berubah. Lihat halaman Harga untuk versi terbaru, atau hubungi tim untuk kebutuhan sekolah dan institusi.',
  },
  {
    q: 'Bagaimana AI menyusun soal?',
    a: 'AI membantu membuat draft berdasarkan topik dan sumber yang Anda berikan. Hasil akhir tetap Anda yang menentukan—setiap soal dapat direvisi atau dihapus sebelum difinalkan.',
  },
  {
    q: 'Apakah data soal saya aman?',
    a: 'Kontrol akses mengikuti peran (guru, admin), setiap aksi penting tercatat, dan komunikasi ke platform dienkripsi dalam transit. Detail di halaman Keamanan Data.',
  },
  {
    q: 'Kurikulum apa yang didukung?',
    a: 'Lembar mengikuti kurikulum yang berlaku di Indonesia. Anda tetap dapat menyesuaikan soal untuk kebutuhan spesifik sekolah, ujian mandiri, atau olimpiade.',
  },
];

export default function FAQPage() {
  return (
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
                <summary className="flex items-center justify-between cursor-pointer px-unit-6 py-unit-5 font-label-semibold text-body-default text-ink hover:bg-surface-container transition-colors select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-burgundy">
                  {faq.q}
                  <span className="material-symbols-outlined text-secondary text-[20px] group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4">
                    expand_more
                  </span>
                </summary>
                <div className="px-unit-6 pb-unit-5 text-secondary text-body-sm leading-relaxed border-t border-border-subtle">
                  <p className="pt-unit-4">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          <article className="mt-unit-8 flex flex-col md:flex-row md:items-center gap-unit-6 p-unit-8 bg-paper border border-border-strong rounded-2xl">
            <div className="flex-1">
              <h3 className="font-h3 text-h3 text-ink mb-1">Belum terjawab?</h3>
              <p className="text-secondary text-body-sm">
                Hubungi kami langsung melalui halaman kontak. Sertakan peran dan konteks singkat
                agar kami bisa merespons lebih cepat.
              </p>
            </div>
            <Link
              href="/kontak"
              className="bg-burgundy text-on-primary px-unit-6 py-unit-3 rounded-lg font-label-semibold text-caption hover:brightness-110 active:scale-[0.98] transition-all whitespace-nowrap"
            >
              Kontak
            </Link>
          </article>

          <p role="status" aria-live="polite" className="mt-unit-6 text-caption text-secondary">
            Pertanyaan dapat dikirim kapan saja. Respons mengikuti jam kerja tim dukungan.
          </p>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
