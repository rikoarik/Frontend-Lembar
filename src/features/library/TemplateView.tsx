'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button, Panel } from '@/app/components/ui';
import type { CompositionValues } from '@/src/features/generate/types';

type Template = { id: string; name: string; config: CompositionValues; updatedAt: string };

export function TemplateView() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const response = await fetch('/v1/templates', { credentials: 'include' });
    const payload = await response.json().catch(() => null);
    if (!response.ok) setError(payload?.error?.message ?? 'Gagal memuat template.');
    else setTemplates(payload?.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const confirmRemove = (id: string) => setConfirmDeleteId(id);
  const cancelRemove = () => setConfirmDeleteId(null);

  const executeRemove = async (template: Template) => {
    setDeleting(true);
    const response = await fetch(`/v1/templates/${template.id}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setError(payload?.error?.message ?? 'Gagal menghapus template.');
    } else {
      setTemplates((current) => current.filter((item) => item.id !== template.id));
    }
    setConfirmDeleteId(null);
    setDeleting(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-h1 font-semibold text-brand-ink">Template konfigurasi</h1>
          <p className="text-body-sm text-brand-ink-muted">Simpan konfigurasi generate yang sering dipakai.</p>
        </div>
        <Link href="/app/generate?saveTemplate=1" className="inline-flex min-h-[var(--control-md)] items-center justify-center rounded-md bg-brand-accent px-4 text-white">
          Buat template baru
        </Link>
      </div>
      {error ? <p role="alert" className="text-body-sm text-brand-danger">{error}</p> : null}
      <Panel title="Template tersimpan" description={`${templates.length} template di workspace aktif`}>
        {loading ? (
          <p className="text-body-sm text-brand-ink-muted">Memuat…</p>
        ) : templates.length === 0 ? (
          <p className="text-body-sm text-brand-ink-muted">Belum ada template. Isi konfigurasi generate lalu simpan sebagai template.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {templates.map((template) => (
              <li key={template.id} className="rounded-md border border-brand-line p-4">
                <h2 className="font-semibold text-brand-ink">{template.name}</h2>
                <p className="mt-1 text-body-sm text-brand-ink-muted">
                  {template.config.questionCount} soal · {template.config.difficulty} · {template.config.assessmentType}
                </p>

                {confirmDeleteId === template.id ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                    <span className="flex-1 text-body-sm text-red-700">Hapus &ldquo;{template.name}&rdquo;?</span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={deleting}
                      onClick={() => void executeRemove(template)}
                    >
                      {deleting ? 'Menghapus…' : 'Ya, hapus'}
                    </Button>
                    <Button type="button" variant="quiet" size="sm" disabled={deleting} onClick={cancelRemove}>
                      Batal
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/app/generate?templateId=${template.id}`}
                      className="inline-flex min-h-9 items-center rounded-md bg-brand-accent px-3 text-body-sm text-white"
                    >
                      Pakai template
                    </Link>
                    <Button type="button" variant="secondary" size="sm" onClick={() => confirmRemove(template.id)}>
                      Hapus
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
