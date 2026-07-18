import SubPageNavbar from '@/app/components/marketing/SubPageNavbar';

export default function FAQPage() {
  const faqs = [
    { q: 'Apa itu lembar?', a: 'lembar adalah platform pembuatan asesmen berbasis AI yang dirancang khusus untuk guru dan institusi pendidikan di Indonesia. Dengan lembar, guru dapat membuat, mengelola, dan mengekspor soal ujian secara cepat dan efisien.' },
    { q: 'Apakah lembar gratis?', a: 'Ya! Kami menyediakan paket Gratis yang bisa langsung Anda gunakan tanpa biaya. Untuk fitur lebih lengkap seperti kolaborasi tim, ekspor massal, dan bank soal AI tak terbatas, tersedia paket Pro dan Institusi.' },
    { q: 'Bagaimana AI lembar bekerja?', a: 'AI kami telah dilatih dengan ribuan soal berkualitas dari berbagai mata pelajaran dan jenjang pendidikan Indonesia. Cukup masukkan topik dan tingkat kesulitan, AI akan menyusun draft soal yang bisa Anda revisi dan sesuaikan.' },
    { q: 'Apakah data soal saya aman?', a: 'Keamanan data adalah prioritas utama kami. Seluruh data dienkripsi dengan standar AES-256 dan infrastruktur kami telah tersertifikasi ISO 27001. Data sekolah Anda tetap menjadi milik sekolah Anda.' },
    { q: 'Bisa digunakan untuk kurikulum apa saja?', a: 'lembar mendukung Kurikulum Merdeka dan kurikulum sebelumnya (K-13). Anda juga dapat menyesuaikan soal untuk kebutuhan khusus sekolah Anda.' },
    { q: 'Bagaimana cara memulai?', a: 'Cukup daftar akun gratis, pilih mata pelajaran, dan mulai buat lembar soal pertama Anda. Prosesnya hanya membutuhkan beberapa menit.' },
  ];

  return (
    <>
      <SubPageNavbar />
      <main>
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto">
            <span className="bg-burgundy/10 text-burgundy px-unit-3 py-unit-1 rounded-full font-label-semibold text-caption border border-burgundy/20">FAQ</span>
            <h1 className="font-display-xl-mobile md:font-display-xl text-ink mt-unit-4 mb-unit-6 max-w-2xl">Pertanyaan yang Sering Diajukan</h1>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-3xl mx-auto flex flex-col gap-unit-4">
            {faqs.map((faq, i) => (
              <details key={i} className="paper-card rounded-2xl border border-border-strong overflow-hidden group">
                <summary className="flex items-center justify-between cursor-pointer p-unit-6 font-label-semibold text-body-default text-ink hover:bg-surface-container transition-colors select-none">
                  {faq.q}
                  <span className="material-symbols-outlined text-secondary group-open:rotate-180 transition-transform duration-300">expand_more</span>
                </summary>
                <div className="px-unit-6 pb-unit-6 text-secondary text-body-sm leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
