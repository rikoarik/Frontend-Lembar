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
    <header className="nav" aria-label="Navigasi utama">
      <div className="nav__inner">
        <Link className="nav__brand" href="/" aria-label="lembar — beranda">
          <Logo variant="mark" className="nav__mark" alt="" priority />
          <span className="nav__wordmark sr-only">lembar</span>
        </Link>

        <nav aria-label="Bagian" className="nav__links">
          {marketingNavigation.map((item) => {
            const active = isActive(item, pathname);
            return (
              <Link
                key={item.id}
                className={`nav__link ${active ? 'nav__link--active' : ''}`.trim()}
                aria-current={active ? 'page' : undefined}
                href={item.href}
              >
                {active ? <ActiveNavIndicator /> : null}
                <span className="nav__link-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="nav__cta">
          <Link className="btn btn--text" href={getMarketingCta('login').href}>
            {getMarketingCta('login').label}
          </Link>
          <Link className="btn btn--primary" href={getMarketingCta('try-free').href}>
            {getMarketingCta('try-free').label}
          </Link>
        </div>
      </div>
    </header>
  );
}
