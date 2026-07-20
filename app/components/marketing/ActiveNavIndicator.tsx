'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function ActiveNavIndicator() {
  const reduce = useReducedMotion();
  if (reduce) return <span className="sr-only" aria-hidden="true" />;
  return (
    <motion.span
      aria-hidden="true"
      className="absolute inset-x-unit-2 bottom-unit-1 h-0.5 rounded-full bg-brand-accent"
      layoutId="marketing-nav-indicator"
      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
    />
  );
}
