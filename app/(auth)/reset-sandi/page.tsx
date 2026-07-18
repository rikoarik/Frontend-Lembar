'use client';

import Link from 'next/link';
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
import { useSearchParams } from 'next/navigation';

function ResetPasswordInner() {
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
      setMatchError('Konfirmasi kata sandi tidak cocok.');
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
            eyebrow="Keamanan akun"
            title="Tautan tidak ditemukan."
            description="Tautan pemulihan tidak ada di URL. Minta tautan baru untuk melanjutkan."
          />
        }
      >
        <AuthFormShell
          eyebrow="Pemulihan"
          title="Tautan tidak dapat digunakan"
          foot={
            <Link href="/lupa-sandi" className="text-burgundy hover:underline">
              Minta tautan baru
            </Link>
          }
        >
          <Notice tone="danger" title="Tautan pemulihan tidak valid.">
            Minta tautan baru untuk melanjutkan.
          </Notice>
        </AuthFormShell>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      side={
        <AuthSidePanel
          eyebrow="Keamanan akun"
          title="Atur ulang kata sandi Anda."
          description="Pilih kata sandi baru minimal 12 karakter."
        />
      }
    >
      <AuthFormShell
        eyebrow="Atur ulang"
        title="Simpan kata sandi baru"
        foot={
          saved ? (
            <Link href="/masuk" className="text-burgundy hover:underline">
              Kembali ke halaman masuk
            </Link>
          ) : (
            <>
              Tidak ingin mengganti?{' '}
              <Link href="/masuk" className="text-burgundy hover:underline">
                Kembali ke halaman masuk
              </Link>
            </>
          )
        }
      >
        {saved ? (
          <Notice tone="success" title="Kata sandi diperbarui.">
            Anda dapat masuk dengan kata sandi baru.
          </Notice>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            <FormStatus tone="alert" message={submit.error?.safeMessage} />
            <PasswordField
              label="Kata sandi baru"
              value={password}
              onChange={setPassword}
              error={matchError}
              autoComplete="new-password"
            />
            <PasswordField
              label="Konfirmasi kata sandi"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
            />
            <SubmitButton
              label="Simpan kata sandi"
              busyLabel="Menyimpan…"
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
