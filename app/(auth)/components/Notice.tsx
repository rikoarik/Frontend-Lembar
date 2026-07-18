'use client';

type Tone = 'info' | 'success' | 'warning' | 'danger';

type NoticeProps = {
  tone?: Tone;
  title?: string;
  children: string;
};

const TONE: Record<Tone, string> = {
  info: 'border-border-subtle bg-surface-container-low text-ink',
  success: 'border-border-subtle bg-surface-container-low text-success',
  warning: 'border-border-subtle bg-warning-soft text-warning',
  danger: 'border-border-subtle bg-danger-soft text-burgundy',
};

export default function Notice({ tone = 'info', title, children }: NoticeProps) {
  return (
    <div className={`flex flex-col gap-1 rounded-lg border px-3 py-2 ${TONE[tone]}`}>
      {title ? (
        <strong className="font-label-semibold text-label-semibold">{title}</strong>
      ) : null}
      <p className="font-body-sm text-body-sm">{children}</p>
    </div>
  );
}
