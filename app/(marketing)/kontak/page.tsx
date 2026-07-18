'use client';

import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';

export default function KontakPage() {
  return (
    <MarketingSubPageLayout
      title="Ada yang bisa kami bantu?"
      description="Mau tanya soal produk, butuh demo khusus, atau sekadar ngobrol — tim kami bisa dihubungi kapan saja di jam kerja."
      badge="Kontak"
    >
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-12 items-start">
            <div className="lg:col-span-6 flex flex-col gap-unit-8">
              <h2 className="font-h2 text-h2 text-ink">Informasi Kontak</h2>
              <div className="flex flex-col gap-unit-6">
                <div className="flex items-start gap-unit-4">
                  <span className="material-symbols-outlined text-burgundy text-[24px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                  <div>
                    <span className="font-label-semibold text-ink block">Email</span>
                    <span className="text-secondary text-body-sm">halo@lembar.id</span>
                  </div>
                </div>
                <div className="flex items-start gap-unit-4">
                  <span className="material-symbols-outlined text-burgundy text-[24px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>call</span>
                  <div>
                    <span className="font-label-semibold text-ink block">Telepon</span>
                    <span className="text-secondary text-body-sm">+62 21 1234 5678</span>
                  </div>
                </div>
                <div className="flex items-start gap-unit-4">
                  <span className="material-symbols-outlined text-burgundy text-[24px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                  <div>
                    <span className="font-label-semibold text-ink block">Jam Kerja</span>
                    <span className="text-secondary text-body-sm">Senin – Jumat, 08.00 – 17.00 WIB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-5 lg:col-start-8">
              <form onSubmit={(e) => e.preventDefault()} className="bg-paper border border-border-strong rounded-2xl p-unit-8 flex flex-col gap-unit-4">
                <h2 className="font-h3 text-h3 text-ink mb-unit-2">Kirim pesan</h2>
                <div>
                  <label htmlFor="contact-name" className="font-label-semibold text-caption text-ink block mb-1">Nama</label>
                  <input id="contact-name" type="text" placeholder="Nama lengkap Anda" className="w-full bg-surface border border-border-strong rounded-lg px-4 py-3 text-body-sm focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all" />
                </div>
                <div>
                  <label htmlFor="contact-email" className="font-label-semibold text-caption text-ink block mb-1">Email</label>
                  <input id="contact-email" type="email" placeholder="email@sekolah.sch.id" className="w-full bg-surface border border-border-strong rounded-lg px-4 py-3 text-body-sm focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all" />
                </div>
                <div>
                  <label htmlFor="contact-message" className="font-label-semibold text-caption text-ink block mb-1">Pesan</label>
                  <textarea id="contact-message" rows={4} placeholder="Apa yang ingin Anda sampaikan?" className="w-full bg-surface border border-border-strong rounded-lg px-4 py-3 text-body-sm focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all resize-none" />
                </div>
                <button type="submit" className="bg-burgundy text-on-primary font-label-semibold h-[48px] rounded-lg text-body-default hover:brightness-110 active:scale-[0.98] transition-all mt-unit-2">
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
