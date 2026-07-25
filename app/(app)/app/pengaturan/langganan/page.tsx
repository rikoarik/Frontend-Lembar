'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Panel, Button } from '@/app/components/ui';

type EntitlementState = 'free' | 'active' | 'grace' | 'blocked' | 'expired';

interface PlanMock {
  state: EntitlementState;
  planLabel: string;
  usageUsed: number;
  usageLimit: number;
  usageUnit: string;
  graceDaysLeft?: number;
}

// Mock data until B6-01 entitlement API lands.
const MOCK_PLAN: PlanMock = {
  state: 'active',
  planLabel: 'Paket Aktif',
  usageUsed: 12,
  usageLimit: 50,
  usageUnit: 'lembar',
};

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
    body: 'Paket Anda memasuki masa tenggang. Fitur tetap aktif sementara. Hubungi tim kami untuk perpanjangan.',
  },
  blocked: {
    heading: 'Akses ditangguhkan',
    body: 'Akses ke fitur berbayar ditangguhkan. Hubungi tim kami untuk memulihkan akses.',
  },
  expired: {
    heading: 'Paket berakhir',
    body: 'Paket Anda telah berakhir. Untuk melanjutkan, hubungi tim kami.',
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
  const [plan] = useState<PlanMock>(MOCK_PLAN);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [subscribeSuccess, setSubscribeSuccess] = useState('');

  const stateCopy = STATE_COPY[plan.state];
  const isRestricted = plan.state === 'blocked' || plan.state === 'expired';

  const handleSubscribe = (tierName: string) => {
    setSelectedTier(tierName);
    setSubscribeModalOpen(true);
  };

  const handleConfirmPay = async () => {
    setSubscribeSuccess('Permintaan langganan berhasil diproses.');
    setTimeout(() => {
      setSubscribeModalOpen(false);
      setSubscribeSuccess('');
    }, 2000);
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
              <span className="text-body-sm font-medium text-brand-ink">{plan.planLabel}</span>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
              Aktif Periode Ini
            </span>
          </div>

          {!isRestricted && (
            <UsageMeter used={plan.usageUsed} limit={plan.usageLimit} unit={plan.usageUnit} />
          )}

          {plan.state === 'grace' && plan.graceDaysLeft !== undefined && (
            <p className="text-body-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              Masa tenggang berakhir dalam {plan.graceDaysLeft} hari.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            {plan.state === 'active' && (
              <Button variant="quiet" size="sm" onClick={() => handleSubscribe('Paket Berbayar')}>
                Hubungi tim kami
              </Button>
            )}
            {(plan.state === 'grace' || plan.state === 'blocked' || plan.state === 'expired') && (
              <Button size="sm" onClick={() => handleSubscribe('Perpanjangan Paket')}>
                Hubungi tim kami
              </Button>
            )}
          </div>
        </div>
      </Panel>

      {/* Opsi Langganan & Upgrade (Paid Subscription Section) */}
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
                Langganan Paket Pro
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
