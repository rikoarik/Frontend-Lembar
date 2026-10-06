import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { fetchMarketingPage } from '@/src/lib/marketing/fetchMarketingPage';
import { BlockRenderer } from '@/app/components/marketing/BlockRenderer';
import { getMarketingSession } from '@/src/lib/api/marketingSession';
import JsonLd from '@/app/components/marketing/JsonLd';
import { marketingMetadata } from '@/src/lib/marketing/marketingMetadata';
import { fetchPublicPlans, type PublicPlan } from '@/src/lib/api/plans';
import type { NumberFormat } from '@/src/i18n/formats';
import { getLocaleFormat } from '@/src/i18n/formatServer';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketing.home.meta');
  const metadata = await marketingMetadata('home', {
    title: t('title'),
    description: t('description'),
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

const FEATURE_ICONS = ['quiz', 'auto_stories', 'fact_check', 'print'] as const;
const STEP_ICONS = ['upload_file', 'auto_awesome', 'task_alt'] as const;
const BENEFIT_KEYS = ['0', '1', '2', '3'] as const;

const HOME_SCHEMA = (description: string, pageName: string) => [
  {
    '@type': 'Organization',
    '@id': 'https://app.lembar.web.id/#organization',
    name: 'Lembar',
    url: 'https://app.lembar.web.id',
    logo: 'https://app.lembar.web.id/lembar/logo-mark.png',
  },
  {
    '@type': 'WebSite',
    '@id': 'https://app.lembar.web.id/#website',
    name: 'Lembar',
    url: 'https://app.lembar.web.id',
    inLanguage: 'id-ID',
    publisher: { '@id': 'https://app.lembar.web.id/#organization' },
  },
  {
    '@type': 'SoftwareApplication',
    '@id': 'https://app.lembar.web.id/#software',
    name: 'Lembar',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    url: 'https://app.lembar.web.id',
    description,
    inLanguage: 'id-ID',
    publisher: { '@id': 'https://app.lembar.web.id/#organization' },
  },
  {
    '@type': 'WebPage',
    '@id': 'https://app.lembar.web.id/#webpage',
    url: 'https://app.lembar.web.id',
    name: pageName,
    inLanguage: 'id-ID',
    isPartOf: { '@id': 'https://app.lembar.web.id/#website' },
    about: { '@id': 'https://app.lembar.web.id/#software' },
  },
];

type LandingPricingCopy = {
  emptyTitle: string;
  emptyBody: string;
  viewPlans: string;
  title: string;
  body: string;
  details: string;
  freePrice: string;
  quotaPerMonth: (values: { count: string }) => string;
  quotaFromCatalog: string;
  schoolName: string;
  schoolPrice: string;
  schoolBody: string;
};

function LivePlanCatalog({
  plans,
  copy,
  number,
}: {
  plans: PublicPlan[];
  copy: LandingPricingCopy;
  number: NumberFormat;
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
                    : number(plan.priceAmount, {
                        style: 'currency',
                        currency: plan.currency,
                        maximumFractionDigits: 0,
                      })}
                </p>
                <p className="mt-2 text-body-sm text-secondary">
                  {plan.tokenMonthlyLimit === null
                    ? copy.quotaFromCatalog
                    : copy.quotaPerMonth({ count: number(plan.tokenMonthlyLimit) })}
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
  const [session, cmsDoc, plans, t, th] = await Promise.all([
    getMarketingSession(),
    fetchMarketingPage('home'),
    fetchPublicPlans(),
    getTranslations('pricing.landing'),
    getTranslations('marketing.home'),
  ]);
  const { number } = await getLocaleFormat();
  const pricingCopy: LandingPricingCopy = {
    emptyTitle: t('emptyTitle'),
    emptyBody: t('emptyBody'),
    viewPlans: t('viewPlans'),
    title: t('title'),
    body: t('body'),
    details: t('details'),
    freePrice: t('freePrice'),
    quotaPerMonth: ({ count }) => t('quotaPerMonth', { count }),
    quotaFromCatalog: t('quotaFromCatalog'),
    schoolName: t('schoolName'),
    schoolPrice: t('schoolPrice'),
    schoolBody: t('schoolBody'),
  };
  const primaryHref = session?.homePath ?? '/daftar';
  const primaryLabel = session ? th('primaryCtaSession') : th('primaryCta');
  const homeSchema = HOME_SCHEMA(th('schemaDescription'), th('schemaPageName'));
  if (cmsDoc) {
    return (
      <>
        <JsonLd schema={homeSchema} />
        <BlockRenderer blocks={cmsDoc.blocks.filter((block) => block.type !== 'pricing')} />
        <LivePlanCatalog plans={plans} copy={pricingCopy} number={number} />
      </>
    );
  }
  return (
    <>
      <JsonLd schema={homeSchema} />
      <main className="flex-grow">
        <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
            <div className="lg:col-span-5 flex flex-col gap-6 relative z-10">
              <span className="font-label-semibold text-label-semibold text-secondary uppercase tracking-wider">
                {th('eyebrow')}
              </span>
              <h1 className="font-display-xl-mobile md:font-display-xl text-display-xl-mobile md:text-display-xl text-ink leading-tight">
                {th('title')}
              </h1>
              <p className="font-body-lead text-body-lead text-secondary max-w-md">{th('body')}</p>
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
                  {th('secondaryCta')}
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
                    {th('cardBadge')}
                  </span>
                </div>

                <div className="space-y-4 text-caption text-secondary">
                  {FEATURE_ICONS.map((icon, index) => (
                    <div key={icon} className="flex items-start gap-2">
                      <span
                        className="material-symbols-outlined text-[20px] text-primary mt-0.5"
                        aria-hidden
                      >
                        {icon}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-label-semibold text-label-semibold text-ink mb-1">
                          {th(`features.${index}.title`)}
                        </h3>
                        <p>{th(`features.${index}.body`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-margin-mobile md:px-margin-desktop bg-surface-container">
          <div className="max-w-container-max mx-auto">
            <h2 className="font-display-lg text-display-lg text-ink text-center mb-12">
              {th('howTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEP_ICONS.map((icon, index) => (
                <div key={icon} className="text-center">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-fixed mb-4">
                    <span
                      className="material-symbols-outlined text-[28px] text-on-primary-fixed"
                      aria-hidden
                    >
                      {icon}
                    </span>
                  </div>
                  <h3 className="font-label-large text-label-large text-ink mb-2">
                    {th(`steps.${index}.title`)}
                  </h3>
                  <p className="text-body-medium text-secondary">{th(`steps.${index}.body`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <h2 className="font-display-lg text-display-lg text-ink text-center mb-4">
            {th('whyTitle')}
          </h2>
          <p className="text-body-lead text-secondary text-center max-w-2xl mx-auto mb-12">
            {th('whyBody')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BENEFIT_KEYS.map((key) => (
              <div key={key} className="border border-border-subtle rounded-DEFAULT p-6 bg-surface">
                <h3 className="font-label-large text-label-large text-ink mb-2">
                  {th(`benefits.${key}.title`)}
                </h3>
                <p className="text-body-medium text-secondary">{th(`benefits.${key}.body`)}</p>
              </div>
            ))}
          </div>
        </section>

        <LivePlanCatalog plans={plans} copy={pricingCopy} number={number} />

        <section className="py-16 px-margin-mobile md:px-margin-desktop bg-surface-container">
          <div className="max-w-container-max mx-auto text-center">
            <h2 className="font-display-lg text-display-lg text-ink mb-4">{th('finalTitle')}</h2>
            <p className="text-body-lead text-secondary max-w-2xl mx-auto mb-8">
              {th('finalBody')}
            </p>
            <Link
              className="inline-flex font-label-semibold text-label-semibold bg-burgundy text-white px-8 py-4 rounded h-[52px] items-center justify-center transition-colors hover:bg-primary shadow-sm"
              href={primaryHref}
            >
              {session ? th('finalCtaSession') : th('finalCta')}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
