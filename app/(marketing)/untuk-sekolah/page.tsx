import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { fetchMarketingPage } from '@/src/lib/marketing/fetchMarketingPage';
import { BlockRenderer } from '@/app/components/marketing/BlockRenderer';
import { HoverCard } from './HoverCard';
import JsonLd from '@/app/components/marketing/JsonLd';

const FEATURE_ICONS = ['group', 'database', 'brand_family', 'history_edu'] as const;
const FEATURE_KEYS = ['0', '1', '2', '3'] as const;
const PILOT_KEYS = ['0', '1', '2'] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketing.school.meta');
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/untuk-sekolah' },
  };
}

export default async function UntukSekolahPage() {
  const [cmsDoc, t] = await Promise.all([
    fetchMarketingPage('untuk-sekolah'),
    getTranslations('marketing.school'),
  ]);
  const sekolahSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://app.lembar.web.id/untuk-sekolah#webpage',
    url: 'https://app.lembar.web.id/untuk-sekolah',
    name: t('schemaName'),
    description: t('schemaDescription'),
    inLanguage: 'id',
  };
  if (cmsDoc) {
    return (
      <>
        <JsonLd schema={sekolahSchema} />
        <BlockRenderer blocks={cmsDoc.blocks} />
      </>
    );
  }
  return (
    <>
      <JsonLd schema={sekolahSchema} />
      <div>
        <section className="pt-unit-16 pb-unit-16 px-margin-mobile md:px-margin-desktop bg-paper overflow-hidden">
          <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-12 gap-unit-12 items-center">
            <div className="lg:col-span-6">
              <h1 className="font-h1 text-h1 text-ink mb-unit-6 leading-tight">{t('heroTitle')}</h1>
              <p className="font-body-lead text-body-lead text-secondary mb-unit-8 max-w-lg">
                {t('heroBody')}
              </p>
              <div className="flex flex-wrap gap-unit-4">
                <Link
                  className="bg-burgundy text-on-primary px-unit-8 py-unit-4 rounded font-label-semibold text-body-default shadow-sm hover:opacity-90 transition-all"
                  href="/kontak"
                >
                  {t('heroCta')}
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6 relative">
              <HoverCard className="paper-card rounded-lg p-unit-6 w-full transform rotate-1 transition-transform duration-500">
                <div className="flex items-center justify-between border-b border-border-subtle pb-unit-4 mb-unit-4">
                  <div className="flex items-center gap-unit-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary text-sm">
                        school
                      </span>
                    </div>
                    <div>
                      <p className="font-label-semibold text-caption text-secondary uppercase tracking-wider">
                        {t('mockup.dashboard')}
                      </p>
                      <p className="font-h3 text-h3 text-ink">{t('mockup.schoolName')}</p>
                    </div>
                  </div>
                  <div className="bg-surface-container px-unit-3 py-unit-1 rounded text-caption font-label-semibold text-burgundy">
                    {t('mockup.activeTeachers')}
                  </div>
                </div>
                <div className="space-y-unit-4">
                  <div className="flex gap-unit-4">
                    <div className="flex-1 p-unit-3 border border-border-subtle rounded-lg bg-background">
                      <p className="text-caption text-secondary">{t('mockup.quotaLabel')}</p>
                      <div className="mt-unit-2 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="bg-burgundy h-full w-[65%]"></div>
                      </div>
                      <p className="text-caption font-label-semibold mt-unit-1">
                        {t('mockup.quotaValue')}
                      </p>
                    </div>
                    <div className="flex-1 p-unit-3 border border-border-subtle rounded-lg bg-background">
                      <p className="text-caption text-secondary">{t('mockup.bankLabel')}</p>
                      <p className="font-h3 text-h3 text-ink mt-unit-1">
                        {t('mockup.bankValue')}{' '}
                        <span className="text-caption text-secondary font-normal">
                          {t('mockup.bankUnit')}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="p-unit-3 border border-border-subtle rounded-lg">
                    <p className="text-caption font-label-semibold text-secondary mb-unit-2">
                      {t('mockup.activityTitle')}
                    </p>
                    <div className="space-y-unit-2">
                      <div className="flex items-center justify-between text-caption border-b border-border-subtle py-unit-1">
                        <span className="text-ink">{t('mockup.activity1')}</span>
                        <span className="text-secondary">{t('mockup.activity1Time')}</span>
                      </div>
                      <div className="flex items-center justify-between text-caption border-b border-border-subtle py-unit-1">
                        <span className="text-ink">{t('mockup.activity2')}</span>
                        <span className="text-secondary">{t('mockup.activity2Time')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </HoverCard>
            </div>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-white">
          <div className="max-w-container-max mx-auto">
            <div className="text-center mb-unit-12">
              <span className="text-burgundy font-label-semibold uppercase tracking-widest text-caption">
                {t('featuresEyebrow')}
              </span>
              <h2 className="font-h2 text-h2 text-ink mt-unit-2">{t('featuresTitle')}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-unit-6">
              {FEATURE_KEYS.map((key, index) => (
                <div
                  key={key}
                  className="p-unit-8 border border-border-subtle rounded-xl hover:border-burgundy transition-colors group"
                >
                  <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center mb-unit-6 group-hover:bg-burgundy group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">{FEATURE_ICONS[index]}</span>
                  </div>
                  <h3 className="font-h3 text-h3 text-ink mb-unit-3">
                    {t(`features.${key}.title`)}
                  </h3>
                  <p className="text-secondary text-body-sm">{t(`features.${key}.body`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-unit-6">
              <div className="lg:col-span-8 h-[400px] rounded-2xl overflow-hidden bg-surface border border-border-strong relative group page-shadow">
                {/* Subtle Grid Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-burgundy/5 via-transparent to-burgundy/5 z-10 pointer-events-none"></div>

                <div className="p-unit-8 relative z-20">
                  <span className="bg-burgundy/10 text-burgundy px-unit-3 py-unit-1 rounded-full font-label-semibold text-caption border border-burgundy/20">
                    {t('insight.badge')}
                  </span>
                  <h3 className="font-h2 text-h2 text-ink mt-unit-4 max-w-[85%] sm:max-w-[40%]">
                    {t('insight.title')}
                  </h3>
                </div>

                {/* macOS Window Widget */}
                <div className="absolute -bottom-4 -right-4 w-[85%] sm:w-[55%] h-[55%] sm:h-[75%] bg-white rounded-t-xl border border-border-strong shadow-[0_20px_50px_rgba(0,0,0,0.12)] group-hover:-translate-y-4 group-hover:-translate-x-4 transition-transform duration-700 ease-out flex flex-col z-30 overflow-hidden">
                  {/* macOS Title Bar */}
                  <div className="flex items-center justify-between px-4 py-3 bg-paper border-b border-border-subtle select-none">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-400"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                      <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    </div>
                    <div className="text-[11px] font-label-semibold text-secondary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">speed</span>
                      {t('insight.fileName')}
                    </div>
                    <div className="w-12"></div> {/* Spacer to center the title */}
                  </div>

                  {/* Widget Content */}
                  <div className="flex-grow p-unit-6 flex gap-unit-6">
                    {/* Left Mini Stats */}
                    <div className="hidden sm:flex flex-col gap-unit-3 w-1/3 border-r border-border-subtle pr-unit-4">
                      <div className="bg-paper p-unit-3 rounded-lg border border-border-subtle">
                        <span className="text-[10px] text-secondary font-label-semibold uppercase tracking-wider block">
                          {t('insight.statTotalLabel')}
                        </span>
                        <span className="font-h3 text-h3 text-ink">
                          {t('insight.statTotalValue')}{' '}
                          <span className="text-caption text-secondary font-normal">
                            {t('insight.statTotalUnit')}
                          </span>
                        </span>
                      </div>
                      <div className="bg-paper p-unit-3 rounded-lg border border-border-subtle">
                        <span className="text-[10px] text-secondary font-label-semibold uppercase tracking-wider block">
                          {t('insight.statAverageLabel')}
                        </span>
                        <span className="font-h3 text-h3 text-green-700">
                          {t('insight.statAverageValue')}
                        </span>
                      </div>
                    </div>

                    {/* Right Chart Area */}
                    <div className="flex-grow flex flex-col h-full justify-between">
                      {/* Chart Grid Lines & Bars */}
                      <div className="relative flex-grow flex gap-unit-4 items-end pb-unit-2 min-h-[120px]">
                        {/* Grid Y-Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          <div className="w-full border-t border-dashed border-border-subtle/50 h-0"></div>
                          <div className="w-full border-t border-dashed border-border-subtle/50 h-0"></div>
                          <div className="w-full border-t border-dashed border-border-subtle/50 h-0"></div>
                          <div className="w-full border-t border-dashed border-border-subtle/50 h-0"></div>
                        </div>

                        {/* Bar Matematika */}
                        <div className="flex-1 flex flex-col justify-end group/bar h-full relative cursor-crosshair z-10">
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-white text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 group-hover/bar:-translate-y-1 transition-all duration-300 pointer-events-none z-20 whitespace-nowrap shadow-md">
                            {t('insight.barMatematikaTooltip')}
                          </div>
                          <div className="w-full bg-surface-container rounded-t-full h-full relative overflow-hidden">
                            <div className="absolute bottom-0 w-full h-[85%] bg-gradient-to-t from-burgundy via-burgundy/80 to-rose-500 rounded-t-full group-hover/bar:opacity-90 transition-all duration-300"></div>
                          </div>
                          <p className="text-caption font-label-semibold mt-unit-2 text-center text-secondary">
                            {t('insight.barMatematikaLabel')}
                          </p>
                        </div>

                        {/* Bar B. Inggris */}
                        <div className="flex-1 flex flex-col justify-end group/bar h-full relative cursor-crosshair z-10">
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-white text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 group-hover/bar:-translate-y-1 transition-all duration-300 pointer-events-none z-20 whitespace-nowrap shadow-md">
                            {t('insight.barInggrisTooltip')}
                          </div>
                          <div className="w-full bg-surface-container rounded-t-full h-full relative overflow-hidden">
                            <div className="absolute bottom-0 w-full h-[42%] bg-gradient-to-t from-burgundy via-burgundy/80 to-rose-500 rounded-t-full group-hover/bar:opacity-90 transition-all duration-300"></div>
                          </div>
                          <p className="text-caption font-label-semibold mt-unit-2 text-center text-secondary">
                            {t('insight.barInggrisLabel')}
                          </p>
                        </div>

                        {/* Bar Fisika */}
                        <div className="flex-1 flex flex-col justify-end group/bar h-full relative cursor-crosshair z-10">
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-white text-xs py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 group-hover/bar:-translate-y-1 transition-all duration-300 pointer-events-none z-20 whitespace-nowrap shadow-md">
                            {t('insight.barFisikaTooltip')}
                          </div>
                          <div className="w-full bg-surface-container rounded-t-full h-full relative overflow-hidden">
                            <div className="absolute bottom-0 w-full h-[92%] bg-gradient-to-t from-burgundy via-burgundy/80 to-rose-500 rounded-t-full group-hover/bar:opacity-90 transition-all duration-300"></div>
                          </div>
                          <p className="text-caption font-label-semibold mt-unit-2 text-center text-secondary">
                            {t('insight.barFisikaLabel')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Extra Floating Badge (Aktivitas Guru) */}
                <div className="absolute top-unit-8 right-unit-8 bg-white p-unit-3 rounded-xl border border-border-strong shadow-lg z-40 hidden sm:flex items-center gap-3 group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                  <div className="w-8 h-8 rounded-full bg-burgundy/10 text-burgundy flex items-center justify-center font-bold text-sm">
                    B
                  </div>
                  <div>
                    <p className="text-caption font-bold text-ink leading-tight">
                      {t('insight.teacherName')}
                    </p>
                    <p className="text-[10px] text-secondary">{t('insight.teacherAction')}</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 h-[400px] bg-ink rounded-2xl p-unit-8 flex flex-col justify-between text-white overflow-hidden relative group">
                <div className="relative z-10">
                  <h3 className="font-h3 text-h3 mb-unit-4">{t('insight.securityTitle')}</h3>
                  <p className="text-surface-variant text-body-sm">{t('insight.securityBody')}</p>
                </div>
                <div className="relative z-10 flex items-center gap-unit-2 text-secondary-fixed">
                  <span className="material-symbols-outlined text-burgundy">verified_user</span>
                  <span className="text-caption font-label-semibold">
                    {t('insight.securityBadge')}
                  </span>
                </div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 border border-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute -bottom-10 -right-10 w-48 h-48 border border-white/5 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-white border-y border-border-subtle">
          <div className="max-w-reading-max mx-auto text-center">
            <h2 className="font-h2 text-h2 text-ink mb-unit-6">{t('pilotTitle')}</h2>
            <div className="space-y-unit-8 text-left">
              {PILOT_KEYS.map((key, index) => (
                <div key={key} className="flex gap-unit-6">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-burgundy flex items-center justify-center text-burgundy font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-label-semibold text-body-default text-ink">
                      {t(`pilotSteps.${key}.title`)}
                    </h4>
                    <p className="text-secondary text-body-sm mt-unit-1">
                      {t(`pilotSteps.${key}.body`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#171717 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          ></div>
          <div className="max-w-container-max mx-auto paper-card rounded-2xl p-unit-12 flex flex-col md:flex-row items-center justify-between gap-unit-8 relative z-10">
            <div className="text-center md:text-left">
              <h2 className="font-h2 text-h2 text-ink mb-unit-2">{t('finalTitle')}</h2>
              <p className="text-secondary text-body-default">{t('finalBody')}</p>
            </div>
            <Link
              className="bg-burgundy text-on-primary px-unit-12 py-unit-4 rounded font-label-semibold text-body-lead hover:shadow-lg transition-all transform active:scale-95 whitespace-nowrap"
              href="/kontak"
            >
              {t('finalCta')}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
