'use client';

/**
 * OpsAiProviderSection — superadmin panel untuk konfigurasi AI provider.
 *
 * Menampilkan dan mengedit konfigurasi primary (hermes/openai-compatible)
 * dan fallback (openai) provider. Setiap API key disensor di response BE.
 * Tombol "Tes Koneksi" melakukan live test sebelum menyimpan.
 */

import { useEffect, useRef, useState } from 'react';
import { AdminPageHeader, AdminPill } from '@/src/features/admin/AdminChrome';
import {
  aiProviderService,
  type AiProviderConfig,
  type AiProviderUpdatePayload,
} from '@/src/services/admin/adminService';

type Driver = 'mock' | 'openai' | 'hermes';

type TestState = {
  loading: boolean;
  ok: boolean | null;
  message: string;
};

const EMPTY_TEST: TestState = { loading: false, ok: null, message: '' };

function ProviderCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-neutral-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-neutral-600">{hint}</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50';

const selectCls =
  'w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50';

function TestBadge({ state }: { state: TestState }) {
  if (state.loading)
    return <span className="text-xs text-neutral-400">Menguji…</span>;
  if (state.ok === null) return null;
  return (
    <span
      className={`text-xs font-medium ${state.ok ? 'text-emerald-400' : 'text-rose-400'}`}
    >
      {state.ok ? '✓' : '✗'} {state.message}
    </span>
  );
}

export function OpsAiProviderSection({
  setToast,
}: {
  setToast?: (msg: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [driver, setDriver] = useState<Driver>('mock');
  const [primaryBaseUrl, setPrimaryBaseUrl] = useState('');
  const [primaryApiKey, setPrimaryApiKey] = useState('');
  const [primaryModelId, setPrimaryModelId] = useState('');
  const [fallbackBaseUrl, setFallbackBaseUrl] = useState('');
  const [fallbackApiKey, setFallbackApiKey] = useState('');
  const [fallbackModelId, setFallbackModelId] = useState('');
  const [timeoutMs, setTimeoutMs] = useState(30000);

  // Original censored keys (to detect if user actually changed them)
  const originalPrimaryKey = useRef('');
  const originalFallbackKey = useRef('');

  // Test states
  const [primaryTest, setPrimaryTest] = useState<TestState>(EMPTY_TEST);
  const [fallbackTest, setFallbackTest] = useState<TestState>(EMPTY_TEST);

  // ── Load config ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    aiProviderService.getAiProvider().then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (!result.ok) {
        setError(result.error.safeMessage ?? 'Gagal memuat konfigurasi provider.');
        return;
      }
      const d = result.value;
      setDriver(d.driver);
      setPrimaryBaseUrl(d.primaryBaseUrl);
      setPrimaryApiKey(d.primaryApiKey);
      originalPrimaryKey.current = d.primaryApiKey;
      setPrimaryModelId(d.primaryModelId);
      setFallbackBaseUrl(d.fallbackBaseUrl);
      setFallbackApiKey(d.fallbackApiKey);
      originalFallbackKey.current = d.fallbackApiKey;
      setFallbackModelId(d.fallbackModelId);
      setTimeoutMs(d.timeoutMs);
    });

    return () => { cancelled = true; };
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const payload: AiProviderUpdatePayload = {
      driver,
      primaryBaseUrl,
      primaryModelId,
      fallbackBaseUrl,
      fallbackModelId,
      timeoutMs,
    };

    // Only send key if user actually changed it (not placeholder)
    if (primaryApiKey && primaryApiKey !== originalPrimaryKey.current && !primaryApiKey.includes('***')) {
      payload.primaryApiKey = primaryApiKey;
    }
    if (fallbackApiKey && fallbackApiKey !== originalFallbackKey.current && !fallbackApiKey.includes('***')) {
      payload.fallbackApiKey = fallbackApiKey;
    }

    const result = await aiProviderService.updateAiProvider(payload);
    setSaving(false);

    if (!result.ok) {
      setError(result.error.safeMessage ?? 'Gagal menyimpan konfigurasi.');
      return;
    }

    setToast?.('Konfigurasi AI provider disimpan.');

    // Refresh to get new censored keys
    const refreshed = await aiProviderService.getAiProvider();
    if (refreshed.ok) {
      setPrimaryApiKey(refreshed.value.primaryApiKey);
      originalPrimaryKey.current = refreshed.value.primaryApiKey;
      setFallbackApiKey(refreshed.value.fallbackApiKey);
      originalFallbackKey.current = refreshed.value.fallbackApiKey;
    }
  };

  // ── Test connection ───────────────────────────────────────────────────────
  const handleTest = async (target: 'primary' | 'fallback') => {
    const setter = target === 'primary' ? setPrimaryTest : setFallbackTest;
    setter({ loading: true, ok: null, message: '' });

    const apiKey = target === 'primary' ? primaryApiKey : fallbackApiKey;
    const baseUrl = target === 'primary' ? primaryBaseUrl : fallbackBaseUrl;
    const modelId = target === 'primary' ? primaryModelId : fallbackModelId;

    // Only send key if not a placeholder
    const payload: Parameters<typeof aiProviderService.testAiProvider>[0] = { target };
    if (baseUrl) payload.baseUrl = baseUrl;
    if (apiKey && !apiKey.includes('***')) payload.apiKey = apiKey;
    if (modelId) payload.modelId = modelId;

    const result = await aiProviderService.testAiProvider(payload);

    if (!result.ok) {
      setter({ loading: false, ok: false, message: result.error.safeMessage ?? 'Error.' });
      return;
    }
    setter({ loading: false, ok: result.value.ok, message: result.value.message });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-neutral-500">
        Memuat konfigurasi AI provider…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Konfigurasi AI Provider"
        description="Atur primary dan fallback provider AI (OpenAI-compatible). API key disimpan di server — tidak pernah dikirim ke browser."
      />

      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-3">
        <span className="text-xs text-neutral-500">Driver aktif:</span>
        <AdminPill
          tone={driver === 'mock' ? 'warn' : driver === 'hermes' ? 'info' : 'ok'}
        >
          {driver.toUpperCase()}
        </AdminPill>
        {primaryModelId && (
          <>
            <span className="text-xs text-neutral-600">·</span>
            <span className="font-mono text-xs text-neutral-400">{primaryModelId}</span>
          </>
        )}
        {driver === 'mock' && (
          <span className="ml-auto text-xs text-amber-400">
            ⚠ Driver mock aktif — tidak ada permintaan nyata yang dikirim ke provider.
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-800/60 bg-rose-900/20 px-4 py-3 text-sm text-rose-400">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* ── Primary Provider ── */}
        <ProviderCard title="Primary Provider">
          <div className="space-y-4">
            <Field label="Driver">
              <select
                className={selectCls}
                value={driver}
                onChange={(e) => setDriver(e.target.value as Driver)}
                disabled={saving}
              >
                <option value="mock">mock — tidak kirim ke provider</option>
                <option value="hermes">hermes — OpenAI-compatible endpoint</option>
                <option value="openai">openai — api.openai.com</option>
              </select>
            </Field>

            <Field
              label="Base URL"
              hint="Contoh: https://api.arklabs.biz.id/v1 — harus kompatibel dengan OpenAI chat completions"
            >
              <input
                type="url"
                className={inputCls}
                placeholder="https://api.example.com/v1"
                value={primaryBaseUrl}
                onChange={(e) => setPrimaryBaseUrl(e.target.value)}
                disabled={saving}
              />
            </Field>

            <Field label="API Key" hint="Kosongkan atau isi *** untuk tidak mengubah key yang tersimpan.">
              <input
                type="password"
                className={inputCls}
                placeholder="sk-••••••••"
                value={primaryApiKey}
                onChange={(e) => setPrimaryApiKey(e.target.value)}
                autoComplete="new-password"
                disabled={saving}
              />
            </Field>

            <Field label="Model ID">
              <input
                type="text"
                className={inputCls}
                placeholder="gpt-4o-mini"
                value={primaryModelId}
                onChange={(e) => setPrimaryModelId(e.target.value)}
                disabled={saving}
              />
            </Field>

            <Field label="Timeout (ms)">
              <input
                type="number"
                className={inputCls}
                min={1000}
                max={120000}
                step={1000}
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(Number(e.target.value))}
                disabled={saving}
              />
            </Field>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleTest('primary')}
                disabled={saving || primaryTest.loading}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-indigo-500 hover:text-indigo-300 disabled:opacity-50"
              >
                {primaryTest.loading ? 'Menguji…' : 'Tes Koneksi Primary'}
              </button>
              <TestBadge state={primaryTest} />
            </div>
          </div>
        </ProviderCard>

        {/* ── Fallback Provider ── */}
        <ProviderCard title="Fallback Provider (OpenAI)">
          <div className="space-y-4">
            <Field
              label="Base URL"
              hint="Default: https://api.openai.com — ganti jika pakai proxy"
            >
              <input
                type="url"
                className={inputCls}
                placeholder="https://api.openai.com"
                value={fallbackBaseUrl}
                onChange={(e) => setFallbackBaseUrl(e.target.value)}
                disabled={saving}
              />
            </Field>

            <Field label="API Key" hint="Kosongkan atau isi *** untuk tidak mengubah key yang tersimpan.">
              <input
                type="password"
                className={inputCls}
                placeholder="sk-••••••••"
                value={fallbackApiKey}
                onChange={(e) => setFallbackApiKey(e.target.value)}
                autoComplete="new-password"
                disabled={saving}
              />
            </Field>

            <Field label="Model ID">
              <input
                type="text"
                className={inputCls}
                placeholder="gpt-4o-mini"
                value={fallbackModelId}
                onChange={(e) => setFallbackModelId(e.target.value)}
                disabled={saving}
              />
            </Field>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleTest('fallback')}
                disabled={saving || fallbackTest.loading}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-indigo-500 hover:text-indigo-300 disabled:opacity-50"
              >
                {fallbackTest.loading ? 'Menguji…' : 'Tes Koneksi Fallback'}
              </button>
              <TestBadge state={fallbackTest} />
            </div>
          </div>
        </ProviderCard>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {saving ? 'Menyimpan…' : 'Simpan Konfigurasi'}
        </button>
        <p className="text-xs text-neutral-600">
          Perubahan langsung diterapkan ke .env server dan merestart worker.
        </p>
      </div>
    </div>
  );
}
