import MarketingSubPageLayout from '@/app/components/marketing/MarketingSubPageLayout';
import { getTranslations } from 'next-intl/server';

const STAT_KEYS = ['0', '1', '2', '3'] as const;
const PRINCIPLE_KEYS = ['0', '1', '2'] as const;

export default async function TentangPage() {
  const t = await getTranslations('marketing.about');
  return (
    <MarketingSubPageLayout
      title={
        <>
          {t('titleLine1')}
          <br />
          {t('titleLine2')}
        </>
      }
      description={t('description')}
      asymmetric
    >
      {/* Numbers strip */}
      <section className="py-unit-12 px-margin-mobile md:px-margin-desktop bg-burgundy text-on-primary">
        <div className="max-w-container-max mx-auto grid grid-cols-2 md:grid-cols-4 gap-unit-8 text-center">
          {STAT_KEYS.map((key) => (
            <div key={key}>
              <span className="font-display-xl block leading-none">{t(`stats.${key}.value`)}</span>
              <span className="text-on-primary/70 text-caption mt-1 block">
                {t(`stats.${key}.label`)}
              </span>
            </div>
          ))}
          <div className="col-span-2 md:col-span-4 text-center mt-unit-2">
            <span className="text-on-primary/50 text-caption block">{t('statsNote')}</span>
          </div>
        </div>
      </section>

      {/* Story — staggered layout, not symmetric cards */}
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
        <div className="max-w-container-max mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-unit-12 gap-x-unit-8">
            {/* Left: Misi */}
            <div className="lg:col-span-5 lg:pt-unit-12">
              <span className="text-burgundy font-label-semibold text-caption tracking-wider uppercase">
                {t('missionEyebrow')}
              </span>
              <h2 className="font-h2 text-h2 text-ink mt-unit-2 mb-unit-4">{t('missionTitle')}</h2>
              <p className="text-secondary text-body-default leading-relaxed">{t('missionBody')}</p>
            </div>

            {/* Right: Visi */}
            <div className="lg:col-span-5 lg:col-start-8">
              <span className="text-burgundy font-label-semibold text-caption tracking-wider uppercase">
                {t('visionEyebrow')}
              </span>
              <h2 className="font-h2 text-h2 text-ink mt-unit-2 mb-unit-4">{t('visionTitle')}</h2>
              <p className="text-secondary text-body-default leading-relaxed">{t('visionBody')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values — horizontal scroll feel on mobile, not generic card grid */}
      <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
        <div className="max-w-container-max mx-auto">
          <span className="text-burgundy font-label-semibold text-caption tracking-wider uppercase">
            {t('principlesEyebrow')}
          </span>
          <h2 className="font-h2 text-h2 text-ink mt-unit-2 mb-unit-12">{t('principlesTitle')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-strong rounded-2xl overflow-hidden">
            {PRINCIPLE_KEYS.map((key) => (
              <div key={key} className="bg-paper p-unit-8 md:p-unit-10">
                <span className="text-[48px] leading-none text-burgundy/20 font-bold block mb-unit-4">
                  {t(`principles.${key}.number`)}
                </span>
                <h3 className="font-h3 text-h3 text-ink mb-unit-2">
                  {t(`principles.${key}.title`)}
                </h3>
                <p className="text-secondary text-body-sm leading-relaxed">
                  {t(`principles.${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingSubPageLayout>
  );
}
