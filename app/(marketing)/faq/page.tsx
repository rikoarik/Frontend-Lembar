import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';
import Link from 'next/link';

const faqs = [
  {
    q: 'Apa itu lembar?',
    a: 'lembar membantu guru menyusun draft asesmen, meninjau setiap butir, lalu menyiapkan hasil untuk dicetak atau dibagikan.',
  },
  {
    q: 'Berapa biayanya?',
    a: 'Harga, kuota, dan fitur mengikuti katalog aktif di halaman Harga. Jika katalog sedang tidak tersedia, lembar tidak menampilkan nilai fallback.',
  },
  {
    q: 'Bagaimana proses generasinya?',
    a: 'Guru memilih konteks dan komposisi soal, lalu sistem menyiapkan draft untuk ditinjau. Guru tetap perlu memeriksa dan menerima setiap butir sebelum finalisasi.',
  },
  {
    q: 'Bagaimana akses soal dikendalikan?',
    a: 'Area kerja memerlukan sesi akun. Tautan siswa menggunakan token terbatas yang dapat kedaluwarsa atau dicabut dan tidak menampilkan kunci jawaban.',
  },
  {
    q: 'Kurikulum apa yang tersedia?',
    a: 'Pilihan jenjang, mata pelajaran, materi, dan versi kurikulum mengikuti katalog yang sedang aktif untuk workspace Anda.',
  },
  {
    q: 'Bagaimana cara mulai menggunakan?',
    a: 'Masuk atau daftar, pilih workspace, tentukan komposisi soal, lalu tinjau draft sebelum mencetak atau membagikannya.',
  },
];

export default function FAQPage() {
  return (
    <MarketingSubPageLayout
      title="Pertanyaan Umum"
      description="Jawaban langsung tanpa basa-basi."
      badge="FAQ"
    >
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-3xl mx-auto flex flex-col gap-unit-4">
          <div className="flex flex-col gap-unit-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="bg-paper border border-border-strong rounded-xl overflow-hidden group"
              >
                <summary className="flex items-center justify-between cursor-pointer px-unit-6 py-unit-5 font-label-semibold text-body-default text-ink hover:bg-surface-container transition-colors select-none">
                  {faq.q}
                  <span className="material-symbols-outlined text-secondary text-[20px] group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4">
                    expand_more
                  </span>
                </summary>
                <div className="px-unit-6 pb-unit-5 text-secondary text-body-sm leading-relaxed border-t border-border-subtle">
                  <p className="pt-unit-4">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-unit-8 flex items-center gap-unit-6 p-unit-8 bg-paper border border-border-strong rounded-2xl">
            <div className="flex-1">
              <h3 className="font-h3 text-h3 text-ink mb-1">Belum terjawab?</h3>
              <p className="text-secondary text-body-sm">
                Kirim pertanyaan melalui halaman kontak.
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
