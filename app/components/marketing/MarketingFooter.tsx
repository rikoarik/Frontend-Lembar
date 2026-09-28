'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

type FooterLink = { key: string; href: string };

const SERVICE_LINKS: readonly FooterLink[] = [
  { key: 'home', href: '/' },
  { key: 'generator', href: '/generator-soal-ai' },
  { key: 'school', href: '/untuk-sekolah' },
  { key: 'pricing', href: '/harga' },
];

const COMPANY_LINKS: readonly FooterLink[] = [
  { key: 'about', href: '/tentang' },
  { key: 'security', href: '/keamanan-data' },
  { key: 'contact', href: '/kontak' },
];

const SUPPORT_LINKS: readonly FooterLink[] = [
  { key: 'help', href: '/bantuan' },
  { key: 'faq', href: '/faq' },
  { key: 'privacy', href: '/privasi' },
  { key: 'terms', href: '/syarat' },
];

const linkClass =
  'font-caption text-caption text-secondary hover:text-burgundy hover:underline transition-all duration-200';

function FooterColumn({
  heading,
  links,
  t,
}: {
  heading: string;
  links: readonly FooterLink[];
  t: (key: string) => string;
}) {
  return (
    <div className="md:col-span-2 flex flex-col gap-unit-4">
      <span className="font-label-semibold text-ink text-body-sm uppercase tracking-wider">
        {heading}
      </span>
      <div className="flex flex-col gap-unit-2">
        {links.map((link) => (
          <Link key={link.key} className={linkClass} href={link.href}>
            {t(`links.${link.key}`)}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function MarketingFooter() {
  const reduce = useReducedMotion();
  const t = useTranslations('marketing.footer');

  return (
    <footer className="w-full bg-paper border-t border-border-strong pt-unit-16 pb-unit-8 select-none">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-unit-12 gap-x-unit-8 pb-unit-12 border-b border-border-subtle">
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col gap-unit-6">
            <div className="flex items-center gap-2">
              <div className="h-unit-8 w-unit-8 flex-shrink-0">
                <Image
                  alt={t('brandAlt')}
                  className="h-full w-full object-contain"
                  src="/lembar/logo-mark.png"
                  width={32}
                  height={32}
                />
              </div>
              <span className="font-h3 text-h3 text-ink font-bold tracking-tight">lembar</span>
            </div>

            <p className="font-caption text-caption text-secondary max-w-[300px] leading-relaxed">
              {t('brandBody')}
            </p>
          </div>

          <FooterColumn heading={t('sections.services')} links={SERVICE_LINKS} t={t} />
          <FooterColumn heading={t('sections.company')} links={COMPANY_LINKS} t={t} />
          <FooterColumn heading={t('sections.support')} links={SUPPORT_LINKS} t={t} />

          {/* Newsletter Column */}
          <div className="md:col-span-2 flex flex-col gap-unit-4">
            <span className="font-label-semibold text-ink text-body-sm uppercase tracking-wider">
              {t('sections.newsletter')}
            </span>
            <p className="font-caption text-caption text-secondary leading-relaxed">
              {t('newsletterBody')}
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder={t('newsletterPlaceholder')}
                aria-label={t('newsletterPlaceholder')}
                className="w-full bg-surface border border-border-strong rounded px-3 py-2 text-caption focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all duration-200"
              />
              <button className="bg-burgundy text-on-primary font-label-semibold h-9 rounded text-caption hover:brightness-110 active:scale-95 transition-all">
                {t('newsletterSubmit')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-unit-8">
          <p className="font-caption text-caption text-secondary text-center sm:text-left">
            {t('copyright')}
          </p>
          <div className="flex items-center gap-1.5 text-secondary font-caption text-caption">
            <span>{t('madeWith')}</span>
            <span
              className={`material-symbols-outlined text-red-500 text-[16px] ${reduce ? '' : 'animate-pulse'}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            <span>{t('madeFor')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
