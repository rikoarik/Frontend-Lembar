import type { Metadata } from 'next';
import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id'),
  title: 'Keamanan Data — lembar',
  description:
    'Bagaimana lembar melindungi soal dan data pribadi: kontrol akses, pencatatan aktivitas, dan kebijakan retensi.',
  alternates: { canonical: '/keamanan-data' },
  openGraph: {
    title: 'Keamanan Data — lembar',
    description: 'Bagaimana lembar melindungi soal dan data pribadi Anda.',
    url: '/keamanan-data',
    siteName: 'lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Keamanan Data — lembar',
    description: 'Bagaimana lembar melindungi soal dan data pribadi Anda.',
  },
};

export default function KeamananDataPage() {
  return (
    <MarketingSubPageLayout
      title="Soal Anda, rahasia Anda."
      description="Soal ujian adalah aset sensitif. Kami memperlakukannya dengan kontrol akses ketat, pencatatan aktivitas, dan kebijakan retensi yang jelas."
      badge="Keamanan"
    >
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-unit-12">
            <div className="rounded-2xl bg-paper border border-border-strong p-unit-10 flex flex-col justify-between min-h-[320px]">
              <div>
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-caption font-label-semibold mb-unit-6">
                  <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true"></span>
                  Berlaku untuk semua data
                </div>
                <h2 className="font-h2 text-h2 text-ink mb-unit-3">Enkripsi dalam transit</h2>
                <p className="text-secondary text-body-default leading-relaxed max-w-md">
                  Komunikasi antara peramban dan platform menggunakan TLS modern. Materi yang Anda
                  unggah tidak dibagikan keluar dari workspace Anda tanpa aksi eksplisit.
                </p>
              </div>
              <div className="flex gap-4 mt-unit-8">
                <span className="bg-surface px-3 py-1.5 rounded text-caption text-secondary border border-border-subtle">
                  TLS modern
                </span>
                <span className="bg-surface px-3 py-1.5 rounded text-caption text-secondary border border-border-subtle">
                  Kontrol akses
                </span>
                <span className="bg-surface px-3 py-1.5 rounded text-caption text-secondary border border-border-subtle">
                  Audit log
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-unit-4">
              <div className="rounded-2xl bg-paper border border-border-strong p-unit-8 flex-1">
                <h3 className="font-h3 text-h3 text-ink mb-unit-2">Kontrol akses berlapis</h3>
                <p className="text-secondary text-body-sm leading-relaxed">
                  Admin sekolah menentukan siapa yang boleh melihat, mengedit, dan mengekspor soal.
                  Guru hanya melihat kelas yang diizinkan. Perubahan peran tercatat di log audit.
                </p>
              </div>
              <div className="rounded-2xl bg-paper border border-border-strong p-unit-8 flex-1">
                <h3 className="font-h3 text-h3 text-ink mb-unit-2">Pencatatan aktivitas</h3>
                <p className="text-secondary text-body-sm leading-relaxed">
                  Setiap aksi penting—buat, edit, ekspor, hapus—tercatat dengan waktu dan pelaku.
                  Tidak ada perubahan yang hilang.
                </p>
              </div>
              <div className="rounded-2xl bg-paper border border-border-strong p-unit-8 flex-1">
                <h3 className="font-h3 text-h3 text-ink mb-unit-2">Retensi yang jelas</h3>
                <p className="text-secondary text-body-sm leading-relaxed">
                  Kebijakan retensi dan penghapusan mengikuti{' '}
                  <a className="text-burgundy hover:underline" href="/privasi">
                    Kebijakan Privasi
                  </a>
                  . Permintaan penghapusan dapat diarahkan ke{' '}
                  <a className="text-burgundy hover:underline" href="mailto:privasi@lembar.id">
                    privasi@lembar.id
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

          <div
            role="status"
            aria-live="polite"
            className="mt-unit-12 rounded-lg border border-border-subtle bg-paper px-unit-6 py-unit-4 text-caption text-secondary"
          >
            Halaman ini menjelaskan praktik keamanan level produk. Laporan keamanan atau pertanyaan
            teknis:{' '}
            <a className="text-burgundy hover:underline" href="mailto:keamanan@lembar.id">
              keamanan@lembar.id
            </a>
            .
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
