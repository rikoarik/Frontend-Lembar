import SubPageNavbar from '@/app/components/marketing/SubPageNavbar';
import Link from 'next/link';

const faqs = [
  {
    q: 'Apa itu lembar?',
    a: 'Platform pembuatan asesmen berbasis AI untuk guru Indonesia. Masukkan topik, pilih tingkat kesulitan — AI menyusun draft soal yang bisa Anda revisi dan ekspor ke Word/PDF.',
  },
  {
    q: 'Berapa biayanya?',
    a: 'Ada paket Gratis untuk mulai mencoba tanpa batas waktu. Paket Pro mulai Rp79rb/bulan untuk fitur lengkap seperti AI tak terbatas dan ekspor massal.',
  },
  {
    q: 'Bagaimana AI-nya bekerja?',
    a: 'AI kami dilatih dengan ribuan soal berkualitas dari berbagai mata pelajaran dan jenjang Indonesia. Cukup berikan topik dan level taksonomi Bloom, sisanya AI yang handle.',
  },
  {
    q: 'Apakah data soal saya aman?',
    a: 'Sangat. Enkripsi AES-256, audit trail lengkap, dan infrastruktur ISO 27001. Soal Anda 100% milik sekolah Anda — kami tidak pernah menjual atau melihat isinya.',
  },
  {
    q: 'Kurikulum apa yang didukung?',
    a: 'Kurikulum Merdeka dan K-13. Anda juga bisa menyesuaikan soal untuk kebutuhan khusus sekolah, ujian mandiri, atau olimpiade.',
  },
  {
    q: 'Berapa lama untuk mulai menggunakan?',
    a: 'Kurang dari 2 menit. Daftar akun gratis, pilih mata pelajaran, dan langsung buat lembar soal pertama Anda.',
  },
];

export default function FAQPage() {
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

            <h1 className="font-display-xl-mobile md:font-display-xl text-ink leading-[1.1] mb-unit-4">
              Pertanyaan Umum
            </h1>
            <p className="text-secondary text-body-lead leading-relaxed max-w-xl mb-unit-12">
              Jawaban langsung tanpa basa-basi.
            </p>

            <div className="max-w-3xl flex flex-col gap-unit-3">
              {faqs.map((faq, i) => (
                <details key={i} className="bg-surface border border-border-strong rounded-xl overflow-hidden group">
                  <summary className="flex items-center justify-between cursor-pointer px-unit-6 py-unit-5 font-label-semibold text-body-default text-ink hover:bg-surface-container transition-colors select-none">
                    {faq.q}
                    <span className="material-symbols-outlined text-secondary text-[20px] group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4">expand_more</span>
                  </summary>
                  <div className="px-unit-6 pb-unit-5 text-secondary text-body-sm leading-relaxed border-t border-border-subtle">
                    <p className="pt-unit-4">{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-unit-12 flex items-center gap-unit-6 p-unit-8 bg-surface border border-border-strong rounded-2xl max-w-3xl">
              <div className="flex-1">
                <h3 className="font-h3 text-h3 text-ink mb-1">Belum terjawab?</h3>
                <p className="text-secondary text-body-sm">Hubungi kami langsung — kami fast response.</p>
              </div>
              <Link href="/kontak" className="bg-burgundy text-on-primary px-unit-6 py-unit-3 rounded-lg font-label-semibold text-caption hover:brightness-110 active:scale-[0.98] transition-all whitespace-nowrap">
                Kontak
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
