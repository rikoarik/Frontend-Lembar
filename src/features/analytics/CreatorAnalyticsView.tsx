'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Panel } from '@/app/components/ui';
import { assessmentService } from '@/src/services/assessments/assessmentService';
import type { AssessmentSummary } from '@/src/features/review/types';

type RangeOption = '7d' | '30d' | 'semester';

function cutoff(range: RangeOption): number {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 183;
  return Date.now() - days * 86_400_000;
}

export function CreatorAnalyticsView() {
  const [range, setRange] = useState<RangeOption>('7d');
  const [items, setItems] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void assessmentService.list()
      .then((result) => {
        if (result.ok) setItems(result.value);
        else setError(result.error.safeMessage);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => items.filter((item) => new Date(item.createdAt).getTime() >= cutoff(range)),
    [items, range],
  );
  const final = filtered.filter((item) => item.lifecycle === 'final').length;
  const review = filtered.filter((item) => item.lifecycle === 'review').length;
  const questionCount = filtered.reduce((total, item) => total + item.questionCount, 0);
  const subjects = Object.entries(
    filtered.reduce<Record<string, number>>((counts, item) => {
      counts[item.subject] = (counts[item.subject] ?? 0) + 1;
      return counts;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-h1 font-semibold text-brand-ink">Analitik pembuat</h1>
          <p className="text-body-sm text-brand-ink-muted">Ringkasan dari assessment workspace aktif.</p>
        </div>
        <div className="flex rounded-xl border border-brand-line p-1">
          {([['7d', '7 Hari'], ['30d', '30 Hari'], ['semester', 'Semester']] as const).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setRange(key)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${range === key ? 'bg-brand-paper shadow-sm' : 'text-brand-ink-muted'}`}>{label}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="h-40 animate-pulse rounded-xl bg-brand-line" aria-busy="true" /> : null}
      {error ? <Panel title="Analitik gagal dimuat" description={error} /> : null}
      {!loading && !error ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Lembar dibuat', filtered.length],
              ['Lembar final', final],
              ['Perlu review', review],
              ['Soal tersimpan', questionCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-brand-line bg-white p-4">
                <p className="text-body-sm text-brand-ink-muted">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-brand-ink">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Mata pelajaran" description="Distribusi assessment pada periode terpilih.">
              {subjects.length ? (
                <ul className="space-y-2">{subjects.map(([subject, count]) => <li key={subject} className="flex justify-between text-body-sm"><span>{subject}</span><strong>{count}</strong></li>)}</ul>
              ) : <p className="text-body-sm text-brand-ink-muted">Belum ada aktivitas pada periode ini.</p>}
            </Panel>
            <Panel title="Aktivitas terbaru" description={`${filtered.length} assessment pada periode terpilih.`}>
              {filtered.length ? (
                <ul className="space-y-3">{filtered.slice(0, 5).map((item) => <li key={item.id}><Link href={item.canOpenOutput ? `/app/output/${item.id}` : `/app/review/${item.id}`} className="text-body-sm font-medium text-brand-ink hover:underline">{item.title}</Link><p className="text-body-xs text-brand-ink-muted">{item.lifecycle} · {item.questionCount} soal</p></li>)}</ul>
              ) : <Link href="/app/generate" className="text-body-sm font-medium text-brand-accent hover:underline">Buat lembar pertama</Link>}
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}
