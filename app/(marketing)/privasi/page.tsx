import type { Metadata } from 'next';
import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi - lembar',
  description:
    'Kebijakan privasi lembar — data yang dikumpulkan, penggunaan, perlindungan, hak pengguna, dan perubahan kebijakan.',
  openGraph: {
    title: 'Kebijakan Privasi - lembar',
    description:
      'Pelajari bagaimana lembar melindungi data pribadi Anda sesuai UU PDP Indonesia.',
  },
};

export default function PrivasiPage() {
  return (
    <MarketingSubPageLayout
      title="Kebijakan Privasi"
      updateDate="Terakhir diperbarui: 18 Juli 2026"
    >
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-3xl mx-auto">
          <article className="flex flex-col gap-unit-10">
            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">1. Data yang kami kumpulkan</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Saat mendaftar: nama, email, nama sekolah, dan peran (guru/admin). Saat menggunakan
                platform: log aktivitas pembuatan soal, metadata ekspor, dan preferensi pengaturan.
                Kami <strong className="text-ink">tidak</strong> mengumpulkan data siswa secara
                langsung.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">
                2. Bagaimana kami menggunakannya
              </h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Informasi Anda digunakan untuk menyediakan layanan lembar, mempersonalisasi
                pengalaman (misal: rekomendasi mata pelajaran), dan mengirim notifikasi terkait
                akun. Kami <strong className="text-ink">tidak pernah</strong> menjual data Anda
                kepada pihak ketiga untuk iklan.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">3. Perlindungan data</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Semua data dienkripsi AES-256 saat tersimpan dan TLS 1.3 saat ditransmisikan.
                Infrastruktur kami tersertifikasi ISO 27001 and mematuhi UU Perlindungan Data
                Pribadi (UU PDP) Indonesia.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">4. Berbagi data</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Data hanya dibagikan jika: (a) diwajibkan hukum yang berlaku, atau (b) atas
                persetujuan eksplisit Anda. Kami menggunakan sub-processor (hosting, email) yang
                terikat perjanjian kerahasiaan setara.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">5. Hak Anda</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Anda berhak mengakses, memperbarui, mengekspor, atau menghapus data pribadi Anda
                kapan saja melalui pengaturan akun. Untuk permintaan penghapusan menyeluruh, hubungi{' '}
                <a href="mailto:privasi@lembar.id" className="text-burgundy hover:underline">
                  privasi@lembar.id
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">6. Perubahan kebijakan</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Jika ada perubahan material, kami akan mengirim notifikasi email minimal 30 hari
                sebelum perubahan berlaku. Penggunaan berkelanjutan setelah tanggal efektif berarti
                Anda menyetujui versi terbaru.
              </p>
            </div>
          </article>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
