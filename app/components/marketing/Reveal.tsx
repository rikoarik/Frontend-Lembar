'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  id?: string;
  'aria-labelledby'?: string;
};

// One transition used everywhere so motion feels coherent across the page.
const EASE = [0.16, 1, 0.3, 1] as const;

export function RevealText({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

export function RevealSection({
  children,
  delay = 0,
  className,
  id,
  'aria-labelledby': ariaLabelledBy,
}: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce)
    return (
      <section id={id} aria-labelledby={ariaLabelledBy} className={className}>
        {children}
      </section>
    );
  return (
    <motion.section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.55, ease: EASE, delay }}
    >
      {children}
    </motion.section>
  );
}

export function RevealMedia({ children, delay = 0, className }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
