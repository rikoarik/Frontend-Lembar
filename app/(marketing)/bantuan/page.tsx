import SubPageNavbar from '@/app/components/marketing/SubPageNavbar';
import Link from 'next/link';

export default function BantuanPage() {
  return (
    <>
      <SubPageNavbar />
      <main>
        <section className="pt-unit-6 pb-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto">
            <Link href="/" className="inline-flex items-center gap-1.5 text-secondary hover:text-burgundy text-caption transition-colors mb-unit-8 group">
              <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
              Beranda
            </Link>

            <h1 className="font-display-xl-mobile md:font-display-xl text-ink leading-[1.1] mb-unit-4 max-w-xl">
              Mulai dari sini.
            </h1>
            <p className="text-secondary text-body-lead leading-relaxed max-w-xl mb-unit-12">
              Panduan singkat untuk langsung produktif dengan lembar.
            </p>

            {/* Guide cards — varied sizes, not 3 equal boxes */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-unit-4">
              {/* Big card */}
              <div className="md:col-span-7 rounded-2xl bg-burgundy text-on-primary p-unit-10 flex flex-col justify-between min-h-[280px]">
                <div>
                  <span className="text-on-primary/60 text-caption font-label-semibold tracking-wider uppercase">Langkah Pertama</span>
                  <h2 className="font-h2 text-h2 mt-unit-2 mb-unit-3">Buat asesmen pertama Anda</h2>
                  <p className="text-on-primary/80 text-body-default leading-relaxed max-w-md">
                    Daftar, pilih mata pelajaran, masukkan topik — AI kami menyusun draft soal dalam hitungan detik. Tinggal review dan sesuaikan.
                  </p>
                </div>
                <span className="text-on-primary/40 text-[64px] font-bold leading-none mt-unit-4 self-end">→</span>
              </div>

              {/* Stacked cards */}
              <div className="md:col-span-5 flex flex-col gap-unit-4">
                <div className="rounded-2xl bg-surface border border-border-strong p-unit-8 flex-1">
                  <span className="text-burgundy text-caption font-label-semibold tracking-wider uppercase">AI Tips</span>
                  <h3 className="font-h3 text-h3 text-ink mt-unit-2 mb-unit-2">Prompt yang menghasilkan soal bagus</h3>
                  <p className="text-secondary text-body-sm leading-relaxed">
                    Semakin spesifik topik dan level taksonomi yang Anda berikan, semakin tajam soal yang dihasilkan AI.
                  </p>
                </div>
                <div className="rounded-2xl bg-surface border border-border-strong p-unit-8 flex-1">
                  <span className="text-burgundy text-caption font-label-semibold tracking-wider uppercase">Kolaborasi</span>
                  <h3 className="font-h3 text-h3 text-ink mt-unit-2 mb-unit-2">Undang tim Anda</h3>
                  <p className="text-secondary text-body-sm leading-relaxed">
                    Ajak guru lain ke workspace sekolah. Atur peran, bagikan bank soal, dan review bersama.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-unit-16 text-center">
              <p className="text-secondary text-body-default mb-unit-4">Masih butuh bantuan?</p>
              <Link href="/kontak" className="inline-flex items-center gap-2 bg-burgundy text-on-primary px-unit-8 py-unit-4 rounded-lg font-label-semibold text-body-default hover:brightness-110 active:scale-[0.98] transition-all">
                Hubungi Tim Kami
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
