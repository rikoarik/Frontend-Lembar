'use client';

import FormField from './FormField';

type IdentityInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  autoFocus?: boolean;
  required?: boolean;
};

export default function IdentityInput({
  value,
  onChange,
  error,
  autoFocus,
  required,
}: IdentityInputProps) {
  return (
    <FormField label="Username, email, atau nomor telepon" error={error}>
      {(control) => (
        <input
          {...control}
          type="text"
          inputMode="email"
          autoComplete="username"
          autoFocus={autoFocus}
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FormField>
  );
}
