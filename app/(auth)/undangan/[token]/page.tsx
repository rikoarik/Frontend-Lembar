'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import AuthShell from '../../AuthShell';
import AuthSidePanel from '../../components/AuthSidePanel';
import AuthFormShell from '../../components/AuthFormShell';
import FormStatus from '../../components/FormStatus';
import FormField from '../../components/FormField';
import PasswordField from '../../components/PasswordField';
import PhoneField from '../../components/PhoneField';
import Notice from '../../components/Notice';
import SubmitButton from '../../components/SubmitButton';
import { authService } from '@/src/services/auth/authService';
import { validateInvitationAccept } from '@/src/features/auth/validation/auth-validation';
import { useAuthSubmit } from '@/src/features/auth/state/useAuthSubmit';
import type { InvitationPreview } from '@/src/types/auth';
import type { AuthError } from '@/src/services/auth/authErrors';
import { err, type Result } from '@/src/types/result';

type FieldKey = 'username' | 'email' | 'phone' | 'password';

const fieldError = (errors: Record<string, string[]>, key: FieldKey): string | undefined =>
  errors[key]?.[0];

export default function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [loadError, setLoadError] = useState<AuthError | null>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [localErrors, setLocalErrors] = useState<Partial<Record<FieldKey, string>>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const result = await authService.getInvitation(token);
      if (cancelled) return;
      if (!result.ok) {
        setLoadError(result.error);
        return;
      }
      setPreview(result.value);
      if (result.value.email) setEmail(result.value.email);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const submit = useAuthSubmit({
    submit: (
      input: { username: string; email: string; phone: string; password: string },
      idempotencyKey: string,
    ): Promise<Result<unknown, AuthError>> => {
      if (!preview || preview.status !== 'pending') {
        return Promise.resolve(
          err({
            code: 'INVITATION_INVALID',
            safeMessage: 'Undangan tidak lagi aktif.',
            retryable: false,
          }),
        );
      }
      return authService.acceptInvitation({ ...input, token }, idempotencyKey);
    },
    onSuccess: () => {
      window.location.href = '/app';
    },
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateInvitationAccept({ username, email, phone, password });
    if (!validation.ok) {
      const next: Partial<Record<FieldKey, string>> = {};
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

  const schoolName = preview?.schoolName ?? 'sekolah Anda';

  const body = (() => {
    if (loadError) {
      return (
        <Notice tone="danger" title="Undangan tidak dapat diperiksa.">
          {loadError.safeMessage}
        </Notice>
      );
    }
    if (preview === null) {
      return <Notice tone="info">Memeriksa undangan…</Notice>;
    }
    if (preview.status === 'expired') {
      return (
        <Notice tone="warning" title="Undangan telah kedaluwarsa.">
          Hubungi admin sekolah untuk meminta undangan baru.
        </Notice>
      );
    }
    if (preview.status === 'invalid' || preview.status === 'revoked') {
      return (
        <Notice tone="danger" title="Undangan tidak lagi aktif.">
          Undangan tidak ditemukan atau sudah dibatalkan.
        </Notice>
      );
    }
    return (
      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        <FormStatus tone="alert" message={submit.error?.safeMessage} />
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
          onChange={setPassword}
          error={localErrors.password ?? fieldError(submit.fieldErrors, 'password')}
          autoComplete="new-password"
        />
        <SubmitButton
          label={`Aktifkan akun untuk ${schoolName}`}
          busyLabel="Mengaktifkan…"
          busy={submit.busy}
        />
      </form>
    );
  })();

  return (
    <AuthShell
      side={
        <AuthSidePanel
          eyebrow={`Undangan dari ${schoolName}`}
          title="Aktifkan akun guru Anda."
          description="Lengkapi identitas untuk bergabung dengan workspace sekolah."
        />
      }
    >
      <AuthFormShell
        eyebrow="Undangan sekolah"
        title={preview?.schoolName ?? 'Undangan sekolah'}
        description={
          preview?.email
            ? `Email pratinjau: ${preview.email}.`
            : 'Isi formulir untuk mengaktifkan akun.'
        }
        foot={
          <Link href="/" className="text-burgundy hover:underline">
            Kembali ke beranda
          </Link>
        }
      >
        {body}
      </AuthFormShell>
    </AuthShell>
  );
}
