import type { Metadata } from 'next';
import Link from 'next/link';
import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id'),
  title: 'Pusat Bantuan — lembar',
  description:
    'Mulai dari sini: panduan singkat, kanal dukungan, dan kontak tim lembar untuk guru dan sekolah.',
  alternates: { canonical: '/bantuan' },
  openGraph: {
    title: 'Pusat Bantuan — lembar',
    description: 'Panduan singkat dan kontak tim dukungan lembar.',
    url: '/bantuan',
    siteName: 'lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pusat Bantuan — lembar',
    description: 'Panduan singkat dan kontak tim dukungan lembar.',
  },
};

export default function BantuanPage() {
  return (
    <MarketingSubPageLayout
      title="Mulai dari sini."
      description="Panduan singkat untuk langsung produktif dengan lembar."
      badge="Dukungan"
    >
      <section className="py-unit-12 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-unit-4">
            <div className="md:col-span-7 rounded-2xl bg-burgundy text-on-primary p-unit-10 flex flex-col justify-between min-h-[280px]">
              <div>
                <span className="text-on-primary/60 text-caption font-label-semibold tracking-wider uppercase">
                  Langkah Pertama
                </span>
                <h2 className="font-h2 text-h2 mt-unit-2 mb-unit-3 text-on-primary">
                  Buat asesmen pertama Anda
                </h2>
                <p className="text-on-primary/80 text-body-default leading-relaxed max-w-md">
                  Daftar, pilih mata pelajaran, masukkan topik — AI membantu menyusun draft soal
                  yang bisa Anda revisi dan ekspor. Tinggal tinjau dan sesuaikan.
                </p>
              </div>
              <Link
                href="/daftar"
                className="self-start mt-unit-8 bg-on-primary text-ink px-unit-6 py-unit-3 rounded-lg font-label-semibold text-caption hover:brightness-95 transition-all"
              >
                Buat akun
              </Link>
            </div>

            <div className="md:col-span-5 flex flex-col gap-unit-4">
              <article className="rounded-2xl bg-paper border border-border-strong p-unit-8 flex-1">
                <span className="text-burgundy text-caption font-label-semibold tracking-wider uppercase">
                  AI Tips
                </span>
                <h3 className="font-h3 text-h3 text-ink mt-unit-2 mb-unit-2">
                  Prompt yang menghasilkan draft lebih baik
                </h3>
                <p className="text-secondary text-body-sm leading-relaxed">
                  Semakin spesifik topik dan tingkat kelas yang Anda berikan, semakin relevan draft
                  awal yang dibantu AI hasilkan. Tinjau sebelum memfinalkan.
                </p>
              </article>
              <article className="rounded-2xl bg-paper border border-border-strong p-unit-8 flex-1">
                <span className="text-burgundy text-caption font-label-semibold tracking-wider uppercase">
                  Kolaborasi
                </span>
                <h3 className="font-h3 text-h3 text-ink mt-unit-2 mb-unit-2">Undang tim Anda</h3>
                <p className="text-secondary text-body-sm leading-relaxed">
                  Ajak guru lain ke workspace sekolah. Atur peran, bagikan bank soal, dan tinjau
                  bersama.
                </p>
              </article>
            </div>
          </div>

          <div
            role="status"
            aria-live="polite"
            className="mt-unit-12 grid grid-cols-1 md:grid-cols-2 gap-unit-4"
          >
            <article className="rounded-2xl bg-paper border border-border-strong p-unit-8 flex flex-col gap-unit-3">
              <span className="font-label-semibold text-ink text-body-sm">
                Tidak menemukan jawaban?
              </span>
              <p className="text-secondary text-body-sm leading-relaxed">
                Lihat{' '}
                <Link className="text-burgundy hover:underline" href="/faq">
                  Pertanyaan Umum
                </Link>{' '}
                atau hubungi tim kami. Sertakan konteks singkat (peran, mata pelajaran, langkah yang
                dilakukan) agar kami bisa merespons lebih cepat.
              </p>
              <Link
                href="/kontak"
                className="inline-flex items-center gap-2 bg-burgundy text-on-primary px-unit-6 py-unit-3 rounded-lg font-label-semibold text-caption hover:brightness-110 active:scale-[0.98] transition-all self-start"
              >
                Hubungi Tim
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </article>

            <article className="rounded-2xl bg-paper border border-border-strong p-unit-8 flex flex-col gap-unit-3">
              <span className="font-label-semibold text-ink text-body-sm">Gangguan sementara?</span>
              <p className="text-secondary text-body-sm leading-relaxed">
                Halaman ini dapat dibuka kapan saja sebagai titik awal. Jika platform sedang tidak
                dapat dijangkau, kontak tim akan tetap menerima pesan setelah layanan pulih.
              </p>
              <a
                href="mailto:halo@lembar.id"
                className="font-label-semibold text-burgundy hover:underline self-start"
              >
                halo@lembar.id
              </a>
            </article>
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
