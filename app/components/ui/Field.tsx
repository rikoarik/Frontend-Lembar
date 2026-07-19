import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

/**
 * Field — wrapper primitive (DESIGN-SYSTEM.md §"Field").
 * - label above control (never placeholder as label)
 * - description rendered as `help`
 * - error is wired via `aria-describedby` to the input
 * - optional required marker; required state is explicit
 * This wrapper composes around arbitrary children so any control (input, select,
 * textarea, custom radio group) can sit inside without coupling to a specific
 * input element.
 */

export type FieldProps = {
  /** Label text rendered above the control. Required for a11y. */
  label: ReactNode;
  /** Help text rendered under the control (description). */
  help?: ReactNode;
  /** Error message. When present, the description wiring switches to error only. */
  error?: ReactNode;
  /** Marks the field as required and surfaces a "wajib" marker. */
  required?: boolean;
  /** Optional class for the outer wrapper. */
  className?: string;
  /** The control to wrap. The wrapper wires `aria-describedby`/`aria-invalid` automatically. */
  children: (props: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': boolean;
    'aria-required': boolean;
  }) => ReactNode;
};

export function Field({ label, help, error, required = false, className, children }: FieldProps) {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const helpId = `${baseId}-help`;
  const errorId = `${baseId}-error`;
  const describedBy =
    [help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={['flex flex-col gap-2', className ?? ''].filter(Boolean).join(' ')}>
      <label htmlFor={inputId} className="text-label-semibold text-brand-ink">
        <span>{label}</span>
        {required ? (
          <span aria-hidden="true" className="text-brand-danger">
            {' '}
            *
          </span>
        ) : null}
        {required ? <span className="sr-only"> (wajib diisi)</span> : null}
      </label>
      {children({
        id: inputId,
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error),
        'aria-required': required,
      })}
      {help ? (
        <p id={helpId} className="text-body-sm text-brand-ink-muted">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-body-sm text-brand-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * TextField — small helper that pairs Field with a plain `<input type="text">`.
 * Provided for ergonomic composition; not required.
 */
export type TextFieldProps = Omit<FieldProps, 'children'> &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'required' | 'aria-required'> &
  Partial<
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'required' | 'aria-required'>
  > & {
    /** When true, renders `<textarea>` instead of `<input>`. */
    multiline?: boolean;
  };

export function TextField({
  label,
  help,
  error,
  required,
  className,
  multiline = false,
  ...input
}: TextFieldProps) {
  const controlClass = [
    'block w-full rounded-md border bg-brand-surface-raised',
    error ? 'border-brand-danger' : 'border-brand-line',
    'px-3 py-2 text-body-default text-brand-ink placeholder:text-brand-ink-subtle',
    'focus-visible:outline-2 focus-visible:outline focus-visible:outline-brand-focus',
    'focus-visible:outline-offset-2 focus-visible:border-brand-line-strong',
    'disabled:bg-brand-paper disabled:cursor-not-allowed',
  ].join(' ');
  return (
    <Field label={label} help={help} error={error} required={required} className={className}>
      {(props) =>
        multiline ? (
          <textarea
            className={controlClass}
            {...props}
            {...(input as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input className={controlClass} {...props} {...input} />
        )
      }
    </Field>
  );
}
