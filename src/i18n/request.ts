import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { LOCALE_COOKIE, resolveLocale } from './config';
import { loadMessages } from './messages';

/**
 * Cookie-based locale resolution without i18n URL routing.
 * The locale can also be provided explicitly (e.g. by middleware or tests).
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const store = await cookies();
  const requested = (await requestLocale) ?? store.get(LOCALE_COOKIE)?.value;
  const locale = resolveLocale(requested);

  return { locale, messages: loadMessages(locale) };
});
