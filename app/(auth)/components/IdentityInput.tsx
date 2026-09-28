import { useTranslations } from 'next-intl';
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
  const t = useTranslations('auth');
  return (
    <FormField label={t('labels.identity')} error={error}>
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
