import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';
import { getTranslations } from 'next-intl/server';

const CARD_KEYS = ['0', '1', '2'] as const;

export default async function KeamananDataPage() {
  const t = await getTranslations('marketing.security');
  return (
    <MarketingSubPageLayout title={t('title')} description={t('description')} badge={t('badge')}>
      <section className="bg-surface px-margin-mobile py-unit-16 md:px-margin-desktop">
        <div className="mx-auto grid max-w-container-max grid-cols-1 gap-unit-6 lg:grid-cols-2">
          <div className="flex min-h-[280px] flex-col justify-between rounded-2xl border border-border-strong bg-paper p-unit-10">
            <div>
              <p className="mb-unit-4 font-label-semibold text-caption uppercase tracking-wider text-secondary">
                {t('sessionEyebrow')}
              </p>
              <h2 className="mb-unit-3 font-h2 text-h2 text-ink">{t('sessionTitle')}</h2>
              <p className="max-w-md text-body-default leading-relaxed text-secondary">
                {t('sessionBody')}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-unit-4">
            {CARD_KEYS.map((key) => (
              <div
                key={key}
                className="flex-1 rounded-2xl border border-border-strong bg-paper p-unit-8"
              >
                <h3 className="mb-unit-2 font-h3 text-h3 text-ink">{t(`cards.${key}.title`)}</h3>
                <p className="text-body-sm leading-relaxed text-secondary">
                  {t(`cards.${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
