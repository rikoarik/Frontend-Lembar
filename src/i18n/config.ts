export const locales = ['id', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'id';
export const LOCALE_COOKIE = 'lembar_locale';

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Resolve a locale from an arbitrary string, falling back to the default. */
export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}
