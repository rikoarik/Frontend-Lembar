import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';
import SchoolLeadForm from '@/src/features/leads/SchoolLeadForm';
import { getTranslations } from 'next-intl/server';

const ROUTE_ICONS = ['fact_check', 'privacy_tip', 'schedule'] as const;

export default async function KontakPage() {
  const t = await getTranslations('marketing.contact');
  return (
    <MarketingSubPageLayout
      title={t('title')}
      description={t('description')}
      badge={t('badge')}
      asymmetric
    >
      <section className="bg-surface px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto max-w-container-max">
          <div className="grid grid-cols-1 items-start gap-unit-12 lg:grid-cols-12">
            <div className="flex flex-col gap-unit-8 lg:col-span-5">
              <div className="flex flex-col gap-unit-4">
                <h2 className="font-h2 text-h2 text-ink">{t('routesTitle')}</h2>
                <p className="max-w-reading-max font-body-default text-body-default leading-relaxed text-secondary">
                  {t('routesBody')}
                </p>
              </div>
              <div className="flex flex-col gap-unit-5 border-y border-border-subtle py-unit-6">
                {ROUTE_ICONS.map((icon, index) => (
                  <div key={icon} className="flex items-start gap-unit-4">
                    <span
                      className="material-symbols-outlined mt-0.5 text-[22px] text-burgundy"
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <div>
                      <h3 className="font-label-semibold text-body-sm text-ink">
                        {t(`routes.${index}.title`)}
                      </h3>
                      <p className="font-body-sm text-body-sm text-secondary">
                        {t(`routes.${index}.body`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <SchoolLeadForm />
            </div>
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
