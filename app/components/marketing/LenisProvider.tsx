'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

const REDUCED_MOTION_MQ = '(prefers-reduced-motion: reduce)';

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia(REDUCED_MOTION_MQ).matches) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
