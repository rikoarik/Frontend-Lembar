import Link from 'next/link';

type PreviewQuestion = {
  no: string;
  stem: string;
  options: string[];
};

const previewQuestions: PreviewQuestion[] = [
  {
    no: 'Soal 1',
    stem: 'Pecahan yang senilai dengan 2/4 adalah …',
    options: ['1/2', '2/6', '3/8', '4/5'],
  },
  {
    no: 'Soal 2',
    stem: 'Bangun datar yang memiliki empat sisi sama panjang adalah …',
    options: ['Persegi panjang', 'Segitiga', 'Persegi', 'Lingkaran'],
  },
  {
    no: 'Soal 3',
    stem: 'Hasil dari 0,25 × 40 adalah …',
    options: ['8', '10', '12', '20'],
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
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#untuk-guru">Untuk Guru</a>
            <a href="#untuk-sekolah">Untuk Sekolah</a>
            <a href="#harga">Harga</a>
          </nav>

          <div className="nav__cta">
            <a className="btn btn--quiet" href="#masuk">
              Masuk
            </a>
            <a className="btn btn--primary" href="#coba-gratis">
              Coba Gratis
            </a>
          </div>
        </div>
      </header>

      <main id="main" className="page">
        <section className="hero" aria-labelledby="hero-heading">
          <p className="hero__eyebrow">Workspace asesmen untuk guru Indonesia</p>
          <h1 id="hero-heading" className="hero__heading">
            Buat lembar soal siap cetak dalam hitungan menit — draf AI, tinjauan guru, hasil akhir.
          </h1>
          <p className="hero__sub">
            Dirancang untuk guru dan sekolah di Indonesia: draf terstruktur dari materi Anda, sumber
            jelas, kunci dan pembahasan opsional, hasil akhir siap cetak atau diunduh sebagai PDF.
          </p>
          <div className="hero__cta">
            <a className="btn btn--primary btn--lg" href="#coba-gratis">
              Coba gratis
            </a>
            <a className="btn btn--quiet btn--lg" href="#untuk-sekolah">
              Untuk sekolah
            </a>
          </div>
          <p className="hero__meta">
            Bahasa Indonesia · Privat secara bawaan · Guru tetap meninjau
          </p>
        </section>

        <section className="preview" aria-label="Contoh tampilan lembar dan panel tinjauan">
          <div className="preview__sheet" role="figure" aria-label="Lembar soal contoh">
            <div className="preview__sheet-head">
              <span className="preview__sheet-title">Lembar Soal — Matematika Kelas 5</span>
              <span className="preview__sheet-meta">20 soal · 60 menit</span>
            </div>
            <ol className="preview__list">
              {previewQuestions.map((q) => (
                <li key={q.no} className="preview__item">
                  <div className="preview__item-head">
                    <span className="preview__no">{q.no}</span>
                    <span className="preview__stem">{q.stem}</span>
                  </div>
                  <ul className="preview__options">
                    {q.options.map((option, i) => (
                      <li key={option}>
                        <span className="preview__bullet">{String.fromCharCode(65 + i)}</span>
                        <span>{option}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <p className="preview__note">Contoh tampilan · bukan soal ujian riil.</p>
          </div>

          <aside className="preview__panel" aria-label="Panel tinjauan dan sumber">
            <div className="preview__panel-section">
              <h2 className="preview__panel-title">Status draf</h2>
              <ul className="preview__status">
                <li>
                  <span className="badge badge--success">Final</span>
                  <span className="preview__status-text">16 soal siap dipakai</span>
                </li>
                <li>
                  <span className="badge badge--warning">Tinjau</span>
                  <span className="preview__status-text">3 soal butuh keputusan</span>
                </li>
                <li>
                  <span className="badge badge--muted">Draf</span>
                  <span className="preview__status-text">1 soal belum disetujui</span>
                </li>
              </ul>
            </div>

            <div className="preview__panel-section">
              <h2 className="preview__panel-title">Sumber</h2>
              <ul className="preview__sources">
                <li>
                  <span className="preview__source-name">Buku Matematika SD 5 · Hal. 42–48</span>
                  <span className="preview__source-meta">2 kutipan · v2024</span>
                </li>
                <li>
                  <span className="preview__source-name">Capaian Pembelajaran · Fase C</span>
                  <span className="preview__source-meta">Kurikulum Merdeka</span>
                </li>
              </ul>
            </div>
          </aside>
        </section>

        <section id="cara-kerja" className="tiles" aria-labelledby="cara-kerja-heading">
          <div className="section__head">
            <h2 id="cara-kerja-heading" className="section__title">
              Tiga alur yang menjaga Anda tetap memegang kendali.
            </h2>
            <p className="section__lede">
              Setiap tahap memberi Anda ruang untuk menerima, menolak, atau mengubah.
            </p>
          </div>
          <div className="tiles__grid">
            <article className="tile">
              <span className="tile__no">01</span>
              <h3 className="tile__title">Generate Lembar</h3>
              <p className="tile__body">
                Pilih materi dan konteks kelas. Sistem menyiapkan draf terstruktur dengan kisi-kisi,
                tingkat kesulitan, dan ringkasan yang bisa Anda tinjau.
              </p>
            </article>
            <article className="tile">
              <span className="tile__no">02</span>
              <h3 className="tile__title">Bank Soal</h3>
              <p className="tile__body">
                Simpan soal tepercaya Anda sebagai arsip pribadi. Versi, sumber, dan revisi tetap
                rapi untuk dipakai lintas kelas dan tahun ajaran.
              </p>
            </article>
            <article className="tile">
              <span className="tile__no">03</span>
              <h3 className="tile__title">Riwayat &amp; Export</h3>
              <p className="tile__body">
                Lacak setiap lembar dari draf hingga final. Hasil akhir dapat dicetak langsung atau
                diunduh sebagai PDF A4 yang siap dibagikan.
              </p>
            </article>
          </div>
        </section>

        <section className="split" aria-label="Untuk guru dan untuk sekolah">
          <article id="untuk-guru" className="split__col">
            <p className="split__eyebrow">Untuk Guru</p>
            <h2 className="split__title">Mulai dari satu kelas, kelola semuanya tanpa ribet.</h2>
            <ul className="split__list">
              <li>Workspace pribadi, rapi, dan siap pakai setiap pagi.</li>
              <li>Reuse draf antar kelas dan tahun ajaran.</li>
              <li>Privasi materi Anda adalah bawaan, bukan add-on.</li>
            </ul>
          </article>
          <article id="untuk-sekolah" className="split__col">
            <p className="split__eyebrow">Untuk Sekolah</p>
            <h2 className="split__title">Satu dasbor untuk admin, bank soal untuk guru.</h2>
            <ul className="split__list">
              <li>Anggota, kursi, dan kuota terlihat tanpa drama.</li>
              <li>Template dan bank internal yang tetap milik sekolah.</li>
              <li>Tanpa mengekspos isi workspace pribadi tiap guru.</li>
            </ul>
          </article>
        </section>

        <section id="harga" className="pricing" aria-labelledby="harga-heading">
          <div className="section__head">
            <h2 id="harga-heading" className="section__title">
              Paket dan harga
            </h2>
            <p className="section__lede">
              Struktur paket sedang kami finalkan. Detail nominal akan diumumkan setelah uji coba
              dengan guru dan sekolah.
            </p>
          </div>
          <p className="pricing__placeholder">Segera diumumkan</p>
          <p className="pricing__note">
            Tertarik untuk uji coba sekolah? <a href="#untuk-sekolah">Hubungi kami</a>.
          </p>
        </section>
      </main>

      <footer className="footer" aria-label="Footer">
        <div className="footer__inner">
          <p className="footer__brand">lembar</p>
          <p className="footer__tagline">
            Workspace asesmen untuk guru Indonesia. Privat secara bawaan.
          </p>
          <a className="footer__link" href="#untuk-sekolah">
            Untuk sekolah
          </a>
          <p className="footer__meta">
            © {new Date().getFullYear()} lembar. Nama dan materi adalah placeholder, bukan data
            pelanggan.
          </p>
        </div>
      </footer>
    </>
  );
}
