export type CtaVariant = 'primary' | 'secondary' | 'text';
export type MarketingCta = {
  id: string;
  label: string;
  href: string;
  variant: CtaVariant;
  trackingKey: string;
};

export const marketingCtas: readonly MarketingCta[] = [
  { id: 'login', label: 'Masuk', href: '#masuk', variant: 'text', trackingKey: 'nav-login' },
  {
    id: 'try-free',
    label: 'Coba Gratis',
    href: '#coba-gratis',
    variant: 'primary',
    trackingKey: 'nav-try-free',
  },
  {
    id: 'create-free',
    label: 'Buat lembar gratis',
    href: '#coba-gratis',
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
    href: '#diskusi-sekolah',
    variant: 'primary',
    trackingKey: 'school-discuss',
  },
  {
    id: 'start-free',
    label: 'Mulai Gratis',
    href: '#coba-gratis',
    variant: 'secondary',
    trackingKey: 'pricing-start-free',
  },
  {
    id: 'subscribe',
    label: 'Langganan Sekarang',
    href: '#langganan',
    variant: 'primary',
    trackingKey: 'pricing-subscribe',
  },
  {
    id: 'pilot',
    label: 'Daftar Pilot',
    href: '#pilot',
    variant: 'secondary',
    trackingKey: 'pricing-pilot',
  },
  {
    id: 'register-now',
    label: 'Daftar Sekarang',
    href: '#daftar',
    variant: 'primary',
    trackingKey: 'pricing-register',
  },
  {
    id: 'schedule-demo',
    label: 'Jadwalkan Demo',
    href: '#demo',
    variant: 'secondary',
    trackingKey: 'pricing-demo',
  },
];

export function getMarketingCta(id: string): MarketingCta {
  const cta = marketingCtas.find((item) => item.id === id);
  if (!cta) throw new Error(`Unknown marketing CTA: ${id}`);
  return cta;
}
