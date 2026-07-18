export type SchoolFeature = {
  title: string;
  body: string;
  icon: 'people' | 'bank' | 'template' | 'audit';
};
export type SchoolContent = {
  hero: { title: string; body: string; cta: string };
  dashboard: {
    eyebrow: string;
    school: string;
    active: string;
    quotaLabel: string;
    quota: string;
    bankLabel: string;
    bank: string;
    activityLabel: string;
    activities: readonly string[];
  };
  features: { eyebrow: string; title: string; items: readonly SchoolFeature[] };
  insight: {
    eyebrow: string;
    title: string;
    subjects: readonly string[];
    securityTitle: string;
    securityBody: string;
    securityMeta: string;
  };
  pilot: { title: string; steps: readonly { no: string; title: string; body: string }[] };
  final: { title: string; body: string; cta: string };
};

export const schoolContent: SchoolContent = {
  hero: {
    title: 'Workspace Organisasi untuk Institusi Sekolah',
    body: 'Sentralisasi pembuatan soal, manajemen akun guru, dan berbagi kuota AI dalam satu dasbor yang aman. Memastikan kualitas standar asesmen di seluruh departemen.',
    cta: 'school-discuss',
  },
  dashboard: {
    eyebrow: 'DASHBOARD SEKOLAH',
    school: 'SMA Nusantara Raya',
    active: 'Aktif: 42 Guru',
    quotaLabel: 'Kuota AI Terpakai',
    quota: '6,500 / 10,000 unit',
    bankLabel: 'Total Bank Soal',
    bank: '1,248 soal',
    activityLabel: 'Aktivitas Terkini',
    activities: [
      'Bu Rina (Matematika) mengekspor 40 soal · 2 menit lalu',
      'Pak Budi menambahkan Template UAS Ganjil · 1 jam lalu',
    ],
  },
  features: {
    eyebrow: 'FITUR ENTERPRISE',
    title: 'Kendali Penuh di Tangan Pendidik',
    items: [
      {
        title: 'Manajemen Akun & Kuota',
        body: 'Tambahkan atau hapus akses guru dengan mudah. Alokasikan kuota AI sesuai kebutuhan mata pelajaran.',
        icon: 'people',
      },
      {
        title: 'Bank Soal Internal',
        body: 'Simpan aset intelektual sekolah dalam repositori pribadi yang terenkripsi dan hanya dapat diakses staf internal.',
        icon: 'bank',
      },
      {
        title: 'Template Bersama',
        body: 'Samakan format header, font, dan branding ujian untuk seluruh kelas guna menjaga kredibilitas sekolah.',
        icon: 'template',
      },
      {
        title: 'Audit Trail',
        body: 'Pantau log aktivitas pembuatan dan ekspor soal secara transparan untuk meminimalisir kebocoran data.',
        icon: 'audit',
      },
    ],
  },
  insight: {
    eyebrow: 'Visual Insight',
    title: 'Pantau Progress Asesmen Secara Real-time',
    subjects: ['Matematika', 'B. Inggris', 'Fisika'],
    securityTitle: 'Keamanan Data Prioritas Utama',
    securityBody:
      'Enkripsi tingkat bank untuk setiap butir soal yang dibuat. Data sekolah Anda tetap menjadi milik sekolah Anda.',
    securityMeta: 'ISO 27001 Certified Infrastructure',
  },
  pilot: {
    title: 'Program Sekolah (Pilot)',
    steps: [
      {
        no: '1',
        title: 'Konsultasi Kebutuhan',
        body: 'Tim kami akan membantu memetakan kebutuhan jumlah guru dan volume asesmen bulanan sekolah Anda.',
      },
      {
        no: '2',
        title: 'Onboarding & Pelatihan',
        body: 'Sesi workshop eksklusif untuk guru agar mahir menggunakan asisten AI lembar dalam hitungan menit.',
      },
      {
        no: '3',
        title: 'Implementasi Bertahap',
        body: 'Mulai dengan satu departemen atau jenjang kelas sebelum diperluas ke seluruh institusi.',
      },
    ],
  },
  final: {
    title: 'Siap untuk digitalisasi asesmen sekolah?',
    body: 'Bergabunglah dengan puluhan institusi yang telah meningkatkan efisiensi guru hingga 70%.',
    cta: 'school-discuss',
  },
};
