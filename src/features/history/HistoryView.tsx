'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Panel, StatusBadge } from '@/app/components/ui';
import type { StatusLabel } from '@/app/components/ui';
import { assessmentService } from '@/src/services/assessments/assessmentService';
import type { AssessmentLifecycle, AssessmentSummary } from '@/src/features/review/types';

const DEFAULT_REFRESH_MS = 10_000;
const KNOWN_LABELS: Record<string, string> = {
  practice: 'Latihan',
};

function titleCase(value: string): string {
  return value.replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());
}

export function humanizeAssessmentLabel(value: string): string {
  return value
    .split(/\s*·\s*/)
    .map((part) => {
      const normalized = part.trim().toLowerCase();
      if (KNOWN_LABELS[normalized]) return KNOWN_LABELS[normalized];
      const grade = normalized.match(/^official-grade-(sd-mi|smp-mts|sma-ma|smk|slb)-(\d+)$/);
      if (grade) return `Kelas ${grade[2]} ${grade[1].toUpperCase().replace('-', '/')}`;
      const legacyGrade = normalized.match(/^official-grade-(\d+)-(sd-mi|smp-mts|sma-ma|smk|slb)$/);
      if (legacyGrade)
        return `Kelas ${legacyGrade[1]} ${legacyGrade[2].toUpperCase().replace('-', '/')}`;
      const subject = normalized.match(
        /^official-subject-(?:sd-mi|smp-mts|sma-ma|smk|slb|paud)-(?:[a-f]|fondasi)-(.*)$/,
      );
      if (subject?.[1]) return titleCase(subject[1].replaceAll('-', ' '));
      if (normalized.startsWith('official-subject-')) return 'Mata pelajaran';
      if (normalized.startsWith('official-grade-')) return 'Kelas';
      return part;
    })
    .join(' · ');
}

function badge(lifecycle: AssessmentLifecycle): StatusLabel {
  switch (lifecycle) {
    case 'final':
      return 'Final';
    case 'generating':
      return 'Sedang dibuat';
    case 'review':
      return 'Siap ditinjau';
    case 'failed':
      return 'Gagal';
    case 'archived':
      return 'Dibatalkan';
    default:
      return 'Draf';
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(
        date,
      );
}

function lifecycleCopy(item: AssessmentSummary): string {
  switch (item.lifecycle) {
    case 'review':
      return item.questionCount > 0
        ? `Siap ditinjau${item.reviewedCount > 0 ? ` · ${item.reviewedCount}/${item.questionCount} ditinjau` : ''}`
        : 'Siap ditinjau';
    case 'final':
      return 'Selesai dan siap digunakan';
    case 'archived':
      return 'Diarsipkan';
    case 'generating':
      return 'Sedang dibuat…';
    case 'failed':
      return 'Gagal dibuat';
    default:
      return item.questionCount > 0 ? `Draf · ${item.questionCount} soal` : 'Draf belum berisi soal';
  }
}

export function HistoryView({ refreshIntervalMs = DEFAULT_REFRESH_MS }: { refreshIntervalMs?: number }) {
  const [items, setItems] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [lifecycle, setLifecycle] = useState<AssessmentLifecycle | 'all'>('all');
  const loaded = useRef(false);

  const load = useCallback(async () => {
    if (!loaded.current) setLoading(true);
    const result = await assessmentService.list({ q, lifecycle });
    loaded.current = true;
    setLoading(false);
    if (!result.ok) {
      setError(result.error.safeMessage);
      return;
    }
    setItems(result.value);
    setError(null);
  }, [q, lifecycle]);

  useEffect(() => {
    loaded.current = false;
    void Promise.resolve().then(load);
  }, [load]);

  useEffect(() => {
    if (!items.some((item) => item.lifecycle === 'generating')) return;
    const id = window.setInterval(() => void load(), refreshIntervalMs);
    return () => window.clearInterval(id);
  }, [items, load, refreshIntervalMs]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Riwayat lembar</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Cari dan buka draf, tinjauan, atau output sesuai statusnya.
        </p>
      </div>

      <Panel title="Filter" description="Pencarian tidak mengubah data sumber.">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-label-semibold">Cari</span>
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Judul, mapel, atau kelas"
              className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3"
            />
          </label>
          <label className="flex w-full flex-col gap-1 md:w-56">
            <span className="text-label-semibold">Status</span>
            <select
              value={lifecycle}
              onChange={(event) => setLifecycle(event.target.value as AssessmentLifecycle | 'all')}
              className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3"
            >
              <option value="all">Semua</option>
              <option value="draft">Draf</option>
              <option value="review">Perlu ditinjau</option>
              <option value="final">Final</option>
              <option value="generating">Diproses</option>
            </select>
          </label>
        </div>
      </Panel>

      {loading ? (
        <div className="h-40 animate-pulse rounded-md bg-brand-line" aria-busy="true" />
      ) : error && items.length === 0 ? (
        <Panel title="Riwayat gagal dimuat" description={error}>
          <Button onClick={() => void load()}>Coba lagi</Button>
        </Panel>
      ) : items.length === 0 ? (
        <Panel title="Belum ada lembar" description="Mulai dari generate untuk membuat draf pertama.">
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
                title={humanizeAssessmentLabel(item.title)}
                description={`${humanizeAssessmentLabel(item.subject)} · ${humanizeAssessmentLabel(item.gradeLabel)} · Diperbarui ${formatDate(item.updatedAt)}`}
                actions={<StatusBadge label={badge(item.lifecycle)} />}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-body-sm text-brand-ink-muted">
                    {item.lifecycle === 'generating' ? (
                      <><span className="font-medium text-brand-ink">Sedang membuat soal</span>{' · Proses tetap aktif meski halaman ini ditinggalkan.'}</>
                    ) : lifecycleCopy(item)}
                    {item.warningCount > 0 ? ` · ${item.warningCount} peringatan` : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.lifecycle === 'review' && item.canReview ? (
                      <Link
                        href={`/app/review/${item.id}`}
                        className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-sm font-medium text-white"
                      >
                        Tinjau soal
                      </Link>
                    ) : null}
                    {item.lifecycle === 'generating' ? (
                      <p className="text-body-sm text-brand-ink-muted animate-pulse">
                        Lembar sedang dibuat. Anda dapat meninggalkan halaman ini.
                      </p>
                    ) : null}
                    {item.lifecycle === 'final' && item.canOpenOutput ? (
                      <Link
                        href={`/app/output/${item.id}`}
                        className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-sm font-medium text-white"
                      >
                        Buka hasil
                      </Link>
                    ) : null}
                    {item.lifecycle === 'draft' ? (
                      <Link
                        href={`/app/review/${item.id}`}
                        className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-sm"
                      >
                        Lanjutkan draf
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
