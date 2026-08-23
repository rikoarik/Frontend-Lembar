import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';

export default function KeamananDataPage() {
  return (
    <MarketingSubPageLayout
      title="Akses data dibuat terbatas dan dapat ditinjau."
      description="Halaman ini menjelaskan kontrol yang diterapkan aplikasi saat ini tanpa mengklaim sertifikasi yang belum dipublikasikan."
      badge="Keamanan"
    >
      <section className="bg-surface px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto grid max-w-container-max grid-cols-1 gap-unit-6 lg:grid-cols-2">
          <div className="flex min-h-[280px] flex-col justify-between rounded-2xl border border-border-strong bg-paper p-unit-10">
            <div>
              <p className="mb-unit-4 font-label-semibold text-caption uppercase tracking-wider text-secondary">
                Sesi browser
              </p>
              <h2 className="mb-unit-3 font-h2 text-h2 text-ink">Cookie autentikasi terbatas</h2>
              <p className="max-w-md text-body-default leading-relaxed text-secondary">
                Token sesi disimpan sebagai cookie HttpOnly, menggunakan SameSite, dan ditandai
                Secure pada environment production. Browser tidak menerima secret provider atau
                credential backend.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-unit-4">
            <div className="flex-1 rounded-2xl border border-border-strong bg-paper p-unit-8">
              <h3 className="mb-unit-2 font-h3 text-h3 text-ink">Pemisahan area kerja</h3>
              <p className="text-body-sm leading-relaxed text-secondary">
                Area guru, admin sekolah, dan ops memiliki guard server. Otorisasi akhir tetap
                diverifikasi oleh layanan backend untuk setiap operasi data.
              </p>
            </div>
            <div className="flex-1 rounded-2xl border border-border-strong bg-paper p-unit-8">
              <h3 className="mb-unit-2 font-h3 text-h3 text-ink">Tautan siswa terbatas</h3>
              <p className="text-body-sm leading-relaxed text-secondary">
                Tautan pengerjaan dapat kedaluwarsa atau dicabut. Endpoint siswa tidak menggunakan
                viewer legacy yang menampilkan jawaban dan penjelasan.
              </p>
            </div>
            <div className="flex-1 rounded-2xl border border-border-strong bg-paper p-unit-8">
              <h3 className="mb-unit-2 font-h3 text-h3 text-ink">Status kepatuhan</h3>
              <p className="text-body-sm leading-relaxed text-secondary">
                Detail hosting, retensi, enkripsi penyimpanan, sertifikasi, dan perjanjian
                pemrosesan data harus dikonfirmasi melalui dokumentasi atau kontak resmi sebelum
                dijadikan dasar keputusan organisasi.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
