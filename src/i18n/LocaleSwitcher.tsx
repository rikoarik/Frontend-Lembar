'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { locales, type Locale } from './config';
import { setLocale } from './actions';

const SHORT_LABEL: Record<Locale, string> = {
  id: 'ID',
  en: 'EN',
};

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations('common.language');
  const activeLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const selectLocale = (next: Locale) => {
    if (next === activeLocale || isPending) return;
    startTransition(() => {
      void setLocale(next);
    });
  };

  return (
    <div
      className={[
        'inline-flex shrink-0 items-center rounded-lg border border-[#e6dfd4] bg-[#fbf8f2] p-1 shadow-[0_1px_2px_rgba(23,23,23,0.05)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="group"
      aria-label={t('label')}
      aria-busy={isPending || undefined}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[17px] text-[#8a8379]"
      >
        <span className="material-symbols-outlined">language</span>
      </span>
      <div className="flex items-center gap-0.5">
        {locales.map((locale) => {
          const active = activeLocale === locale;
          return (
            <button
              key={locale}
              type="button"
              aria-pressed={active}
              aria-label={t(locale)}
              title={t(locale)}
              disabled={isPending}
              onClick={() => selectLocale(locale)}
              className={[
                'inline-flex h-7 min-w-8 items-center justify-center rounded-md px-1.5 text-[11px] font-semibold tracking-[0.06em] transition-all duration-200',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-focus',
                'disabled:cursor-wait disabled:opacity-60',
                active
                  ? 'bg-[#171717] text-white shadow-[0_1px_2px_rgba(23,23,23,0.18)]'
                  : 'text-[#756e65] hover:bg-white hover:text-[#171717] active:scale-[0.96]',
              ].join(' ')}
            >
              <span aria-hidden="true">{SHORT_LABEL[locale]}</span>
            </button>
          );
        })}
      </div>
      <span className="sr-only" role="status">
        {isPending ? t('label') : ''}
      </span>
    </div>
  );
}
