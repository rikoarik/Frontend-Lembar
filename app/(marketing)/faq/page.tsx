import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

const FAQ_KEYS = ['0', '1', '2', '3', '4', '5'] as const;

export default async function FAQPage() {
  const t = await getTranslations('marketing.faq');
  return (
    <MarketingSubPageLayout title={t('title')} description={t('description')} badge={t('badge')}>
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-3xl mx-auto flex flex-col gap-unit-4">
          <div className="flex flex-col gap-unit-3">
            {FAQ_KEYS.map((key) => (
              <details
                key={key}
                className="bg-paper border border-border-strong rounded-xl overflow-hidden group"
              >
                <summary className="flex items-center justify-between cursor-pointer px-unit-6 py-unit-5 font-label-semibold text-body-default text-ink hover:bg-surface-container transition-colors select-none">
                  {t(`items.${key}.question`)}
                  <span className="material-symbols-outlined text-secondary text-[20px] group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4">
                    expand_more
                  </span>
                </summary>
                <div className="px-unit-6 pb-unit-5 text-secondary text-body-sm leading-relaxed border-t border-border-subtle">
                  <p className="pt-unit-4">{t(`items.${key}.answer`)}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-unit-8 flex items-center gap-unit-6 p-unit-8 bg-paper border border-border-strong rounded-2xl">
            <div className="flex-1">
              <h3 className="font-h3 text-h3 text-ink mb-1">{t('unansweredTitle')}</h3>
              <p className="text-secondary text-body-sm">{t('unansweredBody')}</p>
            </div>
            <Link
              href="/kontak"
              className="bg-burgundy text-on-primary px-unit-6 py-unit-3 rounded-lg font-label-semibold text-caption hover:brightness-110 active:scale-[0.98] transition-all whitespace-nowrap"
            >
              {t('contactCta')}
            </Link>
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
