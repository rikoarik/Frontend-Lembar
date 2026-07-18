export default function KeamananDataPage() {
  return (
    <>
      <main>
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto">
            <span className="bg-burgundy/10 text-burgundy px-unit-3 py-unit-1 rounded-full font-label-semibold text-caption border border-burgundy/20">Keamanan</span>
            <h1 className="font-display-xl-mobile md:font-display-xl text-ink mt-unit-4 mb-unit-6 max-w-2xl">Keamanan Data Prioritas Utama.</h1>
            <p className="text-secondary text-body-lead max-w-2xl">
              Kami memahami bahwa soal ujian adalah aset yang sangat sensitif. Karena itu, keamanan data menjadi fondasi utama dalam setiap lini arsitektur lembar.
            </p>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-unit-8">
            <div className="paper-card rounded-2xl p-unit-8 border border-border-strong">
              <span className="material-symbols-outlined text-burgundy text-[32px] mb-unit-4 block">lock</span>
              <h3 className="font-h3 text-h3 text-ink mb-unit-2">Enkripsi End-to-End</h3>
              <p className="text-secondary text-body-sm">Seluruh data soal dienkripsi saat transit (TLS 1.3) maupun saat tersimpan (AES-256) untuk memastikan tidak ada pihak lain yang dapat mengakses konten soal Anda.</p>
            </div>
            <div className="paper-card rounded-2xl p-unit-8 border border-border-strong">
              <span className="material-symbols-outlined text-burgundy text-[32px] mb-unit-4 block">admin_panel_settings</span>
              <h3 className="font-h3 text-h3 text-ink mb-unit-2">Kontrol Akses Berlapis</h3>
              <p className="text-secondary text-body-sm">Setiap pengguna hanya dapat mengakses data sesuai perannya. Admin sekolah memiliki kontrol penuh atas siapa yang dapat melihat, mengedit, dan mengekspor soal.</p>
            </div>
            <div className="paper-card rounded-2xl p-unit-8 border border-border-strong">
              <span className="material-symbols-outlined text-burgundy text-[32px] mb-unit-4 block">history</span>
              <h3 className="font-h3 text-h3 text-ink mb-unit-2">Audit Trail Lengkap</h3>
              <p className="text-secondary text-body-sm">Setiap aktivitas tercatat secara otomatis: siapa yang membuat, mengedit, dan mengekspor soal beserta waktu dan detail perubahannya.</p>
            </div>
            <div className="paper-card rounded-2xl p-unit-8 border border-border-strong">
              <span className="material-symbols-outlined text-burgundy text-[32px] mb-unit-4 block">cloud_done</span>
              <h3 className="font-h3 text-h3 text-ink mb-unit-2">Infrastruktur Tersertifikasi</h3>
              <p className="text-secondary text-body-sm">Platform kami berjalan di infrastruktur cloud yang telah tersertifikasi ISO 27001, SOC 2 Type II, dan sesuai dengan regulasi perlindungan data Indonesia.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
