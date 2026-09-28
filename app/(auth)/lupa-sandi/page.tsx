'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import AuthShell from '../AuthShell';
import AuthSidePanel from '../components/AuthSidePanel';
import AuthFormShell from '../components/AuthFormShell';
import FormStatus from '../components/FormStatus';
import IdentityInput from '../components/IdentityInput';
import Notice from '../components/Notice';
import SubmitButton from '../components/SubmitButton';
import { authService } from '@/src/services/auth/authService';
import { validateRecoveryRequest } from '@/src/features/auth/validation/auth-validation';
import { recoveryRequestCopy, resolveErrorMessage } from '@/src/services/auth/errorMapping';
import { useAuthSubmit } from '@/src/features/auth/state/useAuthSubmit';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const tErrors = useTranslations();
  const [identifier, setIdentifier] = useState('');
  const [localError, setLocalError] = useState<string | undefined>();
  const [delivered, setDelivered] = useState(false);

  const submit = useAuthSubmit<{ identifier: string }>({
    submit: async (input, idempotencyKey) => {
      const result = await authService.requestRecovery(input, idempotencyKey);
      return result.ok ? result : result;
    },
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateRecoveryRequest({ identifier });
    if (!validation.ok) {
      const first = validation.failures[0];
      setLocalError(first ? t(first.message) : undefined);
      return;
    }
    setLocalError(undefined);
    const outcome = submit.submit({ identifier: identifier.trim() });
    if (outcome) {
      outcome.then((result) => {
        if (result.ok) setDelivered(true);
      });
    }
  };

  return (
    <AuthShell
      side={
        <AuthSidePanel
          eyebrow={t('forgot.sideEyebrow')}
          title={t('forgot.sideTitle')}
          description={t('forgot.sideDescription')}
        />
      }
    >
      <AuthFormShell
        eyebrow={t('forgot.eyebrow')}
        title={t('forgot.title')}
        description={t('forgot.description')}
        foot={
          <>
            {t('forgot.remember')}{' '}
            <Link href="/masuk" className="text-burgundy hover:underline">
              {t('backToLogin')}
            </Link>
          </>
        }
      >
        {delivered ? (
          <Notice tone="success" title={t('forgot.deliveredTitle')}>
            {resolveErrorMessage(tErrors, recoveryRequestCopy().safeMessage)}
          </Notice>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            <FormStatus
              tone="alert"
              message={resolveErrorMessage(tErrors, submit.error?.safeMessage)}
            />
            {localError ? <Notice tone="warning">{localError}</Notice> : null}
            <IdentityInput
              value={identifier}
              onChange={setIdentifier}
              error={localError}
              autoFocus
              required
            />
            <SubmitButton
              label={t('forgot.submit')}
              busyLabel={t('forgot.submitBusy')}
              busy={submit.busy}
            />
          </form>
        )}
      </AuthFormShell>
    </AuthShell>
  );
}
