'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button, Panel, StatusBadge } from '@/app/components/ui';
import type { StatusLabel } from '@/app/components/ui';
import { assessmentService } from '@/src/services/assessments/assessmentService';
import type { AssessmentLifecycle, AssessmentSummary } from '@/src/features/review/types';
import { lifecycleLabel } from '@/src/features/review/types';

function badge(lifecycle: AssessmentLifecycle): StatusLabel {
  switch (lifecycle) {
    case 'final':
      return 'Final';
    case 'generating':
      return 'Diproses';
    case 'review':
      return 'Perlu ditinjau';
    case 'archived':
      return 'Kedaluwarsa';
    default:
      return 'Draft';
  }
}

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function HistoryView() {
  const [items, setItems] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [lifecycle, setLifecycle] = useState<AssessmentLifecycle | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    const result = await assessmentService.list({ q, lifecycle });
    if (!result.ok) {
      setError(result.error.safeMessage);
      setItems([]);
      setLoading(false);
      return;
    }
    setItems(result.value);
    setError(null);
    setLoading(false);
  }, [q, lifecycle]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Riwayat lembar</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Cari dan buka draft, tinjauan, atau output sesuai statusnya.
        </p>
      </div>

      <Panel title="Filter" description="Pencarian tidak mengubah data sumber.">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-label-semibold">Cari</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Judul, mapel, atau kelas"
              className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3"
            />
          </label>
          <label className="flex w-full flex-col gap-1 md:w-56">
            <span className="text-label-semibold">Status</span>
            <select
              value={lifecycle}
              onChange={(e) => setLifecycle(e.target.value as AssessmentLifecycle | 'all')}
              className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3"
            >
              <option value="all">Semua</option>
              <option value="draft">Draft</option>
              <option value="review">Perlu ditinjau</option>
              <option value="final">Final</option>
              <option value="generating">Diproses</option>
            </select>
          </label>
          <div className="flex items-end">
            <Button variant="secondary" onClick={() => void load()}>
              Terapkan
            </Button>
          </div>
        </div>
      </Panel>

      {loading ? (
        <div className="h-40 animate-pulse rounded-md bg-brand-line" aria-busy="true" />
      ) : error ? (
        <Panel title="Riwayat gagal dimuat" description={error}>
          <Button onClick={() => void load()}>Coba lagi</Button>
        </Panel>
      ) : items.length === 0 ? (
        <Panel title="Belum ada lembar" description="Mulai dari generate untuk membuat draft pertama.">
          <Link
            href="/app/generate"
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-white"
          >
            Generate lembar
          </Link>
        </Panel>
      ) : (
        <ul className="flex flex-col gap-3" role="list">
          {items.map((item) => (
            <li key={item.id}>
              <Panel
                title={item.title}
                description={`${item.subject} · ${item.gradeLabel} · Diperbarui ${formatDate(item.updatedAt)}`}
                actions={<StatusBadge label={badge(item.lifecycle)} />}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-body-sm text-brand-ink-muted">
                    {lifecycleLabel(item.lifecycle)} · {item.reviewedCount}/{item.questionCount} ditinjau
                    {item.warningCount > 0 ? ` · ${item.warningCount} peringatan` : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.canReview ? (
                      <Link
                        href={`/app/review/${item.id}`}
                        className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-sm font-medium text-white"
                      >
                        Buka tinjauan
                      </Link>
                    ) : null}
                    {item.canOpenOutput ? (
                      <Link
                        href={`/app/output/${item.id}`}
                        className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-sm"
                      >
                        Buka output
                      </Link>
                    ) : null}
                    {!item.canReview && !item.canOpenOutput ? (
                      <Link
                        href={`/app/review/${item.id}`}
                        className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-sm"
                      >
                        Buka
                      </Link>
                    ) : null}
                  </div>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
