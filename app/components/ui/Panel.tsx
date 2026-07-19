import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Panel — border by default, no shadow. Optional elevated variant uses shadow-md
 * (DESIGN-SYSTEM.md §"Radius and shadow": "Most app panels use border without shadow.
 * Modal/popover may use shadow-md."). Nested depth limited to one.
 */

export type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: 'section' | 'article' | 'aside' | 'div';
  /** When true, applies shadow-md (popover/modal only). Default: false (border only). */
  elevated?: boolean;
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export function Panel({
  as: Tag = 'section',
  elevated = false,
  title,
  description,
  actions,
  className,
  children,
  ...rest
}: PanelProps) {
  const surface = elevated
    ? 'rounded-md bg-brand-surface-raised border border-brand-line shadow-md'
    : 'rounded-md bg-brand-surface-raised border border-brand-line';
  return (
    <Tag className={[surface, className ?? ''].filter(Boolean).join(' ')} {...rest}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-brand-line px-4 py-3">
          <div className="flex flex-col gap-1">
            {title ? (
              <h2 className="text-body-default font-semibold text-brand-ink">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-body-sm text-brand-ink-muted">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      )}
      <div className="px-4 py-3">{children}</div>
    </Tag>
  );
}
