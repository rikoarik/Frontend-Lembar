export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  price: string;
  cadence: string;
  features: readonly string[];
  cta: string;
  popular?: string;
};
export type PricingFaq = { question: string; answer: string };
export type PricingContent = {
  hero: { badge: string; title: string; body: string };
  plans: readonly PricingPlan[];
  transparency: { title: string; body: string };
  faq: { title: string; body: string; link: string; items: readonly PricingFaq[] };
  final: { title: string; primaryCta: string; secondaryCta: string };
};

export const pricingContent: PricingContent = {
  hero: {
    badge: 'Pricing Plans',
    title: 'Pilih paket yang sesuai untuk kebutuhan mengajar Anda.',
    body: 'Solusi cerdas untuk pembuatan asesmen berkualitas tinggi, dirancang untuk efisiensi dan ketelitian pendidik.',
  },
  plans: [
    {
      id: 'free',
      name: 'Coba Gratis',
      description: 'Untuk mencoba fitur dasar kami.',
      price: 'Rp0',
      cadence: 'Gratis selamanya',
      features: ['2 paket asesmen lengkap', 'Batas ekspor terbatas', 'Tanpa kartu kredit'],
      cta: 'start-free',
    },
    {
      id: 'pro',
      name: 'Guru Pro',
      description: 'Produktivitas maksimal untuk pengajar.',
      price: 'Rp49.000',
      cadence: 'per bulan',
      features: [
        'Kuota 20 paket/bulan',
        'History tak terbatas',
        'Template pribadi & Bank soal privat',
        'Ekspor DOCX & PDF',
      ],
      cta: 'subscribe',
      popular: 'PALING POPULER',
    },
    {
      id: 'school',
      name: 'Sekolah & Institusi',
      description: 'Kolaborasi tim dan kontrol institusi.',
      price: 'Hubungi Kami',
      cadence: 'Harga kustom sesuai kebutuhan',
      features: [
        'Shared quota seluruh guru',
        'Admin dashboard & analitik',
        'Bank soal sekolah',
        'Onboarding & support khusus',
        'Branding sekolah pada output',
      ],
      cta: 'pilot',
    },
  ],
  transparency: {
    title: 'Catatan Transparansi',
    body: 'Tidak ada biaya tersembunyi. Kuota hanya terpotong untuk generasi soal yang berhasil. Kami menghargai integritas akademik dan transparansi biaya bagi setiap sekolah.',
  },
  faq: {
    title: 'Pertanyaan Seputar Tagihan',
    body: 'Informasi lebih detail mengenai bagaimana kami mengelola kuota dan pembayaran Anda.',
    link: 'Pusat Bantuan Lengkap',
    items: [
      {
        question: 'Bagaimana sistem pemotongan kuota bekerja?',
        answer:
          'Kuota hanya akan berkurang saat sistem AI berhasil memberikan draft soal yang dapat diedit. Jika terjadi kegagalan teknis saat proses generasi, kuota Anda tidak akan berkurang.',
      },
      {
        question: 'Apakah ada batasan jumlah guru untuk paket Institusi?',
        answer:
          'Tidak ada batas minimum atau maksimum yang kaku. Kami menyesuaikan paket berdasarkan jumlah lisensi aktif yang dibutuhkan oleh sekolah Anda agar lebih efisien secara biaya.',
      },
      {
        question: 'Bisakah saya melakukan upgrade di tengah periode?',
        answer:
          'Tentu. Anda dapat meningkatkan kuota atau berpindah ke paket tim kapan saja. Selisih biaya akan dihitung secara pro-rata agar tetap adil bagi Anda.',
      },
    ],
  },
  final: {
    title: 'Siap untuk mulai merancang asesmen lebih baik?',
    primaryCta: 'register-now',
    secondaryCta: 'schedule-demo',
  },
};
