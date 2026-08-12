'use client';

/**
 * OpsWaGatewaySection — panel manajemen WA Gateway sessions.
 * Proxy ke BE /v1/admin/wa-gateway → OpenWA container.
 */

import { useEffect, useRef, useState } from 'react';
import { AdminPageHeader, AdminPill } from '@/src/features/admin/AdminChrome';

// ── Types ─────────────────────────────────────────────────────────────────────

type SessionStatus = 'ready' | 'qr_ready' | 'initializing' | 'disconnected' | string;

type WaSession = {
  id: string;
  status: SessionStatus;
  name?: string;
};

type QrState = { sessionId: string; qrCode: string | null; timedOut: boolean } | null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveApiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return base.endsWith('/v1') && clean.startsWith('/v1') ? `${base}${clean.slice(3)}` : `${base}${clean}`;
}

async function apiFetch(path: string, opts?: RequestInit) {
  return fetch(resolveApiUrl(path), { credentials: 'include', ...opts });
}

const STATUS_TONE: Record<string, 'ok' | 'warn' | 'bad' | 'info' | 'neutral'> = {
  ready: 'ok',
  qr_ready: 'warn',
  initializing: 'info',
  disconnected: 'bad',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function OpsWaGatewaySection({ setToast }: { setToast?: (msg: string) => void }) {
  const [sessions, setSessions] = useState<WaSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newId, setNewId] = useState('');
  const [qr, setQr] = useState<QrState>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toast = (msg: string) => setToast?.(msg);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/v1/admin/wa-gateway');
      if (!res.ok) { toast('Gagal memuat sessions'); return; }
      const body = (await res.json()) as WaSession[] | { data: WaSession[] };
      setSessions(Array.isArray(body) ? body : (body as { data: WaSession[] }).data ?? []);
    } catch { toast('Gagal memuat sessions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopPoll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const startQrPoll = (sessionId: string) => {
    stopPoll();
    const deadline = Date.now() + 60_000;

    const poll = async () => {
      if (Date.now() > deadline) {
        stopPoll();
        setQr(prev => prev ? { ...prev, timedOut: true } : null);
        return;
      }
      try {
        const res = await apiFetch(`/v1/admin/wa-gateway/${sessionId}/qr`);
        if (!res.ok) return;
        const body = (await res.json()) as { qrCode?: string; status?: string };
        if (body.status === 'ready') {
          stopPoll();
          setQr(null);
          toast('Session terhubung!');
          void load();
          return;
        }
        setQr({ sessionId, qrCode: body.qrCode ?? null, timedOut: false });
      } catch { /* retry next tick */ }
    };

    void poll();
    pollRef.current = setInterval(poll, 3000);
  };

  const handleCreate = async () => {
    const id = newId.trim();
    if (!id) return;
    setCreating(true);
    try {
      const res = await apiFetch('/v1/admin/wa-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { toast('Gagal membuat session'); return; }

      // start session
      await apiFetch(`/v1/admin/wa-gateway/${id}/start`, { method: 'POST' });
      setNewId('');
      await load();
      startQrPoll(id);
    } catch { toast('Gagal membuat session'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm(`Hapus session "${sessionId}"?`)) return;
    try {
      await apiFetch(`/v1/admin/wa-gateway/${sessionId}`, { method: 'DELETE' });
      if (qr?.sessionId === sessionId) { stopPoll(); setQr(null); }
      void load();
    } catch { toast('Gagal menghapus session'); }
  };

  // Cleanup on unmount
  useEffect(() => stopPoll, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="WA Gateway"
        description="Manajemen sesi WhatsApp — proxy ke OpenWA container."
        meta={<AdminPill tone="info">superadmin</AdminPill>}
      />

      {/* New session form */}
      <div className="flex gap-2 items-center">
        <input
          className="rounded border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
          placeholder="ID session baru (mis. lembar-wa-1)"
          value={newId}
          onChange={e => setNewId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && void handleCreate()}
          disabled={creating}
          aria-label="ID session baru"
        />
        <button
          onClick={() => void handleCreate()}
          disabled={creating || !newId.trim()}
          className="rounded bg-white/10 px-4 py-1.5 text-sm text-white hover:bg-white/20 disabled:opacity-40"
          aria-busy={creating}
        >
          {creating ? 'Membuat…' : 'Tambah Session'}
        </button>
        <button
          onClick={() => void load()}
          className="rounded bg-white/5 px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/10"
          aria-label="Muat ulang"
        >
          ↻
        </button>
      </div>

      {/* QR panel */}
      {qr && (
        <div
          role="dialog"
          aria-label="Scan QR WhatsApp"
          className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-2"
        >
          <p className="text-sm text-white/70">
            Scan QR di WhatsApp untuk session <strong>{qr.sessionId}</strong>
          </p>
          {qr.timedOut ? (
            <p className="text-sm text-red-400">Waktu habis. Mulai ulang session secara manual.</p>
          ) : qr.qrCode ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${qr.qrCode}`}
              alt="QR WhatsApp"
              className="w-48 h-48 rounded"
            />
          ) : (
            <p className="text-sm text-white/40 animate-pulse">Menunggu QR…</p>
          )}
          <button
            onClick={() => { stopPoll(); setQr(null); }}
            className="text-xs text-white/40 hover:text-white/70"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Session list */}
      {loading ? (
        <p className="text-sm text-white/40 animate-pulse">Memuat sessions…</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-white/40">Belum ada session. Tambah session di atas.</p>
      ) : (
        <ul className="space-y-2" aria-label="Daftar WA session">
          {sessions.map(s => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-white font-mono">{s.id}</span>
                <AdminPill tone={STATUS_TONE[s.status] ?? 'neutral'}>{s.status}</AdminPill>
              </div>
              <div className="flex gap-2">
                {s.status !== 'ready' && (
                  <button
                    onClick={() => startQrPoll(s.id)}
                    className="text-xs rounded bg-white/10 px-3 py-1 text-white hover:bg-white/20"
                  >
                    Lihat QR
                  </button>
                )}
                <button
                  onClick={() => void handleDelete(s.id)}
                  className="text-xs rounded bg-red-500/20 px-3 py-1 text-red-300 hover:bg-red-500/40"
                  aria-label={`Hapus session ${s.id}`}
                >
                  Hapus
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
