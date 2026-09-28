'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';
import AuthShell from '../AuthShell';
import AuthSidePanel from '../components/AuthSidePanel';
import AuthFormShell from '../components/AuthFormShell';
import FormStatus from '../components/FormStatus';
import PasswordField from '../components/PasswordField';
import Notice from '../components/Notice';
import SubmitButton from '../components/SubmitButton';
import { authService } from '@/src/services/auth/authService';
import { validateResetPassword } from '@/src/features/auth/validation/auth-validation';
import { useAuthSubmit } from '@/src/features/auth/state/useAuthSubmit';
import { resolveErrorMessage } from '@/src/services/auth/errorMapping';
import { useSearchParams } from 'next/navigation';

function ResetPasswordInner() {
  const t = useTranslations('auth');
  const tErrors = useTranslations();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [matchError, setMatchError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);
  const [tokenMissing, setTokenMissing] = useState(token.trim().length === 0);

  const submit = useAuthSubmit<{ token: string; password: string }>({
    submit: (input, idempotencyKey) => authService.resetPassword(input, idempotencyKey),
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (token.trim().length === 0) {
      setTokenMissing(true);
      return;
    }
    if (password !== confirm) {
      setMatchError(t('passwordMismatch'));
      return;
    }
    setMatchError(undefined);
    void submit.submit({ token, password }).then((result) => {
      if (result.ok) setSaved(true);
    });
  };

  if (tokenMissing) {
    return (
      <AuthShell
        side={
          <AuthSidePanel
            eyebrow={t('reset.sideEyebrow')}
            title={t('reset.missingTitle')}
            description={t('reset.missingDescription')}
          />
        }
      >
        <AuthFormShell
          eyebrow={t('reset.missingEyebrow')}
          title={t('reset.missingFormTitle')}
          foot={
            <Link href="/lupa-sandi" className="text-burgundy hover:underline">
              {t('reset.requestNewLink')}
            </Link>
          }
        >
          <Notice tone="danger" title={t('reset.invalidTitle')}>
            {t('reset.invalidBody')}
          </Notice>
        </AuthFormShell>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      side={
        <AuthSidePanel
          eyebrow={t('reset.sideEyebrow')}
          title={t('reset.sideTitle')}
          description={t('reset.sideDescription')}
        />
      }
    >
      <AuthFormShell
        eyebrow={t('reset.eyebrow')}
        title={t('reset.title')}
        foot={
          saved ? (
            <Link href="/masuk" className="text-burgundy hover:underline">
              {t('backToLogin')}
            </Link>
          ) : (
            <>
              {t('reset.notChanging')}{' '}
              <Link href="/masuk" className="text-burgundy hover:underline">
                {t('backToLogin')}
              </Link>
            </>
          )
        }
      >
        {saved ? (
          <Notice tone="success" title={t('reset.savedTitle')}>
            {t('reset.savedBody')}
          </Notice>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            <FormStatus
              tone="alert"
              message={resolveErrorMessage(tErrors, submit.error?.safeMessage)}
            />
            <PasswordField
              label={t('labels.newPassword')}
              value={password}
              onChange={setPassword}
              error={matchError}
              autoComplete="new-password"
            />
            <PasswordField
              label={t('labels.confirmPassword')}
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
            />
            <SubmitButton
              label={t('reset.submit')}
              busyLabel={t('reset.submitBusy')}
              busy={submit.busy}
            />
          </form>
        )}
      </AuthFormShell>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
