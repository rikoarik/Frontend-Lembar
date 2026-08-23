'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import AuthShell from '../../(auth)/AuthShell';
import AuthFormShell from '../../(auth)/components/AuthFormShell';
import AuthSidePanel from '../../(auth)/components/AuthSidePanel';
import { Spinner } from '@/app/components/ui/Spinner';

type Status =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; homePath: string };

type CallbackResult = Exclude<Status, { kind: 'loading' }>;

function subscribeToLocationSearch() {
  return () => undefined;
}

function getLocationSearch() {
  return window.location.search;
}

function getServerLocationSearch() {
  return null;
}

export default function GoogleAuthCallbackPage() {
  const locationSearch = useSyncExternalStore(
    subscribeToLocationSearch,
    getLocationSearch,
    getServerLocationSearch,
  );
  const params = locationSearch === null ? null : new URLSearchParams(locationSearch);
  const code = params?.get('code') ?? null;
  const oauthState = params?.get('state') ?? null;
  const oauthError = params?.get('error') ?? null;
  const requestKey = code ? JSON.stringify([code, oauthState]) : null;
  const [result, setResult] = useState<{
    requestKey: string;
    status: CallbackResult;
  } | null>(null);

  useEffect(() => {
    if (!code || oauthError || !requestKey) return;

    let cancelled = false;
    const run = async () => {
      try {
        const response = await fetch('/v1/auth/google/callback', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, state: oauthState }),
        });
        const payload = await response.json().catch(() => null);
        if (cancelled) return;

        if (!response.ok) {
          setResult({
            requestKey,
            status: {
              kind: 'error',
              message: payload?.error?.message || 'Autentikasi Google gagal.',
            },
          });
          return;
        }

        const homePath = payload?.data?.homePath || '/app';
        setResult({ requestKey, status: { kind: 'success', homePath } });
        window.location.href = homePath;
      } catch {
        if (!cancelled) {
          setResult({
            requestKey,
            status: {
              kind: 'error',
              message: 'Tidak dapat terhubung ke server autentikasi.',
            },
          });
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [code, oauthError, oauthState, requestKey]);

  let status: Status = { kind: 'loading' };
  if (locationSearch !== null) {
    if (oauthError) {
      status = {
        kind: 'error',
        message: 'Google membatalkan autentikasi. Coba lagi.',
      };
    } else if (!code) {
      status = {
        kind: 'error',
        message: 'Kode autentikasi Google tidak ditemukan.',
      };
    } else if (result?.requestKey === requestKey) {
      status = result.status;
    }
  }

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
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border-subtle bg-surface-container-lowest p-8 text-center shadow-sm">
            <Spinner size="lg" className="text-burgundy" />
            <div className="flex flex-col gap-1">
              <p className="font-label-semibold text-body-default text-ink">
                Memverifikasi akun Google…
              </p>
              <p className="font-body-sm text-body-sm text-secondary">
                Mohon tunggu sebentar, kami sedang mengonfirmasi identitas Anda.
              </p>
            </div>
          </div>
        ) : null}
        {status.kind === 'success' ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border-subtle bg-surface-container-lowest p-8 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-label-semibold text-body-default text-ink">Autentikasi Berhasil</p>
              <p className="font-body-sm text-body-sm text-secondary">
                Mengalihkan Anda ke portal ({status.homePath})…
              </p>
            </div>
          </div>
        ) : null}
        {status.kind === 'error' ? (
          <div className="flex flex-col gap-4 rounded-xl border border-red-200 bg-red-50/60 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-burgundy">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="font-label-semibold text-body-default text-ink">
                  Gagal Memverifikasi
                </h2>
                <p className="font-body-sm text-body-sm text-secondary">{status.message}</p>
              </div>
            </div>
            <Link
              href="/masuk"
              className="inline-flex h-10 items-center justify-center rounded-md bg-burgundy px-4 font-label-semibold text-body-sm text-white transition-colors hover:bg-primary"
            >
              Kembali ke halaman masuk
            </Link>
          </div>
        ) : null}
      </AuthFormShell>
    </AuthShell>
  );
}
