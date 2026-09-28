export type MarketingNavItem = {
  id: 'product' | 'school' | 'pricing';
  /** Key inside the `marketing.nav.items` namespace. */
  labelKey: 'product' | 'school' | 'pricing';
  href: string;
};

export const marketingNavigation: readonly MarketingNavItem[] = [
  { id: 'product', labelKey: 'product', href: '/' },
  { id: 'school', labelKey: 'school', href: '/untuk-sekolah' },
  { id: 'pricing', labelKey: 'pricing', href: '/harga' },
];
