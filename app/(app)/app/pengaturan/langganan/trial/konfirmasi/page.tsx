'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Panel } from '@/app/components/ui';
import type { MePlanData } from '@/src/lib/api/plans';

type ClaimState = 'loading-link' | 'ready' | 'submitting' | 'success' | 'error';

export default function TrialClaimConfirmationPage() {
  const [claimToken, setClaimToken] = useState('');
  const [state, setState] = useState<ClaimState>('loading-link');
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<MePlanData | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const token = params.get('token') ?? '';
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
      if (token.length < 32) {
        setError('Tautan klaim tidak valid atau sudah tidak tersedia.');
        setState('error');
        return;
      }
      setClaimToken(token);
      setState('ready');
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleClaim = async () => {
    if (state !== 'ready' || !claimToken) return;
    setState('submitting');
    setError('');
    try {
      const response = await fetch('/v1/me/plan/trial/claim', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimToken }),
      });
      const json = (await response.json()) as {
        data?: MePlanData;
        error?: { message?: string };
      };
      if (!response.ok || !json.data) {
        setError(
          json.error?.message ??
            'Tautan klaim tidak valid, kedaluwarsa, atau sudah pernah digunakan.',
        );
        setState('error');
        return;
      }
      setPlan(json.data);
      setClaimToken('');
      setState('success');
    } catch {
      setError('Tidak dapat terhubung. Periksa koneksi Anda lalu coba lagi.');
      setState('error');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-body-xs font-semibold uppercase tracking-[0.12em] text-brand-accent">
          Tautan sekali pakai
        </p>
        <h1 className="text-body-xl font-semibold text-brand-ink">Konfirmasi trial Guru Pro</h1>
        <p className="text-body-sm text-[#6d665d]">
          Trial aktif selama 60 hari dan akan terikat ke perangkat yang dipakai saat konfirmasi.
        </p>
      </div>

      <Panel>
        <div className="flex flex-col items-start gap-4">
          {state === 'loading-link' && (
            <p className="text-body-sm text-[#6d665d]" role="status">
              Memeriksa tautan…
            </p>
          )}

          {state === 'ready' && (
            <>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-body-sm text-amber-900">
                Tautan ini hanya dapat digunakan satu kali. Setelah trial diaktifkan, tautan akan
                langsung ditandai terpakai dan tidak bisa diputar ulang.
              </div>
              <Button onClick={handleClaim}>Aktifkan trial 2 bulan</Button>
              <Link
                href="/app/pengaturan/langganan"
                className="text-body-sm font-medium text-brand-accent underline underline-offset-4"
              >
                Batal dan kembali
              </Link>
            </>
          )}

          {state === 'submitting' && (
            <Button loading loadingLabel="Mengaktifkan trial…">
              Aktifkan trial 2 bulan
            </Button>
          )}

          {state === 'success' && (
            <div className="flex flex-col items-start gap-3" role="status">
              <p className="font-semibold text-green-800">Trial berhasil diaktifkan.</p>
              {plan?.trial?.endsAt && (
                <p className="text-body-sm text-[#6d665d]">
                  Akses Guru Pro aktif hingga{' '}
                  <strong>
                    {new Date(plan.trial.endsAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>
                  .
                </p>
              )}
              <Link
                href="/app/pengaturan/langganan"
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white hover:bg-brand-accent-hover"
              >
                Lihat paket &amp; kuota
              </Link>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-start gap-3">
              <p className="text-body-sm text-red-700" role="alert">
                {error}
              </p>
              <Link
                href="/app/pengaturan/langganan"
                className="text-body-sm font-medium text-brand-accent underline underline-offset-4"
              >
                Kembali dan siapkan tautan baru
              </Link>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
