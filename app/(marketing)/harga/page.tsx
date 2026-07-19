import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';
import Link from 'next/link';

type FaqEntry = {
  q: string;
  a: React.ReactNode;
};

type PlanCard = {
  name: string;
  audience: string;
  positioning: string;
  bullets: string[];
  cta: { label: string; href: string };
  emphasised?: boolean;
};

const plans: PlanCard[] = [
  {
    name: 'Coba Gratis',
    audience: 'Guru',
    positioning:
      'Mengenal alur generate, tinjau, dan cetak pada satu paket soal. Tidak memerlukan kartu.',
    bullets: ['Satu paket soal aktif', 'Akses ke katalog kurikulum MVP', 'Cetak dan unduh PDF pada versi final'],
    cta: { label: 'Mulai gratis', href: '/daftar' },
  },
  {
    name: 'Guru Pro',
    audience: 'Guru',
    positioning:
      'Kuota paket per bulan, bank soal privat, dan template yang dapat digunakan ulang.',
    bullets: [
      'Kuota paket per bulan (nilai diumumkan setelah D-009 diterima)',
      'Riwayat lembar, bank soal privat, dan template pribadi',
      'Cetak, unduh PDF, dan bagikan tautan read-only',
    ],
    cta: { label: 'Daftar tunggu', href: '/kontak' },
    emphasised: true,
  },
  {
    name: 'Untuk Sekolah',
    audience: 'Sekolah dan institusi',
    positioning:
      'Workspace organisasi dengan kursi bersama, template sekolah, dan kontrol admin.',
    bullets: [
      'Undangan guru dan pengelolaan kursi',
      'Template sekolah, bank soal internal, dan branding pada output',
      'Kontak melalui program percontohan terstruktur',
    ],
    cta: { label: 'Bicara dengan tim', href: '/kontak' },
  },
];

const billingFaqs: FaqEntry[] = [
  {
    q: 'Apa beda paket perorangan dan paket sekolah?',
    a: 'Paket perorangan dipakai oleh satu akun guru pada workspace pribadi. Paket sekolah menyediakan workspace organisasi dengan kursi bersama dan kuota yang dapat diatur admin. Keduanya tidak memperlihatkan aktivitas pribadi satu guru kepada admin sekolah.',
  },
  {
    q: 'Bagaimana cara menurunkan paket atau membatalkan langganan?',
    a: 'Detail penurunan paket, pembatalan, dan sisa kuota akan diumumkan setelah keputusan harga diterima. Pada tahap ini tampilan UI tidak menampilkan nominal atau jadwal tagihan.',
  },
  {
    q: 'Bagaimana jika kuota saya habis di tengah periode?',
    a: 'Pembuatan soal hanya memotong kuota saat draft dapat diedit. Jika proses gagal sebelum draft dihasilkan, kuota tidak berkurang. Setelah paket final, lembar tidak memotong kuota tambahan.',
  },
  {
    q: 'Apakah data lembar dan soal saya tetap tersimpan setelah berhenti berlangganan?',
    a: 'Riwayat lembar dan bank soal privat tetap tersimpan setelah langganan berakhir. Akses tulis mengikuti paket aktif pada saat itu. Rincian retensi dan penghapusan didokumentasikan pada halaman Kebijakan Privasi.',
  },
  {
    q: 'Kapan harga dan tanggal penagihan akan ditampilkan?',
    a: 'Setelah keputusan harga dan paket diterima, halaman ini akan menampilkan nominal, periode tagihan, dan pajak yang berlaku. Sampai saat itu, UI hanya menampilkan tombol Coba Gratis dan Hubungi Kami.',
  },
  {
    q: 'Bagaimana menghubungi tim untuk paket sekolah?',
    a: 'Gunakan halaman Kontak atau halaman Untuk Sekolah. Tim kami akan menghubungi Anda untuk mendiskusikan kebutuhan jumlah guru, volume asesmen, dan jadwal percontohan.',
  },
];

function PricingFaqList({ items }: { items: FaqEntry[] }) {
  return (
    <div className="flex flex-col gap-unit-3">
      {items.map((faq, i) => (
        <details
          key={i}
          className="bg-paper border border-border-strong rounded-xl overflow-hidden group"
        >
          <summary className="flex items-center justify-between cursor-pointer px-unit-6 py-unit-5 font-label-semibold text-body-default text-ink hover:bg-surface transition-colors select-none">
            <span>{faq.q}</span>
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-secondary text-[20px] group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-unit-4"
            >
              expand_more
            </span>
          </summary>
          <div className="px-unit-6 pb-unit-5 text-secondary text-body-sm leading-relaxed border-t border-border-subtle">
            <p className="pt-unit-4">{faq.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

export default function HargaPage() {
  return (
    <MarketingSubPageLayout
      title="Pilih paket yang sesuai untuk kebutuhan mengajar Anda."
      description="lembar membedakan paket berdasarkan peran dan cara pemakaian, bukan berdasarkan daftar harga dekoratif. Nominal dan jadwal tagihan akan ditambahkan setelah keputusan harga diterima."
      badge="Harga"
    >
      {/* Packaging placeholder — neutral, no nominal */}
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-unit-6">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={[
                  'flex flex-col bg-paper border rounded-2xl p-unit-8 transition-colors',
                  plan.emphasised
                    ? 'border-burgundy/40 ring-1 ring-burgundy/20'
                    : 'border-border-strong',
                ].join(' ')}
                aria-labelledby={`plan-${plan.name.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div className="mb-unit-6">
                  <span className="text-caption font-label-semibold text-secondary uppercase tracking-wider">
                    {plan.audience}
                  </span>
                  <h2
                    id={`plan-${plan.name.replace(/\s+/g, '-').toLowerCase()}`}
                    className="font-h3 text-h3 text-ink mt-unit-2"
                  >
                    {plan.name}
                  </h2>
                  <p className="text-secondary text-body-sm mt-unit-2">{plan.positioning}</p>
                </div>
                <ul className="space-y-unit-3 mb-unit-10 flex-grow">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-unit-3">
                      <span
                        aria-hidden="true"
                        className="material-symbols-outlined text-burgundy text-[20px]"
                        style={{ fontVariationSettings: "'wght' 600" }}
                      >
                        check_circle
                      </span>
                      <span className="text-body-default text-ink">{bullet}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.cta.href}
                  className={[
                    'w-full font-label-semibold h-[44px] rounded-lg flex items-center justify-center transition-all',
                    plan.emphasised
                      ? 'bg-burgundy text-on-primary hover:brightness-110'
                      : 'border-2 border-burgundy text-burgundy hover:bg-burgundy hover:text-on-primary',
                  ].join(' ')}
                >
                  {plan.cta.label}
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-unit-10 max-w-reading-max mx-auto text-center p-unit-6 rounded-xl border border-border-subtle bg-paper">
            <p className="text-body-default text-secondary">
              Harga dan masa penagihan belum ditampilkan. Halaman ini akan diperbarui setelah keputusan diterima — tampilan tidak pernah memamerkan harga hipotetis atau harga coret yang tidak berlaku.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="py-unit-16 bg-paper">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-unit-12">
            <div className="md:col-span-1">
              <h2 className="font-h2 text-h2 text-ink mb-unit-4">
                Pertanyaan seputar paket dan penagihan
              </h2>
              <p className="text-body-default text-secondary mb-unit-6">
                Jawaban untuk pertanyaan yang umum kami terima sebelum keputusan harga diumumkan.
              </p>
              <Link
                href="/bantuan"
                className="text-burgundy font-label-semibold inline-flex items-center gap-unit-2 group"
              >
                Buka Pusat Bantuan
                <span className="material-symbols-outlined group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
            <div className="md:col-span-2">
              <PricingFaqList items={billingFaqs} />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA — heading/CTA preserved for smoke */}
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="bg-ink rounded-2xl p-unit-12 text-center">
          <h2 className="font-h2 text-h2 text-white mb-unit-6">
            Siap untuk mulai merancang asesmen lebih baik?
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-unit-4">
            <Link
              href="/daftar"
              className="bg-burgundy text-white px-unit-10 h-[52px] rounded-lg font-label-semibold text-body-lead hover:brightness-110 transition-all flex items-center"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/kontak"
              className="border border-surface-variant text-white px-unit-10 h-[52px] rounded-lg font-label-semibold text-body-lead hover:bg-white/10 transition-all flex items-center"
            >
              Bicara dengan Tim
            </Link>
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
