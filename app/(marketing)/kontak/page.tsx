import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';
import SchoolLeadForm from '@/src/features/leads/SchoolLeadForm';

export default function KontakPage() {
  return (
    <MarketingSubPageLayout
      title="Bicarakan kebutuhan sekolah Anda."
      description="Untuk institusi sekolah, kirim data singkat agar tim lembar dapat meninjau kebutuhan dan mengatur percakapan yang tepat."
      badge="Kontak Sekolah"
      asymmetric
    >
      <section className="bg-surface px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto max-w-container-max">
          <div className="grid grid-cols-1 items-start gap-unit-12 lg:grid-cols-12">
            <div className="flex flex-col gap-unit-8 lg:col-span-5">
              <div className="flex flex-col gap-unit-4">
                <h2 className="font-h2 text-h2 text-ink">Rute tindak lanjut</h2>
                <p className="max-w-reading-max font-body-default text-body-default leading-relaxed text-secondary">
                  Kami memakai formulir ini untuk memahami konteks sekolah, bukan untuk membuat akun
                  otomatis. Jangan masukkan data siswa atau dokumen internal.
                </p>
              </div>
              <div className="flex flex-col gap-unit-5 border-y border-border-subtle py-unit-6">
                <div className="flex items-start gap-unit-4">
                  <span
                    className="material-symbols-outlined mt-0.5 text-[22px] text-burgundy"
                    aria-hidden="true"
                  >
                    fact_check
                  </span>
                  <div>
                    <h3 className="font-label-semibold text-body-sm text-ink">
                      Data ditinjau manual
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Tim memeriksa kebutuhan sekolah sebelum menghubungi Anda.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-unit-4">
                  <span
                    className="material-symbols-outlined mt-0.5 text-[22px] text-burgundy"
                    aria-hidden="true"
                  >
                    privacy_tip
                  </span>
                  <div>
                    <h3 className="font-label-semibold text-body-sm text-ink">
                      Tidak perlu data sensitif
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Cukup isi kontak kerja dan ringkasan kebutuhan.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-unit-4">
                  <span
                    className="material-symbols-outlined mt-0.5 text-[22px] text-burgundy"
                    aria-hidden="true"
                  >
                    schedule
                  </span>
                  <div>
                    <h3 className="font-label-semibold text-body-sm text-ink">
                      Tindak lanjut 1–2 hari kerja
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Jika sesuai, kami akan mengatur percakapan lanjutan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <SchoolLeadForm />
            </div>
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
