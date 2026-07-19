'use client';

import { Eye, EyeSlash } from 'iconsax-react';
import { useId, useState } from 'react';
import { PASSWORD_MIN, passwordRules } from '@/src/features/auth/validation/auth-validation';

type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  autoComplete?: string;
  label?: string;
  showRules?: boolean;
};

const inputClass =
  'h-11 w-full rounded-md border border-border-subtle bg-paper pl-3 pr-11 font-body-default text-body-default text-ink placeholder:text-secondary transition-colors focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30';

export default function PasswordField({
  value,
  onChange,
  error,
  autoComplete = 'current-password',
  label = 'Kata sandi',
  showRules = autoComplete === 'new-password',
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const toggleId = `${reactId}-toggle`;
  const errorId = error ? `${reactId}-error` : undefined;
  const rulesId = showRules ? `${reactId}-rules` : undefined;
  const describedBy = [errorId, rulesId].filter(Boolean).join(' ') || undefined;
  const rules = passwordRules(value);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="font-caption text-caption font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={inputClass}
        />
        <button
          id={toggleId}
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          aria-pressed={visible}
          aria-controls={inputId}
          className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded text-secondary transition-colors hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30"
        >
          {visible ? (
            <EyeSlash size={18} variant="Outline" color="currentColor" />
          ) : (
            <Eye size={18} variant="Outline" color="currentColor" />
          )}
        </button>
      </div>
      {showRules ? (
        <ul
          id={rulesId}
          aria-label="Ketentuan kata sandi"
          className="flex flex-wrap gap-x-3 gap-y-0.5 font-caption text-caption text-secondary"
        >
          {rules.map((rule) => (
            <li
              key={rule.key}
              className={`flex items-center gap-1 ${rule.valid ? 'text-success' : ''}`}
            >
              <span aria-hidden="true">{rule.valid ? '✓' : '·'}</span>
              {rule.label}
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="font-caption text-caption text-burgundy">
          {error}
        </p>
      ) : null}
    </div>
  );
}
