import Link from 'next/link';
import type { CtaVariant } from '@/src/lib/marketing/ctas';

export type ButtonProps = {
  ctaId?: string;
  label?: string;
  href?: string;
  variant?: CtaVariant;
  size?: 'default' | 'lg';
  className?: string;
};

const variantClass: Record<CtaVariant, string> = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--secondary',
  text: 'btn btn--text',
};

export default function Button({
  ctaId,
  label,
  href,
  variant = 'primary',
  size = 'default',
  className,
}: ButtonProps) {
  const finalHref = href ?? '#';
  const finalLabel = label ?? '';
  const sizeClass = size === 'lg' ? 'btn--lg' : '';
  const classes = [variantClass[variant], sizeClass, className ?? ''].filter(Boolean).join(' ');
  return (
    <Link data-cta={ctaId} className={classes} href={finalHref}>
      {finalLabel}
    </Link>
  );
}
