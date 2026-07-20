import Link from 'next/link';
import { fetchMarketingPage } from '@/src/lib/marketing/fetchMarketingPage';
import { BlockRenderer } from '@/app/components/marketing/BlockRenderer';
import { HoverCard } from './HoverCard';

export default async function UntukSekolahPage() {
  const cmsDoc = await fetchMarketingPage('untuk-sekolah');
  if (cmsDoc) {
    return <BlockRenderer blocks={cmsDoc.blocks} />;
  }
  return (
    <>
      <div>
        <section className="pt-unit-16 pb-unit-16 px-margin-mobile md:px-margin-desktop bg-paper overflow-hidden">
          <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-unit-12 items-center">
            <div className="lg:col-span-6">
              <h1 className="font-h1 text-h1 text-ink mb-unit-6 leading-tight">
                Workspace Organisasi untuk Institusi Sekolah
              </h1>
              <p className="font-body-lead text-body-lead text-secondary mb-unit-8 max-w-lg">
                Sentralisasi pembuatan soal, manajemen akun guru, dan berbagi kuota AI dalam satu
                dasbor yang aman. Memastikan kualitas standar asesmen di seluruh departemen.
              </p>
              <div className="flex flex-wrap gap-unit-4">
                <Link
                  className="bg-burgundy text-on-primary px-unit-8 py-unit-4 rounded font-label-semibold text-body-default shadow-sm hover:opacity-90 transition-all"
                  href="/kontak"
                >
                  Diskusikan kebutuhan sekolah
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6 relative">
              <HoverCard className="paper-card rounded-lg p-unit-6 w-full transform rotate-1 transition-transform duration-500">
                <div className="flex items-center justify-between border-b border-border-subtle pb-unit-4 mb-unit-4">
                  <div className="flex items-center gap-unit-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-sm">
                        school
                      </span>
                    </div>
                    <div>
                      <p className="font-label-semibold text-caption text-secondary uppercase tracking-wider">
                        Dashboard Sekolah
                      </p>
                      <p className="font-h3 text-h3 text-ink">SMA Nusantara Raya</p>
                    </div>
                  </div>
                  <div className="bg-surface-container px-unit-3 py-unit-1 rounded text-caption font-label-semibold text-burgundy">
                    Aktif: 42 Guru
                  </div>
                </div>
                <div className="space-y-unit-4">
                  <div className="flex gap-unit-4">
                    <div className="flex-1 p-unit-3 border border-border-subtle rounded-lg bg-background">
                      <p className="text-caption text-secondary">Kuota AI Terpakai</p>
                      <div className="mt-unit-2 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="bg-burgundy h-full w-[65%]"></div>
                      </div>
                      <p className="text-caption font-label-semibold mt-unit-1">
                        6,500 / 10,000 unit
                      </p>
                    </div>
                    <div className="flex-1 p-unit-3 border border-border-subtle rounded-lg bg-background">
                      <p className="text-caption text-secondary">Total Bank Soal</p>
                      <p className="font-h3 text-h3 text-ink mt-unit-1">
                        1,248 <span className="text-caption text-secondary font-normal">soal</span>
                      </p>
                    </div>
                  </div>
                  <div className="p-unit-3 border border-border-subtle rounded-lg">
                    <p className="text-caption font-label-semibold text-secondary mb-unit-2">
                      Aktivitas Terkini
                    </p>
                    <div className="space-y-unit-2">
                      <div className="flex items-center justify-between text-caption border-b border-border-subtle py-unit-1">
                        <span className="text-ink">Bu Rina (Matematika) mengekspor 40 soal</span>
                        <span className="text-secondary">2 menit lalu</span>
                      </div>
                      <div className="flex items-center justify-between text-caption border-b border-border-subtle py-unit-1">
                        <span className="text-ink">Pak Budi menambahkan Template UAS Ganjil</span>
                        <span className="text-secondary">1 jam lalu</span>
                      </div>
                    </div>
                  </div>
                </div>
              </HoverCard>
            </div>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-white">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-unit-12">
              <span className="text-burgundy font-label-semibold uppercase tracking-widest text-caption">
                Fitur Enterprise
              </span>
              <h2 className="font-h2 text-h2 text-ink mt-unit-2">
                Kendali Penuh di Tangan Pendidik
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-unit-6">
              <div className="p-unit-8 border border-border-subtle rounded-xl hover:border-burgundy transition-colors group">
                <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center mb-unit-6 group-hover:bg-burgundy group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <h3 className="font-h3 text-h3 text-ink mb-unit-3">Manajemen Akun &amp; Kuota</h3>
                <p className="text-secondary text-body-sm">
                  Tambahkan atau hapus akses guru dengan mudah. Alokasikan kuota AI sesuai kebutuhan
                  mata pelajaran.
                </p>
              </div>
              <div className="p-unit-8 border border-border-subtle rounded-xl hover:border-burgundy transition-colors group">
                <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center mb-unit-6 group-hover:bg-burgundy group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">database</span>
                </div>
                <h3 className="font-h3 text-h3 text-ink mb-unit-3">Bank Soal Internal</h3>
                <p className="text-secondary text-body-sm">
                  Simpan aset intelektual sekolah dalam repositori pribadi yang terenkripsi dan
                  hanya dapat diakses staf internal.
                </p>
              </div>
              <div className="p-unit-8 border border-border-subtle rounded-xl hover:border-burgundy transition-colors group">
                <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center mb-unit-6 group-hover:bg-burgundy group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">brand_family</span>
                </div>
                <h3 className="font-h3 text-h3 text-ink mb-unit-3">Template Bersama</h3>
                <p className="text-secondary text-body-sm">
                  Samakan format header, font, dan branding ujian untuk seluruh kelas guna menjaga
                  kredibilitas sekolah.
                </p>
              </div>
              <div className="p-unit-8 border border-border-subtle rounded-xl hover:border-burgundy transition-colors group">
                <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center mb-unit-6 group-hover:bg-burgundy group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">history_edu</span>
                </div>
                <h3 className="font-h3 text-h3 text-ink mb-unit-3">Audit Trail</h3>
                <p className="text-secondary text-body-sm">
                  Pantau log aktivitas pembuatan dan ekspor soal secara transparan untuk
                  meminimalisir kebocoran data.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-6">
              <div className="lg:col-span-8 h-[400px] rounded-2xl overflow-hidden bg-surface border border-border-strong relative group page-shadow">
                {/* Subtle Grid Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-burgundy/5 via-transparent to-burgundy/5 z-10 pointer-events-none"></div>

                <div className="p-unit-8 relative z-20">
                  <span className="bg-burgundy/10 text-burgundy px-unit-3 py-unit-1 rounded-full font-label-semibold text-caption border border-burgundy/20">
                    Visual Insight
                  </span>
                  <h3 className="font-h2 text-h2 text-ink mt-unit-4 max-w-[85%] sm:max-w-[40%]">
                    Pantau Progress Asesmen Secara Real-time
                  </h3>
                </div>

                {/* macOS Window Widget */}
                <div className="absolute -bottom-4 -right-4 w-[85%] sm:w-[55%] h-[55%] sm:h-[75%] bg-white rounded-t-xl border border-border-strong shadow-[0_20px_50px_rgba(0,0,0,0.12)] group-hover:-translate-y-4 group-hover:-translate-x-4 transition-transform duration-700 ease-out flex flex-col z-30 overflow-hidden">
                  {/* macOS Title Bar */}
                  <div className="flex items-center justify-between px-4 py-3 bg-paper border-b border-border-subtle select-none">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                      <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    </div>
                    <div className="text-[11px] font-label-semibold text-secondary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">speed</span>
                      dashboard_kelas_10.xlsx
                    </div>
                    <div className="w-12"></div> {/* Spacer to center the title */}
                  </div>

                  {/* Widget Content */}
                  <div className="flex-grow p-unit-6 flex gap-unit-6">
                    {/* Left Mini Stats */}
                    <div className="hidden sm:flex flex-col gap-unit-3 w-1/3 border-r border-border-subtle pr-unit-4">
                      <div className="bg-paper p-unit-3 rounded-lg border border-border-subtle">
                        <span className="text-[10px] text-secondary font-label-semibold uppercase tracking-wider block">
                          Total Soal
                        </span>
                        <span className="font-h3 text-h3 text-ink">
                          60 <span className="text-caption text-secondary font-normal">Butir</span>
                        </span>
                      </div>
                      <div className="bg-paper p-unit-3 rounded-lg border border-border-subtle">
                        <span className="text-[10px] text-secondary font-label-semibold uppercase tracking-wider block">
                          Rata-rata Progress
                        </span>
                        <span className="font-h3 text-h3 text-green-700">73%</span>
                      </div>
                    </div>

                    {/* Right Chart Area */}
                    <div className="flex-grow flex flex-col h-full justify-between">
                      {/* Chart Grid Lines & Bars */}
                      <div className="relative flex-grow flex gap-unit-4 items-end pb-unit-2 min-h-[120px]">
                        {/* Grid Y-Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          <div className="w-full border-t border-dashed border-border-subtle/50 h-0"></div>
                          <div className="w-full border-t border-dashed border-border-subtle/50 h-0"></div>
                          <div className="w-full border-t border-dashed border-border-subtle/50 h-0"></div>
                          <div className="w-full border-t border-dashed border-border-subtle/50 h-0"></div>
                        </div>

                        {/* Bar Matematika */}
                        <div className="flex-1 flex flex-col justify-end group/bar h-full relative cursor-crosshair z-10">
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-white text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 group-hover/bar:-translate-y-1 transition-all duration-300 pointer-events-none z-20 whitespace-nowrap shadow-md">
                            85% • 17/20 Soal
                          </div>
                          <div className="w-full bg-surface-container rounded-t-full h-full relative overflow-hidden">
                            <div className="absolute bottom-0 w-full h-[85%] bg-gradient-to-t from-burgundy via-burgundy/80 to-rose-500 rounded-t-full group-hover/bar:opacity-90 transition-all duration-300"></div>
                          </div>
                          <p className="text-caption font-label-semibold mt-unit-2 text-center text-secondary">
                            MTK
                          </p>
                        </div>

                        {/* Bar B. Inggris */}
                        <div className="flex-1 flex flex-col justify-end group/bar h-full relative cursor-crosshair z-10">
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-white text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 group-hover/bar:-translate-y-1 transition-all duration-300 pointer-events-none z-20 whitespace-nowrap shadow-md">
                            42% • 8/20 Soal
                          </div>
                          <div className="w-full bg-surface-container rounded-t-full h-full relative overflow-hidden">
                            <div className="absolute bottom-0 w-full h-[42%] bg-gradient-to-t from-burgundy via-burgundy/80 to-rose-500 rounded-t-full group-hover/bar:opacity-90 transition-all duration-300"></div>
                          </div>
                          <p className="text-caption font-label-semibold mt-unit-2 text-center text-secondary">
                            ING
                          </p>
                        </div>

                        {/* Bar Fisika */}
                        <div className="flex-1 flex flex-col justify-end group/bar h-full relative cursor-crosshair z-10">
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-white text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 group-hover/bar:-translate-y-1 transition-all duration-300 pointer-events-none z-20 whitespace-nowrap shadow-md">
                            92% • 18/20 Soal
                          </div>
                          <div className="w-full bg-surface-container rounded-t-full h-full relative overflow-hidden">
                            <div className="absolute bottom-0 w-full h-[92%] bg-gradient-to-t from-burgundy via-burgundy/80 to-rose-500 rounded-t-full group-hover/bar:opacity-90 transition-all duration-300"></div>
                          </div>
                          <p className="text-caption font-label-semibold mt-unit-2 text-center text-secondary">
                            FIS
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extra Floating Badge (Aktivitas Guru) */}
                <div className="absolute top-unit-8 right-unit-8 bg-white p-unit-3 rounded-xl border border-border-strong shadow-lg z-40 hidden sm:flex items-center gap-3 group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                  <div className="w-8 h-8 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center font-bold text-sm">
                    B
                  </div>
                  <div>
                    <p className="text-caption font-bold text-ink leading-tight">
                      Pak Budi (Fisika)
                    </p>
                    <p className="text-[10px] text-secondary">Mengekspor 18 Soal ke PDF</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 h-[400px] bg-ink rounded-2xl p-unit-8 flex flex-col justify-between text-white overflow-hidden relative group">
                <div className="relative z-10">
                  <h3 className="font-h3 text-h3 mb-unit-4">Keamanan Data Prioritas Utama</h3>
                  <p className="text-surface-variant text-body-sm">
                    Enkripsi tingkat bank untuk setiap butir soal yang dibuat. Data sekolah Anda
                    tetap menjadi milik sekolah Anda.
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-unit-2 text-secondary-fixed">
                  <span className="material-symbols-outlined text-burgundy">verified_user</span>
                  <span className="text-caption font-label-semibold">
                    ISO 27001 Certified Infrastructure
                  </span>
                </div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 border border-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute -bottom-10 -right-10 w-48 h-48 border border-white/5 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-white border-y border-border-subtle">
          <div className="max-w-reading-max mx-auto text-center">
            <h2 className="font-h2 text-h2 text-ink mb-unit-6">Program Sekolah (Pilot)</h2>
            <div className="space-y-unit-8 text-left">
              <div className="flex gap-unit-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-burgundy flex items-center justify-center text-burgundy font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-label-semibold text-body-default text-ink">
                    Konsultasi Kebutuhan
                  </h4>
                  <p className="text-secondary text-body-sm mt-unit-1">
                    Tim kami akan membantu memetakan kebutuhan jumlah guru dan volume asesmen
                    bulanan sekolah Anda.
                  </p>
                </div>
              </div>
              <div className="flex gap-unit-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-burgundy flex items-center justify-center text-burgundy font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-label-semibold text-body-default text-ink">
                    Onboarding &amp; Pelatihan
                  </h4>
                  <p className="text-secondary text-body-sm mt-unit-1">
                    Sesi workshop eksklusif untuk guru agar mahir menggunakan asisten AI lembar
                    dalam hitungan menit.
                  </p>
                </div>
              </div>
              <div className="flex gap-unit-6">
                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-burgundy flex items-center justify-center text-burgundy font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-label-semibold text-body-default text-ink">
                    Implementasi Bertahap
                  </h4>
                  <p className="text-secondary text-body-sm mt-unit-1">
                    Mulai dengan satu departemen atau jenjang kelas sebelum diperluas ke seluruh
                    institusi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#171717 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          ></div>
          <div className="max-w-container-max mx-auto paper-card rounded-2xl p-unit-12 flex flex-col md:flex-row items-center justify-between gap-unit-8 relative z-10">
            <div className="text-center md:text-left">
              <h2 className="font-h2 text-h2 text-ink mb-unit-2">
                Siap untuk digitalisasi asesmen sekolah?
              </h2>
              <p className="text-secondary text-body-default">
                Bergabunglah dengan puluhan institusi yang telah meningkatkan efisiensi guru hingga
                70%.
              </p>
            </div>
            <Link
              className="bg-burgundy text-on-primary px-unit-12 py-unit-4 rounded font-label-semibold text-body-lead hover:shadow-lg transition-all transform active:scale-95 whitespace-nowrap"
              href="/kontak"
            >
              Diskusikan kebutuhan sekolah
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
