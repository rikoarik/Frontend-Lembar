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
    body: 'Susun draft soal dari Buku Siswa atau PDF Anda, periksa sumbernya, lalu cetak, download, atau bagikan.',
    meta: 'Guru tetap meninjau · Sumber terlihat · Siap cetak',
    primaryCta: 'create-free',
    secondaryCta: 'see-example',
  },
  preview: {
    title: 'Generate Lembar',
    draft: 'Draft',
    settings: ['Matematika · Kelas V', 'Pecahan senilai · 20 soal'],
    documentTitle: 'Lembar Soal · Matematika · Kelas V',
    duration: '60 menit',
    questions: [
      {
        no: '01',
        text: 'Pecahan yang senilai dengan 2/4 adalah …',
        answers: ['A. 1/2', 'B. 2/6', 'C. 3/8', 'D. 4/5'],
        source: 'Sumber · Buku Matematika Kelas V · hlm. 42',
        status: 'Siap',
      },
      {
        no: '02',
        text: 'Bangun datar yang memiliki empat sisi sama panjang adalah …',
        answers: ['A. Persegi panjang', 'B. Segitiga', 'C. Persegi', 'D. Lingkaran'],
        source: 'Sumber · Buku Matematika Kelas V · hlm. 58',
        status: 'Tinjau',
      },
    ],
    outputs: ['PDF', 'Cetak', 'Tautan'],
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
        title: 'Draft terstruktur dari materi nyata',
        body: 'Generate Lembar mengubah materi pilihan Anda menjadi kisi-kisi dan draf soal per butir. Setiap butir menunjuk ke bagian materi yang dipakai sebagai rujukan.',
        visual: 'generate',
      },
      {
        eyebrow: 'Cara kerja · 02',
        title: 'Tinjauan butir per butir',
        body: 'Review & Koreksi menampilkan setiap soal dalam panel terpisah. Sumber, tingkat kesulitan, dan status tinjauan terlihat tanpa berpindah halaman.',
        visual: 'review',
      },
      {
        eyebrow: 'Cara kerja · 03',
        title: 'Cetak, PDF, atau tautan terbatas',
        body: 'Hasil akhir dapat dicetak langsung, diunduh sebagai PDF A4, atau dibagikan sebagai tautan yang Anda tentukan masa aktifnya.',
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
      question: 'Pecahan yang senilai dengan 2/4 adalah …',
      answer: 'A. 1/2',
      reason: 'Pembilang dan penyebut dibagi dengan bilangan yang sama.',
      source: 'Buku Matematika Kelas V · halaman 42',
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
