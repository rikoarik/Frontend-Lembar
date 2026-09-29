'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Button, Panel, StatusBadge } from '@/app/components/ui';

type ShareLink = {
  id: string;
  token: string;
  assessmentId: string;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

async function api<T>(path: string, init?: RequestInit, fallbackMessage?: string): Promise<T> {
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
    throw new Error(json.error?.message ?? fallbackMessage ?? 'Request failed.');
  }
  return json.data as T;
}

function fetchShareLinks(assessmentId: string, fallbackMessage?: string) {
  return api<ShareLink[]>(
    `/shares?assessmentId=${encodeURIComponent(assessmentId)}`,
    undefined,
    fallbackMessage,
  );
}

export function ShareManager({ assessmentId, title }: { assessmentId: string; title: string }) {
  const t = useTranslations('share');
  const [items, setItems] = useState<ShareLink[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      setItems(await fetchShareLinks(assessmentId, t('messages.requestFailed')));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('messages.loadFailed'));
    }
  }, [assessmentId, t]);

  useEffect(() => {
    let cancelled = false;

    void fetchShareLinks(assessmentId, t('messages.requestFailed'))
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((error) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : t('messages.loadFailed'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [assessmentId, t]);

  const onCreate = async () => {
    setBusy(true);
    setMessage('');
    try {
      const created = await api<ShareLink>(
        '/shares',
        {
          method: 'POST',
          body: JSON.stringify({ assessmentId, title, ttlSeconds: 30 * 24 * 60 * 60 }),
        },
        t('messages.requestFailed'),
      );
      setItems((prev) => [created, ...prev.filter((item) => item.token !== created.token)]);
      setMessage(t('messages.published', { path: `/attempt/${created.token}` }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('messages.createFailed'));
    } finally {
      setBusy(false);
    }
  };

  const onRevoke = async (token: string) => {
    setBusy(true);
    setMessage('');
    try {
      const updated = await api<ShareLink>(
        `/shares/${encodeURIComponent(token)}/revoke`,
        { method: 'DELETE' },
        t('messages.requestFailed'),
      );
      setItems((prev) => prev.map((item) => (item.token === token ? updated : item)));
      setMessage(t('messages.revoked'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t('messages.revokeFailed'));
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async (token: string) => {
    const url = `${window.location.origin}/attempt/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage(t('messages.copied'));
    } catch {
      setMessage(url);
    }
  };

  return (
    <Panel title={t('title')} description={t('description')}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            loading={busy}
            loadingLabel={t('actions.publishing')}
            onClick={() => void onCreate()}
          >
            {t('actions.publish')}
          </Button>
          <Button variant="secondary" onClick={() => void load()}>
            {t('actions.reload')}
          </Button>
        </div>
        {message ? (
          <p className="text-body-sm text-brand-ink-muted" role="status">
            {message}
          </p>
        ) : null}
        {items.length === 0 ? (
          <p className="text-body-sm text-brand-ink-muted">{t('empty')}</p>
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
                    <StatusBadge label={item.revokedAt ? 'Dibatalkan' : 'Final'} />
                  </div>
                  <p className="text-caption text-brand-ink-muted">
                    {item.revokedAt
                      ? t('expiry.revokedAt', {
                          date: new Date(item.revokedAt).toLocaleDateString('id-ID'),
                        })
                      : item.expiresAt
                        ? t('expiry.expiresAt', {
                            date: new Date(item.expiresAt).toLocaleDateString('id-ID'),
                          })
                        : t('expiry.none')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/attempt/${item.token}`}
                    className="inline-flex min-h-[var(--control-sm)] items-center rounded-md border border-brand-line px-3 text-body-sm"
                  >
                    {t('actions.open')}
                  </Link>
                  <Button size="sm" variant="secondary" onClick={() => void onCopy(item.token)}>
                    {t('actions.copy')}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={!!item.revokedAt || busy}
                    onClick={() => void onRevoke(item.token)}
                  >
                    {t('actions.revoke')}
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
