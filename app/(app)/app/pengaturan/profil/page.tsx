'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Panel } from '@/app/components/ui';
import FormStatus from '@/app/(auth)/components/FormStatus';

type Account = {
  id?: string;
  displayName: string;
  email?: string;
};

export default function ProfileSettingsPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/v1/me', { credentials: 'include', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Gagal memuat profil. Silakan masuk ulang.');
        const body = (await response.json()) as { data?: { account?: Account } };
        if (!body.data?.account?.displayName) throw new Error('Data profil tidak lengkap.');
        setAccount(body.data.account);
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : 'Gagal memuat profil.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const initials =
    account?.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'G';

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-body-xl font-semibold text-brand-ink">Profil</h1>
        <p className="text-body-sm text-[#6d665d]">
          Informasi akun yang sedang digunakan di lembar.
        </p>
      </div>

      {error ? <FormStatus tone="alert" message={error} /> : null}

      {loading ? (
        <div className="flex items-center justify-center py-12" aria-busy="true">
          <span className="text-body-sm text-[#6d665d]">Memuat profil…</span>
        </div>
      ) : account ? (
        <>
          <div className="flex items-center gap-4 rounded-xl border border-[#e6dfd4] bg-white p-4 shadow-xs">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#a3202b] text-[18px] font-bold text-white"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-[16px] font-semibold text-[#171717]">
                {account.displayName}
              </h2>
              <p className="truncate text-body-sm text-[#6d665d]">
                {account.email || 'Email belum tersedia'}
              </p>
            </div>
          </div>

          <Panel
            title="Informasi akun"
            description="Data ini berasal dari layanan autentikasi dan tidak dapat diubah dari frontend saat ini."
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-label-xs uppercase tracking-wide text-brand-ink-muted">Nama</dt>
                <dd className="mt-1 text-body-sm font-medium text-brand-ink">
                  {account.displayName}
                </dd>
              </div>
              <div>
                <dt className="text-label-xs uppercase tracking-wide text-brand-ink-muted">
                  Email
                </dt>
                <dd className="mt-1 text-body-sm font-medium text-brand-ink">
                  {account.email || '—'}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel
            title="Keamanan akun"
            description="Gunakan alur pemulihan terverifikasi untuk mengganti kata sandi."
          >
            <Link
              href="/lupa-sandi"
              className="inline-flex min-h-10 items-center rounded-md border border-brand-line px-4 text-body-sm font-medium text-brand-ink hover:bg-brand-surface"
            >
              Atur ulang kata sandi
            </Link>
          </Panel>
        </>
      ) : null}
    </div>
  );
}
