'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button, Panel, StatusBadge } from '@/app/components/ui';
import type { ShareLink } from '@/src/features/share/mockShareStore';

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/v1${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const json = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(json.error?.message ?? 'Gagal memproses tautan bagikan.');
  }
  return json.data as T;
}

export function ShareManager({
  assessmentId,
  title,
}: {
  assessmentId: string;
  title: string;
}) {
  const [items, setItems] = useState<ShareLink[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api<ShareLink[]>(`/shares?assessmentId=${encodeURIComponent(assessmentId)}`);
      setItems(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal memuat tautan.');
    }
  }, [assessmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = async () => {
    setBusy(true);
    setMessage('');
    try {
      const created = await api<ShareLink>('/shares', {
        method: 'POST',
        body: JSON.stringify({ assessmentId, title, daysValid: 30 }),
      });
      setItems((prev) => [created, ...prev]);
      setMessage(`Tautan dibuat: /bagikan/${created.token}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal membuat tautan.');
    } finally {
      setBusy(false);
    }
  };

  const onRevoke = async (token: string) => {
    setBusy(true);
    setMessage('');
    try {
      const updated = await api<ShareLink>(`/shares/${encodeURIComponent(token)}/revoke`, {
        method: 'POST',
        body: '{}',
      });
      setItems((prev) => prev.map((item) => (item.token === token ? updated : item)));
      setMessage('Tautan dicabut.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal mencabut tautan.');
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async (token: string) => {
    const url = `${window.location.origin}/bagikan/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Tautan disalin.');
    } catch {
      setMessage(url);
    }
  };

  return (
    <Panel title="Tautan bagikan terkontrol" description="Buat, salin, atau cabut tautan read-only.">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button loading={busy} loadingLabel="Membuat…" onClick={() => void onCreate()}>
            Buat tautan 30 hari
          </Button>
          <Button variant="secondary" onClick={() => void load()}>
            Muat ulang
          </Button>
        </div>
        {message ? (
          <p className="text-body-sm text-brand-ink-muted" role="status">
            {message}
          </p>
        ) : null}
        {items.length === 0 ? (
          <p className="text-body-sm text-brand-ink-muted">Belum ada tautan untuk lembar ini.</p>
        ) : (
          <ul className="flex flex-col gap-2" role="list">
            {items.map((item) => (
              <li
                key={item.token}
                className="flex flex-col gap-2 rounded-md border border-brand-line px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="text-body-sm">{item.token}</code>
                    <StatusBadge
                      label={
                        item.status === 'active'
                          ? 'Final'
                          : item.status === 'expired'
                            ? 'Kedaluwarsa'
                            : 'Gagal'
                      }
                    />
                  </div>
                  <p className="text-caption text-brand-ink-muted">
                    Status {item.status} · kedaluwarsa {new Date(item.expiresAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/bagikan/${item.token}`}
                    className="inline-flex min-h-[var(--control-sm)] items-center rounded-md border border-brand-line px-3 text-body-sm"
                  >
                    Buka viewer
                  </Link>
                  <Button size="sm" variant="secondary" onClick={() => void onCopy(item.token)}>
                    Salin
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={item.status !== 'active' || busy}
                    onClick={() => void onRevoke(item.token)}
                  >
                    Cabut
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}
