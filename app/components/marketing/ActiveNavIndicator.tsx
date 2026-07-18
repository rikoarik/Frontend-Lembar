'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function ActiveNavIndicator() {
  const reduce = useReducedMotion();
  if (reduce) return <span className="nav__indicator" aria-hidden="true" />;
  return (
    <motion.span
      className="nav__indicator"
      aria-hidden="true"
      layoutId="marketing-nav-indicator"
      transition={{ type: 'spring', stiffness: 360, damping: 32 }}
    />
  );
}
