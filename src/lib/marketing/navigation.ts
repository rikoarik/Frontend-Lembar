export type MarketingNavItem = {
  id: 'product' | 'school' | 'pricing';
  label: string;
  href: string;
};

export const marketingNavigation: readonly MarketingNavItem[] = [
  { id: 'product', label: 'Produk', href: '/' },
  { id: 'school', label: 'Untuk Sekolah', href: '/untuk-sekolah' },
  { id: 'pricing', label: 'Harga', href: '/harga' },
];
