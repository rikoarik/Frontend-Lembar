'use client';

import { useTranslations } from 'next-intl';
import { Panel } from '@/app/components/ui';

export function OutputSettings() {
  const t = useTranslations('generate');
  return (
    <Panel title={t('panels.output.title')} description={t('panels.output.desc')}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 opacity-60" aria-disabled="true">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-brand-ink">{t('outputSettings.paperSize')}</span>
            <span className="text-body-sm text-brand-ink-muted">A4 (default)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-brand-ink">{t('outputSettings.orientation')}</span>
            <span className="text-body-sm text-brand-ink-muted">Portrait (default)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-brand-ink">{t('outputSettings.font')}</span>
            <span className="text-body-sm text-brand-ink-muted">Inter (default)</span>
          </div>
        </div>
        <p className="text-body-sm text-brand-ink-muted">{t('outputSettings.defaultNote')}</p>
      </div>
    </Panel>
  );
}
