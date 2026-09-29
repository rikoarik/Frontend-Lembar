import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';

/** Sections whose copy is a single paragraph. */
const PLAIN_SECTIONS = ['0', '1', '2', '4', '5'] as const;
/** Sections that interleave a highlighted phrase. */
const EMPHASIS_SECTIONS = ['3'] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketing.terms.meta');
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
    },
  };
}

export default async function SyaratPage() {
  const t = await getTranslations('marketing.terms');
  return (
    <MarketingSubPageLayout title={t('title')} updateDate={t('updated')}>
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-3xl mx-auto">
          <article className="flex flex-col gap-unit-10">
            {PLAIN_SECTIONS.map((key) => (
              <div key={key}>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">{t(`sections.${key}.title`)}</h2>
                <p className="text-secondary text-body-sm leading-[1.8]">
                  {t(`sections.${key}.body`)}
                </p>
              </div>
            ))}
            {EMPHASIS_SECTIONS.map((key) => (
              <div key={key}>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">{t(`sections.${key}.title`)}</h2>
                <p className="text-secondary text-body-sm leading-[1.8]">
                  {t(`sections.${key}.before`)}
                  <strong className="text-ink">{t(`sections.${key}.strong`)}</strong>
                  {t(`sections.${key}.after`)}
                </p>
              </div>
            ))}
          </article>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
