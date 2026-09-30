'use client';

import { useFormatter } from 'next-intl';
import { DATE_SHORT, DATE_TIME_MEDIUM, parseDate, type LocaleFormat } from './formats';

export type { LocaleFormat, NumberFormat } from './formats';

/**
 * Locale-aware formatters backed by the next-intl formatter, so every surface
 * follows the locale selected by `LocaleSwitcher` instead of a hardcoded tag.
 */
export function useLocaleFormat(): LocaleFormat {
  const format = useFormatter();

  return {
    date: (value, options = DATE_SHORT, fallback = '—') => {
      const date = parseDate(value);
      return date ? format.dateTime(date, options) : fallback;
    },
    dateTime: (value, options = DATE_TIME_MEDIUM, fallback = '—') => {
      const date = parseDate(value);
      return date ? format.dateTime(date, options) : fallback;
    },
    number: (value, options) => format.number(value, options),
  };
}
