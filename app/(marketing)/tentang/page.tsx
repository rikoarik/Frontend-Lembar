export default function TentangPage() {
  return (
    <>
      <main>
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto">
            <span className="bg-burgundy/10 text-burgundy px-unit-3 py-unit-1 rounded-full font-label-semibold text-caption border border-burgundy/20">Tentang Kami</span>
            <h1 className="font-display-xl-mobile md:font-display-xl text-ink mt-unit-4 mb-unit-6 max-w-2xl">Membangun masa depan asesmen pendidikan Indonesia.</h1>
            <p className="text-secondary text-body-lead max-w-2xl">
              lembar lahir dari keresahan sederhana: guru menghabiskan terlalu banyak waktu untuk administrasi, dan terlalu sedikit waktu untuk mengajar.
            </p>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-unit-12">
            <div>
              <h2 className="font-h2 text-h2 text-ink mb-unit-6">Misi Kami</h2>
              <p className="text-secondary text-body-default leading-relaxed mb-unit-4">
                Kami percaya bahwa setiap guru berhak memiliki alat yang membebaskan mereka dari rutinitas administratif yang melelahkan. Dengan teknologi AI yang tepat, guru bisa fokus pada hal yang paling penting: membentuk generasi penerus bangsa.
              </p>
              <p className="text-secondary text-body-default leading-relaxed">
                lembar dirancang untuk menjadi asisten cerdas yang memahami kurikulum Indonesia, membantu menyusun soal berkualitas tinggi, dan menyederhanakan proses asesmen dari awal hingga akhir.
              </p>
            </div>
            <div>
              <h2 className="font-h2 text-h2 text-ink mb-unit-6">Visi Kami</h2>
              <p className="text-secondary text-body-default leading-relaxed mb-unit-4">
                Menjadi platform asesmen terdepan di Asia Tenggara yang memberdayakan pendidik untuk menciptakan pengalaman belajar yang lebih bermakna dan terukur.
              </p>
              <p className="text-secondary text-body-default leading-relaxed">
                Kami bermimpi tentang dunia di mana setiap siswa mendapatkan asesmen yang adil, relevan, dan mampu mengukur potensi mereka yang sesungguhnya.
              </p>
            </div>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-h2 text-h2 text-ink mb-unit-12 text-center">Nilai-nilai Kami</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-unit-8">
              <div className="paper-card rounded-2xl p-unit-8 border border-border-strong hover:-translate-y-1 transition-transform duration-300">
                <span className="material-symbols-outlined text-burgundy text-[32px] mb-unit-4 block">school</span>
                <h3 className="font-h3 text-h3 text-ink mb-unit-2">Pendidik di Pusat</h3>
                <p className="text-secondary text-body-sm">Setiap keputusan produk kami didasarkan pada kebutuhan nyata guru di lapangan.</p>
              </div>
              <div className="paper-card rounded-2xl p-unit-8 border border-border-strong hover:-translate-y-1 transition-transform duration-300">
                <span className="material-symbols-outlined text-burgundy text-[32px] mb-unit-4 block">verified_user</span>
                <h3 className="font-h3 text-h3 text-ink mb-unit-2">Kepercayaan & Keamanan</h3>
                <p className="text-secondary text-body-sm">Data soal dan informasi sekolah dijaga dengan standar keamanan tertinggi.</p>
              </div>
              <div className="paper-card rounded-2xl p-unit-8 border border-border-strong hover:-translate-y-1 transition-transform duration-300">
                <span className="material-symbols-outlined text-burgundy text-[32px] mb-unit-4 block">lightbulb</span>
                <h3 className="font-h3 text-h3 text-ink mb-unit-2">Inovasi Berkelanjutan</h3>
                <p className="text-secondary text-body-sm">Kami terus berinovasi agar asesmen menjadi lebih cerdas, cepat, dan bermakna.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
