import coreId from '../../messages/id/core.json';
import enCore from '../../messages/en/core.json';
import idErrors from '../../messages/id/errors.json';
import enErrors from '../../messages/en/errors.json';
import idMarketing from '../../messages/id/marketing.json';
import enMarketing from '../../messages/en/marketing.json';
import idAuth from '../../messages/id/auth.json';
import enAuth from '../../messages/en/auth.json';
import idAppShell from '../../messages/id/appShell.json';
import enAppShell from '../../messages/en/appShell.json';
import idDashboard from '../../messages/id/dashboard.json';
import enDashboard from '../../messages/en/dashboard.json';
import idGenerate from '../../messages/id/generate.json';
import enGenerate from '../../messages/en/generate.json';
import idReview from '../../messages/id/review.json';
import enReview from '../../messages/en/review.json';
import idOutput from '../../messages/id/output.json';
import enOutput from '../../messages/en/output.json';
import idOps from '../../messages/id/ops.json';
import enOps from '../../messages/en/ops.json';
import idAdmin from '../../messages/id/admin.json';
import enAdmin from '../../messages/en/admin.json';
import idSchool from '../../messages/id/school.json';
import enSchool from '../../messages/en/school.json';
import idCatalog from '../../messages/id/catalog.json';
import enCatalog from '../../messages/en/catalog.json';
import idLeads from '../../messages/id/leads.json';
import enLeads from '../../messages/en/leads.json';
import idJobs from '../../messages/id/jobs.json';
import enJobs from '../../messages/en/jobs.json';
import idLibrary from '../../messages/id/library.json';
import enLibrary from '../../messages/en/library.json';
import idHelp from '../../messages/id/help.json';
import enHelp from '../../messages/en/help.json';
import idShare from '../../messages/id/share.json';
import enShare from '../../messages/en/share.json';
import idLms from '../../messages/id/lms.json';
import enLms from '../../messages/en/lms.json';
import idSettings from '../../messages/id/settings.json';
import enSettings from '../../messages/en/settings.json';
import idOnboarding from '../../messages/id/onboarding.json';
import enOnboarding from '../../messages/en/onboarding.json';
import idSubscription from '../../messages/id/subscription.json';
import enSubscription from '../../messages/en/subscription.json';
import idAnalytics from '../../messages/id/analytics.json';
import enAnalytics from '../../messages/en/analytics.json';
import idCommonUi from '../../messages/id/commonUi.json';
import enCommonUi from '../../messages/en/commonUi.json';

export type Messages = Record<string, unknown>;

type Catalog = { [namespace: string]: Messages };

/**
 * Static catalog registry. Each namespace lives in its own file so parallel
 * workstreams never collide on a single messages JSON. To add a namespace:
 * create `messages/<locale>/<ns>.json` and register it below for both locales.
 */
const catalogs: { id: Catalog; en: Catalog } = {
  id: {
    core: coreId,
    errors: idErrors,
    marketing: idMarketing,
    auth: idAuth,
    appShell: idAppShell,
    dashboard: idDashboard,
    generate: idGenerate,
    review: idReview,
    output: idOutput,
    ops: idOps,
    admin: idAdmin,
    school: idSchool,
    catalog: idCatalog,
    leads: idLeads,
    jobs: idJobs,
    library: idLibrary,
    help: idHelp,
    share: idShare,
    lms: idLms,
    settings: idSettings,
    onboarding: idOnboarding,
    subscription: idSubscription,
    analytics: idAnalytics,
    commonUi: idCommonUi,
  },
  en: {
    core: enCore,
    errors: enErrors,
    marketing: enMarketing,
    auth: enAuth,
    appShell: enAppShell,
    dashboard: enDashboard,
    generate: enGenerate,
    review: enReview,
    output: enOutput,
    ops: enOps,
    admin: enAdmin,
    school: enSchool,
    catalog: enCatalog,
    leads: enLeads,
    jobs: enJobs,
    library: enLibrary,
    help: enHelp,
    share: enShare,
    lms: enLms,
    settings: enSettings,
    onboarding: enOnboarding,
    subscription: enSubscription,
    analytics: enAnalytics,
    commonUi: enCommonUi,
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function deepMerge<T extends Messages>(base: T, override: Messages): T {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = result[key];
    result[key] =
      isPlainObject(value) && isPlainObject(current) ? deepMerge(current, value) : value;
  }
  return result as T;
}

export function loadMessages(locale: string): Messages {
  const catalog = locale === 'en' ? catalogs.en : catalogs.id;
  return Object.entries(catalog).reduce<Messages>(
    (merged, [, messages]) => deepMerge(merged, messages),
    {},
  );
}
