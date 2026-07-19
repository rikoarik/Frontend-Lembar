'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthShell from '../AuthShell';
import AuthSidePanel from '../components/AuthSidePanel';
import AuthFormShell from '../components/AuthFormShell';
import FormStatus from '../components/FormStatus';
import GoogleAuthButton from '../components/GoogleAuthButton';
import AuthMethodDivider from '../components/AuthMethodDivider';
import FormField from '../components/FormField';
import PasswordField from '../components/PasswordField';
import PhoneField from '../components/PhoneField';
import SubmitButton from '../components/SubmitButton';
import { authService } from '@/src/services/auth/authService';
import { validateRegister } from '@/src/features/auth/validation/auth-validation';
import { useAuthSubmit } from '@/src/features/auth/state/useAuthSubmit';

type FieldKey = 'username' | 'email' | 'phone' | 'password' | 'confirmPassword';

const fieldError = (errors: Record<string, string[]>, key: FieldKey): string | undefined =>
  errors[key]?.[0];

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localErrors, setLocalErrors] = useState<Partial<Record<FieldKey, string>>>({});

  const submit = useAuthSubmit<{
    username: string;
    email: string;
    phone: string;
    password: string;
  }>({
    submit: (input, idempotencyKey) => authService.register(input, idempotencyKey),
    onSuccess: () => {
      window.location.href = '/app';
    },
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateRegister({ username, email, phone, password });
    const next: Partial<Record<FieldKey, string>> = {};
    if (!validation.ok) {
      for (const failure of validation.failures) {
        if (
          failure.field === 'username' ||
          failure.field === 'email' ||
          failure.field === 'phone' ||
          failure.field === 'password'
        ) {
          next[failure.field] = failure.message;
        }
      }
    }
    if (password !== confirmPassword) {
      next.confirmPassword = 'Konfirmasi kata sandi tidak cocok.';
    }
    if (Object.keys(next).length > 0) {
      setLocalErrors(next);
      return;
    }
    setLocalErrors({});
    void submit.submit({
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    });
  };

  return (
    <AuthShell
      side={
        <AuthSidePanel
          eyebrow="Ruang kerja pribadi"
          title="Mulai dari satu lembar yang siap ditinjau."
          description="Simpan draft, sumber, dan hasil kerja dalam ruang yang Anda kelola sendiri."
        />
      }
    >
      <AuthFormShell
        title="Buat akun lembar"
        foot={
          <span className="font-body-sm text-body-sm text-secondary">
            Dengan membuat akun, Anda menyetujui{' '}
            <Link href="/legal/syarat" className="text-burgundy hover:underline">
              Syarat Penggunaan
            </Link>{' '}
            dan{' '}
            <Link href="/legal/privasi" className="text-burgundy hover:underline">
              Kebijakan Privasi
            </Link>
            .
          </span>
        }
      >
        <div className="flex flex-col gap-5">
          <GoogleAuthButton intent="daftar" />
          <AuthMethodDivider />
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
          <FormStatus
            tone={submit.error?.code === 'DUPLICATE_RESOURCE' ? 'alert' : 'idle'}
            message={submit.statusMessage}
          />
          <FormField
            label="Username"
            error={localErrors.username ?? fieldError(submit.fieldErrors, 'username')}
          >
            {(control) => (
              <input
                {...control}
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            )}
          </FormField>
          <FormField
            label="Email"
            error={localErrors.email ?? fieldError(submit.fieldErrors, 'email')}
          >
            {(control) => (
              <input
                {...control}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            )}
          </FormField>
          <PhoneField
            value={phone}
            onChange={setPhone}
            error={localErrors.phone ?? fieldError(submit.fieldErrors, 'phone')}
          />
          <PasswordField
            label="Kata sandi"
            value={password}
            onChange={(value) => {
              setPassword(value);
              if (localErrors.confirmPassword && value === confirmPassword) {
                setLocalErrors((current) => ({ ...current, confirmPassword: undefined }));
              }
            }}
            error={localErrors.password ?? fieldError(submit.fieldErrors, 'password')}
            autoComplete="new-password"
          />
          <PasswordField
            label="Konfirmasi kata sandi"
            value={confirmPassword}
            onChange={(value) => {
              setConfirmPassword(value);
              setLocalErrors((current) => ({
                ...current,
                confirmPassword:
                  value.length > 0 && value !== password
                    ? 'Konfirmasi kata sandi tidak cocok.'
                    : undefined,
              }));
            }}
            error={localErrors.confirmPassword}
            autoComplete="new-password"
            showRules={false}
          />
          <SubmitButton label="Buat akun" busyLabel="Membuat akun…" busy={submit.busy} />
          <p className="font-body-sm text-body-sm text-secondary">
            Sudah punya akun?{' '}
            <Link href="/masuk" className="text-burgundy hover:underline">
              Masuk
            </Link>
            .
          </p>
        </form>
      </AuthFormShell>
    </AuthShell>
  );
}
