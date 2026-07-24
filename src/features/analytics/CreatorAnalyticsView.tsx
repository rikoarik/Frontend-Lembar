'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Panel, Button } from '@/app/components/ui';

type RangeOption = '7d' | '30d' | 'semester';

interface MetricItem {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
  description: string;
}

const RANGE_METRICS: Record<RangeOption, MetricItem[]> = {
  '7d': [
    {
      label: 'Total Lembar Dibuat',
      value: '18',
      change: '+22%',
      trend: 'up',
      icon: 'auto_awesome',
      description: '7 hari terakhir',
    },
    {
      label: 'Lembar Final',
      value: '14',
      change: '77.7%',
      trend: 'up',
      icon: 'check_circle',
      description: 'siap untuk dicetak/bagikan',
    },
    {
      label: 'Rata-rata Review',
      value: '9.4 mnt',
      change: '-1.8 mnt',
      trend: 'down',
      icon: 'timer',
      description: 'efisiensi peninjauan guru',
    },
    {
      label: 'Akurasi Draft AI',
      value: '95.1%',
      change: '+1.4%',
      trend: 'up',
      icon: 'verified',
      description: 'revisi minimal oleh guru',
    },
  ],
  '30d': [
    {
      label: 'Total Lembar Dibuat',
      value: '64',
      change: '+15%',
      trend: 'up',
      icon: 'auto_awesome',
      description: '30 hari terakhir',
    },
    {
      label: 'Lembar Final',
      value: '52',
      change: '81.2%',
      trend: 'up',
      icon: 'check_circle',
      description: 'siap untuk dicetak/bagikan',
    },
    {
      label: 'Rata-rata Review',
      value: '8.5 mnt',
      change: '-2.4 mnt',
      trend: 'down',
      icon: 'timer',
      description: 'efisiensi peninjauan guru',
    },
    {
      label: 'Akurasi Draft AI',
      value: '94.6%',
      change: '+2.1%',
      trend: 'up',
      icon: 'verified',
      description: 'revisi minimal oleh guru',
    },
  ],
  semester: [
    {
      label: 'Total Lembar Dibuat',
      value: '240',
      change: '+38%',
      trend: 'up',
      icon: 'auto_awesome',
      description: 'semester berjalan',
    },
    {
      label: 'Lembar Final',
      value: '210',
      change: '87.5%',
      trend: 'up',
      icon: 'check_circle',
      description: 'siap untuk dicetak/bagikan',
    },
    {
      label: 'Rata-rata Review',
      value: '7.8 mnt',
      change: '-3.2 mnt',
      trend: 'down',
      icon: 'timer',
      description: 'efisiensi peninjauan guru',
    },
    {
      label: 'Akurasi Draft AI',
      value: '96.2%',
      change: '+4.0%',
      trend: 'up',
      icon: 'verified',
      description: 'revisi minimal oleh guru',
    },
  ],
};

const CHART_DATA: Record<RangeOption, { day: string; count: number; final: number }[]> = {
  '7d': [
    { day: 'Sen', count: 4, final: 3 },
    { day: 'Sel', count: 6, final: 5 },
    { day: 'Rab', count: 3, final: 2 },
    { day: 'Kam', count: 7, final: 6 },
    { day: 'Jum', count: 5, final: 4 },
    { day: 'Sab', count: 1, final: 1 },
    { day: 'Min', count: 2, final: 1 },
  ],
  '30d': [
    { day: 'Minggu 1', count: 14, final: 11 },
    { day: 'Minggu 2', count: 18, final: 15 },
    { day: 'Minggu 3', count: 16, final: 13 },
    { day: 'Minggu 4', count: 20, final: 17 },
  ],
  semester: [
    { day: 'Bulan 1', count: 45, final: 38 },
    { day: 'Bulan 2', count: 58, final: 50 },
    { day: 'Bulan 3', count: 62, final: 55 },
    { day: 'Bulan 4', count: 75, final: 67 },
  ],
};

const RANGE_SUBJECTS: Record<RangeOption, { name: string; count: number; percentage: number; color: string }[]> = {
  '7d': [
    { name: 'Matematika', count: 7, percentage: 39, color: 'bg-[#a3202b]' },
    { name: 'Bahasa Indonesia', count: 5, percentage: 28, color: 'bg-amber-600' },
    { name: 'IPA Terpadu', count: 4, percentage: 22, color: 'bg-emerald-600' },
    { name: 'Bahasa Inggris', count: 2, percentage: 11, color: 'bg-indigo-600' },
  ],
  '30d': [
    { name: 'Matematika', count: 24, percentage: 38, color: 'bg-[#a3202b]' },
    { name: 'Bahasa Indonesia', count: 18, percentage: 28, color: 'bg-amber-600' },
    { name: 'IPA Terpadu', count: 14, percentage: 22, color: 'bg-emerald-600' },
    { name: 'Bahasa Inggris', count: 8, percentage: 12, color: 'bg-indigo-600' },
  ],
  semester: [
    { name: 'Matematika', count: 92, percentage: 38, color: 'bg-[#a3202b]' },
    { name: 'Bahasa Indonesia', count: 68, percentage: 28, color: 'bg-amber-600' },
    { name: 'IPA Terpadu', count: 50, percentage: 21, color: 'bg-emerald-600' },
    { name: 'Bahasa Inggris', count: 30, percentage: 13, color: 'bg-indigo-600' },
  ],
};

const RANGE_QUESTION_TYPES: Record<RangeOption, { type: string; count: number; percentage: number }[]> = {
  '7d': [
    { type: 'Pilihan Ganda', count: 130, percentage: 65 },
    { type: 'Isian Singkat', count: 44, percentage: 22 },
    { type: 'Uraian / Essay', count: 26, percentage: 13 },
  ],
  '30d': [
    { type: 'Pilihan Ganda', count: 420, percentage: 65 },
    { type: 'Isian Singkat', count: 140, percentage: 22 },
    { type: 'Uraian / Essay', count: 84, percentage: 13 },
  ],
  semester: [
    { type: 'Pilihan Ganda', count: 1560, percentage: 65 },
    { type: 'Isian Singkat', count: 520, percentage: 22 },
    { type: 'Uraian / Essay', count: 320, percentage: 13 },
  ],
};

const RANGE_ACTIVITIES: Record<RangeOption, { id: string; title: string; date: string; status: string; questions: number }[]> = {
  '7d': [
    { id: '1', title: 'Ulangan Harian Matematika Bab 3 - Fraction & Desimal', date: 'Hari ini, 14:20', status: 'Final', questions: 20 },
    { id: '2', title: 'Asesmen Sumatif Bahasa Indonesia - Teks Laporan', date: 'Kemarin, 09:15', status: 'Dalam Review', questions: 15 },
    { id: '3', title: 'Latihan IPA Kelas 8 - Sistem Pencernaan', date: '22 Juli 2026', status: 'Final', questions: 25 },
  ],
  '30d': [
    { id: '1', title: 'Ulangan Harian Matematika Bab 3 - Fraction & Desimal', date: 'Hari ini, 14:20', status: 'Final', questions: 20 },
    { id: '2', title: 'Asesmen Sumatif Bahasa Indonesia - Teks Laporan', date: 'Kemarin, 09:15', status: 'Dalam Review', questions: 15 },
    { id: '3', title: 'Latihan IPA Kelas 8 - Sistem Pencernaan', date: '22 Juli 2026', status: 'Final', questions: 25 },
    { id: '4', title: 'Kuis Bahasa Inggris - Descriptive Text & Grammar', date: '18 Juli 2026', status: 'Final', questions: 15 },
    { id: '5', title: 'PTS Matematika Semester 1 - Aljabar & Geometri', date: '10 Juli 2026', status: 'Final', questions: 30 },
  ],
  semester: [
    { id: '1', title: 'Ulangan Harian Matematika Bab 3 - Fraction & Desimal', date: 'Hari ini, 14:20', status: 'Final', questions: 20 },
    { id: '2', title: 'Asesmen Sumatif Bahasa Indonesia - Teks Laporan', date: 'Kemarin, 09:15', status: 'Dalam Review', questions: 15 },
    { id: '3', title: 'Latihan IPA Kelas 8 - Sistem Pencernaan', date: '22 Juli 2026', status: 'Final', questions: 25 },
    { id: '4', title: 'Kuis Bahasa Inggris - Descriptive Text & Grammar', date: '18 Juli 2026', status: 'Final', questions: 15 },
    { id: '5', title: 'PTS Matematika Semester 1 - Aljabar & Geometri', date: '10 Juli 2026', status: 'Final', questions: 30 },
    { id: '6', title: 'Ujian Akhir Semester IPA Kelas 8', date: '02 Juni 2026', status: 'Final', questions: 40 },
  ],
};

export function CreatorAnalyticsView() {
  const [range, setRange] = useState<RangeOption>('7d');

  const metrics = RANGE_METRICS[range];
  const chartSeries = CHART_DATA[range];
  const subjectDistribution = RANGE_SUBJECTS[range];
  const questionTypes = RANGE_QUESTION_TYPES[range];
  const recentActivities = RANGE_ACTIVITIES[range];

  const maxCount = Math.max(...chartSeries.map((s) => s.count), 1);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-h1 font-semibold text-brand-ink">Analitik pembuat</h1>
          <p className="text-body-sm text-[#6d665d]">
            Pantau aktivitas pembuatan soal, kecepatan review, dan efisiensi AI Anda.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 rounded-xl border border-[#e6dfd4] bg-[#fbf8f2] p-1 self-start sm:self-auto">
          {(
            [
              { key: '7d', label: '7 Hari' },
              { key: '30d', label: '30 Hari' },
              { key: 'semester', label: 'Semester Ini' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setRange(item.key)}
              className={[
                'rounded-lg px-3.5 py-1.5 text-[12px] font-semibold transition-all cursor-pointer',
                range === item.key
                  ? 'bg-white text-[#171717] shadow-xs border border-[#e6dfd4]'
                  : 'text-[#6d665d] hover:text-[#171717] hover:bg-white/50',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex flex-col gap-3 rounded-xl border border-[#e6dfd4] bg-white p-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f7f3ec] text-[#a3202b]">
                <span className="material-symbols-outlined text-[20px]">{metric.icon}</span>
              </span>
              <span
                className={[
                  'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  metric.trend === 'up'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : metric.trend === 'down'
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                      : 'bg-gray-100 text-gray-700',
                ].join(' ')}
              >
                {metric.change}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] font-medium text-[#8a8379]">{metric.label}</span>
              <span className="text-[24px] font-bold tracking-tight text-[#171717]">
                {metric.value}
              </span>
              <span className="text-[11px] text-[#6d665d]">{metric.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Activity Chart Section (Full Width to eliminate gap!) */}
      <Panel
        title="Aktivitas Pembuatan Lembar"
        description="Jumlah lembar kerja yang dibuat & difinalisasi per periode."
      >
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex items-center gap-5 text-[12px] text-[#6d665d]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-xs bg-[#a3202b]" />
              <span className="font-medium text-[#171717]">Total Pembuatan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-xs bg-emerald-600" />
              <span className="font-medium text-[#171717]">Status Final</span>
            </div>
          </div>

          <div className="flex h-60 items-end gap-4 pt-6 border-b border-[#e6dfd4] pb-3">
            {chartSeries.map((item) => (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
                <div className="flex w-full items-end justify-center gap-2 h-full">
                  {/* Total Bar */}
                  <div
                    className="w-full max-w-[36px] rounded-t-md bg-[#a3202b] transition-all hover:brightness-110 relative group cursor-pointer"
                    style={{ height: `${Math.max(12, (item.count / maxCount) * 100)}%` }}
                  >
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block rounded-md bg-[#171717] px-2 py-1 text-[11px] font-medium text-white shadow-md z-20 whitespace-nowrap">
                      {item.count} lembar ({item.day})
                    </span>
                  </div>
                  {/* Final Bar */}
                  <div
                    className="w-full max-w-[36px] rounded-t-md bg-emerald-600 transition-all hover:brightness-110 relative group cursor-pointer"
                    style={{ height: `${Math.max(10, (item.final / maxCount) * 100)}%` }}
                  >
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block rounded-md bg-[#171717] px-2 py-1 text-[11px] font-medium text-white shadow-md z-20 whitespace-nowrap">
                      {item.final} final ({item.day})
                    </span>
                  </div>
                </div>
                <span className="text-[12px] font-semibold text-[#514b44]">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Distribution & Breakdown Grid (2 Equal Columns) */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Subject Distribution */}
        <Panel
          title="Distribusi Mata Pelajaran"
          description="Persentase materi yang paling sering dibuat pada periode ini."
        >
          <div className="flex flex-col gap-4 pt-1">
            {subjectDistribution.map((subject) => (
              <div key={subject.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="font-medium text-[#171717]">{subject.name}</span>
                  <span className="text-[#6d665d] font-semibold">{subject.count} lembar ({subject.percentage}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#f0ebe3] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${subject.color}`}
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Question Types Overview */}
        <Panel title="Komposisi Tipe Soal" description="Tipe soal yang paling umum digunakan dalam lembar kerja.">
          <div className="flex flex-col gap-3 pt-1">
            {questionTypes.map((qt) => (
              <div key={qt.type} className="flex items-center justify-between rounded-lg bg-[#fbf8f2] border border-[#e6dfd4] px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-[#171717]">{qt.type}</span>
                  <span className="text-[11px] text-[#6d665d]">{qt.count} soal dihasilkan</span>
                </div>
                <span className="text-[14px] font-bold text-[#a3202b] bg-white border border-[#e6dfd4] px-2.5 py-1 rounded-md">
                  {qt.percentage}%
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Recent Activity List & Quick Actions */}
      <Panel title="Aktivitas Lembar Terbaru" description="Daftar pembuatan lembar kerja terakhir Anda.">
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col divide-y divide-[#e6dfd4]">
            {recentActivities.map((act) => (
              <Link
                key={act.id}
                href="/app/riwayat"
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 gap-3 group hover:bg-[#fbf8f2] px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span aria-hidden="true" className="material-symbols-outlined text-[22px] text-[#8a8379] group-hover:text-[#a3202b] transition-colors shrink-0">
                    description
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-[13px] font-semibold text-[#171717] group-hover:text-[#a3202b] transition-colors">
                      {act.title}
                    </span>
                    <span className="text-[11px] text-[#6d665d]">
                      {act.date} · {act.questions} soal
                    </span>
                  </div>
                </div>
                <span
                  className={[
                    'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                    act.status === 'Final'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
                  ].join(' ')}
                >
                  {act.status}
                </span>
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#e6dfd4] mt-2">
            <Link
              href="/app/riwayat"
              className="text-body-sm font-semibold text-[#a3202b] hover:underline inline-flex items-center gap-1"
            >
              <span>Lihat Semua Riwayat Lembar</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>

            <Link href="/app/generate">
              <Button variant="primary" size="sm">
                + Buat Lembar Baru
              </Button>
            </Link>
          </div>
        </div>
      </Panel>
    </div>
  );
}
