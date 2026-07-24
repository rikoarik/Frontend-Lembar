'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

const REDUCED_MOTION_MQ = '(prefers-reduced-motion: reduce)';

/**
 * Smooth scrolling only for public marketing pages.
 * App/admin shells use native overflow scroll and break under Lenis.
 */
function isMarketingPath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (
    pathname.startsWith('/app') ||
    pathname.startsWith('/ops') ||
    pathname.startsWith('/school') ||
    pathname.startsWith('/masuk') ||
    pathname.startsWith('/daftar') ||
    pathname.startsWith('/lupa-sandi') ||
    pathname.startsWith('/reset-sandi') ||
    pathname.startsWith('/undangan') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/bagikan') ||
    pathname.startsWith('/v1')
  ) {
    return false;
  }
  return true;
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia(REDUCED_MOTION_MQ).matches) return;
    if (!isMarketingPath(pathname)) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.6,
      // Keep nested overflow / form controls on native scroll.
      prevent: (node: HTMLElement) => {
        if (
          node.closest(
            'textarea, input, select, [data-lenis-prevent], [data-scroll-lock], .overflow-y-auto, .overflow-auto',
          )
        ) {
          return true;
        }
        return false;
      },
    });

    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [pathname]);

  return <>{children}</>;
}
