'use client';

type FormStatusProps = {
  tone?: 'idle' | 'alert';
  message?: string | undefined;
};

export default function FormStatus({ tone = 'idle', message }: FormStatusProps) {
  if (!message) return null;
  const role = tone === 'alert' ? 'alert' : 'status';
  return (
    <p
      role={role}
      aria-live={tone === 'alert' ? 'assertive' : 'polite'}
      className={
        tone === 'alert'
          ? 'rounded-lg border border-border-strong bg-red-50 px-3 py-2 font-body-sm text-body-sm text-burgundy'
          : 'rounded-lg border border-border-subtle bg-surface-container-low px-3 py-2 font-body-sm text-body-sm text-ink'
      }
    >
      {message}
    </p>
  );
}
