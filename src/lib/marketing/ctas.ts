export type CtaVariant = 'primary' | 'secondary' | 'text';
export type MarketingCta = {
  id: string;
  /** Key inside the `marketing.cta` namespace. */
  labelKey: string;
  href: string;
  variant: CtaVariant;
  trackingKey: string;
};

export const marketingCtas: readonly MarketingCta[] = [
  {
    id: 'login',
    labelKey: 'login',
    href: '/masuk',
    variant: 'text',
    trackingKey: 'nav-login',
  },
  {
    id: 'try-free',
    labelKey: 'tryFree',
    href: '/daftar',
    variant: 'primary',
    trackingKey: 'nav-try-free',
  },
  {
    id: 'create-free',
    labelKey: 'createFree',
    href: '/daftar',
    variant: 'primary',
    trackingKey: 'home-create-free',
  },
  {
    id: 'see-example',
    labelKey: 'seeExample',
    href: '#contoh-hasil',
    variant: 'secondary',
    trackingKey: 'home-see-example',
  },
  {
    id: 'school-discuss',
    labelKey: 'schoolDiscuss',
    href: '/kontak',
    variant: 'primary',
    trackingKey: 'school-discuss',
  },
  {
    id: 'start-free',
    labelKey: 'startFree',
    href: '/daftar',
    variant: 'secondary',
    trackingKey: 'pricing-start-free',
  },
  {
    id: 'subscribe',
    labelKey: 'subscribe',
    href: '/daftar',
    variant: 'primary',
    trackingKey: 'pricing-subscribe',
  },
  {
    id: 'pilot',
    labelKey: 'pilot',
    href: '/kontak',
    variant: 'secondary',
    trackingKey: 'pricing-pilot',
  },
  {
    id: 'register-now',
    labelKey: 'registerNow',
    href: '/daftar',
    variant: 'primary',
    trackingKey: 'pricing-register',
  },
  {
    id: 'schedule-demo',
    labelKey: 'scheduleDemo',
    href: '/kontak',
    variant: 'secondary',
    trackingKey: 'pricing-demo',
  },
];

export function getMarketingCta(id: string): MarketingCta {
  const cta = marketingCtas.find((item) => item.id === id);
  if (!cta) throw new Error(`Unknown marketing CTA: ${id}`);
  return cta;
}
