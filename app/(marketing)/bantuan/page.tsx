import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function BantuanPage() {
  const t = await getTranslations('marketing.help');
  return (
    <MarketingSubPageLayout title={t('title')} description={t('description')} badge={t('badge')}>
      <section className="py-unit-12 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto">
          {/* Guide cards — varied sizes, not 3 equal boxes */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-unit-4">
            {/* Big card */}
            <div className="md:col-span-7 rounded-2xl bg-burgundy text-on-primary p-unit-10 flex flex-col justify-between min-h-[280px]">
              <div>
                <span className="text-on-primary/60 text-caption font-label-semibold tracking-wider uppercase">
                  {t('firstStepEyebrow')}
                </span>
                <h2 className="font-h2 text-h2 mt-unit-2 mb-unit-3 text-on-primary">
                  {t('firstStepTitle')}
                </h2>
                <p className="text-on-primary/80 text-body-default leading-relaxed max-w-md">
                  {t('firstStepBody')}
                </p>
              </div>
              <span className="text-on-primary/40 text-[64px] font-bold leading-none mt-unit-4 self-end">
                →
              </span>
            </div>

            {/* Stacked cards */}
            <div className="md:col-span-5 flex flex-col gap-unit-4">
              <div className="rounded-2xl bg-paper border border-border-strong p-unit-8 flex-1">
                <span className="text-burgundy text-caption font-label-semibold tracking-wider uppercase">
                  {t('tipEyebrow')}
                </span>
                <h3 className="font-h3 text-h3 text-ink mt-unit-2 mb-unit-2">{t('tipTitle')}</h3>
                <p className="text-secondary text-body-sm leading-relaxed">{t('tipBody')}</p>
              </div>
              <div className="rounded-2xl bg-paper border border-border-strong p-unit-8 flex-1">
                <span className="text-burgundy text-caption font-label-semibold tracking-wider uppercase">
                  {t('collabEyebrow')}
                </span>
                <h3 className="font-h3 text-h3 text-ink mt-unit-2 mb-unit-2">{t('collabTitle')}</h3>
                <p className="text-secondary text-body-sm leading-relaxed">{t('collabBody')}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-unit-16 text-center">
            <p className="text-secondary text-body-default mb-unit-4">{t('ctaText')}</p>
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 bg-burgundy text-on-primary px-unit-8 py-unit-4 rounded-lg font-label-semibold text-body-default hover:brightness-110 active:scale-[0.98] transition-all"
            >
              {t('ctaLabel')}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
