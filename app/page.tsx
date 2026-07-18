import {
  Book1,
  Buildings2,
  DocumentText,
  Edit2,
  Export,
  ShieldTick,
  Teacher,
  TickCircle,
  Verify,
} from 'iconsax-react';
import Link from 'next/link';
import Reveal from './components/Reveal';

const workflow = [
  {
    no: '01',
    icon: DocumentText,
    title: 'Generate Lembar',
    body: 'Pilih materi, kelas, dan jenis lembar. Sistem menyiapkan draf terstruktur dengan kisi-kisi dan tingkat kesulitan.',
  },
  {
    no: '02',
    icon: Edit2,
    title: 'Review & Koreksi',
    body: 'Setiap soal dapat Anda terima, sunting, atau minta ulang drafnya. Sumber tetap terlihat di samping soal.',
  },
  {
    no: '03',
    icon: Export,
    title: 'Export PDF, Cetak, atau Tautan',
    body: 'Hasil akhir dicetak langsung atau diunduh sebagai PDF A4. Buat tautan terbatas untuk dibagikan.',
  },
  {
    no: '04',
    icon: Book1,
    title: 'Bank Soal',
    body: 'Simpan soal tepercaya Anda sebagai arsip pribadi. Versi, sumber, dan revisi rapi untuk lintas tahun ajaran.',
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Lewati ke konten
      </a>

      <header className="nav" aria-label="Navigasi utama">
        <div className="nav__inner">
          <Link className="nav__brand" href="/">
            <svg
              className="nav__mark"
              viewBox="0 0 24 24"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 3h12v18H6z M6 3l12 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
            </svg>
            <span className="nav__wordmark">lembar</span>
          </Link>

          <nav aria-label="Bagian" className="nav__links">
            <a href="#produk">Produk</a>
            <a href="#untuk-sekolah">Untuk Sekolah</a>
            <a href="#harga">Harga</a>
          </nav>

          <div className="nav__cta">
            <Link className="btn btn--primary" href="#coba-gratis">
              Mulai
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="page">
        <section className="hero" aria-labelledby="hero-heading">
          <Reveal className="hero__copy">
            <p className="hero__eyebrow">Workspace asesmen untuk guru Indonesia</p>
            <h1 id="hero-heading" className="hero__heading">
              Buat lembar soal siap cetak dalam hitungan menit — draf AI, tinjauan guru, hasil
              akhir.
            </h1>
            <p className="hero__sub">
              Dirancang untuk guru dan sekolah di Indonesia: draf terstruktur dari materi Anda,
              sumber yang terlihat jelas, kunci dan pembahasan opsional, hasil akhir yang siap cetak
              atau diunduh sebagai PDF.
            </p>
            <div className="hero__cta">
              <Link className="btn btn--primary btn--lg" href="#coba-gratis">
                Coba gratis
              </Link>
              <Link className="btn btn--quiet btn--lg" href="#untuk-sekolah">
                Untuk sekolah
              </Link>
            </div>
            <p className="hero__meta">
              Bahasa Indonesia · Privat secara bawaan · Guru tetap meninjau
            </p>
          </Reveal>

          <Reveal className="hero__preview" delay={0.08}>
            <div className="preview" aria-label="Contoh kerja Generate Lembar">
              <div className="preview__panel">
                <div className="preview__head">
                  <span className="preview__title">Generate Lembar</span>
                  <span className="preview__pill">Draf</span>
                </div>

                <ul className="preview__controls" aria-label="Pengaturan lembar">
                  <li>
                    <span className="preview__label">Kelas</span>
                    <span className="preview__value">V (SD)</span>
                  </li>
                  <li>
                    <span className="preview__label">Mata pelajaran</span>
                    <span className="preview__value">Matematika</span>
                  </li>
                  <li>
                    <span className="preview__label">Materi</span>
                    <span className="preview__value">Pecahan senilai</span>
                  </li>
                  <li>
                    <span className="preview__label">Jenis lembar</span>
                    <span className="preview__value">Pilihan ganda · 20 soal</span>
                  </li>
                </ul>

                <div className="preview__sheet">
                  <div className="preview__sheet-head">
                    <span className="preview__sheet-title">Lembar Soal · Kelas V</span>
                    <span className="preview__sheet-meta">20 soal · 60 menit</span>
                  </div>
                  <ol className="preview__list">
                    <li className="preview__item preview__item--review">
                      <div className="preview__rail" aria-hidden="true" />
                      <div className="preview__body">
                        <span className="preview__no">Soal 1</span>
                        <span className="preview__stem">
                          Pecahan yang senilai dengan 2/4 adalah …
                        </span>
                        <ul className="preview__options">
                          <li>
                            <span className="preview__bullet">A</span>1/2
                          </li>
                          <li>
                            <span className="preview__bullet">B</span>2/6
                          </li>
                          <li>
                            <span className="preview__bullet">C</span>3/8
                          </li>
                          <li>
                            <span className="preview__bullet">D</span>4/5
                          </li>
                        </ul>
                      </div>
                      <span className="badge badge--success">Final</span>
                    </li>
                    <li className="preview__item preview__item--review">
                      <div className="preview__rail" aria-hidden="true" />
                      <div className="preview__body">
                        <span className="preview__no">Soal 2</span>
                        <span className="preview__stem">
                          Bangun datar yang memiliki empat sisi sama panjang adalah …
                        </span>
                        <ul className="preview__options">
                          <li>
                            <span className="preview__bullet">A</span>Persegi panjang
                          </li>
                          <li>
                            <span className="preview__bullet">B</span>Segitiga
                          </li>
                          <li>
                            <span className="preview__bullet">C</span>Persegi
                          </li>
                          <li>
                            <span className="preview__bullet">D</span>Lingkaran
                          </li>
                        </ul>
                      </div>
                      <span className="badge badge--warning">Tinjau</span>
                    </li>
                  </ol>
                </div>

                <div className="preview__outputs" aria-label="Pilihan hasil akhir">
                  <span className="chip chip--solid">PDF A4</span>
                  <span className="chip">Cetak</span>
                  <span className="chip">Tautan</span>
                </div>
                <p className="preview__note">Contoh tampilan · bukan soal ujian riil.</p>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="produk" className="workflow" aria-labelledby="workflow-heading">
          <Reveal>
            <div className="section__head section__head--center">
              <p className="section__eyebrow">Alur kerja</p>
              <h2 id="workflow-heading" className="section__title">
                Empat tahap yang menjaga Anda tetap memegang kendali.
              </h2>
              <p className="section__lede">
                Setiap tahap memberi ruang untuk menerima, menolak, atau mengubah sebelum hasil
                final dicetak atau dibagikan.
              </p>
            </div>
          </Reveal>

          <div className="workflow__grid">
            {workflow.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.no} delay={0.04 * i}>
                  <article className="step">
                    <div className="step__top">
                      <span className="icon-accent" aria-hidden="true">
                        <Icon size={22} variant="Linear" />
                      </span>
                      <span className="step__no">{step.no}</span>
                    </div>
                    <h3 className="step__title">{step.title}</h3>
                    <p className="step__body">{step.body}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section className="audience" aria-labelledby="audience-heading">
          <Reveal>
            <div className="section__head">
              <p className="section__eyebrow">Untuk siapa</p>
              <h2 id="audience-heading" className="section__title">
                Satu produk, dua cara pakai yang jelas.
              </h2>
            </div>
          </Reveal>

          <div className="audience__grid">
            <Reveal>
              <article id="untuk-sekolah" className="audience__card">
                <span className="icon-accent icon-accent--lg" aria-hidden="true">
                  <Buildings2 size={24} variant="Linear" />
                </span>
                <p className="audience__eyebrow">Untuk Sekolah</p>
                <h3 className="audience__title">
                  Dasbor admin, bank soal internal, dan kursi yang terlihat.
                </h3>
                <ul className="audience__list">
                  <li>Anggota, kursi, dan kuota dalam satu tampilan.</li>
                  <li>Template dan bank soal yang tetap milik sekolah.</li>
                  <li>Isi workspace pribadi tiap guru tidak diekspos.</li>
                </ul>
                <Link className="audience__link" href="#coba-gratis">
                  Hubungi untuk uji coba →
                </Link>
              </article>
            </Reveal>
            <Reveal delay={0.06}>
              <article className="audience__card">
                <span className="icon-accent icon-accent--lg" aria-hidden="true">
                  <Teacher size={24} variant="Linear" />
                </span>
                <p className="audience__eyebrow">Untuk Guru Individual</p>
                <h3 className="audience__title">
                  Mulai dari satu kelas, kelola semuanya tanpa ribet.
                </h3>
                <ul className="audience__list">
                  <li>Workspace pribadi, rapi, dan siap dipakai setiap pagi.</li>
                  <li>Reuse draf antar kelas dan tahun ajaran.</li>
                  <li>Privasi materi Anda adalah bawaan, bukan add-on.</li>
                </ul>
                <Link className="audience__link" href="#coba-gratis">
                  Buat workspace gratis →
                </Link>
              </article>
            </Reveal>
          </div>
        </section>

        <section className="trust" aria-labelledby="trust-heading">
          <Reveal>
            <div className="section__head">
              <p className="section__eyebrow">Prinsip</p>
              <h2 id="trust-heading" className="section__title">
                Tiga janji yang tidak kami langgar.
              </h2>
            </div>
          </Reveal>
          <div className="trust__grid">
            <Reveal>
              <article className="trust__card">
                <span className="icon-accent" aria-hidden="true">
                  <Verify size={22} variant="Linear" />
                </span>
                <span className="trust__no">01</span>
                <h3 className="trust__title">Selaras Kurikulum Merdeka</h3>
                <p className="trust__body">
                  Pengaturan kelas dan mata pelajaran mengikuti Capaian Pembelajaran Fase C.
                </p>
              </article>
            </Reveal>
            <Reveal delay={0.05}>
              <article className="trust__card">
                <span className="icon-accent" aria-hidden="true">
                  <ShieldTick size={22} variant="Linear" />
                </span>
                <span className="trust__no">02</span>
                <h3 className="trust__title">Sumber terlihat, bukan disembunyikan</h3>
                <p className="trust__body">
                  Setiap soal menunjuk ke bagian materi atau dokumen yang dipakai sebagai rujukan.
                </p>
              </article>
            </Reveal>
            <Reveal delay={0.1}>
              <article className="trust__card">
                <span className="icon-accent" aria-hidden="true">
                  <TickCircle size={22} variant="Linear" />
                </span>
                <span className="trust__no">03</span>
                <h3 className="trust__title">Tinjauan guru sebelum final</h3>
                <p className="trust__body">
                  Hasil akhir hanya keluar setelah guru menyetujui tiap butir yang akan dipakai.
                </p>
              </article>
            </Reveal>
          </div>
        </section>

        <section id="harga" className="cta" aria-labelledby="cta-heading">
          <Reveal>
            <div className="cta__inner">
              <h2 id="cta-heading" className="cta__title">
                Mulai dari satu lembar.
              </h2>
              <p className="cta__sub">
                Coba gratis untuk guru individual. Untuk sekolah, paket dan harga diumumkan setelah
                uji coba terbatas.
              </p>
              <div className="cta__actions">
                <Link className="btn btn--primary btn--lg" href="#coba-gratis">
                  Coba gratis
                </Link>
                <Link className="btn btn--quiet btn--lg" href="#untuk-sekolah">
                  Untuk sekolah
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="footer" aria-label="Footer">
        <div className="footer__inner">
          <div>
            <p className="footer__brand">lembar</p>
            <p className="footer__tagline">
              Workspace asesmen untuk guru Indonesia. Privat secara bawaan.
            </p>
          </div>
          <a className="footer__link" href="#untuk-sekolah">
            Untuk sekolah
          </a>
          <p className="footer__meta">
            © {new Date().getFullYear()} lembar. Nama dan materi pada contoh adalah placeholder,
            bukan data pelanggan.
          </p>
        </div>
      </footer>
    </>
  );
}
