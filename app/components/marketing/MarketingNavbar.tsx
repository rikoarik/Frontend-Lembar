'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { marketingNavigation, type MarketingNavItem } from '@/src/lib/marketing/navigation';
import { getMarketingCta } from '@/src/lib/marketing/ctas';
import ActiveNavIndicator from './ActiveNavIndicator';
import Logo from './Logo';

function isActive(item: MarketingNavItem, pathname: string): boolean {
  if (item.href === '/') return pathname === '/';
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function MarketingNavbar() {
  const pathname = usePathname() ?? '/';
  return (
    <header
      aria-label="Navigasi utama"
      style={{ position: 'sticky', top: 0, zIndex: 1000000 }}
      className="w-full border-b border-brand-line bg-brand-paper/90 backdrop-blur supports-[backdrop-filter]:bg-brand-paper/70"
    >
      <div className="mx-auto flex min-h-control-lg max-w-container-max items-center justify-between gap-unit-4 px-margin-mobile py-unit-3 md:px-margin-desktop md:py-unit-4">
        <Link
          href="/"
          aria-label="lembar — beranda"
          className="flex shrink-0 items-center gap-unit-2 text-brand-ink"
        >
          <Logo variant="mark" alt="" priority />
          <span className="sr-only">lembar</span>
        </Link>

        <nav aria-label="Bagian" className="hidden items-center gap-unit-1 md:flex">
          {marketingNavigation.map((item) => {
            const active = isActive(item, pathname);
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'relative inline-flex h-control-md items-center rounded-md px-unit-3 text-label-semibold text-brand-accent'
                    : 'relative inline-flex h-control-md items-center rounded-md px-unit-3 text-label-semibold text-brand-ink hover:text-brand-accent'
                }
              >
                {active ? <ActiveNavIndicator /> : null}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-unit-2">
          <Link
            href={getMarketingCta('login').href}
            className="hidden h-control-md items-center rounded-md px-unit-3 text-label-semibold text-brand-ink hover:text-brand-accent sm:inline-flex"
          >
            {getMarketingCta('login').label}
          </Link>
          <Link
            href={getMarketingCta('try-free').href}
            className="inline-flex h-control-md items-center rounded-md bg-brand-accent px-unit-4 text-label-semibold text-white hover:bg-brand-accent-hover"
          >
            {getMarketingCta('try-free').label}
          </Link>
        </div>
      </div>
    </header>
  );
}
