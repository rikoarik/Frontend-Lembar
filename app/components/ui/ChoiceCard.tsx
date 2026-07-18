import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

/**
 * ChoiceCard — radio/checkbox wrapper (DESIGN-SYSTEM.md §"Choice card").
 * The whole card is one radio/checkbox target with visible selected and focus
 * state. Title plus one-line description. Status is not color-only.
 */

export type ChoiceKind = 'radio' | 'checkbox';

export type ChoiceCardProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'children' | 'className'
> & {
  kind?: ChoiceKind;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

const base =
  'flex items-start gap-3 rounded-md border border-brand-line bg-brand-surface-raised ' +
  'p-3 text-left transition-colors duration-[var(--motion-fast)] ease-[ease-out] ' +
  'hover:border-brand-line-strong cursor-pointer ' +
  'has-[input:checked]:border-brand-accent has-[input:checked]:bg-brand-accent-soft ' +
  'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-60 ' +
  'has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline ' +
  'has-[input:focus-visible]:outline-brand-focus has-[input:focus-visible]:outline-offset-2';

export const ChoiceCard = forwardRef<HTMLInputElement, ChoiceCardProps>(function ChoiceCard(
  { kind = 'radio', title, description, className, id, ...rest },
  ref,
) {
  return (
    <label className={[base, className ?? ''].filter(Boolean).join(' ')}>
      <input ref={ref} id={id} type={kind} className="mt-1 h-4 w-4 accent-brand-accent" {...rest} />
      <span className="flex flex-col gap-1">
        <span className="text-body-default font-medium text-brand-ink">{title}</span>
        {description ? (
          <span className="text-body-sm text-brand-ink-muted">{description}</span>
        ) : null}
      </span>
    </label>
  );
});
