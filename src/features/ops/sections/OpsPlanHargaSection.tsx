/**
 * Ops Plan & Harga section — manage canonical plan catalog via GET/PATCH /v1/admin/plans.
 * Uses existing adminService request() pattern and BFF proxy at /v1/admin/[...slug].
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/components/ui';
import { AdminPageHeader } from '@/src/features/admin/AdminChrome';
import {
  adminService,
  type AdminPlanRow,
  type AdminError,
} from '@/src/services/admin/adminService';
import type { Result } from '@/src/types/result';
import { formatPrice, formatTokenLimit } from '@/src/lib/api/plans';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type EditRow = {
  displayName: string;
  priceAmount: string;
  tokenMonthlyLimit: string;
  billingPeriod: '' | 'monthly';
  features: string;
  active: boolean;
};

type Requirement = { label: string; met: boolean };

export function planRequirements(planKey: string, edit: EditRow): Requirement[] {
  const price = Number(edit.priceAmount);
  const tokens = edit.tokenMonthlyLimit.trim() === '' ? null : Number(edit.tokenMonthlyLimit);
  const features = edit.features.split(',').map((item) => item.trim()).filter(Boolean);
  const paid = planKey !== 'free';
  return [
    { label: 'Nama paket diisi', met: edit.displayName.trim().length > 0 },
    { label: paid ? 'Harga lebih dari Rp0' : 'Harga tepat Rp0', met: paid ? Number.isInteger(price) && price > 0 : price === 0 },
    { label: paid ? 'Periode tagihan: bulanan' : 'Periode tagihan kosong', met: paid ? edit.billingPeriod === 'monthly' : edit.billingPeriod === '' },
    { label: 'Kuota token diisi dan lebih dari 0', met: tokens !== null && Number.isInteger(tokens) && tokens > 0 },
    { label: 'Minimal satu fitur/manfaat', met: features.length > 0 },
  ];
}

function toEditRow(p: AdminPlanRow): EditRow {
  return {
    displayName: p.displayName,
    priceAmount: String(p.priceAmount),
    tokenMonthlyLimit: p.tokenMonthlyLimit === null ? '' : String(p.tokenMonthlyLimit),
    billingPeriod: p.billingPeriod === 'monthly' ? 'monthly' : '',
    features: p.features.join(', '),
    active: p.active,
  };
}

function PlanListItem({
  plan,
  active,
  onEdit,
}: {
  plan: AdminPlanRow;
  active: boolean;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
        active ? 'border-[#851925] bg-[#fff8f8]' : 'border-[#e2ddd6] bg-white hover:bg-[#faf8f5]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[#171717]">{plan.displayName}</p>
          <p className="text-body-xs text-[#6d665d]">
            {plan.key} · {formatPrice({ ...plan, key: plan.key })} ·{' '}
            {formatTokenLimit(plan.tokenMonthlyLimit)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[#ddd4c8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#6d665d]">
            {plan.features.length} fitur
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${plan.active ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f3ede5] text-[#6d665d]'}`}
          >
            {plan.active ? 'aktif' : 'nonaktif'}
          </span>
          <span className="rounded-full bg-[#851925] px-2.5 py-1 text-[11px] font-semibold text-white">
            Edit
          </span>
        </div>
      </div>
    </button>
  );
}

function PlanEditor({
  plan,
  onSaved,
  setToast,
}: {
  plan: AdminPlanRow;
  onSaved: (updated: AdminPlanRow) => void;
  setToast: (msg: string) => void;
}) {
  const [edit, setEdit] = useState<EditRow>(toEditRow(plan));
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState('');
  const requirements = planRequirements(plan.key, edit);
  const activationReady = requirements.every((requirement) => requirement.met);

  const handleSave = async () => {
    if (edit.active && !activationReady) {
      setSaveError('Lengkapi semua syarat aktivasi terlebih dahulu.');
      setSaveState('error');
      return;
    }
    setSaveState('saving');
    setSaveError('');
    const priceAmount = parseInt(edit.priceAmount, 10);
    const tokenMonthlyLimit =
      edit.tokenMonthlyLimit.trim() === '' ? null : parseInt(edit.tokenMonthlyLimit, 10);
    if (isNaN(priceAmount) || priceAmount < 0) {
      setSaveError('Harga harus angka >= 0.');
      setSaveState('error');
      return;
    }
    if (tokenMonthlyLimit !== null && (isNaN(tokenMonthlyLimit) || tokenMonthlyLimit < 0)) {
      setSaveError('Batas token harus angka >= 0 atau kosong (tidak terbatas).');
      setSaveState('error');
      return;
    }
    const payload: Record<string, unknown> = {
      displayName: edit.displayName.trim() || undefined,
      priceAmount,
      tokenMonthlyLimit,
      billingPeriod: edit.billingPeriod.trim() || null,
      features: edit.features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      active: edit.active,
    };
    const result: Result<AdminPlanRow, AdminError> = await adminService.updatePlan(
      plan.key,
      payload,
      plan.revision,
    );
    if (result.ok) {
      setSaveState('saved');
      onSaved(result.value);
      setToast(`Paket ${plan.key} berhasil disimpan.`);
      setTimeout(() => setSaveState('idle'), 2000);
    } else {
      setSaveError(result.error.safeMessage);
      setSaveState('error');
    }
  };

  const field = (label: string, key: keyof EditRow, hint?: string) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-body-xs font-semibold text-[#6d665d]" htmlFor={`${plan.key}-${key}`}>
        {label}
      </label>
      {key !== 'active' ? (
        <input
          id={`${plan.key}-${key}`}
          className="rounded-xl border border-[#e2ddd6] bg-white px-3 py-2 text-body-sm text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#851925]/25"
          value={edit[key] as string}
          onChange={(e) => setEdit((prev) => ({ ...prev, [key]: e.target.value }))}
          aria-describedby={hint ? `${plan.key}-${key}-hint` : undefined}
        />
      ) : null}
      {hint && (
        <p id={`${plan.key}-${key}-hint`} className="text-[11px] text-[#6d665d]">
          {hint}
        </p>
      )}
    </div>
  );

  return (
    <div className="rounded-2xl border border-[#e2ddd6] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a8177]">
            Sedang diedit
          </p>
          <h3 className="text-body-lead font-semibold text-[#171717]">{plan.displayName}</h3>
          <p className="text-body-xs text-[#6d665d]">
            {plan.key} · {formatPrice({ ...plan, key: plan.key })} ·{' '}
            {formatTokenLimit(plan.tokenMonthlyLimit)} · Revisi #{plan.revision}
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-burgundy"
            checked={edit.active}
            disabled={!edit.active && !activationReady}
            onChange={(e) => setEdit((prev) => ({ ...prev, active: e.target.checked }))}
            aria-describedby={`${plan.key}-activation-hint`}
            aria-label={`Paket ${plan.key} aktif`}
          />
          <span className="text-body-sm text-[#171717]">Aktif</span>
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-[#eadfce] bg-[#fffaf4] p-4">
        <p className="font-semibold text-[#1e1814]">Syarat sebelum paket diaktifkan</p>
        <p id={`${plan.key}-activation-hint`} className="mt-1 text-body-xs text-[#6d665d]">
          Status Aktif membuat paket dapat dipilih pengguna. Lengkapi semua poin ini terlebih dahulu.
        </p>
        <ul className="mt-3 grid gap-2 text-body-xs sm:grid-cols-2">
          {requirements.map((requirement) => (
            <li key={requirement.label} className={requirement.met ? 'text-emerald-700' : 'font-medium text-[#851925]'}>
              {requirement.met ? '✓' : 'Perlu diisi:'} {requirement.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {field('Nama paket', 'displayName', 'Contoh: Guru Pro. Tampil di halaman harga dan langganan.')}
        {field(
          'Harga per bulan (Rp)',
          'priceAmount',
          plan.key === 'free' ? 'Wajib 0 untuk paket Free.' : 'Wajib lebih dari 0. Contoh: 49000 untuk Rp49.000/bulan.',
        )}
        {field(
          'Kuota token per bulan',
          'tokenMonthlyLimit',
          'Wajib diisi saat aktif. Contoh: 300000. Ini batas penggunaan AI per akun tiap bulan.',
        )}
        <div className="flex flex-col gap-1.5">
          <label className="text-body-xs font-semibold text-[#6d665d]" htmlFor={`${plan.key}-billingPeriod`}>
            Periode tagihan
          </label>
          <select
            id={`${plan.key}-billingPeriod`}
            className="rounded-xl border border-[#e2ddd6] bg-white px-3 py-2 text-body-sm text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#851925]/25"
            value={edit.billingPeriod}
            onChange={(e) => setEdit((prev) => ({ ...prev, billingPeriod: e.target.value as '' | 'monthly' }))}
          >
            <option value="">{plan.key === 'free' ? 'Tidak ada tagihan' : 'Pilih periode'}</option>
            {plan.key !== 'free' && <option value="monthly">Bulanan</option>}
          </select>
          <p className="text-[11px] text-[#6d665d]">{plan.key === 'free' ? 'Free wajib tanpa periode tagihan.' : 'Saat ini platform hanya mendukung tagihan bulanan.'}</p>
        </div>
        {field(
          'Fitur dan manfaat',
          'features',
          'Wajib minimal satu. Pisahkan dengan koma. Contoh: Buat lembar tanpa watermark, Kuota AI 300.000 token/bulan.',
        )}
      </div>

      {saveError && (
        <p
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {saveError}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={saveState === 'saving'}>
          {saveState === 'saving' ? 'Menyimpan…' : 'Simpan perubahan'}
        </Button>
        {saveState === 'saved' && (
          <span className="text-body-xs text-green-700" aria-live="polite">
            Tersimpan ✓
          </span>
        )}
      </div>
    </div>
  );
}

export function OpsPlanHargaSection({ setToast }: { setToast: (msg: string) => void }) {
  const [plans, setPlans] = useState<AdminPlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const requestPlans = useCallback(() => {
    adminService.listPlans().then((result) => {
      if (result.ok) {
        setPlans(result.value);
      } else {
        setLoadError(result.error.safeMessage);
      }
      setLoading(false);
    });
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    requestPlans();
  }, [requestPlans]);

  useEffect(() => {
    requestPlans();
  }, [requestPlans]);

  const handleSaved = (updated: AdminPlanRow) => {
    setPlans((prev) => prev.map((p) => (p.key === updated.key ? updated : p)));
  };

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const activePlan = plans.find((plan) => plan.key === editingKey) ?? plans[0];

  return (
    <div className="flex w-full flex-col gap-6">
      <AdminPageHeader
        title="Plan & Harga"
        description="Kelola katalog paket harga yang menjadi sumber kebenaran di seluruh platform."
        actions={
          <Button size="sm" variant="quiet" onClick={load} disabled={loading}>
            {loading ? 'Memuat…' : 'Muat ulang'}
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Memuat data paket">
          <div className="h-16 animate-pulse rounded-xl bg-[#f3ede5]" />
          <div className="h-16 animate-pulse rounded-xl bg-[#f3ede5]" />
          <div className="h-16 animate-pulse rounded-xl bg-[#f3ede5]" />
        </div>
      ) : loadError ? (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {loadError}
          <button className="ml-3 underline font-semibold text-red-800" onClick={load}>
            Coba lagi
          </button>
        </div>
      ) : plans.length === 0 ? (
        <p className="text-body-sm text-[#6d665d]">Tidak ada paket ditemukan.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-3">
            <div className="rounded-xl border border-[#ddd4c8] bg-white p-3 text-sm text-[#6d665d]">
              Pilih paket untuk diedit. Perubahan ini dipakai di landing harga, langganan, dan batas
              token.
            </div>
            {plans.map((plan) => (
              <PlanListItem
                key={plan.key}
                plan={plan}
                active={plan.key === (editingKey ?? plans[0]?.key)}
                onEdit={() => setEditingKey(plan.key)}
              />
            ))}
          </div>

          {activePlan ? (
            <PlanEditor
              key={`${activePlan.key}:${activePlan.revision}`}
              plan={activePlan}
              onSaved={handleSaved}
              setToast={setToast}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
