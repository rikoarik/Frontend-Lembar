export type CtaVariant = 'primary' | 'secondary' | 'text';
export type MarketingCta = {
  id: string;
  label: string;
  href: string;
  variant: CtaVariant;
  trackingKey: string;
};

export const marketingCtas: readonly MarketingCta[] = [
  { id: 'login', label: 'Masuk', href: '/masuk', variant: 'text', trackingKey: 'nav-login' },
  {
    id: 'try-free',
    label: 'Coba Gratis',
    href: '/daftar',
    variant: 'primary',
    trackingKey: 'nav-try-free',
  },
  {
    id: 'create-free',
    label: 'Buat lembar gratis',
    href: '/daftar',
    variant: 'primary',
    trackingKey: 'home-create-free',
  },
  {
    id: 'see-example',
    label: 'Lihat contoh hasil',
    href: '#contoh-hasil',
    variant: 'secondary',
    trackingKey: 'home-see-example',
  },
  {
    id: 'school-discuss',
    label: 'Diskusikan kebutuhan sekolah',
    href: '/kontak',
    variant: 'primary',
    trackingKey: 'school-discuss',
  },
  {
    id: 'start-free',
    label: 'Mulai Gratis',
    href: '/daftar',
    variant: 'secondary',
    trackingKey: 'pricing-start-free',
  },
  {
    id: 'subscribe',
    label: 'Langganan Sekarang',
    href: '/daftar',
    variant: 'primary',
    trackingKey: 'pricing-subscribe',
  },
  {
    id: 'pilot',
    label: 'Daftar Pilot',
    href: '/kontak',
    variant: 'secondary',
    trackingKey: 'pricing-pilot',
  },
  {
    id: 'register-now',
    label: 'Daftar Sekarang',
    href: '/daftar',
    variant: 'primary',
    trackingKey: 'pricing-register',
  },
  {
    id: 'schedule-demo',
    label: 'Jadwalkan Demo',
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
