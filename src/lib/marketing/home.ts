export type HomeProofStep = { no: string; title: string; body: string };
export type HomePanel = {
  eyebrow: string;
  title: string;
  body: string;
  visual: 'generate' | 'review' | 'export';
};
export type HomeContent = {
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    meta: string;
    primaryCta: string;
    secondaryCta: string;
  };
  preview: {
    title: string;
    draft: string;
    settings: readonly string[];
    documentTitle: string;
    duration: string;
    questions: readonly {
      no: string;
      text: string;
      answers: readonly string[];
      source: string;
      status: string;
    }[];
    outputs: readonly string[];
  };
  proof: readonly HomeProofStep[];
  how: { eyebrow: string; title: string; panels: readonly HomePanel[] };
  trust: {
    eyebrow: string;
    title: string;
    body: string;
    link: string;
    specimen: {
      no: string;
      status: string;
      question: string;
      answer: string;
      reason: string;
      source: string;
    };
  };
  final: { eyebrow: string; title: string; body: string; cta: string; schoolLink: string };
};

export const homeContent: HomeContent = {
  hero: {
    eyebrow: 'WORKSPACE ASESMEN UNTUK GURU',
    title: 'Dari materi menjadi lembar ujian yang siap ditinjau.',
    body: 'Susun draft dari Buku Siswa atau PDF Anda, periksa sumbernya, lalu cetak, download, atau bagikan.',
    meta: 'Guru tetap meninjau · Sumber terlihat · Siap cetak',
    primaryCta: 'create-free',
    secondaryCta: 'see-example',
  },
  preview: {
    title: 'Generate Lembar',
    draft: 'Draft',
    settings: ['Bahasa Indonesia · Kelas 5', 'Gagasan Utama · 20 soal'],
    documentTitle: 'Penilaian Akhir Semester',
    duration: 'Bahasa Indonesia · Kelas 5',
    questions: [
      {
        no: '01',
        text: 'Setiap pagi, Budi selalu menyempatkan diri untuk membaca berita terbaru. Ia merasa bahwa dengan mengetahui perkembangan dunia, ia bisa lebih siap menghadapi tantangan. Kebiasaan ini sering ia lakukan sejak duduk di bangku sekolah dasar.\n\nGagasan utama paragraf di atas adalah …',
        answers: [
          'A. Budi suka membaca berita pagi hari.',
          'B. Kebiasaan membaca berita membuat Budi siap menghadapi tantangan.',
          'C. Budi belajar membaca sejak sekolah dasar.',
          'D. Berita pagi penting untuk perkembangan dunia.',
        ],
        source: 'Rujukan: Buku Siswa B. Indo Kls 5, Hlm 72',
        status: 'Siap',
      },
    ],
    outputs: ['Cetak', 'PDF', 'Tautan'],
  },
  proof: [
    {
      no: '01',
      title: 'Pilih materi',
      body: 'Pilih Buku Siswa, PDF, atau materi yang sudah Anda siapkan untuk kelas ini.',
    },
    {
      no: '02',
      title: 'Tinjau draft',
      body: 'Guru tetap memegang kendali untuk menerima atau mengubah setiap butir.',
    },
    {
      no: '03',
      title: 'Gunakan hasil',
      body: 'Cetak, unduh PDF, atau buat tautan terbatas untuk dibagikan.',
    },
  ],
  how: {
    eyebrow: 'Cara kerja',
    title: 'Materi Anda, alur kerja yang tetap dikuasai guru.',
    panels: [
      {
        eyebrow: 'Cara kerja · 01',
        title: 'Pilih sumber yang Anda percaya.',
        body: 'Unggah PDF materi Anda sendiri, atau pilih dari kurasi Buku Siswa resmi. Lembar hanya akan menyusun pertanyaan berdasarkan teks yang Anda berikan, meminimalisir halusinasi.',
        visual: 'generate',
      },
      {
        eyebrow: 'Cara kerja · 02',
        title: 'Tinjau sebelum digunakan.',
        body: 'Guru tetap memegang kendali. Periksa tingkat kognitif, sesuaikan kunci jawaban, dan pastikan setiap butir soal selaras dengan standar kurikulum Anda.',
        visual: 'review',
      },
      {
        eyebrow: 'Cara kerja · 03',
        title: 'Gunakan sesuai kebutuhan.',
        body: 'Format siap pakai. Cetak langsung untuk ujian kelas, unduh sebagai PDF untuk arsip, atau bagikan tautan untuk dikerjakan secara digital.',
        visual: 'export',
      },
    ],
  },
  trust: {
    eyebrow: 'Prinsip',
    title: 'AI menyusun draft. Guru melihat alasannya.',
    body: 'Setiap soal yang muncul di draf menunjuk ke bagian materi atau dokumen yang dipakai sebagai rujukan. Hasil akhir hanya keluar setelah guru menyetujui tiap butir.',
    link: 'Lihat Dokumen',
    specimen: {
      no: 'Q3',
      status: 'Terverifikasi',
      question: 'Apa faktor utama penyebab terjadinya erosi pada lereng gundul?',
      answer: 'A. Tidak adanya akar pohon penahan air',
      reason: 'Tanpa adanya sistem perakaran pohon yang kuat untuk mengikat tanah dan menyerap air, lapisan atas tanah sangat mudah terbawa arus air.',
      source: 'IPA Kelas 5, Hlm 72',
    },
  },
  final: {
    eyebrow: 'Mulai dari satu lembar.',
    title: 'Mulai dari satu lembar.',
    body: 'Bergabung dengan pendidik yang bekerja lebih cermat.',
    cta: 'create-free',
    schoolLink: 'Untuk sekolah',
  },
};

