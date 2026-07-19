'use client';

import Link from 'next/link';
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
import { recoveryRequestCopy } from '@/src/services/auth/errorMapping';
import { useAuthSubmit } from '@/src/features/auth/state/useAuthSubmit';

export default function ForgotPasswordPage() {
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
      setLocalError(validation.failures[0]?.message);
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
          eyebrow="Keamanan akun"
          title="Pulihkan akses tanpa membuka identitas akun."
          description="Respons pemulihan tetap sama untuk setiap permintaan agar informasi akun tetap terlindungi."
        />
      }
    >
      <AuthFormShell
        eyebrow="Pemulihan"
        title="Lupa kata sandi"
        description="Masukkan identitas akun Anda."
        foot={
          <>
            Ingat kata sandi Anda?{' '}
            <Link href="/masuk" className="text-burgundy hover:underline">
              Kembali ke halaman masuk
            </Link>
          </>
        }
      >
        {delivered ? (
          <Notice tone="success" title="Permintaan diterima.">
            {recoveryRequestCopy().safeMessage}
          </Notice>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            <FormStatus tone="alert" message={submit.error?.safeMessage} />
            {localError ? <Notice tone="warning">{localError}</Notice> : null}
            <IdentityInput
              value={identifier}
              onChange={setIdentifier}
              error={localError}
              autoFocus
              required
            />
            <SubmitButton label="Kirim tautan pemulihan" busyLabel="Mengirim…" busy={submit.busy} />
          </form>
        )}
      </AuthFormShell>
    </AuthShell>
  );
}
