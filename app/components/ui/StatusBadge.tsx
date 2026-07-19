import type { HTMLAttributes, ReactNode } from 'react';

/**
 * StatusBadge — compact label for document/job state.
 * Allowed labels (per DESIGN-SYSTEM.md §"Status badge"):
 *   Draft | Diproses | Perlu ditinjau | Final | Gagal | Kedaluwarsa
 * Badge never replaces surrounding explanatory state. Color is reinforced by the
 * label and (when meaningful) a leading dot, not by color alone (DESIGN-SYSTEM.md
 * §"Accessibility").
 */

export type StatusLabel =
  | 'Draft'
  | 'Diproses'
  | 'Perlu ditinjau'
  | 'Final'
  | 'Gagal'
  | 'Kedaluwarsa';

type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-brand-paper text-brand-ink border-brand-line',
  info: 'bg-brand-info-soft text-brand-info border-brand-info/30',
  warning: 'bg-brand-warning-soft text-brand-warning border-brand-warning/30',
  success: 'bg-brand-success-soft text-brand-success border-brand-success/30',
  danger: 'bg-brand-danger-soft text-brand-danger border-brand-danger/30',
};

const toneFor: Record<StatusLabel, Tone> = {
  Draft: 'neutral',
  Diproses: 'info',
  'Perlu ditinjau': 'warning',
  Final: 'success',
  Gagal: 'danger',
  Kedaluwarsa: 'danger',
};

export type StatusBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  label: StatusLabel;
  children?: ReactNode;
};

export function StatusBadge({ label, className, ...rest }: StatusBadgeProps) {
  const tone = toneFor[label];
  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5',
        'text-label-semibold whitespace-nowrap',
        toneClass[tone],
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
