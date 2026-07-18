'use client';

import { ArrowDown2 } from 'iconsax-react';
import { useId, useState } from 'react';

export type CountryDial = {
  code: string;
  flag: string;
  label: string;
  dial: string;
  max: number;
  sample: string;
};

export const DIAL_COUNTRIES: readonly CountryDial[] = [
  { code: 'ID', flag: '🇮🇩', label: 'Indonesia', dial: '+62', max: 12, sample: '812 3456 7890' },
  { code: 'MY', flag: '🇲🇾', label: 'Malaysia', dial: '+60', max: 11, sample: '12 345 6789' },
  { code: 'SG', flag: '🇸🇬', label: 'Singapura', dial: '+65', max: 10, sample: '8123 4567' },
  { code: 'TL', flag: '🇹🇱', label: 'Timor Leste', dial: '+670', max: 9, sample: '772 1234' },
  { code: 'PH', flag: '🇵🇭', label: 'Filipina', dial: '+63', max: 11, sample: '917 123 4567' },
  { code: 'AU', flag: '🇦🇺', label: 'Australia', dial: '+61', max: 10, sample: '412 345 678' },
  { code: 'JP', flag: '🇯🇵', label: 'Jepang', dial: '+81', max: 11, sample: '90 1234 5678' },
  { code: 'KR', flag: '🇰🇷', label: 'Korea Selatan', dial: '+82', max: 11, sample: '10 1234 5678' },
  { code: 'US', flag: '🇺🇸', label: 'Amerika Serikat', dial: '+1', max: 10, sample: '202 555 0143' },
  { code: 'GB', flag: '🇬🇧', label: 'Inggris', dial: '+44', max: 11, sample: '7911 123456' },
];

const DEFAULT_COUNTRY = DIAL_COUNTRIES[0];

function findCountry(code: string): CountryDial {
  return DIAL_COUNTRIES.find((country) => country.code === code) ?? DEFAULT_COUNTRY;
}

function digitsOnly(input: string) {
  return input.replace(/\D+/g, '');
}

function localDigits(value: string, country: CountryDial): string {
  const digits = digitsOnly(value);
  const dial = digitsOnly(country.dial);
  return digits.startsWith(dial) ? digits.slice(dial.length) : digits;
}

function formatForCountry(value: string, country: CountryDial): string {
  const digits = digitsOnly(value).slice(0, country.max);
  if (!digits) return '';

  if (country.code === 'ID' || country.code === 'MY' || country.code === 'AU') {
    return digits.replace(/(\d{3,4})(\d{3,4})?(\d+)?/, (_match, a, b, c) =>
      [a, b, c].filter(Boolean).join(' '),
    );
  }
  if (country.code === 'SG' || country.code === 'JP' || country.code === 'KR' || country.code === 'TL') {
    return digits.replace(/(\d{3,4})(\d{4})?(\d+)?/, (_match, a, b, c) =>
      [a, b, c].filter(Boolean).join(' '),
    );
  }
  if (country.code === 'US' || country.code === 'PH') {
    return digits.replace(/(\d{3})(\d{3})(\d+)?/, (_match, a, b, c) =>
      [a, b, c].filter(Boolean).join(' '),
    );
  }
  if (country.code === 'GB') {
    return digits.replace(/(\d{4})(\d+)?/, (_match, a, b) =>
      [a, b].filter(Boolean).join(' '),
    );
  }
  return digits;
}

function fullPhone(country: CountryDial, local: string): string {
  const formatted = formatForCountry(local, country);
  return formatted ? `${country.dial} ${formatted}` : '';
}

type PhoneFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  defaultCountry?: string;
  autoComplete?: string;
};

export default function PhoneField({
  value,
  onChange,
  error,
  defaultCountry,
  autoComplete = 'tel',
}: PhoneFieldProps) {
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const selectId = `${reactId}-country`;
  const errorId = error ? `${reactId}-error` : undefined;
  const [country, setCountry] = useState(() =>
    findCountry(defaultCountry ?? DEFAULT_COUNTRY.code),
  );

  const visibleValue = formatForCountry(localDigits(value, country), country);

  const handleCountryChange = (code: string) => {
    const next = findCountry(code);
    const local = localDigits(value, country);
    setCountry(next);
    onChange(fullPhone(next, local));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="font-caption text-caption font-medium text-ink">
        Nomor telepon
      </label>
      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex w-[6.5rem] items-center gap-1.5 px-3 text-secondary"
        >
          <span className="text-[16px] leading-none">{country.flag}</span>
          <span className="font-caption text-caption font-medium">{country.dial}</span>
          <ArrowDown2 size={12} variant="Linear" color="currentColor" />
        </div>
        <select
          id={selectId}
          aria-label="Pilih kode negara"
          value={country.code}
          onChange={(event) => handleCountryChange(event.target.value)}
          className="absolute inset-y-0 left-0 z-10 w-[6.5rem] cursor-pointer opacity-0"
        >
          {DIAL_COUNTRIES.map((entry) => (
            <option key={entry.code} value={entry.code}>
              {entry.flag} {entry.label} ({entry.dial})
            </option>
          ))}
        </select>
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          pattern="[0-9 ]*"
          autoComplete={autoComplete}
          value={visibleValue}
          onChange={(event) => onChange(fullPhone(country, event.target.value))}
          placeholder={country.sample}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className="h-11 w-full rounded-md border border-border-subtle bg-paper pl-[6.5rem] pr-3 font-body-default text-body-default text-ink placeholder:text-secondary/70 transition-colors focus-visible:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30"
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="font-caption text-caption text-burgundy">
          {error}
        </p>
      ) : null}
    </div>
  );
}
