'use client';

import Link from 'next/link';
import { Panel } from '@/app/components/ui';

const METRICS = [
  { label: 'Lembar dibuat (30h)', value: '18' },
  { label: 'Final', value: '7' },
  { label: 'Perlu ditinjau', value: '4' },
  { label: 'Rata-rata review', value: '12 mnt' },
];

const SERIES = [
  { day: 'Sen', count: 2 },
  { day: 'Sel', count: 3 },
  { day: 'Rab', count: 1 },
  { day: 'Kam', count: 4 },
  { day: 'Jum', count: 2 },
  { day: 'Sab', count: 0 },
  { day: 'Min', count: 1 },
];

export function CreatorAnalyticsView() {
  const max = Math.max(...SERIES.map((s) => s.count), 1);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Analitik pembuat</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Ringkasan mock penggunaan pribadi. Bukan data produksi.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <Panel key={metric.label} title={metric.label}>
            <p className="text-h2 font-semibold text-brand-ink">{metric.value}</p>
          </Panel>
        ))}
      </div>
      <Panel title="Aktivitas 7 hari" description="Jumlah lembar yang disentuh per hari.">
        <div className="flex h-40 items-end gap-2">
          {SERIES.map((item) => (
            <div key={item.day} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-brand-accent"
                style={{ height: `${Math.max(8, (item.count / max) * 100)}%` }}
                title={`${item.count}`}
              />
              <span className="text-caption text-brand-ink-muted">{item.day}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Link href="/app/riwayat" className="text-body-sm text-brand-accent underline">
        Buka riwayat detail
      </Link>
    </div>
  );
}
