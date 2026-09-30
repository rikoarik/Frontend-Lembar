'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { marketingNavigation, type MarketingNavItem } from '@/src/lib/marketing/navigation';
import { getMarketingCta } from '@/src/lib/marketing/ctas';
import ActiveNavIndicator from './ActiveNavIndicator';
import Logo from './Logo';
import { LocaleSwitcher } from '@/src/i18n/LocaleSwitcher';

function isActive(item: MarketingNavItem, pathname: string): boolean {
  if (item.href === '/') return pathname === '/';
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function MarketingNavbar({
  session,
}: {
  session: { displayName: string; homePath: string } | null;
}) {
  const t = useTranslations('marketing.nav');
  const tCta = useTranslations('marketing.cta');
  const pathname = usePathname() ?? '/';
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  // Escape closes the mobile menu and returns focus to the toggle.
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const loginCta = getMarketingCta('login');
  const tryFreeCta = getMarketingCta('try-free');

  return (
    <header
      aria-label={t('ariaLabel')}
      style={{ position: 'sticky', top: 0, zIndex: 1000000 }}
      className="w-full border-b border-brand-line bg-brand-paper/90 backdrop-blur supports-[backdrop-filter]:bg-brand-paper/70"
    >
      <div className="mx-auto flex min-h-control-lg max-w-container-max items-center justify-between gap-unit-4 px-margin-mobile py-unit-3 md:px-margin-desktop md:py-unit-4">
        <Link
          href="/"
          aria-label={t('ariaHome')}
          className="flex shrink-0 items-center gap-unit-2 text-brand-ink"
          onClick={closeMobile}
        >
          <Logo variant="mark" alt="" priority />
          <span className="sr-only">lembar</span>
        </Link>

        <nav aria-label={t('ariaSections')} className="hidden items-center gap-unit-1 md:flex">
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
                <span>{t(`items.${item.labelKey}`)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-unit-2">
          <LocaleSwitcher className="hidden md:inline-flex items-center gap-2 text-sm" />
          {session ? (
            <Link
              href={session.homePath}
              className="inline-flex h-control-md items-center gap-unit-2 rounded-md bg-brand-accent px-unit-3 text-label-semibold text-white hover:bg-brand-accent-hover sm:px-unit-4"
              title={session.displayName}
              onClick={closeMobile}
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                account_circle
              </span>
              {t('openWorkspace')}
            </Link>
          ) : (
            <>
              <Link
                href={loginCta.href}
                className="inline-flex h-control-md items-center rounded-md px-unit-2 text-label-semibold text-brand-ink hover:text-brand-accent sm:px-unit-3"
                onClick={closeMobile}
              >
                {tCta(loginCta.labelKey)}
              </Link>
              <Link
                href={tryFreeCta.href}
                className="inline-flex h-control-md items-center rounded-md bg-brand-accent px-unit-3 text-label-semibold text-white hover:bg-brand-accent-hover sm:px-unit-4"
                onClick={closeMobile}
              >
                {tCta(tryFreeCta.labelKey)}
              </Link>
            </>
          )}

          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-control-md w-control-md items-center justify-center rounded-md border border-brand-line text-brand-ink hover:bg-brand-paper focus-visible:outline-2 focus-visible:outline focus-visible:outline-brand-focus focus-visible:outline-offset-2 md:hidden"
            aria-label={mobileOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id={menuId}
          ref={panelRef}
          className="border-t border-brand-line bg-brand-paper md:hidden"
        >
          <nav
            aria-label={t('ariaMobile')}
            className="mx-auto flex max-w-container-max flex-col gap-1 px-margin-mobile py-unit-3"
          >
            {marketingNavigation.map((item) => {
              const active = isActive(item, pathname);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={closeMobile}
                  className={
                    active
                      ? 'inline-flex min-h-[var(--control-lg)] items-center rounded-md bg-brand-accent-soft px-unit-3 text-label-semibold text-brand-accent'
                      : 'inline-flex min-h-[var(--control-lg)] items-center rounded-md px-unit-3 text-label-semibold text-brand-ink hover:bg-brand-paper'
                  }
                >
                  {t(`items.${item.labelKey}`)}
                </Link>
              );
            })}

            <div className="my-unit-2 border-t border-brand-line" />

            <LocaleSwitcher className="inline-flex items-center gap-2 text-sm px-unit-3 py-unit-2 md:hidden" />

            {session ? (
              <Link
                href={session.homePath}
                onClick={closeMobile}
                className="inline-flex min-h-[var(--control-lg)] items-center justify-center rounded-md bg-brand-accent px-unit-4 text-label-semibold text-white hover:bg-brand-accent-hover"
              >
                {t('openWorkspace')}
              </Link>
            ) : (
              <>
                <Link
                  href={loginCta.href}
                  onClick={closeMobile}
                  className="inline-flex min-h-[var(--control-lg)] items-center rounded-md px-unit-3 text-label-semibold text-brand-ink hover:bg-brand-paper"
                >
                  {tCta(loginCta.labelKey)}
                </Link>
                <Link
                  href={tryFreeCta.href}
                  onClick={closeMobile}
                  className="inline-flex min-h-[var(--control-lg)] items-center justify-center rounded-md bg-brand-accent px-unit-4 text-label-semibold text-white hover:bg-brand-accent-hover"
                >
                  {tCta(tryFreeCta.labelKey)}
                </Link>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
