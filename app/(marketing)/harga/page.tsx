import Link from 'next/link';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { fetchPublicPlans, type PublicPlan } from '@/src/lib/api/plans';

import { marketingMetadata } from '@/src/lib/marketing/marketingMetadata';
import JsonLd from '@/app/components/marketing/JsonLd';

export async function generateMetadata(): Promise<Metadata> {
  return marketingMetadata('harga', {
    title: 'Harga lembar — paket untuk guru dan sekolah',
    description:
      'Lihat paket lembar yang tersedia dari katalog aktif atau hubungi tim untuk kebutuhan sekolah.',
    canonical: '/harga',
  });
}

function CheckIcon({ inverted = false }: { inverted?: boolean }) {
  return (
    <span
      className={`material-symbols-outlined shrink-0 ${inverted ? 'text-white' : 'text-burgundy'}`}
      style={{ fontVariationSettings: "'wght' 600" }}
      aria-hidden="true"
    >
      check_circle
    </span>
  );
}

type PricingCopy = {
  popular: string;
  priceFree: string;
  perMonth: string;
  noCard: string;
  quotaFromCatalog: string;
  tokenQuota: (values: { count: string }) => string;
  catalogUpdate: {
    eyebrow: string;
    name: string;
    subtitle: string;
    price: string;
    body: string;
    detail: string;
    status: string;
  };
};

function tokenQuotaLabel(plan: PublicPlan, locale: string, copy: PricingCopy): string {
  if (plan.tokenMonthlyLimit === null) return copy.quotaFromCatalog;
  return copy.tokenQuota({
    count: new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US').format(
      plan.tokenMonthlyLimit,
    ),
  });
}

function CatalogUpdateCard({ copy }: { copy: PricingCopy }) {
  return (
    <article className="flex min-h-[32rem] flex-col rounded-2xl border border-dashed border-burgundy/40 bg-burgundy/[0.035] p-7">
      <div className="mb-8 min-h-[5.5rem]">
        <p className="text-caption font-label-semibold uppercase tracking-[0.12em] text-burgundy">
          {copy.catalogUpdate.eyebrow}
        </p>
        <h3 className="mt-2 font-h3 text-h3 text-ink">{copy.catalogUpdate.name}</h3>
        <p className="mt-1 text-body-sm text-secondary">{copy.catalogUpdate.subtitle}</p>
      </div>
      <div className="mb-8 min-h-[4.5rem]">
        <p className="font-h2 text-h2 text-ink">{copy.catalogUpdate.price}</p>
        <p className="mt-1 text-body-sm text-secondary">{copy.catalogUpdate.body}</p>
      </div>
      <p className="flex-grow text-body-default leading-6 text-secondary">
        {copy.catalogUpdate.detail}
      </p>
      <span className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg border border-burgundy/30 px-4 text-center text-body-sm font-label-semibold text-burgundy">
        {copy.catalogUpdate.status}
      </span>
    </article>
  );
}

function PlanCard({
  plan,
  isPopular,
  cta,
  ctaHref,
  subtitle,
  name,
  locale,
  copy,
}: {
  plan: PublicPlan;
  isPopular?: boolean;
  cta: string;
  ctaHref: string;
  subtitle: string;
  name: string;
  locale: string;
  copy: PricingCopy;
}) {
  const isFree = plan.priceAmount === 0;
  const price = isFree
    ? 'Rp0'
    : new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US', {
        style: 'currency',
        currency: plan.currency,
        maximumFractionDigits: 0,
      }).format(plan.priceAmount);
  return (
    <article
      className={`group relative flex min-h-[32rem] flex-col rounded-2xl border p-7 transition duration-300 hover:-translate-y-1 ${
        isPopular
          ? 'border-ink bg-ink text-white shadow-[0_18px_40px_rgba(23,23,23,0.2)]'
          : 'border-border-strong bg-surface shadow-[0_12px_30px_rgba(93,76,58,0.08)] hover:shadow-[0_18px_36px_rgba(93,76,58,0.13)]'
      }`}
    >
      {isPopular && (
        <div className="absolute top-unit-4 right-unit-4 bg-burgundy text-white px-unit-3 py-unit-1 rounded-full text-caption font-label-semibold">
          {copy.popular}
        </div>
      )}
      <div className="mb-8 min-h-[5.5rem]">
        <h3 className={`font-h3 text-h3 mb-2 ${isPopular ? 'text-white' : 'text-ink'}`}>{name}</h3>
        <p
          className={`max-w-[24ch] text-body-sm leading-5 ${isPopular ? 'text-white/70' : 'text-secondary'}`}
        >
          {subtitle}
        </p>
      </div>
      <div className="mb-8 min-h-[4.5rem]">
        <span className={`font-h2 text-h2 tabular-nums ${isPopular ? 'text-white' : 'text-ink'}`}>
          {price}
        </span>
        <span
          className={`mt-1 block text-body-sm ${isPopular ? 'text-white/70' : 'text-secondary'}`}
        >
          {isFree ? copy.priceFree : plan.billingPeriod === 'monthly' ? copy.perMonth : ''}
        </span>
      </div>
      <div className="mb-10 flex flex-grow flex-col gap-4">
        <div className="flex items-start gap-3">
          <CheckIcon inverted={isPopular} />
          <span className={`text-body-default leading-6 ${isPopular ? 'text-white' : 'text-ink'}`}>
            {tokenQuotaLabel(plan, locale, copy)}
          </span>
        </div>
        {plan.features.map((feat) => (
          <div key={feat} className="flex items-start gap-3">
            <CheckIcon inverted={isPopular} />
            <span className={`text-body-default ${isPopular ? 'text-white' : 'text-ink'}`}>
              {feat}
            </span>
          </div>
        ))}
        {isFree && (
          <div className="flex items-start gap-3">
            <CheckIcon inverted={isPopular} />
            <span className="text-body-default text-ink">{copy.noCard}</span>
          </div>
        )}
      </div>
      <Link
        className={`flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-center text-body-sm font-label-semibold transition duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy ${
          isPopular
            ? 'bg-burgundy text-white hover:bg-[#8d1b24]'
            : 'border border-burgundy text-burgundy hover:bg-burgundy hover:text-white'
        }`}
        href={ctaHref}
      >
        {cta}
      </Link>
    </article>
  );
}

export default async function HargaPage() {
  const hargaSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://app.lembar.web.id/harga#webpage',
    url: 'https://app.lembar.web.id/harga',
    name: 'Harga lembar — paket untuk guru dan sekolah',
    description: 'Katalog paket lembar untuk guru dan kebutuhan institusi.',
    inLanguage: 'id',
  };
  // Prices and quotas must only be rendered from the live catalog. Marketing CMS
  // blocks intentionally cannot override this page with stale commercial information.
  const [plans, t, locale] = await Promise.all([
    fetchPublicPlans(),
    getTranslations('pricing'),
    getLocale(),
  ]);
  const copy: PricingCopy = {
    popular: t('popular'),
    priceFree: t('priceFree'),
    perMonth: t('perMonth'),
    noCard: t('noCard'),
    quotaFromCatalog: t('quotaFromCatalog'),
    tokenQuota: ({ count }) => t('tokenQuota', { count }),
    catalogUpdate: {
      eyebrow: t('catalogUpdate.eyebrow'),
      name: t('catalogUpdate.name'),
      subtitle: t('catalogUpdate.subtitle'),
      price: t('catalogUpdate.price'),
      body: t('catalogUpdate.body'),
      detail: t('catalogUpdate.detail'),
      status: t('catalogUpdate.status'),
    },
  };
  const freePlan = plans.find((p) => p.key === 'free') ?? plans[0];
  const proPlan = plans.find((p) => p.key === 'pro') ?? plans[1];
  const plusPlan = plans.find((p) => p.key === 'plus');

  return (
    <>
      <JsonLd schema={hargaSchema} />
      <div className="min-h-screen">
        <header className="mx-auto max-w-3xl px-margin-mobile pb-10 pt-14 text-center md:px-margin-desktop md:pb-14 md:pt-20">
          <div className="inline-block px-unit-3 py-unit-1 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full font-label-semibold text-caption mb-unit-6">
            {t('badge')}
          </div>
          <h1 className="mx-auto max-w-[18ch] text-balance font-h1 text-h1 leading-[1.05] text-ink">
            {t('title')}
          </h1>
          <p className="mx-auto mt-5 max-w-[58ch] text-body-lead leading-7 text-secondary">
            {t('description')}
          </p>
        </header>

        <section className="mx-auto max-w-container-max px-margin-mobile pb-20 md:px-margin-desktop">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {plans.length === 0 ? (
              <div className="md:col-span-2 rounded-xl border border-border-strong bg-paper p-unit-8">
                <h2 className="font-h3 text-h3 text-ink">{t('catalogUnavailableTitle')}</h2>
                <p className="mt-unit-2 text-body-default text-secondary">
                  {t('catalogUnavailableBody')}
                </p>
              </div>
            ) : null}
            {freePlan && (
              <PlanCard
                plan={freePlan}
                name={t('plans.free.name')}
                cta={t('plans.free.cta')}
                ctaHref="/daftar"
                subtitle={t('plans.free.subtitle')}
                locale={locale}
                copy={copy}
              />
            )}
            {plusPlan ? (
              <PlanCard
                plan={plusPlan}
                name={t('plans.plus.name')}
                cta={t('plans.plus.cta')}
                ctaHref="/daftar"
                subtitle={t('plans.plus.subtitle')}
                locale={locale}
                copy={copy}
              />
            ) : (
              <CatalogUpdateCard copy={copy} />
            )}
            {proPlan && (
              <PlanCard
                plan={proPlan}
                isPopular
                name={t('plans.pro.name')}
                cta={t('plans.pro.cta')}
                ctaHref="/daftar"
                subtitle={t('plans.pro.subtitle')}
                locale={locale}
                copy={copy}
              />
            )}

            {/* School plan: always contact-custom, no executable quota */}
            <article className="flex min-h-[32rem] flex-col rounded-2xl border border-border-strong bg-surface p-7 shadow-[0_12px_30px_rgba(93,76,58,0.08)]">
              <div className="mb-8 min-h-[5.5rem]">
                <h3 className="mb-2 font-h3 text-h3 text-ink">{t('school.name')}</h3>
                <p className="max-w-[24ch] text-body-sm leading-5 text-secondary">
                  {t('school.subtitle')}
                </p>
              </div>
              <div className="mb-8 min-h-[4.5rem]">
                <p className="font-h2 text-h2 text-ink">{t('school.headline')}</p>
                <p className="mt-1 text-body-sm text-secondary">{t('school.price')}</p>
              </div>
              <p className="flex-grow text-body-default leading-6 text-secondary">
                {t('school.body')}
              </p>
              <Link
                className="mt-8 flex min-h-11 w-full items-center justify-center rounded-lg border border-burgundy px-4 text-center text-body-sm font-label-semibold text-burgundy transition duration-200 hover:bg-burgundy hover:text-white active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy"
                href="/kontak"
              >
                {t('school.cta')}
              </Link>
            </article>
          </div>
        </section>

        {/* FAQ billing */}
        <section className="pb-unit-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="max-w-[640px] mx-auto">
            <h2 className="font-h2 text-h2 text-ink mb-unit-8 text-center">{t('faq.title')}</h2>
            <div className="space-y-unit-6">
              <div>
                <h3 className="font-label-semibold text-body-lead text-ink mb-unit-2">
                  {t('faq.tokenQuestion')}
                </h3>
                <p className="text-body-default text-secondary">{t('faq.tokenAnswer')}</p>
              </div>
              <div>
                <h3 className="font-label-semibold text-body-lead text-ink mb-unit-2">
                  {t('faq.billingQuestion')}
                </h3>
                <p className="text-body-default text-secondary">{t('faq.billingAnswer')}</p>
              </div>
              <div>
                <h3 className="font-label-semibold text-body-lead text-ink mb-unit-2">
                  {t('faq.upgradeQuestion')}
                </h3>
                <p className="text-body-default text-secondary">{t('faq.upgradeAnswer')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-unit-16 px-margin-mobile md:px-margin-desktop">
          <div className="bg-ink rounded-2xl py-unit-16 px-unit-8 md:px-unit-16 max-w-container-max mx-auto text-center">
            <h2 className="font-h2 text-h2 text-white mb-unit-6 relative z-10">{t('cta.title')}</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-unit-4 relative z-10">
              <Link
                className="bg-burgundy text-white px-unit-12 h-[52px] rounded-lg font-label-semibold text-body-lead hover:brightness-110 transition-all flex items-center"
                href="/daftar"
              >
                {t('cta.register')}
              </Link>
              <Link
                className="border border-surface-variant text-white px-unit-12 h-[52px] rounded-lg font-label-semibold text-body-lead hover:bg-white/10 transition-all flex items-center"
                href="/kontak"
              >
                {t('cta.contact')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
