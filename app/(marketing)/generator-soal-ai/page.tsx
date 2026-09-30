import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import JsonLd from '@/app/components/marketing/JsonLd';

const SITE_URL = 'https://app.lembar.web.id';
const PAGE_URL = `${SITE_URL}/generator-soal-ai`;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketing.generator.meta');
  return {
    metadataBase: new URL(SITE_URL),
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/generator-soal-ai' },
    openGraph: {
      title: t('title'),
      description: t('ogDescription'),
      url: '/generator-soal-ai',
      siteName: 'Lembar',
      locale: 'id_ID',
      type: 'website',
      images: ['/og-image.svg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('twitterDescription'),
      images: ['/og-image.svg'],
    },
    robots: { index: true, follow: true },
  };
}

const QUESTION_TYPE_ICONS = ['checklist', 'rule', 'short_text', 'notes'] as const;
const TYPE_KEYS = ['0', '1', '2', '3'] as const;
const STEP_KEYS = ['0', '1', '2', '3'] as const;
const FAQ_KEYS = ['0', '1', '2', '3', '4', '5'] as const;
const CHECKLIST_KEYS = ['0', '1', '2', '3'] as const;
const OPTION_KEYS = ['0', '1', '2'] as const;

export default async function GeneratorSoalAiPage() {
  const t = await getTranslations('marketing.generator');

  const steps = STEP_KEYS.map((key) => ({
    title: t(`steps.${key}.title`),
    body: t(`steps.${key}.body`),
  }));

  const faqs = FAQ_KEYS.map((key) => ({
    question: t(`faqs.${key}.question`),
    answer: t(`faqs.${key}.answer`),
  }));

  const schema = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Lembar',
      url: SITE_URL,
      logo: `${SITE_URL}/lembar/logo-mark.png`,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Lembar',
      inLanguage: 'id-ID',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'Lembar',
      applicationCategory: 'EducationalApplication',
      applicationSubCategory: t('schema.softwareSubCategory'),
      operatingSystem: 'Web',
      url: SITE_URL,
      inLanguage: 'id-ID',
      description: t('schema.softwareDescription'),
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'WebPage',
      '@id': `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: t('schema.webPageName'),
      description: t('schema.webPageDescription'),
      inLanguage: 'id-ID',
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#software` },
    },
    {
      '@type': 'HowTo',
      '@id': `${PAGE_URL}#howto`,
      name: t('schema.howToName'),
      description: t('schema.howToDescription'),
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.title,
        text: step.body,
        url: `${PAGE_URL}#cara-kerja`,
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ];

  return (
    <article className="bg-paper text-ink">
      <JsonLd schema={schema} />

      <section className="overflow-hidden px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto grid max-w-container-max items-center gap-unit-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h1 className="max-w-3xl font-display-xl-mobile leading-[1.05] text-ink md:font-display-xl">
              {t('title')}
            </h1>
            <p className="mt-unit-6 max-w-xl text-body-lead leading-relaxed text-secondary">
              {t('lead')}
            </p>
            <div className="mt-unit-8 flex flex-wrap gap-unit-4">
              <Link
                href="/daftar"
                className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded bg-burgundy px-unit-6 font-label-semibold text-white transition-colors hover:brightness-110 active:scale-[0.98]"
              >
                {t('primaryCta')}
              </Link>
              <a
                href="#cara-kerja"
                className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded border border-ink px-unit-6 font-label-semibold text-ink transition-colors hover:bg-surface-container active:scale-[0.98]"
              >
                {t('secondaryCta')}
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border-strong bg-surface p-unit-6 shadow-[0_16px_48px_rgba(80,35,35,0.08)] md:p-unit-8">
              <div className="flex items-center justify-between gap-unit-4 border-b border-border-subtle pb-unit-4">
                <div>
                  <p className="text-caption font-label-semibold text-burgundy">
                    {t('preview.eyebrow')}
                  </p>
                  <h2 className="mt-1 font-h3 text-h3">{t('preview.subject')}</h2>
                </div>
                <span className="material-symbols-outlined text-burgundy" aria-hidden="true">
                  fact_check
                </span>
              </div>
              <div className="mt-unit-5">
                <p className="font-label-semibold text-body-default">{t('preview.question')}</p>
                <ol className="mt-unit-4 grid gap-unit-2 text-body-sm text-secondary">
                  {OPTION_KEYS.map((key) => (
                    <li
                      key={key}
                      className="rounded-lg border border-border-subtle px-unit-4 py-unit-3"
                    >
                      {t(`preview.options.${key}`)}
                    </li>
                  ))}
                </ol>
                <p className="mt-unit-4 flex items-start gap-unit-2 rounded-lg bg-surface-container px-unit-4 py-unit-3 text-caption text-secondary">
                  <span
                    className="material-symbols-outlined text-[18px] text-burgundy"
                    aria-hidden="true"
                  >
                    edit_note
                  </span>
                  {t('preview.note')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto max-w-container-max">
          <div className="max-w-3xl">
            <h2 className="font-h1 text-h1">{t('aboutTitle')}</h2>
            <p className="mt-unit-4 text-body-lead leading-relaxed text-secondary">
              {t('aboutBody')}
            </p>
          </div>
          <div className="mt-unit-10 grid gap-unit-4 md:grid-cols-12">
            <div className="rounded-2xl bg-burgundy p-unit-8 text-white md:col-span-7">
              <span className="material-symbols-outlined text-[32px]" aria-hidden="true">
                picture_as_pdf
              </span>
              <h3 className="mt-unit-6 font-h2 text-h2">{t('sources.pdfTitle')}</h3>
              <p className="mt-unit-3 max-w-xl text-body-default leading-relaxed text-white/85">
                {t('sources.pdfBody')}
              </p>
            </div>
            <div className="rounded-2xl border border-border-strong bg-paper p-unit-8 md:col-span-5">
              <span
                className="material-symbols-outlined text-[32px] text-burgundy"
                aria-hidden="true"
              >
                school
              </span>
              <h3 className="mt-unit-6 font-h2 text-h2">{t('sources.curriculumTitle')}</h3>
              <p className="mt-unit-3 text-body-default leading-relaxed text-secondary">
                {t('sources.curriculumBody')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto max-w-container-max">
          <h2 className="max-w-3xl font-h1 text-h1">{t('typesTitle')}</h2>
          <p className="mt-unit-4 max-w-2xl text-body-lead text-secondary">{t('typesLead')}</p>
          <div className="mt-unit-10 grid gap-unit-4 md:grid-cols-2">
            {TYPE_KEYS.map((key, index) => (
              <article
                key={key}
                className={`rounded-2xl border border-border-strong p-unit-6 ${
                  index === 0 || index === TYPE_KEYS.length - 1
                    ? 'bg-surface-container md:col-span-2'
                    : 'bg-surface'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[28px] text-burgundy"
                  aria-hidden="true"
                >
                  {QUESTION_TYPE_ICONS[index]}
                </span>
                <h3 className="mt-unit-4 font-h3 text-h3">{t(`types.${key}.title`)}</h3>
                <p className="mt-unit-2 max-w-2xl text-body-sm leading-relaxed text-secondary">
                  {t(`types.${key}.body`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="cara-kerja"
        className="bg-surface-container px-margin-mobile py-unit-16 md:px-margin-desktop"
      >
        <div className="mx-auto max-w-container-max">
          <h2 className="font-h1 text-h1">{t('howTitle')}</h2>
          <p className="mt-unit-4 max-w-2xl text-body-lead text-secondary">{t('howLead')}</p>
          <ol className="mt-unit-10 grid gap-unit-4 lg:grid-cols-2">
            {steps.map((step) => (
              <li
                key={step.title}
                className="rounded-2xl border border-border-strong bg-paper p-unit-6"
              >
                <h3 className="font-h3 text-h3">{step.title}</h3>
                <p className="mt-unit-2 text-body-sm leading-relaxed text-secondary">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto grid max-w-container-max gap-unit-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-h1 text-h1">{t('reviewTitle')}</h2>
            <p className="mt-unit-4 text-body-lead leading-relaxed text-secondary">
              {t('reviewBody')}
            </p>
            <Link
              href="/keamanan-data"
              className="mt-unit-6 inline-flex font-label-semibold text-burgundy underline underline-offset-4"
            >
              {t('reviewLink')}
            </Link>
          </div>
          <div className="grid gap-unit-3 lg:col-span-7">
            {CHECKLIST_KEYS.map((key) => (
              <div
                key={key}
                className="flex items-start gap-unit-3 rounded-xl bg-surface-container p-unit-4"
              >
                <span className="material-symbols-outlined text-burgundy" aria-hidden="true">
                  task_alt
                </span>
                <p className="text-body-default text-ink">{t(`checklist.${key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto max-w-container-max">
          <h2 className="font-h1 text-h1">{t('outputTitle')}</h2>
          <p className="mt-unit-4 max-w-3xl text-body-lead leading-relaxed text-secondary">
            {t('outputBody')}
          </p>
          <div className="mt-unit-8 flex flex-wrap gap-unit-4">
            <Link
              href="/harga"
              className="font-label-semibold text-burgundy underline underline-offset-4"
            >
              {t('outputPricingLink')}
            </Link>
            <Link
              href="/untuk-sekolah"
              className="font-label-semibold text-burgundy underline underline-offset-4"
            >
              {t('outputSchoolLink')}
            </Link>
          </div>
        </div>
      </section>

      <section id="faq" className="px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-h1 text-h1">{t('faqTitle')}</h2>
          <div className="mt-unit-8 grid gap-unit-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-border-strong bg-surface"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-unit-4 px-unit-6 py-unit-5 font-label-semibold text-ink">
                  {faq.question}
                  <span
                    className="material-symbols-outlined text-secondary transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </summary>
                <p className="border-t border-border-subtle px-unit-6 py-unit-5 text-body-sm leading-relaxed text-secondary">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-margin-mobile pb-unit-16 md:px-margin-desktop">
        <div className="mx-auto flex max-w-container-max flex-col items-start justify-between gap-unit-6 rounded-2xl bg-burgundy p-unit-8 text-white md:flex-row md:items-center md:p-unit-12">
          <div>
            <h2 className="font-h1 text-h1 text-white">{t('finalTitle')}</h2>
            <p className="mt-unit-3 max-w-2xl text-body-default text-white/85">{t('finalBody')}</p>
          </div>
          <Link
            href="/daftar"
            className="inline-flex h-11 shrink-0 items-center justify-center whitespace-nowrap rounded bg-white px-unit-6 font-label-semibold text-burgundy transition-colors hover:bg-paper active:scale-[0.98]"
          >
            {t('finalCta')}
          </Link>
        </div>
      </section>
    </article>
  );
}
