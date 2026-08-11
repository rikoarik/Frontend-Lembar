'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Panel, Button } from '@/app/components/ui';
import { formatTokenLimit } from '@/src/lib/api/plans';
import type { MePlanData } from '@/src/lib/api/plans';

type EntitlementState = 'free' | 'active' | 'grace' | 'blocked' | 'expired';

const WA_LINK = 'https://wa.me/6285784255112';

const STATE_COPY: Record<EntitlementState, { heading: string; body: string }> = {
  free: {
    heading: 'Paket Gratis',
    body: 'Anda saat ini menggunakan paket gratis dengan kuota terbatas. Tingkatkan paket untuk akses tanpa batas.',
  },
  active: {
    heading: 'Paket aktif',
    body: 'Paket Anda aktif. Anda dapat membuat dan mendistribusikan lembar kerja.',
  },
  grace: {
    heading: 'Masa tenggang',
    body: `Paket Anda memasuki masa tenggang. Fitur tetap aktif sementara. Hubungi tim kami di ${WA_LINK} untuk perpanjangan.`,
  },
  blocked: {
    heading: 'Akses ditangguhkan',
    body: `Akses ke fitur berbayar ditangguhkan. Hubungi tim kami di ${WA_LINK} untuk memulihkan akses.`,
  },
  expired: {
    heading: 'Paket berakhir',
    body: `Paket Anda telah berakhir. Hubungi tim kami di ${WA_LINK} untuk melanjutkan.`,
  },
};

function TokenMeter({ used, limit }: { used: number; limit: number | null }) {
  if (limit === null) {
    return (
      <div className="flex flex-col gap-1.5" aria-label="Penggunaan token: tidak terbatas">
        <div className="flex justify-between text-body-xs text-brand-muted">
          <span>Token digunakan bulan ini</span>
          <span>{new Intl.NumberFormat('id-ID').format(used)} / Tidak terbatas</span>
        </div>
      </div>
    );
  }
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const isHigh = pct >= 80;
  return (
    <div
      className="flex flex-col gap-1.5"
      aria-label={`Token digunakan: ${used} dari ${limit}`}
    >
      <div className="flex justify-between text-body-xs text-brand-muted">
        <span>Token digunakan bulan ini</span>
        <span>
          {new Intl.NumberFormat('id-ID').format(used)} / {new Intl.NumberFormat('id-ID').format(limit)}
        </span>
      </div>
      <div
        className="h-2 rounded-full bg-brand-line overflow-hidden"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label={`${pct}% terpakai`}
      >
        <div
          className={`h-full rounded-full transition-all ${isHigh ? 'bg-amber-500' : 'bg-brand-accent'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function PlanUsageSettingsPage() {
  const [plan, setPlan] = useState<MePlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState('');

  // Trial state (preserved from existing tests)
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialError, setTrialError] = useState('');
  const [trialSuccess, setTrialSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/v1/me/plan', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat data paket');
        return res.json() as Promise<{ data: MePlanData }>;
      })
      .then((json) => {
        if (cancelled) return;
        setPlan(json.data);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message || 'Gagal memuat data paket');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    setUpgradeError('');
    try {
      // orderId is a client-generated idempotency key; amount is always derived server-side
      const orderId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const res = await fetch('/v1/payment/pakasir/create-order', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, toPlan: 'pro' }),
      });
      const json = (await res.json()) as { paymentUrl?: string; error?: { code?: string; message?: string } };
      if (res.ok && json.paymentUrl) {
        window.location.href = json.paymentUrl;
        return;
      }
      const code = json.error?.code ?? '';
      if (code === 'PAYMENT_NOT_CONFIGURED') {
        setUpgradeError(
          `Gateway pembayaran belum aktif. Hubungi tim kami via WhatsApp untuk upgrade manual.`,
        );
      } else {
        setUpgradeError(json.error?.message ?? 'Gagal membuat pesanan. Coba lagi.');
      }
    } catch {
      setUpgradeError('Tidak dapat terhubung. Periksa koneksi Anda.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleClaimTrial = async () => {
    setTrialLoading(true);
    setTrialError('');
    setTrialSuccess('');
    try {
      const res = await fetch('/v1/me/plan/trial/claim', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        setTrialError(json.error?.message ?? 'Gagal mengklaim trial.');
        return;
      }
      const json = (await res.json()) as { data: MePlanData };
      setPlan(json.data);
      setTrialSuccess('Trial berhasil diaktifkan.');
    } catch {
      setTrialError('Tidak dapat terhubung. Periksa koneksi Anda.');
    } finally {
      setTrialLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-brand-ink font-semibold text-body-xl">Paket &amp; kuota</h1>
        </div>
        <div className="h-40 animate-pulse rounded-2xl bg-[#efe8dc]" aria-busy="true" />
        <div className="h-60 animate-pulse rounded-2xl bg-[#efe8dc]" aria-busy="true" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <h1 className="text-brand-ink font-semibold text-body-xl">Paket &amp; kuota</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          {error || 'Data tidak tersedia'}
        </div>
      </div>
    );
  }

  const state: EntitlementState = plan.entitlementState ?? (plan.plan === 'pro' ? 'active' : 'free');
  const stateCopy = STATE_COPY[state];
  const planLabel = plan.plan === 'pro' ? 'Guru Pro' : 'Paket Gratis';
  const tokenLimit = plan.tokenMonthlyLimit ?? plan.catalog?.tokenMonthlyLimit ?? null;
  const tokenUsed = plan.tokenUsedThisMonth ?? 0;
  const trial = plan.trial;
  const isPro = plan.plan === 'pro';

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-brand-ink font-semibold text-body-xl">Paket &amp; kuota</h1>
        <p className="text-body-sm text-[#6d665d]">Kelola paket berlangganan dan pantau penggunaan token Anda.</p>
      </div>

      {/* Current plan status */}
      <Panel>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-body-lead text-brand-ink">{stateCopy.heading}</p>
              <p className="text-body-sm text-[#6d665d] mt-0.5">{planLabel}</p>
            </div>
            {plan.entitlementSource === 'trial' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Trial aktif
              </span>
            )}
          </div>
          <p className="text-body-sm text-[#6d665d]">{stateCopy.body}</p>
        </div>
      </Panel>

      {/* Token usage */}
      <Panel>
        <div className="flex flex-col gap-4">
          <p className="font-semibold text-body-lead text-brand-ink">Penggunaan token</p>
          <TokenMeter used={tokenUsed} limit={tokenLimit} />
          <p className="text-body-xs text-[#6d665d]">
            Kuota token: {formatTokenLimit(tokenLimit)}. Reset setiap awal siklus tagihan.
          </p>
        </div>
      </Panel>

      {/* Trial section */}
      {trial && (
        <Panel>
          <div className="flex flex-col gap-3">
            <p className="font-semibold text-body-lead text-brand-ink">Trial Guru Pro</p>
            {trial.eligible && !trial.claimed && (
              <>
                <p className="text-body-sm text-[#6d665d]">
                  Anda memenuhi syarat trial 2 bulan Guru Pro gratis. Klaim sekarang untuk menikmati kuota tidak
                  terbatas.
                </p>
                {trialError && (
                  <p className="text-sm text-red-700" role="alert">{trialError}</p>
                )}
                <Button size="sm" onClick={handleClaimTrial} disabled={trialLoading}>
                  {trialLoading ? 'Memproses…' : 'Klaim trial 2 bulan'}
                </Button>
              </>
            )}
            {trial.claimed && trial.endsAt && (
              <div className="flex flex-col gap-1">
                {trialSuccess && <p className="text-sm text-green-700" role="status">{trialSuccess}</p>}
                <p className="text-body-sm text-[#6d665d]">
                  Trial aktif hingga{' '}
                  <strong>
                    {new Date(trial.endsAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>
                </p>
                {trial.remainingDays !== null && (
                  <p className="text-body-sm text-amber-700">{trial.remainingDays} hari tersisa</p>
                )}
              </div>
            )}
          </div>
        </Panel>
      )}

      {/* Upgrade section — only shown for free non-trial users */}
      {!isPro && plan.entitlementSource !== 'trial' && (
        <Panel>
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-semibold text-body-lead text-brand-ink">Upgrade ke Guru Pro</p>
              <p className="text-body-sm text-[#6d665d] mt-0.5">
                Kuota tidak terbatas, ekspor penuh, dan semua fitur Pro.
              </p>
            </div>
            {upgradeError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                <p>{upgradeError}</p>
                {upgradeError.includes('WhatsApp') && (
                  <Link
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-red-800 underline"
                  >
                    Hubungi tim via WhatsApp
                  </Link>
                )}
              </div>
            )}
            <Button onClick={handleUpgrade} disabled={upgradeLoading}>
              {upgradeLoading ? 'Memproses…' : 'Upgrade ke Pro'}
            </Button>
            <p className="text-body-xs text-[#6d665d]">Pembayaran via QRIS. Aman dan instan.</p>
          </div>
        </Panel>
      )}
    </div>
  );
}
