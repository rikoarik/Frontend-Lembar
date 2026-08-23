import Link from 'next/link';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { fetchMarketingPage } from '@/src/lib/marketing/fetchMarketingPage';
import { BlockRenderer } from '@/app/components/marketing/BlockRenderer';
import { getMarketingSession } from '@/src/lib/api/marketingSession';
import JsonLd from '@/app/components/marketing/JsonLd';
import { marketingMetadata } from '@/src/lib/marketing/marketingMetadata';
import { fetchPublicPlans, type PublicPlan } from '@/src/lib/api/plans';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await marketingMetadata('home', {
    title: 'Generator Soal AI untuk Guru — lembar',
    description:
      'Generator soal otomatis berbasis AI untuk guru Indonesia. Buat draft ujian, ulangan, dan latihan dari materi atau PDF, lalu tinjau sebelum digunakan.',
    canonical: '/',
  });

  return {
    ...metadata,
    keywords: [
      'generator soal',
      'generator soal ai',
      'pembuat soal otomatis',

      'membuat soal dengan ai',
      'generator ujian',
      'buat soal otomatis',
      'generator soal kurikulum merdeka',
      'ai untuk guru',
      'generator soal untuk guru',
      'aplikasi buat soal',
      'software generator soal',
    ],
  };
}

type LandingPricingCopy = {
  emptyTitle: string;
  emptyBody: string;
  viewPlans: string;
  title: string;
  body: string;
  details: string;
  freePrice: string;
  tokenQuota: (values: { count: string }) => string;
  quotaFromCatalog: string;
  schoolName: string;
  schoolPrice: string;
  schoolBody: string;
};

function LivePlanCatalog({
  plans,
  copy,
  locale,
}: {
  plans: PublicPlan[];
  copy: LandingPricingCopy;
  locale: string;
}) {
  if (plans.length === 0) {
    return (
      <section className="py-16 px-margin-mobile md:px-margin-desktop bg-surface-container">
        <div className="max-w-container-max mx-auto text-center">
          <h2 className="font-display-lg text-display-lg text-ink mb-4">{copy.emptyTitle}</h2>
          <p className="text-body-lead text-secondary max-w-2xl mx-auto">{copy.emptyBody}</p>
          <Link
            href="/harga"
            className="mt-6 inline-flex font-label-semibold text-burgundy underline"
          >
            {copy.viewPlans}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-margin-mobile md:px-margin-desktop bg-surface-container">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display-lg text-display-lg text-ink mb-4">{copy.title}</h2>
          <p className="text-body-lead text-secondary max-w-2xl mx-auto">{copy.body}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-container-max mx-auto">
          {(['free', 'pro', 'plus'] as const).map((key) => {
            const plan = plans.find((item) => item.key === key);
            if (!plan) return null;
            return (
              <article
                key={plan.key}
                className="rounded-xl border border-border-subtle bg-surface p-5 text-left"
              >
                <h3 className="font-label-large text-label-large text-ink">{plan.displayName}</h3>
                <p className="mt-2 font-h3 text-h3 text-ink">
                  {plan.priceAmount === 0
                    ? copy.freePrice
                    : new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
                        style: 'currency',
                        currency: plan.currency,
                        maximumFractionDigits: 0,
                      }).format(plan.priceAmount)}
                </p>
                <p className="mt-2 text-body-sm text-secondary">
                  {plan.tokenMonthlyLimit === null
                    ? copy.quotaFromCatalog
                    : copy.tokenQuota({
                        count: new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US').format(
                          plan.tokenMonthlyLimit,
                        ),
                      })}
                </p>
              </article>
            );
          })}
          <article className="rounded-xl border border-border-subtle bg-surface p-5 text-left">
            <h3 className="font-label-large text-label-large text-ink">{copy.schoolName}</h3>
            <p className="mt-2 font-h3 text-h3 text-ink">{copy.schoolPrice}</p>
            <p className="mt-2 text-body-sm text-secondary">{copy.schoolBody}</p>
          </article>
        </div>
        <div className="mt-8 text-center">
          <Link href="/harga" className="font-label-semibold text-burgundy underline">
            {copy.details}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function LandingPage() {
  const [session, cmsDoc, plans, t, locale] = await Promise.all([
    getMarketingSession(),
    fetchMarketingPage('home'),
    fetchPublicPlans(),
    getTranslations('pricing.landing'),
    getLocale(),
  ]);
  const pricingCopy: LandingPricingCopy = {
    emptyTitle: t('emptyTitle'),
    emptyBody: t('emptyBody'),
    viewPlans: t('viewPlans'),
    title: t('title'),
    body: t('body'),
    details: t('details'),
    freePrice: t('freePrice'),
    tokenQuota: ({ count }) => t('tokenQuota', { count }),
    quotaFromCatalog: t('quotaFromCatalog'),
    schoolName: t('schoolName'),
    schoolPrice: t('schoolPrice'),
    schoolBody: t('schoolBody'),
  };
  const primaryHref = session?.homePath ?? '/daftar';
  const primaryLabel = session ? 'Buka workspace' : 'Mulai membuat soal';
  if (cmsDoc) {
    return (
      <>
        <BlockRenderer blocks={cmsDoc.blocks.filter((block) => block.type !== 'pricing')} />
        <LivePlanCatalog plans={plans} copy={pricingCopy} locale={locale} />
      </>
    );
  }
  return (
    <>
      <JsonLd
        schema={[
          {
            '@type': 'SoftwareApplication',
            '@id': 'https://app.lembar.web.id/#app',
            name: 'lembar',
            applicationCategory: 'EducationApplication',
            operatingSystem: 'Web',
            url: 'https://app.lembar.web.id',
            description:
              'Generator soal otomatis berbasis AI untuk guru Indonesia. Buat soal ujian, ulangan, dan latihan dari materi kurikulum atau PDF.',

            inLanguage: 'id',
          },
          {
            '@type': 'Organization',
            '@id': 'https://app.lembar.web.id/#org',
            name: 'lembar',
            url: 'https://app.lembar.web.id',
          },
        ]}
      />
      <main className="flex-grow">
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
            <div className="lg:col-span-5 flex flex-col gap-6 relative z-10">
              <span className="font-label-semibold text-label-semibold text-secondary uppercase tracking-wider">
                Generator soal AI untuk guru Indonesia
              </span>
              <h1 className="font-display-xl-mobile md:font-display-xl text-display-xl-mobile md:text-display-xl text-ink leading-tight">
                Buat soal ujian otomatis dari materi kurikulum atau PDF Anda
              </h1>
              <p className="font-body-lead text-body-lead text-secondary max-w-md">
                Generator soal berbasis AI yang menghasilkan draft ujian, ulangan, dan latihan dari
                Buku Siswa atau materi Anda. Tinjau setiap butir soal sebelum cetak atau bagikan.
                Harga dan kuota mengikuti katalog paket yang sedang aktif.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <Link
                  className="font-label-semibold text-label-semibold bg-burgundy text-white px-6 py-3 rounded h-[44px] flex items-center justify-center transition-colors hover:bg-primary shadow-sm"
                  href={primaryHref}
                >
                  {primaryLabel}
                </Link>
                <a
                  className="font-label-semibold text-label-semibold text-ink border border-ink px-6 py-3 rounded h-[44px] flex items-center justify-center transition-colors hover:bg-surface-container-highest"
                  href="#contoh-hasil"
                >
                  Lihat contoh hasil generator
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
                  <span className="material-symbols-outlined text-[14px] text-primary" aria-hidden>
                    check_circle
                  </span>
                  <span className="font-label-semibold text-label-semibold text-secondary">
                    Draft AI siap tinjau
                  </span>
                </div>

                <div className="space-y-4 text-caption text-secondary">
                  <div className="flex items-start gap-2">
                    <span
                      className="material-symbols-outlined text-[20px] text-primary mt-0.5"
                      aria-hidden
                    >
                      quiz
                    </span>
                    <div className="flex-1">
                      <h3 className="font-label-semibold text-label-semibold text-ink mb-1">
                        Generator soal pilihan ganda dan esai
                      </h3>
                      <p>Buat soal PG, esai, atau campuran otomatis dari materi yang Anda pilih</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span
                      className="material-symbols-outlined text-[20px] text-primary mt-0.5"
                      aria-hidden
                    >
                      auto_stories
                    </span>
                    <div className="flex-1">
                      <h3 className="font-label-semibold text-label-semibold text-ink mb-1">
                        Dari kurikulum atau PDF
                      </h3>
                      <p>
                        Upload materi, pilih topik dari katalog kurikulum, atau gabungkan keduanya
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span
                      className="material-symbols-outlined text-[20px] text-primary mt-0.5"
                      aria-hidden
                    >
                      fact_check
                    </span>
                    <div className="flex-1">
                      <h3 className="font-label-semibold text-label-semibold text-ink mb-1">
                        Tinjau sebelum pakai
                      </h3>
                      <p>Setiap soal bisa diedit, regenerate, atau dihapus sebelum final</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span
                      className="material-symbols-outlined text-[20px] text-primary mt-0.5"
                      aria-hidden
                    >
                      print
                    </span>
                    <div className="flex-1">
                      <h3 className="font-label-semibold text-label-semibold text-ink mb-1">
                        Cetak atau bagikan link
                      </h3>
                      <p>Download PDF siap cetak atau buat link aman untuk dibagikan ke siswa</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-margin-mobile md:px-margin-desktop bg-surface-container">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-display-lg text-display-lg text-ink text-center mb-12">
              Cara kerja generator soal AI lembar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed mb-4">
                  <span
                    className="material-symbols-outlined text-[28px] text-on-primary-fixed"
                    aria-hidden
                  >
                    upload_file
                  </span>
                </div>
                <h3 className="font-label-large text-label-large text-ink mb-2">1. Pilih materi</h3>
                <p className="text-body-medium text-secondary">
                  Upload PDF materi Anda atau pilih topik dari katalog kurikulum Merdeka dan K-13
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed mb-4">
                  <span
                    className="material-symbols-outlined text-[28px] text-on-primary-fixed"
                    aria-hidden
                  >
                    auto_awesome
                  </span>
                </div>
                <h3 className="font-label-large text-label-large text-ink mb-2">
                  2. Generate draft soal
                </h3>
                <p className="text-body-medium text-secondary">
                  AI membuat draft soal berdasarkan materi, lengkap dengan kunci jawaban dan
                  referensi sumber
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed mb-4">
                  <span
                    className="material-symbols-outlined text-[28px] text-on-primary-fixed"
                    aria-hidden
                  >
                    task_alt
                  </span>
                </div>
                <h3 className="font-label-large text-label-large text-ink mb-2">
                  3. Tinjau & finalkan
                </h3>
                <p className="text-body-medium text-secondary">
                  Periksa, edit, atau regenerate soal sampai puas, lalu cetak atau bagikan link aman
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <h2 className="font-display-lg text-display-lg text-ink text-center mb-4">
            Kenapa guru pilih generator soal lembar?
          </h2>
          <p className="text-body-lead text-secondary text-center max-w-2xl mx-auto mb-12">
            Generator soal AI yang dirancang khusus untuk guru Indonesia, dengan kuota yang jelas
            untuk setiap paket.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-border-subtle rounded-DEFAULT p-6 bg-surface">
              <h3 className="font-label-large text-label-large text-ink mb-2">
                ✓ Paket Gratis dengan kuota jelas
              </h3>
              <p className="text-body-medium text-secondary">
                Mulai tanpa kartu kredit. Kuota generasi per bulan dan opsi trial ditampilkan
                transparan di halaman paket.
              </p>
            </div>
            <div className="border border-border-subtle rounded-DEFAULT p-6 bg-surface">
              <h3 className="font-label-large text-label-large text-ink mb-2">
                ✓ Kontrol penuh di tangan guru
              </h3>
              <p className="text-body-medium text-secondary">
                Draft AI selalu ditinjau guru. Edit, regenerate, hapus soal sesuka Anda sebelum
                final.
              </p>
            </div>
            <div className="border border-border-subtle rounded-DEFAULT p-6 bg-surface">
              <h3 className="font-label-large text-label-large text-ink mb-2">
                ✓ Katalog kurikulum lengkap
              </h3>
              <p className="text-body-medium text-secondary">
                Pilih topik dari Kurikulum Merdeka atau K-13, atau upload materi sendiri.
              </p>
            </div>
            <div className="border border-border-subtle rounded-DEFAULT p-6 bg-surface">
              <h3 className="font-label-large text-label-large text-ink mb-2">
                ✓ Hasil siap pakai
              </h3>
              <p className="text-body-medium text-secondary">
                PDF siap cetak atau link bagikan yang aman, tanpa iklan atau watermark.
              </p>
            </div>
          </div>
        </section>

        <LivePlanCatalog plans={plans} copy={pricingCopy} locale={locale} />

        <section className="py-16 px-margin-mobile md:px-margin-desktop bg-surface-container">
          <div className="max-w-container-max mx-auto text-center">
            <h2 className="font-display-lg text-display-lg text-ink mb-4">
              Mulai buat soal otomatis sekarang
            </h2>
            <p className="text-body-lead text-secondary max-w-2xl mx-auto mb-8">
              Generator soal AI untuk guru Indonesia. Daftar gratis, langsung buat soal tanpa kartu
              kredit.
            </p>
            <Link
              className="inline-flex font-label-semibold text-label-semibold bg-burgundy text-white px-8 py-4 rounded h-[52px] items-center justify-center transition-colors hover:bg-primary shadow-sm"
              href={primaryHref}
            >
              {session ? 'Buka workspace' : 'Daftar & buat soal gratis'}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
