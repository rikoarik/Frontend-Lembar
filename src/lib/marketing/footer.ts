export type FooterLink = { id: string; label: string; href: string };
export type MarketingFooterContent = {
  tagline: string;
  copyright: string;
  links: readonly FooterLink[];
};

export const marketingFooter: MarketingFooterContent = {
  tagline: 'Dirancang untuk keahlian pendidik.',
  copyright: '© 2024 lembar.',
  links: [
    { id: 'about', label: 'Tentang Kami', href: '#tentang' },
    { id: 'help', label: 'Pusat Bantuan', href: '#bantuan' },
    { id: 'privacy', label: 'Kebijakan Privasi', href: '#privasi' },
    { id: 'terms', label: 'Syarat & Ketentuan', href: '#syarat' },
  ],
};
