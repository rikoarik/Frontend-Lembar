'use client';

import Link from 'next/link';
import { useState } from 'react';
import AuthShell from '../AuthShell';
import AuthSidePanel from '../components/AuthSidePanel';
import AuthFormShell from '../components/AuthFormShell';
import FormStatus from '../components/FormStatus';
import GoogleAuthButton from '../components/GoogleAuthButton';
import AuthMethodDivider from '../components/AuthMethodDivider';
import IdentityInput from '../components/IdentityInput';
import PasswordField from '../components/PasswordField';
import SubmitButton from '../components/SubmitButton';
import { authService } from '@/src/services/auth/authService';
import { validateLogin } from '@/src/features/auth/validation/auth-validation';
import { useAuthSubmit } from '@/src/features/auth/state/useAuthSubmit';

type FieldKey = 'identifier' | 'password';

const fieldError = (errors: Record<string, string[]>, key: FieldKey): string | undefined =>
  errors[key]?.[0];

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localErrors, setLocalErrors] = useState<Partial<Record<FieldKey, string>>>({});

  const submit = useAuthSubmit<{ identifier: string; password: string }>({
    submit: (input, idempotencyKey) => {
      if (input.identifier.trim().toLowerCase() === 'ops') {
        return authService.login(
          { identifier: input.identifier, password: input.password },
          idempotencyKey,
        );
      }
      return authService.login(input, idempotencyKey);
    },
    onSuccess: (value) => {
      const payload = value as {
        homePath?: string;
        activeRole?: string;
        workspaceId?: string;
      } | null;
      const next = new URLSearchParams(window.location.search).get('next');
      const safeNext = next?.startsWith('/') && !next.startsWith('//') ? next : null;
      window.location.href = safeNext || payload?.homePath || '/app';
    },
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateLogin({ identifier, password });
    if (!validation.ok) {
      const next: Partial<Record<FieldKey, string>> = {};
      for (const failure of validation.failures) {
        if (failure.field === 'identifier' || failure.field === 'password') {
          next[failure.field] = failure.message;
        }
      }
      setLocalErrors(next);
      return;
    }
    setLocalErrors({});
    void submit.submit({ identifier: identifier.trim(), password });
  };

  return (
    <AuthShell
      side={
        <AuthSidePanel
          eyebrow="Ruang kerja lembar"
          title="Dari materi ke lembar siap ditinjau."
          description="Guru, admin sekolah, dan ops memakai portal masuk yang sama. Role diarahkan ke panel yang tepat."
        />
      }
    >
      <AuthFormShell
        title="Masuk ke lembar"
        foot={
          <>
            Belum punya akun?{' '}
            <Link href="/daftar" className="text-burgundy hover:underline">
              Daftar gratis
            </Link>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <GoogleAuthButton intent="masuk" />
          <AuthMethodDivider />
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3.5" noValidate>
          <FormStatus
            tone={submit.error?.code === 'INVALID_CREDENTIALS' ? 'alert' : 'idle'}
            message={submit.statusMessage}
          />
          <IdentityInput
            value={identifier}
            onChange={setIdentifier}
            error={localErrors.identifier ?? fieldError(submit.fieldErrors, 'identifier')}
            autoFocus
            required
          />
          <PasswordField
            value={password}
            onChange={setPassword}
            error={localErrors.password ?? fieldError(submit.fieldErrors, 'password')}
          />
          <div className="flex justify-end">
            <Link
              href="/lupa-sandi"
              className="font-body-sm text-body-sm text-burgundy hover:underline"
            >
              Lupa kata sandi?
            </Link>
          </div>
          <SubmitButton label="Masuk" busyLabel="Memverifikasi…" busy={submit.busy} />
        </form>
      </AuthFormShell>
    </AuthShell>
  );
}
