export default function BantuanPage() {
  return (
    <>
      <main>
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto">
            <span className="bg-burgundy/10 text-burgundy px-unit-3 py-unit-1 rounded-full font-label-semibold text-caption border border-burgundy/20">Dukungan</span>
            <h1 className="font-display-xl-mobile md:font-display-xl text-ink mt-unit-4 mb-unit-6 max-w-2xl">Pusat Bantuan</h1>
            <p className="text-secondary text-body-lead max-w-2xl">
              Temukan panduan, tutorial, dan jawaban untuk membantu Anda menggunakan lembar secara maksimal.
            </p>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-unit-8">
            <div className="paper-card rounded-2xl p-unit-8 border border-border-strong hover:-translate-y-1 transition-transform duration-300">
              <span className="material-symbols-outlined text-burgundy text-[32px] mb-unit-4 block">play_circle</span>
              <h3 className="font-h3 text-h3 text-ink mb-unit-2">Panduan Memulai</h3>
              <p className="text-secondary text-body-sm">Langkah-langkah awal untuk membuat asesmen pertama Anda di lembar dalam hitungan menit.</p>
            </div>
            <div className="paper-card rounded-2xl p-unit-8 border border-border-strong hover:-translate-y-1 transition-transform duration-300">
              <span className="material-symbols-outlined text-burgundy text-[32px] mb-unit-4 block">auto_awesome</span>
              <h3 className="font-h3 text-h3 text-ink mb-unit-2">Tips AI</h3>
              <p className="text-secondary text-body-sm">Pelajari cara memanfaatkan asisten AI untuk menghasilkan soal berkualitas tinggi sesuai kurikulum.</p>
            </div>
            <div className="paper-card rounded-2xl p-unit-8 border border-border-strong hover:-translate-y-1 transition-transform duration-300">
              <span className="material-symbols-outlined text-burgundy text-[32px] mb-unit-4 block">groups</span>
              <h3 className="font-h3 text-h3 text-ink mb-unit-2">Manajemen Tim</h3>
              <p className="text-secondary text-body-sm">Cara mengundang guru, mengatur hak akses, dan berkolaborasi menyusun soal bersama tim.</p>
            </div>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto text-center">
            <h2 className="font-h2 text-h2 text-ink mb-unit-4">Masih butuh bantuan?</h2>
            <p className="text-secondary text-body-default mb-unit-8">Hubungi tim dukungan kami, kami siap membantu kapan saja.</p>
            <a href="/kontak" className="bg-burgundy text-on-primary px-unit-8 py-unit-4 rounded font-label-semibold text-body-default hover:brightness-110 active:scale-95 transition-all inline-block">
              Hubungi Kami
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
