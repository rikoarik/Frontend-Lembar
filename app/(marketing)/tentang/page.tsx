import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';

export default function TentangPage() {
  return (
    <MarketingSubPageLayout
      title={
        <>
          Guru tidak seharusnya
          <br />
          jadi mesin administrasi.
        </>
      }
      description="Kami membangun lembar karena percaya waktu guru terlalu berharga untuk dihabiskan membuat soal dari nol. AI bisa bantu — guru tetap yang memutuskan."
      asymmetric
    >
      {/* Numbers strip */}
      <section className="py-unit-12 px-margin-mobile md:px-margin-desktop bg-burgundy text-on-primary">
        <div className="max-w-container-max mx-auto grid grid-cols-2 md:grid-cols-4 gap-unit-8 text-center">
          <div>
            <span className="font-display-xl block leading-none">2.500+</span>
            <span className="text-on-primary/70 text-caption mt-1 block">Guru aktif</span>
          </div>
          <div>
            <span className="font-display-xl block leading-none">150+</span>
            <span className="text-on-primary/70 text-caption mt-1 block">Sekolah mitra</span>
          </div>
          <div>
            <span className="font-display-xl block leading-none">50rb+</span>
            <span className="text-on-primary/70 text-caption mt-1 block">Soal dihasilkan</span>
          </div>
          <div>
            <span className="font-display-xl block leading-none">12x</span>
            <span className="text-on-primary/70 text-caption mt-1 block">Lebih cepat</span>
          </div>
        </div>
      </section>

      {/* Story — staggered layout, not symmetric cards */}
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-unit-12 gap-x-unit-8">
            {/* Left: Misi */}
            <div className="lg:col-span-5 lg:pt-unit-12">
              <span className="text-burgundy font-label-semibold text-caption tracking-wider uppercase">
                Misi
              </span>
              <h2 className="font-h2 text-h2 text-ink mt-unit-2 mb-unit-4">
                Bebaskan guru dari rutinitas
              </h2>
              <p className="text-secondary text-body-default leading-relaxed">
                Dengan AI yang memahami kurikulum Indonesia, guru bisa fokus ke hal terpenting:
                membentuk karakter dan potensi siswa. Bukan menghabiskan malam menyusun soal
                ulangan.
              </p>
            </div>

            {/* Right: Visi */}
            <div className="lg:col-span-5 lg:col-start-8">
              <span className="text-burgundy font-label-semibold text-caption tracking-wider uppercase">
                Visi
              </span>
              <h2 className="font-h2 text-h2 text-ink mt-unit-2 mb-unit-4">
                Asesmen yang bermakna
              </h2>
              <p className="text-secondary text-body-default leading-relaxed">
                Kami mimpi setiap siswa mendapatkan asesmen yang adil dan relevan — bukan sekadar
                soal yang diulang dari tahun ke tahun, tapi yang benar-benar mengukur pemahaman.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values — horizontal scroll feel on mobile, not generic card grid */}
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
        <div className="max-w-container-max mx-auto">
          <span className="text-burgundy font-label-semibold text-caption tracking-wider uppercase">
            Prinsip Kerja
          </span>
          <h2 className="font-h2 text-h2 text-ink mt-unit-2 mb-unit-12">Yang kami pegang teguh.</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-strong rounded-2xl overflow-hidden">
            <div className="bg-paper p-unit-8 md:p-unit-10">
              <span className="text-[48px] leading-none text-burgundy/20 font-bold block mb-unit-4">
                01
              </span>
              <h3 className="font-h3 text-h3 text-ink mb-unit-2">Guru dulu, teknologi kemudian</h3>
              <p className="text-secondary text-body-sm leading-relaxed">
                Setiap fitur dimulai dari masalah nyata guru di lapangan, bukan dari tren teknologi
                terbaru.
              </p>
            </div>
            <div className="bg-paper p-unit-8 md:p-unit-10">
              <span className="text-[48px] leading-none text-burgundy/20 font-bold block mb-unit-4">
                02
              </span>
              <h3 className="font-h3 text-h3 text-ink mb-unit-2">Data milik sekolah</h3>
              <p className="text-secondary text-body-sm leading-relaxed">
                Soal dan data siswa 100% milik sekolah. Kami tidak pernah menjual atau
                memanfaatkannya untuk kepentingan lain.
              </p>
            </div>
            <div className="bg-paper p-unit-8 md:p-unit-10">
              <span className="text-[48px] leading-none text-burgundy/20 font-bold block mb-unit-4">
                03
              </span>
              <h3 className="font-h3 text-h3 text-ink mb-unit-2">Transparan, selalu</h3>
              <p className="text-secondary text-body-sm leading-relaxed">
                Harga jelas, tanpa biaya tersembunyi. Cara kerja AI kami terbuka. Kami tumbuh
                bersama kepercayaan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
