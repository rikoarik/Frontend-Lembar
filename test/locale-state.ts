import type { Locale } from '@/src/i18n/config';

/**
 * Mutable locale state shared between the global next-intl test double
 * (vitest.setup.ts) and tests that prove a locale switch changes the UI.
 */
export const localeState: { locale: Locale } = { locale: 'id' };

export function setTestLocale(locale: Locale): void {
  localeState.locale = locale;
}
