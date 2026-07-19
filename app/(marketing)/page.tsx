import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id'),
  title: 'lembar — buat, tinjau, dan finalkan lembar soal',
  description:
    'lembar adalah workspace asesmen untuk guru. Pilih materi, susun draft soal dengan bantuan AI, tinjau setiap butir, lalu cetak atau bagikan lembar yang siap dipakai.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'lembar — workspace asesmen untuk guru',
    description:
      'Buat draft soal, tinjau sumbernya, dan finalkan lembar yang siap cetak. Draft AI selalu ditinjau guru.',
    url: '/',
    siteName: 'lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'lembar — workspace asesmen untuk guru',
    description: 'Buat draft soal, tinjau sumbernya, dan finalkan lembar yang siap cetak.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LandingPage() {
  return (
    <>
      <header className="bg-background dark:bg-background font-body-default text-body-default w-full sticky top-0 z-50 border-b border-border-subtle dark:border-outline-variant transition-colors duration-200">
        <div className="flex justify-between items-center h-unit-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <Link href="/" className="flex items-center gap-4" aria-label="lembar — beranda">
            <div className="flex items-center h-unit-8 w-unit-8">
              <img
                alt=""
                className="h-full w-full object-contain"
                src="https://raw.githubusercontent.com/rikoarik/Frontend-Lembar/ao/frontend-integration/public/lembar/logo-mark.png"
              />
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8" aria-label="Navigasi utama">
            <Link
              className="font-body-default hover:text-burgundy transition-colors duration-200 text-burgundy font-bold active-nav-indicator border-b-2 border-burgundy pb-1"
              href="/"
            >
              Produk
            </Link>
            <Link
              className="text-secondary font-body-default hover:text-burgundy transition-colors duration-200"
              href="/untuk-sekolah"
            >
              Untuk Sekolah
            </Link>
            <Link
              className="font-body-default text-secondary hover:text-burgundy transition-colors duration-200"
              href="/harga"
            >
              Harga
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              className="text-secondary font-label-semibold px-unit-4 py-unit-2 hover:text-burgundy transition-colors"
              href="/masuk"
            >
              Masuk
            </Link>
            <Link
              className="bg-burgundy text-on-primary font-label-semibold h-[44px] px-unit-6 rounded-lg hover:brightness-110 transition-all flex items-center"
              href="/daftar"
            >
              Coba Gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
            <div className="lg:col-span-5 flex flex-col gap-6 relative z-10">
              <span className="font-label-semibold text-label-semibold text-secondary uppercase tracking-wider">
                Workspace asesmen untuk guru
              </span>
              <h1 className="font-display-xl-mobile md:font-display-xl text-display-xl-mobile md:text-display-xl text-ink leading-tight">
                Dari materi menjadi lembar ujian yang siap ditinjau.
              </h1>
              <p className="font-body-lead text-body-lead text-secondary max-w-md">
                Susun draft soal dari Buku Siswa atau PDF Anda, periksa sumbernya, lalu cetak,
                download, atau bagikan.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <Link
                  className="font-label-semibold text-label-semibold bg-burgundy text-white px-6 py-3 rounded h-[44px] flex items-center justify-center transition-colors hover:bg-primary shadow-sm"
                  href="/daftar"
                >
                  Buat lembar gratis
                </Link>
                <a
                  className="font-label-semibold text-label-semibold text-ink border border-ink px-6 py-3 rounded h-[44px] flex items-center justify-center transition-colors hover:bg-surface-container-highest"
                  href="#contoh-hasil"
                >
                  Lihat contoh hasil
                </a>
              </div>
            </div>

            <div
              className="lg:col-span-7 relative mt-12 lg:mt-0 flex justify-center lg:justify-end"
              id="contoh-hasil"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-surface-container rounded-full blur-3xl opacity-50 z-0"></div>

              <div className="bg-surface border border-border-subtle p-8 md:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded-DEFAULT w-full max-w-lg relative z-10 rotate-1 hover:rotate-0 transition-transform duration-500 ease-out origin-bottom-right">
                <div className="absolute -top-4 -right-4 bg-surface border border-border-strong px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[16px] text-green-600"
                    data-icon="check_circle"
                  >
                    check_circle
                  </span>
                  <span className="font-caption text-caption text-ink">
                    20 soal, Sumber terlihat, Siap cetak
                  </span>
                </div>

                <div className="border-b border-border-subtle pb-6 mb-6">
                  <h3 className="font-h3 text-h3 text-ink mb-2">Penilaian Akhir Semester</h3>
                  <p className="font-caption text-caption text-secondary">
                    Bahasa Indonesia - Kelas 6
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <span className="font-label-semibold text-label-semibold text-ink">1.</span>
                    <div>
                      <p className="font-body-default text-body-default text-ink mb-3">
                        Bacalah paragraf berikut dengan saksama!
                        <br />
                        <br />
                        Setiap pagi, Budi selalu menyempatkan diri untuk membaca berita terkini. Ia
                        merasa bahwa dengan mengetahui perkembangan dunia, ia bisa lebih siap
                        menghadapi tantangan. Kebiasaan ini sudah ia tanamkan sejak duduk di bangku
                        sekolah dasar.
                      </p>
                      <p className="font-label-semibold text-label-semibold text-ink mb-2">
                        Ide pokok paragraf di atas adalah...
                      </p>
                      <div className="space-y-2 pl-2">
                        <div className="flex gap-2 items-start">
                          <span className="font-label-semibold text-ink">A.</span>
                          <span className="font-body-sm text-ink">
                            Budi suka membaca berita pagi hari.
                          </span>
                        </div>
                        <div className="flex gap-2 items-start">
                          <span className="font-label-semibold text-ink">B.</span>
                          <span className="font-body-sm text-ink">
                            Kebiasaan membaca berita membuat Budi siap menghadapi tantangan.
                          </span>
                        </div>
                        <div className="flex gap-2 items-start">
                          <span className="font-label-semibold text-ink">C.</span>
                          <span className="font-body-sm text-ink">
                            Budi belajar membaca sejak sekolah dasar.
                          </span>
                        </div>
                        <div className="flex gap-2 items-start">
                          <span className="font-label-semibold text-ink">D.</span>
                          <span className="font-body-sm text-ink">
                            Berita pagi penting untuk perkembangan dunia.
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 inline-flex items-center gap-1 bg-surface-container-low px-2 py-1 rounded-DEFAULT border border-border-subtle">
                        <span
                          className="material-symbols-outlined text-[12px] text-secondary"
                          data-icon="menu_book"
                        >
                          menu_book
                        </span>
                        <span className="font-caption text-caption text-secondary">
                          Buku Siswa Hal 45
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-surface to-transparent rounded-b-DEFAULT"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border-subtle bg-surface-bright py-8">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full border border-border-strong flex items-center justify-center font-label-semibold text-secondary shrink-0">
                  01
                </div>
                <span className="font-body-default text-ink font-medium">Pilih materi</span>
              </div>
              <div className="hidden md:block flex-1 h-[1px] bg-border-subtle"></div>

              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full border border-border-strong flex items-center justify-center font-label-semibold text-secondary shrink-0">
                  02
                </div>
                <span className="font-body-default text-ink font-medium">Tinjau draft</span>
              </div>
              <div className="hidden md:block flex-1 h-[1px] bg-border-subtle"></div>

              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-full border border-border-strong flex items-center justify-center font-label-semibold text-secondary shrink-0">
                  03
                </div>
                <span className="font-body-default text-ink font-medium">Gunakan hasil</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto space-y-32">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
            <div className="md:col-span-5 flex flex-col gap-4">
              <h2 className="font-h1 text-h1 text-ink">Pilih sumber yang Anda percaya.</h2>
              <p className="font-body-lead text-body-lead text-secondary">
                Unggah PDF materi Anda sendiri, atau pilih dari kurasi Buku Siswa resmi. Lembar
                hanya akan menyusun pertanyaan berdasarkan teks yang Anda berikan, meminimalisir
                halusinasi.
              </p>
            </div>
            <div className="md:col-span-7 bg-surface border border-border-subtle p-8 rounded-lg shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                  <span className="font-label-semibold text-ink">Sumber Materi</span>
                  <span className="text-burgundy font-label-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]" data-icon="add">
                      add
                    </span>{' '}
                    Tambah
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-border-strong p-4 rounded bg-surface-container-low flex flex-col items-center justify-center gap-2">
                    <span
                      className="material-symbols-outlined text-[24px] text-secondary"
                      data-icon="upload_file"
                    >
                      upload_file
                    </span>
                    <span className="font-caption text-secondary">Unggah PDF</span>
                  </div>
                  <div className="border border-border-strong p-4 rounded bg-surface flex flex-col gap-2 relative overflow-hidden">
                    <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full"></div>
                    <span
                      className="material-symbols-outlined text-[24px] text-ink"
                      data-icon="menu_book"
                    >
                      menu_book
                    </span>
                    <span className="font-caption text-ink font-medium truncate">
                      Buku Siswa B.Indo Kls 6
                    </span>
                    <span className="text-[10px] text-secondary">Terpilih (Bab 3-4)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
            <div className="md:col-span-7 order-2 md:order-1">
              <div className="bg-surface border border-border-subtle rounded-lg shadow-sm overflow-hidden">
                <div className="bg-surface-container-low border-b border-border-subtle px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  </div>
                  <span className="font-caption text-secondary">Tinjauan Draft</span>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div className="border border-border-strong rounded p-4 relative group">
                    <div className="absolute -left-3 top-4 w-6 h-6 bg-surface border border-border-strong rounded-full flex items-center justify-center font-caption text-ink shadow-sm">
                      2
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-semibold bg-surface-container text-secondary">
                          C3 - Aplikasi
                        </span>
                      </div>
                      <div
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2"
                        aria-hidden="true"
                      >
                        <span className="text-secondary">
                          <span className="material-symbols-outlined text-[16px]" data-icon="edit">
                            edit
                          </span>
                        </span>
                        <span className="text-secondary">
                          <span
                            className="material-symbols-outlined text-[16px]"
                            data-icon="delete"
                          >
                            delete
                          </span>
                        </span>
                      </div>
                    </div>
                    <p className="font-body-default text-ink mb-3">
                      Apa kesimpulan utama dari teks bacaan pada halaman 45?
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 bg-green-50/50 p-1 rounded border border-green-200">
                        <span
                          className="material-symbols-outlined text-[14px] text-green-600"
                          data-icon="check"
                        >
                          check
                        </span>
                        <span className="font-body-sm text-ink">
                          A. Pahlawan nasional berjuang tanpa pamrih. (Kunci)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-1">
                        <span className="w-[14px]"></span>
                        <span className="font-body-sm text-secondary">
                          B. Sejarah kemerdekaan sangat panjang.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-5 order-1 md:order-2 flex flex-col gap-4 pl-0 md:pl-8">
              <h2 className="font-h1 text-h1 text-ink">Tinjau sebelum digunakan.</h2>
              <p className="font-body-lead text-body-lead text-secondary">
                Guru tetap memegang kendali. Periksa tingkat kognitif, sesuaikan kunci jawaban, dan
                pastikan setiap butir soal selaras dengan standar kurikulum Anda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
            <div className="md:col-span-5 flex flex-col gap-4">
              <h2 className="font-h1 text-h1 text-ink">Gunakan sesuai kebutuhan.</h2>
              <p className="font-body-lead text-body-lead text-secondary">
                Format siap pakai. Cetak langsung untuk ujian kelas, unduh sebagai PDF untuk arsip,
                atau bagikan tautan untuk dikerjakan secara digital.
              </p>
            </div>
            <div className="md:col-span-7">
              <div className="bg-surface-container p-8 rounded-lg flex gap-4 justify-center">
                <div className="bg-surface p-4 rounded border border-border-subtle shadow-sm flex flex-col items-center gap-2 w-32">
                  <span
                    className="material-symbols-outlined text-[32px] text-ink"
                    data-icon="print"
                  >
                    print
                  </span>
                  <span className="font-label-semibold text-ink">Cetak</span>
                </div>
                <div className="bg-surface p-4 rounded border border-border-subtle shadow-sm flex flex-col items-center gap-2 w-32">
                  <span
                    className="material-symbols-outlined text-[32px] text-ink"
                    data-icon="picture_as_pdf"
                  >
                    picture_as_pdf
                  </span>
                  <span className="font-label-semibold text-ink">PDF</span>
                </div>
                <div className="bg-surface p-4 rounded border border-border-subtle shadow-sm flex flex-col items-center gap-2 w-32">
                  <span className="material-symbols-outlined text-[32px] text-ink" data-icon="link">
                    link
                  </span>
                  <span className="font-label-semibold text-ink">Tautan</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-ink text-white py-24 px-margin-mobile md:px-margin-desktop">
          <div className="max-w-container-max mx-auto flex flex-col items-center text-center gap-12">
            <h2 className="font-h1 text-h1 max-w-2xl">
              AI menyusun draft. Guru melihat alasannya.
            </h2>

            <div className="bg-surface rounded-lg p-6 md:p-8 max-w-3xl w-full text-left shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-burgundy to-transparent opacity-50"></div>
              <div className="flex justify-between items-start border-b border-border-subtle pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-surface-container text-ink font-bold w-8 h-8 flex items-center justify-center rounded">
                    Q3
                  </span>
                  <p className="font-body-default text-ink">
                    Apa faktor utama penyebab terjadinya erosi pada lereng gundul?
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-label-semibold text-secondary mb-2 uppercase text-[10px] tracking-wider">
                    Opsi Jawaban
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 border border-green-200 bg-green-50 rounded flex items-center justify-between">
                      <span className="font-body-sm text-ink">
                        A. Tidak adanya akar pohon penahan air.
                      </span>
                      <span
                        className="material-symbols-outlined text-[16px] text-green-600"
                        data-icon="check_circle"
                      >
                        check_circle
                      </span>
                    </div>
                    <div className="p-2 border border-border-subtle rounded">
                      <span className="font-body-sm text-secondary">
                        B. Curah hujan yang rendah.
                      </span>
                    </div>
                    <div className="p-2 border border-border-subtle rounded">
                      <span className="font-body-sm text-secondary">
                        C. Jenis tanah liat yang keras.
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded border border-border-subtle">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-label-semibold text-ink flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-[16px]"
                        data-icon="find_in_page"
                      >
                        find_in_page
                      </span>{' '}
                      Sumber Kutipan
                    </p>
                    <span className="text-burgundy font-caption">Dokumen sumber</span>
                  </div>
                  <p className="font-body-sm text-secondary italic border-l-2 border-border-strong pl-3 py-1">
                    &quot;...erosi paling sering terjadi pada lereng yang telah ditebang habis.
                    Tanpa adanya sistem perakaran pohon yang kuat untuk mengikat tanah dan menyerap
                    air hujan, lapisan atas tanah sangat mudah terbawa arus air...&quot;
                  </p>
                  <p className="font-caption text-secondary mt-2 text-right">
                    - IPA Kelas 6, Hal 72
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-32 px-margin-mobile md:px-margin-desktop text-center bg-paper">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h2 className="font-display-xl-mobile md:font-display-xl text-ink">
              Mulai dari satu lembar.
            </h2>
            <p className="font-body-lead text-secondary mb-4">
              Buat ruang kerja pribadi Anda dan mulai menyusun draft pertama.
            </p>
            <Link
              className="font-label-semibold text-label-semibold bg-burgundy text-white px-8 py-4 rounded h-[56px] flex items-center justify-center transition-colors hover:bg-primary shadow-sm text-[16px]"
              href="/daftar"
            >
              Buat lembar gratis
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
