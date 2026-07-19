import type { Metadata } from 'next';
import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id'),
  title: 'Kebijakan Privasi — lembar',
  description:
    'Bagaimana lembar mengumpulkan, menggunakan, melindungi, dan membagikan data pribadi Anda, lengkap dengan hak-hak Anda sebagai pengguna.',
  alternates: { canonical: '/privasi' },
  openGraph: {
    title: 'Kebijakan Privasi — lembar',
    description:
      'Bagaimana lembar mengumpulkan, menggunakan, melindungi, dan membagikan data pribadi Anda.',
    url: '/privasi',
    siteName: 'lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kebijakan Privasi — lembar',
    description: 'Bagaimana lembar mengelola data pribadi Anda.',
  },
};

export default function PrivasiPage() {
  return (
    <MarketingSubPageLayout
      title="Kebijakan Privasi"
      updateDate="Terakhir diperbarui: 19 Juli 2026"
    >
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-3xl mx-auto">
          <article className="flex flex-col gap-unit-10">
            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">1. Data yang kami kumpulkan</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Saat mendaftar: nama, email, nama sekolah, dan peran (guru/admin). Saat menggunakan
                platform: log aktivitas pembuatan soal, metadata ekspor, dan preferensi pengaturan.
                Kami tidak mengumpulkan data siswa secara langsung.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">
                2. Bagaimana kami menggunakannya
              </h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Informasi Anda digunakan untuk menyediakan layanan lembar, mempersonalisasi
                pengalaman (misal: rekomendasi mata pelajaran), dan mengirim notifikasi terkait
                akun. Kami tidak menjual data Anda kepada pihak ketiga untuk iklan.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">3. Perlindungan data</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Komunikasi ke platform dienkripsi dalam transit. Penyimpanan data mengikuti praktik
                keamanan standar industri termasuk kontrol akses berbasis peran dan pencatatan
                akses. Detail teknis terbaru tersedia di halaman{' '}
                <a className="text-burgundy hover:underline" href="/keamanan-data">
                  Keamanan Data
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">4. Berbagi data</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Data hanya dibagikan jika: (a) diwajibkan hukum yang berlaku, atau (b) atas
                persetujuan eksplisit Anda. Sub-processor yang kami gunakan (misal: layanan hosting
                dan email) terikat perjanjian kerahasiaan setara.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">5. Hak Anda</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Anda berhak mengakses, memperbarui, mengekspor, atau menghapus data pribadi Anda
                kapan saja melalui pengaturan akun. Untuk permintaan penghapusan menyeluruh, hubungi{' '}
                <a className="text-burgundy hover:underline" href="mailto:privasi@lembar.id">
                  privasi@lembar.id
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">6. Perubahan kebijakan</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Jika ada perubahan material, kami akan mengirim notifikasi email sebelum perubahan
                berlaku. Penggunaan berkelanjutan setelah tanggal efektif berarti Anda menyetujui
                versi terbaru. Versi sebelumnya tersedia di arsip internal atas permintaan.
              </p>
            </div>

            <div
              role="status"
              aria-live="polite"
              className="mt-unit-4 rounded-lg border border-border-subtle bg-paper px-unit-6 py-unit-4 text-caption text-secondary"
            >
              Halaman ini adalah teks kebijakan dan tidak mengumpulkan data baru. Pertanyaan terkait
              privasi:{' '}
              <a className="text-burgundy hover:underline" href="mailto:privasi@lembar.id">
                privasi@lembar.id
              </a>
              .
            </div>
          </article>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
