'use client';

import { Spinner } from '@/app/components/ui/Spinner';

type SubmitButtonProps = {
  label: string;
  busyLabel: string;
  busy?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
};

export default function SubmitButton({
  label,
  busyLabel,
  busy,
  disabled,
  name,
  value,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      aria-busy={busy ? true : undefined}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-burgundy px-4 font-label-semibold text-label-semibold text-on-primary transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30 disabled:cursor-not-allowed disabled:opacity-60"
      name={name}
      value={value}
    >
      {busy ? (
        <>
          <Spinner size="sm" />
          <span>{busyLabel}</span>
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
}
