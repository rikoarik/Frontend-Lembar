'use client';

import { useEffect, useRef, useState } from 'react';
import { AdminPageHeader, AdminPill } from '@/src/features/admin/AdminChrome';
import {
  aiProviderService,
  type AiProviderConfig,
  type AiProviderUpdatePayload,
} from '@/src/services/admin/adminService';

type Driver = 'mock' | 'openai' | 'hermes';
type TestTarget = 'primary' | 'fallback';

type TestState = {
  loading: boolean;
  ok: boolean | null;
  message: string;
};

const EMPTY_TEST: TestState = { loading: false, ok: null, message: '' };
const fieldCls =
  'w-full rounded-xl border border-[#ddd3c4] bg-white px-3.5 py-2.5 text-sm text-[#1e1814] placeholder:text-[#b0a79b] outline-none transition focus:border-[#851925] focus:ring-2 focus:ring-[#851925]/15 disabled:opacity-50 disabled:bg-[#f5f0e8]';
const cardCls = 'rounded-2xl border border-[#ddd3c4] bg-white p-5 shadow-sm';
const labelCls = 'mb-1.5 block text-[12px] font-semibold text-[#57534e]';
const hintCls = 'mt-1.5 text-[11px] leading-5 text-[#8a8177]';
const testBtnCls =
  'rounded-xl border border-[#ddd3c4] bg-white px-4 py-2 text-sm font-medium text-[#57534e] transition hover:bg-[#f5f0e8] disabled:opacity-50';

function safeText(value: string, fallback: string): string {
  return value.trim() || fallback;
}

function ProviderField({
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
      <span className={labelCls}>{label}</span>
      {children}
      {hint ? <p className={hintCls}>{hint}</p> : null}
    </label>
  );
}

function StatusBadge({ state }: { state: TestState }) {
  if (state.loading) {
    return <span className="text-xs text-[#7a736b]">Menguji koneksi...</span>;
  }
  if (state.ok === null) return null;
  return (
    <span className={`text-xs font-medium ${state.ok ? 'text-emerald-700' : 'text-rose-700'}`}>
      {state.ok ? 'Berhasil' : 'Gagal'}: {state.message}
    </span>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={cardCls}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8177]">
            {title}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function OpsAiProviderSection({ setToast }: { setToast?: (msg: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [driver, setDriver] = useState<Driver>('mock');
  const [primaryBaseUrl, setPrimaryBaseUrl] = useState('');
  const [primaryApiKey, setPrimaryApiKey] = useState('');
  const [primaryModelId, setPrimaryModelId] = useState('');
  const [fallbackBaseUrl, setFallbackBaseUrl] = useState('');
  const [fallbackApiKey, setFallbackApiKey] = useState('');
  const [fallbackModelId, setFallbackModelId] = useState('');
  const [timeoutMs, setTimeoutMs] = useState(30000);
  const originalPrimaryKey = useRef('');
  const originalFallbackKey = useRef('');
  const [primaryTest, setPrimaryTest] = useState<TestState>(EMPTY_TEST);
  const [fallbackTest, setFallbackTest] = useState<TestState>(EMPTY_TEST);

  useEffect(() => {
    let cancelled = false;

    aiProviderService.getAiProvider().then((result) => {
      if (cancelled) return;
      setLoading(false);
      if (!result.ok) {
        setError(result.error.safeMessage ?? 'Gagal memuat konfigurasi AI.');
        return;
      }
      const cfg = result.value;
      setDriver(cfg.driver);
      setPrimaryBaseUrl(cfg.primaryBaseUrl);
      setPrimaryApiKey(cfg.primaryApiKey);
      originalPrimaryKey.current = cfg.primaryApiKey;
      setPrimaryModelId(cfg.primaryModelId);
      setFallbackBaseUrl(cfg.fallbackBaseUrl);
      setFallbackApiKey(cfg.fallbackApiKey);
      originalFallbackKey.current = cfg.fallbackApiKey;
      setFallbackModelId(cfg.fallbackModelId);
      setTimeoutMs(cfg.timeoutMs);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = async () => {
    const refreshed = await aiProviderService.getAiProvider();
    if (!refreshed.ok) return;
    setPrimaryApiKey(refreshed.value.primaryApiKey);
    originalPrimaryKey.current = refreshed.value.primaryApiKey;
    setFallbackApiKey(refreshed.value.fallbackApiKey);
    originalFallbackKey.current = refreshed.value.fallbackApiKey;
  };

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

    if (
      primaryApiKey &&
      primaryApiKey !== originalPrimaryKey.current &&
      !primaryApiKey.includes('***')
    ) {
      payload.primaryApiKey = primaryApiKey;
    }
    if (
      fallbackApiKey &&
      fallbackApiKey !== originalFallbackKey.current &&
      !fallbackApiKey.includes('***')
    ) {
      payload.fallbackApiKey = fallbackApiKey;
    }

    const result = await aiProviderService.updateAiProvider(payload);
    setSaving(false);

    if (!result.ok) {
      setError(result.error.safeMessage ?? 'Gagal menyimpan konfigurasi.');
      return;
    }

    setToast?.('Konfigurasi AI disimpan.');
    await refresh();
  };

  const handleTest = async (target: TestTarget) => {
    const setter = target === 'primary' ? setPrimaryTest : setFallbackTest;
    const apiKey = target === 'primary' ? primaryApiKey : fallbackApiKey;
    const baseUrl = target === 'primary' ? primaryBaseUrl : fallbackBaseUrl;
    const modelId = target === 'primary' ? primaryModelId : fallbackModelId;

    setter({ loading: true, ok: null, message: '' });

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

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#ddd3c4] bg-[#f5f0e8] p-6 text-sm text-[#7a736b]">
        Memuat konfigurasi AI...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#1e1814]">
      <AdminPageHeader
        title="Konfigurasi AI"
        description="Atur provider inference yang dipakai Hermes Runtime: base URL, API key, model utama, fallback, dan timeout. Fitur aplikasi tidak memanggil provider secara langsung."
      />

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#ddd3c4] bg-[#f5f0e8] px-4 py-3">
        <span className="text-xs text-[#8a8177]">Runtime:</span>
        <AdminPill tone="info">HERMES</AdminPill>
        <span className="text-xs text-[#8a8177]">Provider aktif:</span>
        <AdminPill tone={driver === 'mock' ? 'warn' : driver === 'hermes' ? 'info' : 'ok'}>
          {driver.toUpperCase()}
        </AdminPill>
        {primaryModelId ? <span className="text-xs text-[#b0a79b]">·</span> : null}
        {primaryModelId ? (
          <span className="font-mono text-xs text-[#57534e]">{primaryModelId}</span>
        ) : null}
        {driver === 'mock' ? (
          <span className="ml-auto text-xs text-amber-700">
            Driver mock aktif. Tidak ada request nyata yang dikirim.
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Primary">
          <div className="space-y-4">
            <ProviderField label="Driver">
              <select
                className={fieldCls}
                value={driver}
                onChange={(e) => setDriver(e.target.value as Driver)}
                disabled={saving}
              >
                <option value="mock">mock - tidak kirim ke provider</option>
                <option value="hermes">hermes - OpenAI-compatible endpoint</option>
                <option value="openai">openai - api.openai.com</option>
              </select>
            </ProviderField>

            <ProviderField
              label="Base URL"
              hint="Contoh: https://api.arklabs.biz.id/v1 - harus kompatibel dengan OpenAI chat completions"
            >
              <input
                type="url"
                className={fieldCls}
                placeholder="https://api.example.com/v1"
                value={primaryBaseUrl}
                onChange={(e) => setPrimaryBaseUrl(e.target.value)}
                disabled={saving}
              />
            </ProviderField>

            <ProviderField
              label="API Key"
              hint="Biarkan kosong untuk mempertahankan key yang tersimpan."
            >
              <input
                type="password"
                className={fieldCls}
                placeholder="Biarkan kosong bila tidak diubah"
                value={primaryApiKey}
                onChange={(e) => setPrimaryApiKey(e.target.value)}
                autoComplete="new-password"
                disabled={saving}
              />
            </ProviderField>

            <ProviderField label="Model ID">
              <input
                type="text"
                className={fieldCls}
                placeholder="gpt-4o-mini"
                value={primaryModelId}
                onChange={(e) => setPrimaryModelId(e.target.value)}
                disabled={saving}
              />
            </ProviderField>

            <ProviderField label="Timeout (ms)">
              <input
                type="number"
                className={fieldCls}
                min={1000}
                max={120000}
                step={1000}
                value={timeoutMs}
                onChange={(e) => setTimeoutMs(Number(e.target.value))}
                disabled={saving}
              />
            </ProviderField>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleTest('primary')}
                disabled={saving || primaryTest.loading}
                className={testBtnCls}
              >
                {primaryTest.loading ? 'Menguji...' : 'Tes Koneksi Primary'}
              </button>
              <StatusBadge state={primaryTest} />
            </div>
          </div>
        </Panel>

        <Panel title="Fallback">
          <div className="space-y-4">
            <ProviderField
              label="Base URL"
              hint="Default: https://api.openai.com - ganti jika pakai proxy"
            >
              <input
                type="url"
                className={fieldCls}
                placeholder="https://api.openai.com"
                value={fallbackBaseUrl}
                onChange={(e) => setFallbackBaseUrl(e.target.value)}
                disabled={saving}
              />
            </ProviderField>

            <ProviderField
              label="API Key"
              hint="Biarkan kosong untuk mempertahankan key yang tersimpan."
            >
              <input
                type="password"
                className={fieldCls}
                placeholder="Biarkan kosong bila tidak diubah"
                value={fallbackApiKey}
                onChange={(e) => setFallbackApiKey(e.target.value)}
                autoComplete="new-password"
                disabled={saving}
              />
            </ProviderField>

            <ProviderField label="Model ID">
              <input
                type="text"
                className={fieldCls}
                placeholder="gpt-4o-mini"
                value={fallbackModelId}
                onChange={(e) => setFallbackModelId(e.target.value)}
                disabled={saving}
              />
            </ProviderField>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleTest('fallback')}
                disabled={saving || fallbackTest.loading}
                className={testBtnCls}
              >
                {fallbackTest.loading ? 'Menguji...' : 'Tes Koneksi Fallback'}
              </button>
              <StatusBadge state={fallbackTest} />
            </div>
          </div>
        </Panel>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-[#851925] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6d1420] disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </button>
        <p className="text-sm text-[#7a736b]">
          Perubahan langsung diterapkan ke .env server dan merestart worker.
        </p>
      </div>
    </div>
  );
}
