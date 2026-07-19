import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';

export default function SyaratPage() {
  return (
    <MarketingSubPageLayout
      title="Syarat & Ketentuan"
      updateDate="Terakhir diperbarui: 18 Juli 2026"
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
                Soal yang Anda buat melalui lembar{' '}
                <strong className="text-ink">tetap 100% milik Anda</strong> atau institusi Anda.
                Kami tidak mengklaim kepemilikan atas konten buatan pengguna. Anda memberikan kami
                lisensi terbatas hanya untuk menyimpan dan menampilkan konten tersebut dalam
                platform.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">5. Ketersediaan layanan</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Kami menargetkan uptime 99.9% dan melakukan maintenance terjadwal di luar jam kerja.
                Namun, kami tidak menjamin layanan akan selalu bebas gangguan. Notifikasi
                maintenance akan dikirim minimal 24 jam sebelumnya.
              </p>
            </div>

            <div>
              <h2 className="font-h3 text-h3 text-ink mb-unit-3">6. Perubahan ketentuan</h2>
              <p className="text-secondary text-body-sm leading-[1.8]">
                Perubahan material akan diberitahukan via email minimal 30 hari sebelum berlaku.
                Untuk perubahan minor (typo, klarifikasi), kami akan memperbarui tanggal
                &quot;Terakhir diperbarui&quot; di halaman ini.
              </p>
            </div>
          </article>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
