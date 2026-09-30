import { getFormatter } from 'next-intl/server';
import { DATE_SHORT, DATE_TIME_MEDIUM, parseDate, type LocaleFormat } from './formats';

/**
 * Server-component counterpart of `useLocaleFormat`. Both are backed by the
 * next-intl formatter, so a server-rendered page and a client island format
 * the same value identically for the locale selected by `LocaleSwitcher`.
 */
export async function getLocaleFormat(): Promise<LocaleFormat> {
  const format = await getFormatter();

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
