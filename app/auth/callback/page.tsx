'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthShell from '../../(auth)/AuthShell';
import AuthFormShell from '../../(auth)/components/AuthFormShell';
import AuthSidePanel from '../../(auth)/components/AuthSidePanel';

type Status =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; homePath: string };

export default function GoogleAuthCallbackPage() {
  const [status, setStatus] = useState<Status>({ kind: 'loading' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const oauthError = params.get('error');

    if (oauthError) {
      setStatus({
        kind: 'error',
        message: 'Google membatalkan autentikasi. Coba lagi.',
      });
      return;
    }

    if (!code) {
      setStatus({
        kind: 'error',
        message: 'Kode autentikasi Google tidak ditemukan.',
      });
      return;
    }

    let cancelled = false;
    const run = async () => {
      try {
        const response = await fetch('/v1/auth/google/callback', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state }),
        });
        const payload = await response.json().catch(() => null);
        if (cancelled) return;

        if (!response.ok) {
          setStatus({
            kind: 'error',
            message: payload?.error?.message || 'Autentikasi Google gagal.',
          });
          return;
        }

        const homePath = payload?.data?.homePath || '/app';
        setStatus({ kind: 'success', homePath });
        window.location.href = homePath;
      } catch {
        if (!cancelled) {
          setStatus({
            kind: 'error',
            message: 'Tidak dapat terhubung ke server autentikasi.',
          });
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthShell
      side={
        <AuthSidePanel
          eyebrow="Google"
          title="Menyelesaikan masuk dengan Google."
          description="Kami memverifikasi akun Google Anda dan menyiapkan ruang kerja lembar."
        />
      }
    >
      <AuthFormShell title="Autentikasi Google">
        {status.kind === 'loading' ? (
          <p className="font-body-sm text-body-sm text-secondary">Memverifikasi akun Google…</p>
        ) : null}
        {status.kind === 'success' ? (
          <p className="font-body-sm text-body-sm text-secondary">
            Berhasil. Mengalihkan ke {status.homePath}…
          </p>
        ) : null}
        {status.kind === 'error' ? (
          <div className="flex flex-col gap-3">
            <p className="font-body-sm text-body-sm text-danger" role="alert">
              {status.message}
            </p>
            <Link href="/masuk" className="text-burgundy hover:underline font-body-sm text-body-sm">
              Kembali ke halaman masuk
            </Link>
          </div>
        ) : null}
      </AuthFormShell>
    </AuthShell>
  );
}
