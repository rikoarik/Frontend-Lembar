'use client';

import { useEffect, useState } from 'react';
import { AdminContentLoading } from '@/src/features/admin/AdminChrome';
import { adminService } from '@/src/services/admin/adminService';

function formatDayLabel(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.slice(5);
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    return `${days[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
  } catch {
    return dateStr.slice(5);
  }
}

const BAR_H = 56;

function MiniBar({
  data,
  max,
  color,
  hoverColor,
  hoveredIdx,
  setHoveredIdx,
}: {
  data: { day: string; count: number }[];
  max: number;
  color: string;
  hoverColor: string;
  hoveredIdx: number | null;
  setHoveredIdx: (idx: number | null) => void;
}) {
  if (data.length === 0) {
    return (
      <div className="flex py-6 px-4 items-center justify-center rounded-xl bg-[#faf8f5] text-[12px] text-[#57534e]">
        Belum ada data tren 7 hari terakhir
      </div>
    );
  }

  return (
    <div className="relative pt-6 pb-2">
      <div className="flex items-end gap-1.5 min-h-[100px] px-1 py-2">
        {data.map((d, idx) => {
          const h = Math.max(4, Math.round((d.count / max) * BAR_H));
          const isHovered = hoveredIdx === idx;
          const isMax = d.count === max && d.count > 0;
          return (
            <div
              key={d.day}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="group relative flex flex-col items-center flex-1 cursor-pointer"
            >
              <div
                className={`absolute -top-6 text-[10px] font-bold tabular-nums transition-all duration-150 ${
                  isHovered || isMax
                    ? 'opacity-100 text-[#171717] scale-100'
                    : 'opacity-0 text-[#57534e] scale-95 group-hover:opacity-100'
                }`}
              >
                {d.count}
              </div>

              <div className="relative w-full rounded-md bg-[#f4ede4]/60 h-[56px] flex items-end overflow-hidden">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isHovered ? hoverColor : color
                  }`}
                  style={{ height: `${h}px` }}
                />
              </div>

              <span
                className={`mt-2 text-[10px] font-medium tabular-nums transition-colors ${
                  isHovered ? 'text-[#171717] font-semibold' : 'text-[#57534e]'
                }`}
              >
                {formatDayLabel(d.day)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardTrendsChart() {
  const [trends, setTrends] = useState<{
    jobs: { day: string; count: number }[];
    quality: { day: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredJobsIdx, setHoveredJobsIdx] = useState<number | null>(null);
  const [hoveredQualityIdx, setHoveredQualityIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminService
      .dashboardTrends()
      .then((res) => {
        if (cancelled) return;
        if (res.ok) setTrends(res.value as any);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading)
    return (
      <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-5">
        <AdminContentLoading />
      </div>
    );

  if (!trends || (trends.jobs.length === 0 && trends.quality.length === 0)) return null;

  const maxJobs = Math.max(...trends.jobs.map((d) => d.count), 1);
  const maxQuality = Math.max(...trends.quality.map((d) => d.count), 1);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-[#ddd4c8]/80 bg-white p-5 shadow-[0_2px_12px_rgba(23,23,23,0.01),0_1px_2px_rgba(23,23,23,0.02)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(23,23,23,0.04)]">
        <div className="flex items-center justify-between border-b border-[#eee6da]/60 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#176b45]" aria-hidden />
              <h3 className="text-[14px] font-bold text-[#171717]">Tren Aktivitas Jobs (7 Hari)</h3>
            </div>
            <p className="mt-0.5 text-[12px] text-[#57534e]">
              Total beban job pemrosesan yang dieksekusi
            </p>
          </div>
          <div className="text-right">
            <span className="text-[18px] font-extrabold tabular-nums text-[#171717]">
              {trends.jobs.reduce((s, d) => s + d.count, 0)}
            </span>
            <span className="block text-[10px] uppercase font-semibold text-[#57534e]">
              total job
            </span>
          </div>
        </div>
        <MiniBar
          data={trends.jobs}
          max={maxJobs}
          color="bg-[#176b45]"
          hoverColor="bg-[#135939]"
          hoveredIdx={hoveredJobsIdx}
          setHoveredIdx={setHoveredJobsIdx}
        />
      </div>

      <div className="rounded-2xl border border-[#ddd4c8]/80 bg-white p-5 shadow-[0_2px_12px_rgba(23,23,23,0.01),0_1px_2px_rgba(23,23,23,0.02)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(23,23,23,0.04)]">
        <div className="flex items-center justify-between border-b border-[#eee6da]/60 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#c9703a]" aria-hidden />
              <h3 className="text-[14px] font-bold text-[#171717]">Laporan Quality (7 Hari)</h3>
            </div>
            <p className="mt-0.5 text-[12px] text-[#57534e]">
              Laporan masalah / kendala dari pengguna
            </p>
          </div>
          <div className="text-right">
            <span className="text-[18px] font-extrabold tabular-nums text-[#171717]">
              {trends.quality.reduce((s, d) => s + d.count, 0)}
            </span>
            <span className="block text-[10px] uppercase font-semibold text-[#57534e]">
              total laporan
            </span>
          </div>
        </div>
        <MiniBar
          data={trends.quality}
          max={maxQuality}
          color="bg-[#c9703a]"
          hoverColor="bg-[#a85929]"
          hoveredIdx={hoveredQualityIdx}
          setHoveredIdx={setHoveredQualityIdx}
        />
      </div>
    </div>
  );
}
