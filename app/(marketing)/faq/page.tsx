import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';
import Link from 'next/link';

type FaqEntry = {
  q: string;
  a: React.ReactNode;
};

const productFaqs: FaqEntry[] = [
  {
    q: 'Apakah hasil generate langsung final?',
    a: 'Bukan. lembar menghasilkan draft soal sebagai titik awal. Guru meninjau, mengedit, menerima, menolak, atau meregenerasi per soal, lalu mengonfirmasi finalisasi secara eksplisit sebelum paket dicetak atau dibagikan.',
  },
  {
    q: 'Materi apa yang dapat dipakai?',
    a: 'Materi bersumber dari katalog kurikulum yang telah disetujui dan dari PDF yang Anda unggah sendiri. PDF diproses di ruang privat, hanya milik Anda, dan dapat dihapus kapan saja.',
  },
  {
    q: 'Apakah PDF saya disimpan atau dibagikan?',
    a: 'PDF yang Anda unggah disimpan secara privat pada workspace Anda. lembar tidak mempublikasikan materi atau soal Anda kepada pengguna lain. Tautan berbagi hanya dibuat saat Anda secara eksplisit membuatnya, dapat dicabut, dan dapat kedaluwarsa.',
  },
  {
    q: 'Apakah semua kelas dan mata pelajaran tersedia?',
    a: 'Untuk MVP yang sedang berjalan, cakupan terbatas pada kurikulum yang telah selesai disiapkan (lihat halaman Produk untuk daftar terkini). Cakupan diperluas bertahap; lembar tidak menjanjikan ketersediaan kelas atau mapel di luar yang tampil di katalog.',
  },
  {
    q: 'Apa beda print, unduh PDF, dan tautan web?',
    a: 'Cetak langsung membuka lembar A4 di jendela browser. Unduhan PDF menghasilkan versi final immutable yang dapat diarsipkan. Tautan web read-only, tidak terindeks mesin pencari, dan kunci/pembahasan hanya tampil jika Anda memilihnya.',
  },
  {
    q: 'Apakah siswa memerlukan akun?',
    a: 'Tidak pada MVP. lembar berfokus pada ruang kerja guru; siswa menerima lembar melalui cetakan, PDF, atau tautan yang Anda bagikan. lembar tidak menyimpan data siswa.',
  },
  {
    q: 'Bagaimana sekolah mengelola banyak guru?',
    a: 'Workspace sekolah (ketersediaan menyusul) memungkinkan admin mengelola keanggotaan, kursi, dan kuota bersama. Aktivitas pribadi guru tidak otomatis dapat dilihat admin — visibilitas hanya pada metrik agregat yang relevan dengan administrasi.',
  },
  {
    q: 'Bagaimana kualitas soal dijaga?',
    a: 'Setiap soal melewati pemeriksaan otomatis: satu jawaban benar, kunci termasuk opsi, bahasa sesuai kelas, tidak ambigu, dan tidak duplikat. Hasil tetap berstatus draft sampai guru mengonfirmasi; finalisasi tidak dilakukan otomatis.',
  },
  {
    q: 'Bagaimana cara menghubungi tim lembar?',
    a: 'Gunakan halaman Kontak untuk pertanyaan umum, atau halaman Untuk Sekolah bila Anda mewakili institusi. Tim kami menanggapi sesuai urutan masuk pada hari kerja.',
  },
];

const policyGroupLabel =
  'text-ink font-label-semibold text-body-default mb-unit-4 mt-unit-8 first:mt-0';

function FaqList({ items }: { items: FaqEntry[] }) {
  return (
    <div className="flex flex-col gap-unit-3">
      {items.map((faq, i) => (
        <details
          key={i}
          className="bg-paper border border-border-strong rounded-xl overflow-hidden group"
        >
          <summary className="flex items-center justify-between cursor-pointer px-unit-6 py-unit-5 font-label-semibold text-body-default text-ink hover:bg-surface transition-colors select-none">
            <span>{faq.q}</span>
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-secondary text-[20px] group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-unit-4"
            >
              expand_more
            </span>
          </summary>
          <div className="px-unit-6 pb-unit-5 text-secondary text-body-sm leading-relaxed border-t border-border-subtle">
            <p className="pt-unit-4">{faq.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

export default function FAQPage() {
  return (
    <MarketingSubPageLayout
      title="Pertanyaan yang sering ditanyakan"
      description="Jawaban singkat tentang produk, penggunaan materi, dan sekolah. Jawaban mencerminkan rilis berjalan; tidak ada klaim di luar yang ditampilkan di katalog."
      badge="FAQ"
    >
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-3xl mx-auto flex flex-col gap-unit-8">
          <h2 className="font-h2 text-h2 text-ink">Produk dan penggunaan</h2>
          <FaqList items={productFaqs} />

          <div
            className="mt-unit-8 flex items-center gap-unit-6 p-unit-8 bg-paper border border-border-strong rounded-2xl"
            role="region"
            aria-label="Belum menemukan jawaban"
          >
            <div className="flex-1">
              <h3 className="font-h3 text-h3 text-ink mb-1">Belum terjawab?</h3>
              <p className="text-secondary text-body-sm">
                Kunjungi halaman Bantuan atau hubungi kami lewat halaman Kontak.
              </p>
            </div>
            <Link
              href="/kontak"
              className="bg-burgundy text-on-primary px-unit-6 py-unit-3 rounded-lg font-label-semibold text-caption hover:brightness-110 active:scale-[0.98] transition-all whitespace-nowrap"
            >
              Kontak
            </Link>
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
