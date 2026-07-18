import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';

export default function KeamananDataPage() {
  return (
    <MarketingSubPageLayout
      title="Soal Anda, rahasia Anda."
      description="Soal ujian adalah aset sensitif. Kami memperlakukannya seperti data keuangan — terenkripsi, terkontrol, dan tercatat."
      badge="Keamanan"
    >
      {/* Security architecture — visual, not boring cards */}
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-unit-12">
            {/* Left: big feature */}
            <div className="rounded-2xl bg-paper border border-border-strong p-unit-10 flex flex-col justify-between min-h-[320px]">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-caption font-label-semibold mb-unit-6">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Aktif di semua data
                </div>
                <h2 className="font-h2 text-h2 text-ink mb-unit-3">Enkripsi End-to-End</h2>
                <p className="text-secondary text-body-default leading-relaxed max-w-md">
                  TLS 1.3 saat transit, AES-256 saat tersimpan. Tidak ada pihak ketiga — termasuk kami — yang bisa mengintip isi soal Anda.
                </p>
              </div>
              <div className="flex gap-4 mt-unit-8">
                <span className="bg-surface px-3 py-1.5 rounded text-caption text-secondary border border-border-subtle">TLS 1.3</span>
                <span className="bg-surface px-3 py-1.5 rounded text-caption text-secondary border border-border-subtle">AES-256</span>
                <span className="bg-surface px-3 py-1.5 rounded text-caption text-secondary border border-border-subtle">Zero-knowledge</span>
              </div>
            </div>

            {/* Right: stacked features */}
            <div className="flex flex-col gap-unit-4">
              <div className="rounded-2xl bg-paper border border-border-strong p-unit-8 flex-1">
                <h3 className="font-h3 text-h3 text-ink mb-unit-2">Kontrol Akses Berlapis</h3>
                <p className="text-secondary text-body-sm leading-relaxed">
                  Admin sekolah menentukan siapa yang boleh melihat, mengedit, dan mengekspor soal. Guru hanya melihat kelasnya sendiri.
                </p>
              </div>
              <div className="rounded-2xl bg-paper border border-border-strong p-unit-8 flex-1">
                <h3 className="font-h3 text-h3 text-ink mb-unit-2">Audit Trail</h3>
                <p className="text-secondary text-body-sm leading-relaxed">
                  Setiap aksi tercatat: siapa membuat, siapa mengedit, kapan diunduh. Tidak ada perubahan yang hilang.
                </p>
              </div>
              <div className="rounded-2xl bg-paper border border-border-strong p-unit-8 flex-1">
                <h3 className="font-h3 text-h3 text-ink mb-unit-2">Infrastruktur Tersertifikasi</h3>
                <p className="text-secondary text-body-sm leading-relaxed">
                  Berjalan di infrastruktur ISO 27001 & SOC 2 Type II. Sesuai regulasi perlindungan data Indonesia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
