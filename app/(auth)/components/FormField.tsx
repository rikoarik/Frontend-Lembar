'use client';

import type { InputHTMLAttributes, ReactElement } from 'react';
import { useId } from 'react';

type FormFieldProps = {
  label: string;
  error?: string | undefined;
  help?: string;
  children: (control: InputHTMLAttributes<HTMLInputElement>) => ReactElement;
};

const inputClass =
  'h-11 w-full rounded-md border border-border-subtle bg-paper px-3 font-body-default text-body-default text-ink placeholder:text-secondary transition-colors focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30';

export default function FormField({ label, error, help, children }: FormFieldProps) {
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;
  const helpId = help ? `${id}-help` : undefined;

  const passProps = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [errorId, helpId].filter(Boolean).join(' ') || undefined,
    className: inputClass,
  } satisfies InputHTMLAttributes<HTMLInputElement>;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-caption text-caption font-medium text-ink"
      >
        {label}
      </label>
      {children(passProps)}
      {help ? (
        <p id={helpId} className="font-caption text-caption text-secondary">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="font-caption text-caption text-burgundy">
          {error}
        </p>
      ) : null}
    </div>
  );
}
