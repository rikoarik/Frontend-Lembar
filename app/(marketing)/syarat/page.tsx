import type { Metadata } from 'next';
import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id'),
  title: 'Syarat & Ketentuan — lembar',
  description:
    'Ketentuan penggunaan platform lembar untuk guru, admin sekolah, dan institusi pendidikan.',
  alternates: { canonical: '/syarat' },
  openGraph: {
    title: 'Syarat & Ketentuan — lembar',
    description: 'Ketentuan penggunaan platform lembar.',
    url: '/syarat',
    siteName: 'lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syarat & Ketentuan — lembar',
    description: 'Ketentuan penggunaan platform lembar.',
  },
};

export default function SyaratPage() {
  return (
    <MarketingSubPageLayout
      title="Syarat & Ketentuan"
      updateDate="Terakhir diperbarui: 19 Juli 2026"
    >
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-3xl mx-auto">
          <article className="flex flex-col gap-unit-10">
            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">1. Penerimaan ketentuan</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Dengan mengakses dan menggunakan platform lembar, Anda menyetujui untuk terikat oleh
                syarat ini. Jika Anda mewakili institusi pendidikan, Anda menyatakan memiliki
                wewenang untuk mengikat institusi tersebut.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">2. Akun pengguna</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda. Satu akun untuk
                satu pengguna — berbagi akun tidak diperkenankan. Segera hubungi kami jika terjadi
                akses tidak sah.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">3. Penggunaan yang diizinkan</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Layanan lembar hanya boleh digunakan untuk tujuan pendidikan yang sah. Dilarang
                keras: membuat konten yang melanggar hukum, melakukan reverse-engineering platform,
                atau menggunakan API secara berlebihan di luar batas wajar.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">4. Kepemilikan konten</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Soal yang Anda buat melalui lembar tetap menjadi milik Anda atau institusi Anda.
                Kami tidak mengklaim kepemilikan atas konten buatan pengguna. Anda memberikan kami
                lisensi terbatas hanya untuk menyimpan dan menampilkan konten tersebut dalam
                platform.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">5. Ketersediaan layanan</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Kami berusaha menjaga layanan tetap tersedia. Maintenance terjadwal akan diumumkan
                sebelumnya melalui email atau banner aplikasi. Layanan-layanan tertentu (misal:
                generasi soal otomatis) bergantung pada penyedia pihak ketiga dan dapat berubah
                sewaktu-waktu.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">6. Perubahan ketentuan</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Perubahan material akan diberitahukan via email sebelum berlaku. Untuk perubahan
                minor (koreksi typo, klarifikasi), kami memperbarui tanggal &quot;Terakhir
                diperbarui&quot; di halaman ini.
              </p>
            </div>

            <div
              role="status"
              aria-live="polite"
              className="mt-unit-4 rounded-lg border border-border-subtle bg-paper px-unit-6 py-unit-4 text-caption text-secondary"
            >
              Pertanyaan terkait ketentuan:{' '}
              <a className="text-burgundy hover:underline" href="mailto:halo@lembar.id">
                halo@lembar.id
              </a>
              .
            </div>
          </article>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
