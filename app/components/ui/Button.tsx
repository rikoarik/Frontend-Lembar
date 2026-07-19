import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Button — primitive. See docs/frontend/DESIGN-SYSTEM.md §"Button".
 * - variants: primary | secondary | quiet | danger | link
 * - sizes:    sm (36) | md (40) | lg (44)
 * - states:   default | hover | active | focus-visible | disabled | loading
 * Loading preserves width and label context; uses deterministic Indonesian label,
 * not spinner-only. Disabled reason should be provided via the disabled prop plus
 * adjacent help text in the caller (DESIGN-SYSTEM.md §"Forms").
 */

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  children?: ReactNode;
  className?: string;
};

export type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

export type LinkButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'> & {
    href: string;
  };

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-md ' +
  'transition-colors duration-[var(--motion-fast)] ease-[ease-out] ' +
  'focus-visible:outline-2 focus-visible:outline focus-visible:outline-brand-focus ' +
  'focus-visible:outline-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-60 select-none whitespace-nowrap ' +
  'min-h-[var(--control-md)]';

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-[var(--control-sm)] px-3 text-body-sm',
  md: 'h-[var(--control-md)] px-4 text-body-default',
  lg: 'h-[var(--control-lg)] px-5 text-body-default',
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-accent text-white hover:bg-brand-accent-hover ' +
    'active:bg-brand-accent-hover disabled:bg-brand-accent',
  secondary:
    'bg-brand-surface-raised text-brand-ink border border-brand-line ' +
    'hover:border-brand-line-strong active:bg-brand-paper disabled:bg-brand-paper',
  quiet:
    'bg-transparent text-brand-ink hover:bg-brand-paper active:bg-brand-line/30 ' +
    'disabled:bg-transparent',
  danger:
    'bg-brand-danger text-white hover:bg-brand-accent-hover ' +
    'active:bg-brand-accent-hover disabled:bg-brand-danger',
  link:
    'bg-transparent text-brand-accent hover:text-brand-accent-hover ' +
    'underline underline-offset-4 px-0 min-h-0 h-auto',
};

const join = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingLabel,
    type = 'button',
    disabled,
    children,
    className,
    'aria-busy': ariaBusy,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || ariaBusy}
      className={join(base, sizeClass[size], variantClass[variant], className)}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full bg-current opacity-70"
        />
      ) : null}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
    </button>
  );
});

export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingLabel,
    children,
    className,
    'aria-busy': ariaBusy,
    ...rest
  },
  ref,
) {
  return (
    <a
      ref={ref}
      aria-busy={loading || ariaBusy}
      aria-disabled={loading || undefined}
      className={join(base, sizeClass[size], variantClass[variant], className)}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full bg-current opacity-70"
        />
      ) : null}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
    </a>
  );
});
