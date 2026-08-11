'use client';

/**
 * Ops Plan & Harga section — manage canonical plan catalog via GET/PATCH /v1/admin/plans.
 * Uses existing adminService request() pattern and BFF proxy at /v1/admin/[...slug].
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/components/ui';
import { AdminPageHeader } from '@/src/features/admin/AdminChrome';
import { adminService, type AdminPlanRow, type AdminError } from '@/src/services/admin/adminService';
import type { Result } from '@/src/types/result';
import { formatPrice, formatTokenLimit } from '@/src/lib/api/plans';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type EditRow = {
  displayName: string;
  priceAmount: string;
  tokenMonthlyLimit: string;
  billingPeriod: string;
  features: string;
  active: boolean;
};

function toEditRow(p: AdminPlanRow): EditRow {
  return {
    displayName: p.displayName,
    priceAmount: String(p.priceAmount),
    tokenMonthlyLimit: p.tokenMonthlyLimit === null ? '' : String(p.tokenMonthlyLimit),
    billingPeriod: p.billingPeriod ?? '',
    features: p.features.join(', '),
    active: p.active,
  };
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

  const handleSave = async () => {
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
    <div className="flex flex-col gap-1">
      <label className="text-body-xs font-semibold text-[#6d665d]" htmlFor={`${plan.key}-${key}`}>
        {label}
      </label>
      {key === 'active' ? null : (
        <input
          id={`${plan.key}-${key}`}
          className="rounded border border-[#e2ddd6] bg-white px-2.5 py-1.5 text-body-sm text-[#171717] focus:outline-none focus:ring-2 focus:ring-burgundy/40"
          value={edit[key] as string}
          onChange={(e) => setEdit((prev) => ({ ...prev, [key]: e.target.value }))}
          aria-describedby={hint ? `${plan.key}-${key}-hint` : undefined}
        />
      )}
      {hint && (
        <p id={`${plan.key}-${key}-hint`} className="text-[11px] text-[#6d665d]">
          {hint}
        </p>
      )}
    </div>
  );

  return (
    <div className="rounded-xl border border-[#e2ddd6] bg-white p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-body-lead text-[#171717]">{plan.key}</p>
          <p className="text-body-xs text-[#6d665d]">
            Tampil: <strong>{plan.displayName}</strong> · Harga: {formatPrice({ ...plan, key: plan.key })} ·
            Token: {formatTokenLimit(plan.tokenMonthlyLimit)} · Revisi #{plan.revision}
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-burgundy"
            checked={edit.active}
            onChange={(e) => setEdit((prev) => ({ ...prev, active: e.target.checked }))}
            aria-label={`Paket ${plan.key} aktif`}
          />
          <span className="text-body-sm text-[#171717]">Aktif</span>
        </label>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {field('Nama tampil', 'displayName')}
        {field('Harga (IDR, angka)', 'priceAmount')}
        {field('Batas token / bulan', 'tokenMonthlyLimit', 'Kosongkan = tidak terbatas')}
        {field('Periode tagihan', 'billingPeriod', 'monthly, yearly, atau kosong')}
        {field('Fitur (pisah koma)', 'features')}
      </div>

      {/* Save */}
      {saveError && (
        <p className="text-sm text-red-700 rounded bg-red-50 border border-red-200 px-3 py-2" role="alert">
          {saveError}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={saveState === 'saving'}>
          {saveState === 'saving' ? 'Menyimpan…' : 'Simpan'}
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

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    adminService.listPlans().then((result) => {
      if (result.ok) {
        setPlans(result.value);
      } else {
        setLoadError(result.error.safeMessage);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSaved = (updated: AdminPlanRow) => {
    setPlans((prev) => prev.map((p) => (p.key === updated.key ? updated : p)));
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <AdminPageHeader
        title="Plan & Harga"
        description="Kelola katalog paket harga yang menjadi sumber kebenaran di seluruh platform."
        actions={
          <Button size="sm" variant="quiet" onClick={load} disabled={loading}>
            {loading ? 'Memuat…' : 'Muat ulang'}
          </Button>
        }
      />

      {loading && (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Memuat data paket">
          <div className="h-40 animate-pulse rounded-xl bg-[#f3ede5]" />
          <div className="h-40 animate-pulse rounded-xl bg-[#f3ede5]" />
        </div>
      )}

      {!loading && loadError && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          {loadError}
          <button
            className="ml-3 underline text-red-800 font-semibold"
            onClick={load}
          >
            Coba lagi
          </button>
        </div>
      )}

      {!loading && !loadError && plans.length === 0 && (
        <p className="text-body-sm text-[#6d665d]">Tidak ada paket ditemukan.</p>
      )}

      {!loading &&
        plans.map((p) => (
          <PlanEditor key={p.key} plan={p} onSaved={handleSaved} setToast={setToast} />
        ))}
    </div>
  );
}
