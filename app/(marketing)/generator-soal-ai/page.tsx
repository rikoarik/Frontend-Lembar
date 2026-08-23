import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/app/components/marketing/JsonLd';

const SITE_URL = 'https://app.lembar.web.id';
const PAGE_URL = `${SITE_URL}/generator-soal-ai`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Generator Soal AI untuk Guru Indonesia | Lembar',
  description:
    'Generator soal AI dari PDF dan materi untuk Kurikulum Merdeka. Buat pilihan ganda, esai, dan draft soal lain untuk ditinjau guru.',
  keywords: [
    'generator soal',
    'generator soal AI',
    'generator soal dari PDF',
    'pembuat soal otomatis',
    'AI untuk guru',
    'generator soal Kurikulum Merdeka',
    'buat soal pilihan ganda otomatis',
    'generator soal esai',
  ],
  alternates: { canonical: '/generator-soal-ai' },
  openGraph: {
    title: 'Generator Soal AI untuk Guru Indonesia | Lembar',
    description:
      'Buat draft soal dari PDF atau materi, atur jenis soal, lalu tinjau setiap butir sebelum digunakan.',
    url: '/generator-soal-ai',
    siteName: 'Lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generator Soal AI untuk Guru Indonesia | Lembar',
    description: 'Buat dan tinjau draft soal dari PDF, materi, atau konteks kurikulum.',
    images: ['/og-image.svg'],
  },
  robots: { index: true, follow: true },
};

const questionTypes = [
  {
    icon: 'checklist',
    title: 'Pilihan ganda',
    body: 'Susun opsi jawaban dan kunci dalam draft yang tetap dapat diperiksa dan diedit oleh guru.',
  },
  {
    icon: 'rule',
    title: 'Benar atau salah',
    body: 'Buat pernyataan untuk menguji pemahaman konsep secara ringkas.',
  },
  {
    icon: 'short_text',
    title: 'Jawaban singkat',
    body: 'Siapkan pertanyaan dengan respons pendek untuk istilah, fakta, atau perhitungan sederhana.',
  },
  {
    icon: 'notes',
    title: 'Esai',
    body: 'Rancang soal terbuka untuk penalaran, penjelasan proses, dan analisis siswa.',
  },
];

const steps = [
  {
    title: 'Pilih sumber materi',
    body: 'Gunakan PDF, materi yang Anda siapkan, atau konteks dari katalog kurikulum yang tersedia.',
  },
  {
    title: 'Atur komposisi soal',
    body: 'Tentukan jumlah dan jenis soal sesuai tujuan latihan, ulangan, atau ujian.',
  },
  {
    title: 'Buat draft dengan AI',
    body: 'Lembar memproses konteks dan menyiapkan butir soal sebagai draft, bukan hasil final otomatis.',
  },
  {
    title: 'Tinjau sebelum digunakan',
    body: 'Periksa pertanyaan, opsi, kunci, dan kesesuaian materi. Edit atau hapus butir yang belum tepat.',
  },
];

const faqs = [
  {
    question: 'Apa itu generator soal AI Lembar?',
    answer:
      'Lembar adalah aplikasi web yang membantu guru membuat draft soal dari materi, PDF, atau konteks kurikulum. Guru tetap meninjau setiap butir sebelum finalisasi.',
  },
  {
    question: 'Apakah Lembar bisa membuat soal dari PDF?',
    answer:
      'Ya. Guru dapat menggunakan PDF sebagai sumber materi, lalu menentukan komposisi soal yang ingin dibuat. Hasilnya perlu diperiksa terhadap dokumen sumber.',
  },
  {
    question: 'Jenis soal apa yang dapat dibuat?',
    answer:
      'Lembar mendukung alur pembuatan pilihan ganda, benar atau salah, jawaban singkat, dan esai. Ketersediaan akhir mengikuti fitur pada workspace dan katalog aktif.',
  },
  {
    question: 'Apakah soal dari AI langsung siap digunakan?',
    answer:
      'Tidak selalu. Konten AI dapat keliru atau kurang sesuai konteks. Karena itu, Lembar menempatkan proses tinjau guru sebelum soal dicetak atau dibagikan.',
  },
  {
    question: 'Apa hasil yang dapat disiapkan setelah review?',
    answer:
      'Setelah finalisasi, guru dapat menggunakan alur ekspor dokumen guru dan siswa atau membagikan asesmen melalui fitur online yang tersedia pada workspace.',
  },
  {
    question: 'Apakah Lembar dapat dipakai untuk Kurikulum Merdeka?',
    answer:
      'Guru dapat memilih konteks dari katalog kurikulum yang sedang aktif dan menyesuaikan hasil dengan tujuan pembelajaran, materi, jenjang, dan kebutuhan kelas.',
  },
];

const schema = [
  {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Lembar',
    url: SITE_URL,
    logo: `${SITE_URL}/lembar/logo-mark.png`,
  },
  {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'Lembar',
    inLanguage: 'id-ID',
    publisher: { '@id': `${SITE_URL}/#organization` },
  },
  {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#software`,
    name: 'Lembar',
    applicationCategory: 'EducationalApplication',
    applicationSubCategory: 'Generator soal AI untuk guru',
    operatingSystem: 'Web',
    url: SITE_URL,
    inLanguage: 'id-ID',
    description:
      'Aplikasi web untuk membuat dan meninjau draft soal dari PDF, materi, atau konteks kurikulum.',
    publisher: { '@id': `${SITE_URL}/#organization` },
  },
  {
    '@type': 'WebPage',
    '@id': `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: 'Generator Soal AI untuk Guru Indonesia',
    description:
      'Panduan dan fitur generator soal AI Lembar untuk membuat draft soal dari PDF, materi, dan konteks kurikulum.',
    inLanguage: 'id-ID',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#software` },
  },
  {
    '@type': 'HowTo',
    '@id': `${PAGE_URL}#howto`,
    name: 'Cara membuat soal dengan AI di Lembar',
    description: 'Empat tahap untuk menyiapkan dan meninjau draft soal dengan Lembar.',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.body,
      url: `${PAGE_URL}#cara-kerja`,
    })),
  },
  {
    '@type': 'FAQPage',
    '@id': `${PAGE_URL}#faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  },
];

export default function GeneratorSoalAiPage() {
  return (
    <article className="bg-paper text-ink">
      <JsonLd schema={schema} />

      <section className="overflow-hidden px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto grid max-w-container-max items-center gap-unit-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h1 className="max-w-3xl font-display-xl-mobile leading-[1.05] text-ink md:font-display-xl">
              Generator soal AI untuk guru Indonesia
            </h1>
            <p className="mt-unit-6 max-w-xl text-body-lead leading-relaxed text-secondary">
              Buat draft pilihan ganda, esai, dan jenis soal lain dari PDF atau materi, lalu periksa
              sebelum digunakan.
            </p>
            <div className="mt-unit-8 flex flex-wrap gap-unit-4">
              <Link
                href="/daftar"
                className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded bg-burgundy px-unit-6 font-label-semibold text-white transition-colors hover:brightness-110 active:scale-[0.98]"
              >
                Mulai membuat soal
              </Link>
              <a
                href="#cara-kerja"
                className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded border border-ink px-unit-6 font-label-semibold text-ink transition-colors hover:bg-surface-container active:scale-[0.98]"
              >
                Lihat cara kerja
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border-strong bg-surface p-unit-6 shadow-[0_16px_48px_rgba(80,35,35,0.08)] md:p-unit-8">
              <div className="flex items-center justify-between gap-unit-4 border-b border-border-subtle pb-unit-4">
                <div>
                  <p className="text-caption font-label-semibold text-burgundy">
                    Contoh draft untuk ditinjau
                  </p>
                  <h2 className="mt-1 font-h3 text-h3">Ilmu Pengetahuan Alam</h2>
                </div>
                <span className="material-symbols-outlined text-burgundy" aria-hidden="true">
                  fact_check
                </span>
              </div>
              <div className="mt-unit-5">
                <p className="font-label-semibold text-body-default">
                  Mengapa proses fotosintesis penting bagi kehidupan di Bumi?
                </p>
                <ol className="mt-unit-4 grid gap-unit-2 text-body-sm text-secondary">
                  <li className="rounded-lg border border-border-subtle px-unit-4 py-unit-3">
                    A. Menghasilkan oksigen dan menyimpan energi dalam glukosa
                  </li>
                  <li className="rounded-lg border border-border-subtle px-unit-4 py-unit-3">
                    B. Mengubah seluruh air menjadi karbon dioksida
                  </li>
                  <li className="rounded-lg border border-border-subtle px-unit-4 py-unit-3">
                    C. Menghentikan pertumbuhan tumbuhan pada siang hari
                  </li>
                </ol>
                <p className="mt-unit-4 flex items-start gap-unit-2 rounded-lg bg-surface-container px-unit-4 py-unit-3 text-caption text-secondary">
                  <span
                    className="material-symbols-outlined text-[18px] text-burgundy"
                    aria-hidden="true"
                  >
                    edit_note
                  </span>
                  Guru memeriksa pertanyaan, pilihan jawaban, kunci, dan kesesuaian dengan materi
                  sumber.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto max-w-container-max">
          <div className="max-w-3xl">
            <h2 className="font-h1 text-h1">Apa yang dilakukan generator soal Lembar?</h2>
            <p className="mt-unit-4 text-body-lead leading-relaxed text-secondary">
              Lembar membantu mengubah konteks pembelajaran menjadi draft asesmen yang dapat diedit.
              Sistem tidak menggantikan keputusan guru dan tidak menjamin setiap keluaran AI selalu
              benar.
            </p>
          </div>
          <div className="mt-unit-10 grid gap-unit-4 md:grid-cols-12">
            <div className="rounded-2xl bg-burgundy p-unit-8 text-white md:col-span-7">
              <span className="material-symbols-outlined text-[32px]" aria-hidden="true">
                picture_as_pdf
              </span>
              <h3 className="mt-unit-6 font-h2 text-h2">Dari PDF atau materi pembelajaran</h3>
              <p className="mt-unit-3 max-w-xl text-body-default leading-relaxed text-white/85">
                Gunakan dokumen sumber agar topik soal lebih terarah, lalu cocokkan kembali draft
                dengan isi materi sebelum dipakai.
              </p>
            </div>
            <div className="rounded-2xl border border-border-strong bg-paper p-unit-8 md:col-span-5">
              <span
                className="material-symbols-outlined text-[32px] text-burgundy"
                aria-hidden="true"
              >
                school
              </span>
              <h3 className="mt-unit-6 font-h2 text-h2">Konteks kurikulum</h3>
              <p className="mt-unit-3 text-body-default leading-relaxed text-secondary">
                Pilih jenjang, mata pelajaran, atau materi dari katalog yang tersedia, kemudian
                sesuaikan dengan tujuan pembelajaran kelas Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto max-w-container-max">
          <h2 className="max-w-3xl font-h1 text-h1">Jenis soal yang dapat disiapkan</h2>
          <p className="mt-unit-4 max-w-2xl text-body-lead text-secondary">
            Campurkan beberapa format agar asesmen tidak hanya mengukur hafalan, tetapi juga
            pemahaman dan penalaran.
          </p>
          <div className="mt-unit-10 grid gap-unit-4 md:grid-cols-2">
            {questionTypes.map((type, index) => (
              <article
                key={type.title}
                className={`rounded-2xl border border-border-strong p-unit-6 ${
                  index === 0 || index === questionTypes.length - 1
                    ? 'bg-surface-container md:col-span-2'
                    : 'bg-surface'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[28px] text-burgundy"
                  aria-hidden="true"
                >
                  {type.icon}
                </span>
                <h3 className="mt-unit-4 font-h3 text-h3">{type.title}</h3>
                <p className="mt-unit-2 max-w-2xl text-body-sm leading-relaxed text-secondary">
                  {type.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="cara-kerja"
        className="bg-surface-container px-margin-mobile py-unit-16 md:px-margin-desktop"
      >
        <div className="mx-auto max-w-container-max">
          <h2 className="font-h1 text-h1">Cara membuat soal dengan AI</h2>
          <p className="mt-unit-4 max-w-2xl text-body-lead text-secondary">
            Alurnya menjaga guru tetap menjadi pemeriksa dan pengambil keputusan akhir.
          </p>
          <ol className="mt-unit-10 grid gap-unit-4 lg:grid-cols-2">
            {steps.map((step) => (
              <li
                key={step.title}
                className="rounded-2xl border border-border-strong bg-paper p-unit-6"
              >
                <h3 className="font-h3 text-h3">{step.title}</h3>
                <p className="mt-unit-2 text-body-sm leading-relaxed text-secondary">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto grid max-w-container-max gap-unit-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-h1 text-h1">Review guru bukan langkah opsional</h2>
            <p className="mt-unit-4 text-body-lead leading-relaxed text-secondary">
              AI dapat menghasilkan fakta, opsi, atau tingkat kesulitan yang kurang tepat. Periksa
              setiap butir terhadap sumber dan kebutuhan siswa.
            </p>
            <Link
              href="/keamanan-data"
              className="mt-unit-6 inline-flex font-label-semibold text-burgundy underline underline-offset-4"
            >
              Pelajari keamanan data
            </Link>
          </div>
          <div className="grid gap-unit-3 lg:col-span-7">
            {[
              'Periksa kesesuaian dengan materi dan tujuan pembelajaran.',
              'Pastikan hanya ada satu kunci yang tepat untuk pilihan ganda.',
              'Sesuaikan bahasa, konteks, dan tingkat kesulitan dengan siswa.',
              'Edit atau hapus keluaran yang meragukan sebelum finalisasi.',
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-unit-3 rounded-xl bg-surface-container p-unit-4"
              >
                <span className="material-symbols-outlined text-burgundy" aria-hidden="true">
                  task_alt
                </span>
                <p className="text-body-default text-ink">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto max-w-container-max">
          <h2 className="font-h1 text-h1">Dari draft ke dokumen atau asesmen online</h2>
          <p className="mt-unit-4 max-w-3xl text-body-lead leading-relaxed text-secondary">
            Setelah review dan finalisasi, gunakan alur output yang tersedia pada workspace untuk
            menyiapkan dokumen guru, dokumen siswa, atau membagikan asesmen secara online.
          </p>
          <div className="mt-unit-8 flex flex-wrap gap-unit-4">
            <Link
              href="/harga"
              className="font-label-semibold text-burgundy underline underline-offset-4"
            >
              Lihat paket aktif
            </Link>
            <Link
              href="/untuk-sekolah"
              className="font-label-semibold text-burgundy underline underline-offset-4"
            >
              Lembar untuk sekolah
            </Link>
          </div>
        </div>
      </section>

      <section id="faq" className="px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-h1 text-h1">Pertanyaan tentang generator soal AI</h2>
          <div className="mt-unit-8 grid gap-unit-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-border-strong bg-surface"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-unit-4 px-unit-6 py-unit-5 font-label-semibold text-ink">
                  {faq.question}
                  <span
                    className="material-symbols-outlined text-secondary transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </summary>
                <p className="border-t border-border-subtle px-unit-6 py-unit-5 text-body-sm leading-relaxed text-secondary">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-margin-mobile pb-unit-16 md:px-margin-desktop">
        <div className="mx-auto flex max-w-container-max flex-col items-start justify-between gap-unit-6 rounded-2xl bg-burgundy p-unit-8 text-white md:flex-row md:items-center md:p-unit-12">
          <div>
            <h2 className="font-h1 text-h1 text-white">Siapkan draft soal pertama Anda</h2>
            <p className="mt-unit-3 max-w-2xl text-body-default text-white/85">
              Mulai dari materi yang Anda miliki, lalu tinjau setiap hasil sebelum digunakan di
              kelas.
            </p>
          </div>
          <Link
            href="/daftar"
            className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded bg-white px-unit-6 font-label-semibold text-burgundy transition-colors hover:bg-paper active:scale-[0.98]"
          >
            Mulai membuat soal
          </Link>
        </div>
      </section>
    </article>
  );
}
