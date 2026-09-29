import type { Locale } from './config';

/**
 * Single source of truth for locale-aware date/number formatting.
 *
 * Components must not call `toLocaleDateString('id-ID')` / `Intl.NumberFormat('id-ID')`
 * directly: the active locale comes from next-intl (`useFormatter` / `getFormatter`),
 * and only the option presets below are shared.
 */

/** Map an app locale to the BCP-47 tag used by the Intl formatters. */
export function intlLocale(locale: Locale): string {
  return locale === 'en' ? 'en-US' : 'id-ID';
}

/**
 * next-intl narrows `Intl.DateTimeFormatOptions`: it types the enum-valued keys
 * (`calendar`, `numberingSystem`, `timeZone`, `timeZoneName`) as unions instead
 * of the loose `string` in `lib.dom`, so those keys are dropped here and the
 * presets stay assignable to `useFormatter().dateTime` / `getFormatter()`.
 */
export type DateFormatOptions = Omit<
  Intl.DateTimeFormatOptions,
  'calendar' | 'numberingSystem' | 'timeZone' | 'timeZoneName'
>;

/** 29 Jul 2026 / Jul 29, 2026 */
export const DATE_SHORT: DateFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

/** 29 Juli 2026 / July 29, 2026 */
export const DATE_LONG: DateFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
};

/** 29 Jul 2026, 17.00 / Jul 29, 2026, 5:00 PM */
export const DATE_TIME_SHORT: DateFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

/** 29 Jul 2026, 17.00 / Jul 29, 2026, 5:00 PM */
export const DATE_TIME_MEDIUM: DateFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

export type DateInput = string | number | Date | null | undefined;

/** Parse any accepted input into a valid Date, or null when it is unusable. */
export function parseDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Number formatter shape exposed by next-intl. */
export type NumberFormat = (value: number | bigint, options?: Intl.NumberFormatOptions) => string;

/**
 * Locale-aware formatting surface shared by the client hook
 * (`useLocaleFormat`) and the server helper (`getLocaleFormat`).
 */
export type LocaleFormat = {
  /** Locale-aware date, e.g. "29 Jul 2026" (id) / "Jul 29, 2026" (en). */
  date: (value: DateInput, options?: DateFormatOptions, fallback?: string) => string;
  /** Locale-aware date + time. */
  dateTime: (value: DateInput, options?: DateFormatOptions, fallback?: string) => string;
  /** Locale-aware number, e.g. "1.500" (id) / "1,500" (en). */
  number: NumberFormat;
};
