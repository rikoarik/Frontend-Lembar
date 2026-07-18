export default function KontakPage() {
  return (
    <>
      <main>
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto">
            <span className="bg-burgundy/10 text-burgundy px-unit-3 py-unit-1 rounded-full font-label-semibold text-caption border border-burgundy/20">Kontak</span>
            <h1 className="font-display-xl-mobile md:font-display-xl text-ink mt-unit-4 mb-unit-6 max-w-2xl">Hubungi Kami</h1>
            <p className="text-secondary text-body-lead max-w-2xl">
              Ada pertanyaan atau ingin berdiskusi tentang kebutuhan sekolah Anda? Tim kami siap membantu.
            </p>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-unit-8">
            <div className="paper-card rounded-2xl p-unit-8 border border-border-strong text-center hover:-translate-y-1 transition-transform duration-300">
              <span className="material-symbols-outlined text-burgundy text-[32px] mb-unit-4 block">mail</span>
              <h3 className="font-h3 text-h3 text-ink mb-unit-2">Email</h3>
              <p className="text-secondary text-body-sm">halo@lembar.id</p>
            </div>
            <div className="paper-card rounded-2xl p-unit-8 border border-border-strong text-center hover:-translate-y-1 transition-transform duration-300">
              <span className="material-symbols-outlined text-burgundy text-[32px] mb-unit-4 block">call</span>
              <h3 className="font-h3 text-h3 text-ink mb-unit-2">Telepon</h3>
              <p className="text-secondary text-body-sm">+62 21 1234 5678</p>
            </div>
            <div className="paper-card rounded-2xl p-unit-8 border border-border-strong text-center hover:-translate-y-1 transition-transform duration-300">
              <span className="material-symbols-outlined text-burgundy text-[32px] mb-unit-4 block">schedule</span>
              <h3 className="font-h3 text-h3 text-ink mb-unit-2">Jam Kerja</h3>
              <p className="text-secondary text-body-sm">Senin – Jumat, 08.00 – 17.00 WIB</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
