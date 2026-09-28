'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
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

const fieldError = (
  t: (key: string) => string,
  errors: Record<string, string[]>,
  key: FieldKey,
): string | undefined => {
  const first = errors[key]?.[0];
  return first ? t(first) : undefined;
};

export default function LoginPage() {
  const t = useTranslations('auth');
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
          next[failure.field] = t(failure.message);
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
          eyebrow={t('login.sideEyebrow')}
          title={t('login.sideTitle')}
          description={t('login.sideDescription')}
        />
      }
    >
      <AuthFormShell
        title={t('login.title')}
        foot={
          <>
            {t('login.noAccount')}{' '}
            <Link href="/daftar" className="text-burgundy hover:underline">
              {t('login.registerLink')}
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
            error={localErrors.identifier ?? fieldError(t, submit.fieldErrors, 'identifier')}
            autoFocus
            required
          />
          <PasswordField
            value={password}
            onChange={setPassword}
            error={localErrors.password ?? fieldError(t, submit.fieldErrors, 'password')}
          />
          <div className="flex justify-end">
            <Link
              href="/lupa-sandi"
              className="font-body-sm text-body-sm text-burgundy hover:underline"
            >
              {t('login.forgotPassword')}
            </Link>
          </div>
          <SubmitButton
            label={t('login.submit')}
            busyLabel={t('login.submitBusy')}
            busy={submit.busy}
          />
        </form>
      </AuthFormShell>
    </AuthShell>
  );
}
