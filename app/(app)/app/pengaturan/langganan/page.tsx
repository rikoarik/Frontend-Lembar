'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Panel, Button } from '@/app/components/ui';

type EntitlementState = 'free' | 'active' | 'grace' | 'blocked' | 'expired';

interface PlanData {
  workspaceId: string;
  plan: 'free' | 'pro';
  entitlementState?: EntitlementState;
  generationsUsedThisMonth: number;
  monthlyLimit: number | null;
  billingCycleStartedAt: string;
  entitlementSource?: 'free' | 'paid' | 'trial';
}

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
    body: 'Paket Anda memasuki masa tenggang. Fitur tetap aktif sementara. Hubungi tim kami di wa.me/6285784255112 untuk perpanjangan.',
  },
  blocked: {
    heading: 'Akses ditangguhkan',
    body: 'Akses ke fitur berbayar ditangguhkan. Hubungi tim kami di wa.me/6285784255112 untuk memulihkan akses.',
  },
  expired: {
    heading: 'Paket berakhir',
    body: 'Paket Anda telah berakhir. Hubungi tim kami di wa.me/6285784255112 untuk melanjutkan.',
  },
};

function UsageMeter({ used, limit, unit }: { used: number; limit: number; unit: string }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const isHigh = pct >= 80;

  return (
    <div className="flex flex-col gap-1.5" aria-label={`Penggunaan: ${used} dari ${limit} ${unit}`}>
      <div className="flex justify-between text-body-xs text-brand-muted">
        <span>Penggunaan {unit}</span>
        <span>
          {used} / {limit}
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
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [subscribeSuccess, setSubscribeSuccess] = useState('');


  useEffect(() => {
    let cancelled = false;
    fetch('/v1/me/plan', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat data paket');
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setPlan(json.data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || 'Gagal memuat data paket');
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-1">
          <h1 className="text-brand-ink font-semibold text-body-xl">Paket &amp; kuota</h1>
        </div>
        <div className="h-40 animate-pulse rounded-2xl bg-[#efe8dc]" />
        <div className="h-60 animate-pulse rounded-2xl bg-[#efe8dc]" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <h1 className="text-brand-ink font-semibold text-body-xl">Paket &amp; kuota</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || 'Data tidak tersedia'}
        </div>
      </div>
    );
  }

  const isUnlimited = plan.monthlyLimit === null;
  const limit = plan.monthlyLimit ?? 0;
  const used = plan.generationsUsedThisMonth;
  const state: EntitlementState = plan.entitlementState ?? (plan.plan === 'pro' ? 'active' : 'free');
  const stateCopy = STATE_COPY[state];
  const planLabel = plan.plan === 'pro' ? 'Guru Pro' : 'Paket Gratis';

  const handleSubscribe = (tierName: string) => {
    setSelectedTier(tierName);
    setSubscribeModalOpen(true);
  };

  const handleConfirmPay = () => {
    setSubscribeModalOpen(false);
    setSubscribeSuccess(
      `Terima kasih! Tim kami akan menghubungi Anda segera untuk menyelesaikan proses berlangganan ${selectedTier ?? 'paket'}.`,
    );
  };



  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-brand-ink font-semibold text-body-xl">Paket &amp; kuota</h1>
        <p className="text-body-sm text-[#6d665d]">
          Pantau sisa kuota lembar Anda dan pilih paket berlangganan sesuai kebutuhan.
        </p>
      </div>

      {/* Status Paket Saat Ini */}
      <Panel title={stateCopy.heading} description={stateCopy.body}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-brand-muted">Paket saat ini:</span>
              <span className="text-body-sm font-medium text-brand-ink">{planLabel}</span>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${
                plan.plan === 'pro'
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                  : 'bg-neutral-50 text-neutral-600 ring-neutral-200'
              }`}
            >
              {state === 'active' ? (plan.plan === 'pro' ? 'Pro Aktif' : 'Aktif') : STATE_COPY[state].heading}
            </span>
          </div>

          <UsageMeter
            used={used}
            limit={isUnlimited ? Math.max(used, 1) : limit}
            unit={isUnlimited ? 'lembar (unlimited)' : 'lembar / bulan'}
          />

          {plan.billingCycleStartedAt && plan.plan === 'pro' ? (
            <p className="text-body-sm text-brand-ink-muted">
              Siklus tagihan mulai:{' '}
              <span className="font-medium text-brand-ink">
                {new Date(plan.billingCycleStartedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </p>
          ) : plan.plan === 'free' ? (
            <p className="text-body-sm text-brand-ink-muted">
              Kuota direset setiap tanggal 1.
            </p>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            {plan.plan === 'free' && (
              <Button size="sm" onClick={() => handleSubscribe('Guru Pro')}>
                Upgrade ke Guru Pro
              </Button>
            )}
            {plan.plan === 'pro' && (
              <Button variant="quiet" size="sm" onClick={() => handleSubscribe('Perpanjangan')}>
                Hubungi tim kami
              </Button>
            )}
          </div>
        </div>
      </Panel>

      {/* Opsi Langganan & Upgrade */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[16px] font-semibold text-[#171717]">Pilihan Paket Langganan</h2>
        <p className="text-body-sm text-[#6d665d]">
          Tingkatkan kuota dan buka semua fitur pembuatan soal AI tanpa batas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* Paket Guru Pro */}
          <div className="flex flex-col justify-between rounded-xl border-2 border-[#a3202b] bg-white p-5 shadow-xs relative">
            <span className="absolute -top-3 right-4 rounded-full bg-[#a3202b] px-3 py-0.5 text-[11px] font-semibold text-white shadow-xs">
              Rekomendasi Guru
            </span>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col">
                <h3 className="text-[16px] font-bold text-[#171717]">Paket Guru Pro</h3>
                <p className="text-[12px] text-[#6d665d]">
                  Untuk guru mandiri yang butuh kuota lebih tinggi
                </p>
              </div>

              <ul className="flex flex-col gap-2 pt-2 border-t border-[#e6dfd4]">
                <li className="flex items-center gap-2 text-[13px] text-[#171717]">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    check_circle
                  </span>
                  <span>Kuota 500 lembar / bulan</span>
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#171717]">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    check_circle
                  </span>
                  <span>Pemrosesan AI prioritas cepat</span>
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#171717]">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    check_circle
                  </span>
                  <span>Ekspor PDF &amp; Word tanpa batas</span>
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#171717]">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    check_circle
                  </span>
                  <span>Akses semua kurikulum &amp; template</span>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-4 border-t border-[#e6dfd4]">
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={() => handleSubscribe('Guru Pro')}
              >
                {plan.plan === 'pro' ? 'Paket Aktif' : 'Langganan Paket Pro'}
              </Button>
            </div>
          </div>

          {/* Paket Sekolah / Tim */}
          <div className="flex flex-col justify-between rounded-xl border border-[#e6dfd4] bg-[#fbf8f2] p-5 shadow-xs">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col">
                <h3 className="text-[16px] font-bold text-[#171717]">Paket Sekolah</h3>
                <p className="text-[12px] text-[#6d665d]">Untuk institusi dan tim guru sekolah</p>
              </div>

              <ul className="flex flex-col gap-2 pt-2 border-t border-[#e6dfd4]">
                <li className="flex items-center gap-2 text-[13px] text-[#171717]">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    check_circle
                  </span>
                  <span>Kuota shared seluruh guru sekolah</span>
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#171717]">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    check_circle
                  </span>
                  <span>Dashboard manajemen admin sekolah</span>
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#171717]">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    check_circle
                  </span>
                  <span>Bank soal bersama terpusat</span>
                </li>
                <li className="flex items-center gap-2 text-[13px] text-[#171717]">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                    check_circle
                  </span>
                  <span>Dukungan pendampingan khusus</span>
                </li>
              </ul>
            </div>

            <div className="pt-5 mt-4 border-t border-[#e6dfd4]">
              <Link href="/harga" className="block w-full">
                <Button variant="secondary" size="md" className="w-full justify-center">
                  Lihat Detail Paket Sekolah
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Dialog Langganan */}
      {subscribeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-[#e6dfd4] bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e6dfd4] pb-3">
              <h3 className="text-[16px] font-bold text-[#171717]">Langganan {selectedTier}</h3>
              <button
                type="button"
                onClick={() => setSubscribeModalOpen(false)}
                className="text-[#8a8379] hover:text-[#171717]"
              >
                ✕
              </button>
            </div>

            {subscribeSuccess ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-body-sm">
                {subscribeSuccess}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-body-sm text-[#6d665d]">
                  Anda memilih untuk berlangganan <strong>{selectedTier}</strong>. Tim kami akan
                  menghubungi Anda untuk instruksi pembayaran dan aktivasi kuota instan.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="quiet" size="sm" onClick={() => setSubscribeModalOpen(false)}>
                    Batal
                  </Button>
                  <Button size="sm" onClick={handleConfirmPay}>
                    Konfirmasi Langganan
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
