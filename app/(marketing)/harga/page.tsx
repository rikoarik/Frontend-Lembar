import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchMarketingPage } from '@/src/lib/marketing/fetchMarketingPage';
import { BlockRenderer } from '@/app/components/marketing/BlockRenderer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id'),
  title: 'Harga lembar — paket untuk guru dan sekolah',
  description:
    'Paket Coba Gratis, Guru Pro, dan Sekolah & Institusi. Bandingkan hak pakai, kuota generasi soal, dan fitur kolaborasi untuk guru serta tim sekolah.',
  alternates: {
    canonical: '/harga',
  },
  openGraph: {
    title: 'Harga lembar — paket untuk guru dan sekolah',
    description:
      'Bandingkan paket Coba Gratis, Guru Pro, dan Sekolah & Institusi. Tidak ada biaya tersembunyi.',
    url: '/harga',
    siteName: 'lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harga lembar — paket untuk guru dan sekolah',
    description: 'Coba Gratis, Guru Pro, dan Sekolah & Institusi.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function HargaPage() {
  const cmsDoc = await fetchMarketingPage('harga');
  if (cmsDoc) {
    return <BlockRenderer blocks={cmsDoc.blocks} />;
  }
  return (
    <>
      <div className="min-h-screen">
        <header className="py-unit-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
          <div className="inline-block px-unit-3 py-unit-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-label-semibold text-caption mb-unit-6">
            Pricing Plans
          </div>
          <h1 className="font-h1 text-h1 text-ink mb-unit-4 max-w-[800px] mx-auto">
            Pilih paket yang sesuai untuk kebutuhan mengajar Anda.
          </h1>
          <p className="font-body-lead text-body-lead text-secondary max-w-reading-max mx-auto">
            Solusi cerdas untuk pembuatan asesmen berkualitas tinggi, dirancang untuk efisiensi dan
            ketelitian pendidik.
          </p>
        </header>

        <section className="pb-unit-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-unit-6 max-w-container-max mx-auto">
            <div className="bento-card bg-surface border border-border-strong rounded-xl p-unit-6 flex flex-col page-shadow hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className="mb-unit-6">
                <h3 className="font-h3 text-h3 text-ink mb-unit-1">Coba Gratis</h3>
                <p className="text-secondary text-body-sm">Untuk mencoba fitur dasar kami.</p>
              </div>
              <div className="mb-unit-8">
                <span className="text-h2 font-h2 text-ink">Rp0</span>
                <span className="text-secondary text-body-sm block mt-unit-1">
                  Gratis selamanya
                </span>
              </div>
              <div className="space-y-unit-4 mb-unit-12 flex-grow">
                <div className="flex items-start gap-unit-3">
                  <span
                    className="material-symbols-outlined text-burgundy"
                    style={{ fontVariationSettings: "'wght' 600" }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-default text-ink">2 paket asesmen lengkap</span>
                </div>
                <div className="flex items-start gap-unit-3">
                  <span
                    className="material-symbols-outlined text-burgundy"
                    style={{ fontVariationSettings: "'wght' 600" }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-default text-ink">Batas ekspor terbatas</span>
                </div>
                <div className="flex items-start gap-unit-3">
                  <span
                    className="material-symbols-outlined text-burgundy"
                    style={{ fontVariationSettings: "'wght' 600" }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-default text-ink">Tanpa kartu kredit</span>
                </div>
              </div>
              <Link
                className="w-full border-2 border-burgundy text-burgundy font-label-semibold h-[44px] rounded-lg group-hover:bg-burgundy group-hover:text-white active:scale-95 transition-all duration-300 flex items-center justify-center"
                href="/daftar"
              >
                Mulai Gratis
              </Link>
            </div>

            <div className="bento-card bg-paper border-2 border-burgundy/50 rounded-xl p-unit-6 flex flex-col relative overflow-hidden page-shadow hover:-translate-y-3 hover:shadow-2xl hover:shadow-burgundy/20 hover:border-burgundy transition-all duration-300 group cursor-pointer z-10">
              <div className="absolute top-0 right-0 bg-burgundy text-on-primary px-unit-4 py-unit-1 text-caption font-label-semibold rounded-bl-xl shadow-md">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 motion-safe:animate-ping motion-reduce:animate-none"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  PALING POPULER
                </span>
              </div>
              <div className="mb-unit-6">
                <h3 className="font-h3 text-h3 text-ink mb-unit-1">Guru Pro</h3>
                <p className="text-secondary text-body-sm">
                  Produktivitas maksimal untuk pengajar.
                </p>
              </div>
              <div className="mb-unit-8">
                <span className="text-h2 font-h2 text-burgundy">Rp49.000</span>
                <span className="text-secondary text-body-sm block mt-unit-1">per bulan</span>
              </div>
              <div className="space-y-unit-4 mb-unit-12 flex-grow">
                <div className="flex items-start gap-unit-3">
                  <span
                    className="material-symbols-outlined text-burgundy"
                    style={{ fontVariationSettings: "'wght' 600" }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-default text-ink">Kuota 20 paket/bulan</span>
                </div>
                <div className="flex items-start gap-unit-3">
                  <span
                    className="material-symbols-outlined text-burgundy"
                    style={{ fontVariationSettings: "'wght' 600" }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-default text-ink">History tak terbatas</span>
                </div>
                <div className="flex items-start gap-unit-3">
                  <span
                    className="material-symbols-outlined text-burgundy"
                    style={{ fontVariationSettings: "'wght' 600" }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-default text-ink">
                    Template pribadi &amp; Bank soal privat
                  </span>
                </div>
                <div className="flex items-start gap-unit-3">
                  <span
                    className="material-symbols-outlined text-burgundy"
                    style={{ fontVariationSettings: "'wght' 600" }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-default text-ink">Ekspor DOCX &amp; PDF</span>
                </div>
              </div>
              <Link
                className="w-full bg-burgundy text-on-primary font-label-semibold h-[44px] rounded-lg group-hover:brightness-110 group-hover:shadow-lg group-hover:shadow-burgundy/40 active:scale-95 transition-all duration-300 flex items-center justify-center"
                href="/daftar"
              >
                Langganan Sekarang
              </Link>
            </div>

            <div className="bento-card bg-surface border border-border-strong rounded-xl p-unit-6 flex flex-col page-shadow hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className="mb-unit-6">
                <h3 className="font-h3 text-h3 text-ink mb-unit-1">Sekolah &amp; Institusi</h3>
                <p className="text-secondary text-body-sm">Kolaborasi tim dan kontrol institusi.</p>
              </div>
              <div className="mb-unit-8">
                <span className="text-h2 font-h2 text-ink">Hubungi Kami</span>
                <span className="text-secondary text-body-sm block mt-unit-1">
                  Harga kustom sesuai kebutuhan
                </span>
              </div>
              <div className="space-y-unit-4 mb-unit-12 flex-grow">
                <div className="flex items-start gap-unit-3">
                  <span
                    className="material-symbols-outlined text-burgundy"
                    style={{ fontVariationSettings: "'wght' 600" }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-default text-ink">Shared quota seluruh guru</span>
                </div>
                <div className="flex items-start gap-unit-3">
                  <span
                    className="material-symbols-outlined text-burgundy"
                    style={{ fontVariationSettings: "'wght' 600" }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-default text-ink">Admin dashboard &amp; analitik</span>
                </div>
                <div className="flex items-start gap-unit-3">
                  <span
                    className="material-symbols-outlined text-burgundy"
                    style={{ fontVariationSettings: "'wght' 600" }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-default text-ink">Bank soal sekolah</span>
                </div>
                <div className="flex items-start gap-unit-3">
                  <span
                    className="material-symbols-outlined text-burgundy"
                    style={{ fontVariationSettings: "'wght' 600" }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-default text-ink">
                    Onboarding &amp; support khusus
                  </span>
                </div>
                <div className="flex items-start gap-unit-3">
                  <span
                    className="material-symbols-outlined text-burgundy"
                    style={{ fontVariationSettings: "'wght' 600" }}
                  >
                    check_circle
                  </span>
                  <span className="text-body-default text-ink">Branding sekolah pada output</span>
                </div>
              </div>
              <Link
                className="w-full border-2 border-burgundy text-burgundy font-label-semibold h-[44px] rounded-lg group-hover:bg-burgundy group-hover:text-white active:scale-95 transition-all duration-300 flex items-center justify-center"
                href="/kontak"
              >
                Daftar Pilot
              </Link>
            </div>
          </div>

          <div className="mt-unit-12 max-w-reading-max mx-auto text-center p-unit-6 rounded-xl border border-border-subtle bg-paper">
            <div className="flex items-center justify-center gap-unit-2 text-burgundy mb-unit-2">
              <span className="material-symbols-outlined">info</span>
              <span className="font-label-semibold">Catatan Transparansi</span>
            </div>
            <p className="text-body-default text-secondary">
              Tidak ada biaya tersembunyi. Kuota hanya terpotong untuk generasi soal yang berhasil.
              Kami menghargai integritas akademik dan transparansi biaya bagi setiap sekolah.
            </p>
          </div>
        </section>

        <section className="py-unit-16 bg-paper">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-unit-12">
              <div className="md:col-span-1">
                <h2 className="font-h2 text-h2 text-ink mb-unit-4">Pertanyaan Seputar Tagihan</h2>
                <p className="text-body-default text-secondary mb-unit-6">
                  Informasi lebih detail mengenai bagaimana kami mengelola kuota dan pembayaran
                  Anda.
                </p>
                <Link
                  className="text-burgundy font-label-semibold flex items-center gap-unit-1 group"
                  href="/bantuan"
                >
                  Pusat Bantuan Lengkap
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-burgundy">
                    check_circle
                  </span>
                </Link>
              </div>
              <div className="md:col-span-2 space-y-unit-6">
                <div className="p-unit-6 border border-border-subtle rounded-lg bg-surface">
                  <h4 className="font-label-semibold text-ink mb-unit-2">
                    Bagaimana sistem pemotongan kuota bekerja?
                  </h4>
                  <p className="text-body-sm text-secondary">
                    Kuota hanya akan berkurang saat sistem AI berhasil memberikan draft soal yang
                    dapat diedit. Jika terjadi kegagalan teknis saat proses generasi, kuota Anda
                    tidak akan berkurang.
                  </p>
                </div>
                <div className="p-unit-6 border border-border-subtle rounded-lg bg-surface">
                  <h4 className="font-label-semibold text-ink mb-unit-2">
                    Apakah ada batasan jumlah guru untuk paket Institusi?
                  </h4>
                  <p className="text-body-sm text-secondary">
                    Tidak ada batas minimum atau maksimum yang kaku. Kami menyesuaikan paket
                    berdasarkan jumlah lisensi aktif yang dibutuhkan oleh sekolah Anda agar lebih
                    efisien secara biaya.
                  </p>
                </div>
                <div className="p-unit-6 border border-border-subtle rounded-lg bg-surface">
                  <h4 className="font-label-semibold text-ink mb-unit-2">
                    Bisakah saya melakukan upgrade di tengah periode?
                  </h4>
                  <p className="text-body-sm text-secondary">
                    Tentu. Anda dapat meningkatkan kuota atau berpindah ke paket tim kapan saja.
                    Selisih biaya akan dihitung secara pro-rata agar tetap adil bagi Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="relative bg-ink rounded-2xl p-unit-12 overflow-hidden text-center">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-64 h-64 bg-burgundy rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-burgundy rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>
            </div>
            <h2 className="font-h1 text-h1 text-white mb-unit-6 relative z-10">
              Siap untuk mulai merancang asesmen lebih baik?
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-unit-4 relative z-10">
              <Link
                className="bg-burgundy text-white px-unit-12 h-[52px] rounded-lg font-label-semibold text-body-lead hover:brightness-110 transition-all flex items-center"
                href="/daftar"
              >
                Daftar Sekarang
              </Link>
              <Link
                className="border border-surface-variant text-white px-unit-12 h-[52px] rounded-lg font-label-semibold text-body-lead hover:bg-white/10 transition-all flex items-center"
                href="/kontak"
              >
                Jadwalkan Demo
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
