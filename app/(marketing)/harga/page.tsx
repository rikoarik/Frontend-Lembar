import Link from 'next/link';
import type { Metadata } from 'next';
import { fetchMarketingPage } from '@/src/lib/marketing/fetchMarketingPage';
import { BlockRenderer } from '@/app/components/marketing/BlockRenderer';
import {
  fetchPublicPlans,
  formatPrice,
  formatTokenLimit,
  type PublicPlan,
} from '@/src/lib/api/plans';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lembar.id'),
  title: 'Harga lembar — paket untuk guru dan sekolah',
  description:
    'Paket Coba Gratis, Guru Pro, dan Sekolah & Institusi. Bandingkan kuota token, hak pakai, dan fitur kolaborasi untuk guru serta tim sekolah.',
  alternates: { canonical: '/harga' },
  openGraph: {
    title: 'Harga lembar — paket untuk guru dan sekolah',
    description: 'Bandingkan paket Coba Gratis, Guru Pro, dan Sekolah & Institusi. Tidak ada biaya tersembunyi.',
    url: '/harga',
    siteName: 'lembar',
    locale: 'id_ID',
    type: 'website',
    images: ['/og-image.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Harga lembar — paket untuk guru dan sekolah',
    description: 'Coba Gratis, Guru Pro, dan Sekolah & Institusi.',
    images: ['/og-image.svg'],
  },
  robots: { index: true, follow: true },
};

function CheckIcon() {
  return (
    <span
      className="material-symbols-outlined text-burgundy"
      style={{ fontVariationSettings: "'wght' 600" }}
      aria-hidden="true"
    >
      check_circle
    </span>
  );
}

function PlanCard({
  plan,
  isPopular,
  cta,
  ctaHref,
  subtitle,
}: {
  plan: PublicPlan;
  isPopular?: boolean;
  cta: string;
  ctaHref: string;
  subtitle: string;
}) {
  const isFree = plan.priceAmount === 0;
  return (
    <div
      className={`bento-card rounded-xl p-unit-6 flex flex-col page-shadow hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group cursor-pointer ${
        isPopular
          ? 'bg-ink text-white border border-ink relative overflow-hidden'
          : 'bg-surface border border-border-strong'
      }`}
    >
      {isPopular && (
        <div className="absolute top-unit-4 right-unit-4 bg-burgundy text-white px-unit-3 py-unit-1 rounded-full text-caption font-label-semibold">
          Populer
        </div>
      )}
      <div className="mb-unit-6">
        <h3 className={`font-h3 text-h3 mb-unit-1 ${isPopular ? 'text-white' : 'text-ink'}`}>
          {plan.displayName}
        </h3>
        <p className={`text-body-sm ${isPopular ? 'text-white/70' : 'text-secondary'}`}>{subtitle}</p>
      </div>
      <div className="mb-unit-8">
        <span className={`text-h2 font-h2 ${isPopular ? 'text-white' : 'text-ink'}`}>
          {isFree ? 'Rp0' : `Rp${new Intl.NumberFormat('id-ID').format(plan.priceAmount)}`}
        </span>
        <span className={`text-body-sm block mt-unit-1 ${isPopular ? 'text-white/70' : 'text-secondary'}`}>
          {isFree ? 'Gratis selamanya' : plan.billingPeriod === 'monthly' ? 'per bulan' : formatPrice(plan)}
        </span>
      </div>
      <div className="space-y-unit-4 mb-unit-12 flex-grow">
        <div className="flex items-start gap-unit-3">
          <CheckIcon />
          <span className={`text-body-default ${isPopular ? 'text-white' : 'text-ink'}`}>
            {formatTokenLimit(plan.tokenMonthlyLimit)} token generasi
          </span>
        </div>
        {plan.features.map((feat) => (
          <div key={feat} className="flex items-start gap-unit-3">
            <CheckIcon />
            <span className={`text-body-default ${isPopular ? 'text-white' : 'text-ink'}`}>{feat}</span>
          </div>
        ))}
        {isFree && (
          <div className="flex items-start gap-unit-3">
            <CheckIcon />
            <span className="text-body-default text-ink">Tanpa kartu kredit</span>
          </div>
        )}
      </div>
      <Link
        className={`w-full font-label-semibold h-[44px] rounded-lg active:scale-95 transition-all duration-300 flex items-center justify-center ${
          isPopular
            ? 'bg-burgundy text-white hover:brightness-110'
            : 'border-2 border-burgundy text-burgundy group-hover:bg-burgundy group-hover:text-white'
        }`}
        href={ctaHref}
      >
        {cta}
      </Link>
    </div>
  );
}

export default async function HargaPage() {
  const cmsDoc = await fetchMarketingPage('harga');
  if (cmsDoc) {
    return <BlockRenderer blocks={cmsDoc.blocks} />;
  }

  // Fetch canonical catalog server-side; falls back to CANONICAL_FALLBACK if unreachable
  const plans = await fetchPublicPlans();
  const freePlan = plans.find((p) => p.key === 'free') ?? plans[0];
  const proPlan = plans.find((p) => p.key === 'pro') ?? plans[1];

  return (
    <>
      <div className="min-h-screen">
        <header className="py-unit-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
          <div className="inline-block px-unit-3 py-unit-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-label-semibold text-caption mb-unit-6">
            Paket Harga
          </div>
          <h1 className="font-h1 text-h1 text-ink mb-unit-4 max-w-[800px] mx-auto">
            Pilih paket yang sesuai untuk kebutuhan mengajar Anda.
          </h1>
          <p className="font-body-lead text-body-lead text-secondary max-w-reading-max mx-auto">
            Solusi cerdas untuk pembuatan asesmen berkualitas tinggi, dirancang untuk efisiensi dan ketelitian pendidik.
          </p>
        </header>

        <section className="pb-unit-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-unit-6 max-w-container-max mx-auto">
            {freePlan && (
              <PlanCard
                plan={freePlan}
                cta="Mulai Gratis"
                ctaHref="/daftar"
                subtitle="Untuk mencoba fitur dasar kami."
              />
            )}
            {proPlan && (
              <PlanCard
                plan={proPlan}
                isPopular
                cta="Mulai Pro"
                ctaHref="/daftar"
                subtitle="Untuk guru aktif dengan kebutuhan penuh."
              />
            )}

            {/* School plan: always contact-custom, no executable quota */}
            <div className="bento-card bg-surface border border-border-strong rounded-xl p-unit-6 flex flex-col page-shadow hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className="mb-unit-6">
                <h3 className="font-h3 text-h3 text-ink mb-unit-1">Sekolah &amp; Institusi</h3>
                <p className="text-secondary text-body-sm">Untuk tim sekolah dan institusi pendidikan.</p>
              </div>
              <div className="mb-unit-8">
                <span className="text-h2 font-h2 text-ink">Hubungi Kami</span>
                <span className="text-secondary text-body-sm block mt-unit-1">Harga disesuaikan kebutuhan</span>
              </div>
              <div className="space-y-unit-4 mb-unit-12 flex-grow">
                <div className="flex items-start gap-unit-3">
                  <CheckIcon />
                  <span className="text-body-default text-ink">Kuota token kolektif untuk tim</span>
                </div>
                <div className="flex items-start gap-unit-3">
                  <CheckIcon />
                  <span className="text-body-default text-ink">Manajemen guru &amp; kelas</span>
                </div>
                <div className="flex items-start gap-unit-3">
                  <CheckIcon />
                  <span className="text-body-default text-ink">Onboarding &amp; dukungan langsung</span>
                </div>
                <div className="flex items-start gap-unit-3">
                  <CheckIcon />
                  <span className="text-body-default text-ink">SLA &amp; laporan penggunaan</span>
                </div>
              </div>
              <Link
                className="w-full border-2 border-burgundy text-burgundy font-label-semibold h-[44px] rounded-lg group-hover:bg-burgundy group-hover:text-white active:scale-95 transition-all duration-300 flex items-center justify-center"
                href="/kontak"
              >
                Diskusikan kebutuhan sekolah
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ billing */}
        <section className="pb-unit-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="max-w-[640px] mx-auto">
            <h2 className="font-h2 text-h2 text-ink mb-unit-8 text-center">Pertanyaan umum</h2>
            <div className="space-y-unit-6">
              <div>
                <h3 className="font-label-semibold text-body-lead text-ink mb-unit-2">
                  Apa itu token generasi?
                </h3>
                <p className="text-body-default text-secondary">
                  Token adalah unit komputasi AI yang digunakan saat Anda membuat soal. Paket Gratis mendapat{' '}
                  {freePlan ? new Intl.NumberFormat('id-ID').format(freePlan.tokenMonthlyLimit ?? 0) : '60.000'} token
                  per bulan. Paket Pro tidak terbatas.
                </p>
              </div>
              <div>
                <h3 className="font-label-semibold text-body-lead text-ink mb-unit-2">
                  Apakah ada biaya tersembunyi?
                </h3>
                <p className="text-body-default text-secondary">
                  Tidak. Harga yang tertera adalah harga final. Pembayaran dilakukan via QRIS.
                </p>
              </div>
              <div>
                <h3 className="font-label-semibold text-body-lead text-ink mb-unit-2">
                  Bagaimana cara upgrade ke Pro?
                </h3>
                <p className="text-body-default text-secondary">
                  Masuk ke akun Anda → Pengaturan → Paket &amp; Kuota, lalu klik tombol Upgrade ke Pro untuk
                  melakukan pembayaran.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-unit-16 px-margin-mobile md:px-margin-desktop">
          <div className="bg-ink rounded-2xl py-unit-16 px-unit-8 md:px-unit-16 max-w-container-max mx-auto text-center">
            <h2 className="font-h2 text-h2 text-white mb-unit-6 relative z-10">
              Siap untuk mulai merancang asesmen lebih baik?
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-unit-4 relative z-10">
              <Link
                className="bg-burgundy text-white px-unit-12 h-[52px] rounded-lg font-label-semibold text-body-lead hover:brightness-110 transition-all flex items-center"
                href="/daftar"
              >
                Daftar Sekarang
              </Link>
              <Link
                className="border border-surface-variant text-white px-unit-12 h-[52px] rounded-lg font-label-semibold text-body-lead hover:bg-white/10 transition-all flex items-center"
                href="/kontak"
              >
                Jadwalkan Demo
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
