'use client';

/**
 * OpsWaGatewaySection — panel manajemen WA Gateway sessions.
 * Proxy ke BE /v1/admin/wa-gateway → OpenWA container.
 */

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  return base.endsWith('/v1') && clean.startsWith('/v1')
    ? `${base}${clean.slice(3)}`
    : `${base}${clean}`;
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
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newId, setNewId] = useState('');
  const [qr, setQr] = useState<QrState>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelPollRef = useRef<(() => void) | null>(null);

  const toast = useCallback((msg: string) => setToast?.(msg), [setToast]);

  const requestSessions = useCallback(() => {
    return apiFetch('/v1/admin/wa-gateway')
      .then(async (res) => {
        if (!res.ok) {
          toast('Gagal memuat sessions');
          return null;
        }
        return (await res.json()) as WaSession[] | { data: WaSession[] };
      })
      .then((body) => {
        if (body) setSessions(Array.isArray(body) ? body : (body.data ?? []));
      })
      .catch(() => toast('Gagal memuat sessions'))
      .finally(() => setLoading(false));
  }, [toast]);

  const load = useCallback(async () => {
    setLoading(true);
    await requestSessions();
  }, [requestSessions]);

  useEffect(() => {
    void requestSessions();
  }, [requestSessions]);

  const stopPoll = useCallback(() => {
    cancelPollRef.current?.();
    cancelPollRef.current = null;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startQrPoll = (sessionId: string) => {
    stopPoll();
    let cancelled = false;
    cancelPollRef.current = () => {
      cancelled = true;
    };
    const deadline = Date.now() + 60_000;

    const poll = async () => {
      if (cancelled) return;
      if (Date.now() > deadline) {
        stopPoll();
        setQr((prev) => (prev ? { ...prev, timedOut: true } : null));
        return;
      }
      try {
        const res = await apiFetch(`/v1/admin/wa-gateway/${sessionId}/qr`);
        if (cancelled) return;
        if (!res.ok) return;
        const body = (await res.json()) as { qrCode?: string; status?: string };
        if (cancelled) return;
        if (body.status === 'ready') {
          stopPoll();
          setQr(null);
          toast('Session terhubung!');
          void load();
          return;
        }
        setQr({ sessionId, qrCode: body.qrCode ?? null, timedOut: false });
      } catch {
        /* retry next tick */
      }
    };

    void poll();
    if (pollRef.current) clearInterval(pollRef.current);
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
      if (!res.ok) {
        toast('Gagal membuat session');
        return;
      }

      // start session
      await apiFetch(`/v1/admin/wa-gateway/${id}/start`, { method: 'POST' });
      setNewId('');
      await load();
      startQrPoll(id);
    } catch {
      toast('Gagal membuat session');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm(`Hapus session "${sessionId}"?`)) return;
    try {
      await apiFetch(`/v1/admin/wa-gateway/${sessionId}`, { method: 'DELETE' });
      if (qr?.sessionId === sessionId) {
        stopPoll();
        setQr(null);
      }
      void load();
    } catch {
      toast('Gagal menghapus session');
    }
  };

  // Cleanup on unmount
  useEffect(() => () => stopPoll(), [stopPoll]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="WA Gateway"
        description="Manajemen sesi WhatsApp — proxy ke OpenWA container."
        meta={<AdminPill tone="info">superadmin</AdminPill>}
      />

      {/* New session form */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          className="w-full sm:w-auto min-w-[240px] rounded-xl border border-[#ddd3c4] bg-white px-3.5 py-2.5 text-sm text-[#1e1814] placeholder:text-[#b0a79b] outline-none transition focus:border-[#851925] focus:ring-2 focus:ring-[#851925]/20"
          placeholder="ID session baru (mis. lembar-wa-1)"
          value={newId}
          onChange={(e) => setNewId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void handleCreate()}
          disabled={creating}
          aria-label="ID session baru"
        />
        <button
          onClick={() => void handleCreate()}
          disabled={creating || !newId.trim()}
          className="rounded-xl bg-[#851925] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6d1420] disabled:opacity-50 transition-colors"
          aria-busy={creating}
        >
          {creating ? 'Membuat…' : 'Tambah Session'}
        </button>
        <button
          onClick={() => void load()}
          className="rounded-xl border border-[#ddd3c4] bg-white px-3 py-2.5 text-sm text-[#6d665d] hover:bg-[#faf8f5] transition-colors"
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
          className="rounded-xl border border-[#e6dfd4] bg-white p-4 shadow-sm space-y-2"
        >
          <p className="text-sm text-[#1e1814]">
            Scan QR di WhatsApp untuk session <strong>{qr.sessionId}</strong>
          </p>
          {qr.timedOut ? (
            <p className="text-sm text-[#a3202b]">
              Waktu habis. Mulai ulang session secara manual.
            </p>
          ) : qr.qrCode ? (
            <Image
              src={`data:image/png;base64,${qr.qrCode}`}
              alt="QR WhatsApp"
              width={192}
              height={192}
              unoptimized
              className="h-48 w-48 rounded"
            />
          ) : (
            <p className="text-sm text-[#8a8177] animate-pulse">Menunggu QR…</p>
          )}
          <button
            onClick={() => {
              stopPoll();
              setQr(null);
            }}
            className="text-xs text-[#8a8177] hover:text-[#1e1814]"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Session list */}
      {loading ? (
        <p className="text-sm text-[#8a8177] animate-pulse">Memuat sessions…</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-[#8a8177]">Belum ada session. Tambah session di atas.</p>
      ) : (
        <ul className="space-y-2" aria-label="Daftar WA session">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e6dfd4] bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3 min-w-0">
                <span className="text-sm font-mono text-[#1e1814] break-all">{s.id}</span>
                <AdminPill tone={STATUS_TONE[s.status] ?? 'neutral'}>{s.status}</AdminPill>
              </div>
              <div className="flex gap-2">
                {s.status !== 'ready' && (
                  <button
                    onClick={() => startQrPoll(s.id)}
                    className="text-xs rounded-lg border border-[#ddd3c4] bg-white px-3 py-1.5 font-medium text-[#1e1814] hover:bg-[#faf8f5] transition-colors"
                  >
                    Lihat QR
                  </button>
                )}
                <button
                  onClick={() => void handleDelete(s.id)}
                  className="text-xs rounded-lg bg-[#fdeaea] px-3 py-1.5 font-medium text-[#a3202b] hover:bg-[#fbd6d6] transition-colors"
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
