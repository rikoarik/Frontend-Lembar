import SubPageNavbar from '@/app/components/marketing/SubPageNavbar';
import Link from 'next/link';

export default function PrivasiPage() {
  return (
    <>
      <SubPageNavbar />
      <main>
        <section className="pt-unit-6 pb-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto">
            <Link href="/" className="inline-flex items-center gap-1.5 text-secondary hover:text-burgundy text-caption transition-colors mb-unit-8 group">
              <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
              Beranda
            </Link>

            <div className="max-w-2xl">
              <h1 className="font-display-xl-mobile md:font-display-xl text-ink leading-[1.1] mb-unit-3">
                Kebijakan Privasi
              </h1>
              <p className="text-secondary text-body-sm">Terakhir diperbarui: 18 Juli 2026</p>
            </div>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-3xl mx-auto">
            <article className="flex flex-col gap-unit-10">
              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">1. Data yang kami kumpulkan</h2>
                <p className="text-secondary text-body-sm leading-[1.8]">
                  Saat mendaftar: nama, email, nama sekolah, dan peran (guru/admin). Saat menggunakan platform: log aktivitas pembuatan soal, metadata ekspor, dan preferensi pengaturan. Kami <strong className="text-ink">tidak</strong> mengumpulkan data siswa secara langsung.
                </p>
              </div>

              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">2. Bagaimana kami menggunakannya</h2>
                <p className="text-secondary text-body-sm leading-[1.8]">
                  Informasi Anda digunakan untuk menyediakan layanan lembar, mempersonalisasi pengalaman (misal: rekomendasi mata pelajaran), dan mengirim notifikasi terkait akun. Kami <strong className="text-ink">tidak pernah</strong> menjual data Anda kepada pihak ketiga untuk iklan.
                </p>
              </div>

              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">3. Perlindungan data</h2>
                <p className="text-secondary text-body-sm leading-[1.8]">
                  Semua data dienkripsi AES-256 saat tersimpan dan TLS 1.3 saat ditransmisikan. Infrastruktur kami tersertifikasi ISO 27001 dan mematuhi UU Perlindungan Data Pribadi (UU PDP) Indonesia.
                </p>
              </div>

              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">4. Berbagi data</h2>
                <p className="text-secondary text-body-sm leading-[1.8]">
                  Data hanya dibagikan jika: (a) diwajibkan hukum yang berlaku, atau (b) atas persetujuan eksplisit Anda. Kami menggunakan sub-processor (hosting, email) yang terikat perjanjian kerahasiaan setara.
                </p>
              </div>

              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">5. Hak Anda</h2>
                <p className="text-secondary text-body-sm leading-[1.8]">
                  Anda berhak mengakses, memperbarui, mengekspor, atau menghapus data pribadi Anda kapan saja melalui pengaturan akun. Untuk permintaan penghapusan menyeluruh, hubungi <a href="mailto:privasi@lembar.id" className="text-burgundy hover:underline">privasi@lembar.id</a>.
                </p>
              </div>

              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">6. Perubahan kebijakan</h2>
                <p className="text-secondary text-body-sm leading-[1.8]">
                  Jika ada perubahan material, kami akan mengirim notifikasi email minimal 30 hari sebelum perubahan berlaku. Penggunaan berkelanjutan setelah tanggal efektif berarti Anda menyetujui versi terbaru.
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
