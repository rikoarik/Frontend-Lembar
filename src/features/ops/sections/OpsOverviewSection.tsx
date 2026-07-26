'use client';

import { Button } from '@/app/components/ui';
import { AdminStatCards, AdminDataTable, AdminPill } from '@/src/features/admin/AdminChrome';
import { DashboardTrendsChart } from '../components/DashboardTrendsChart';
import { jobTone, planTone } from '../utils/opsToneUtils';
import type { AdminDashboard, AdminJobRow, AdminSchoolRow } from '@/src/services/admin/adminService';

export function OpsOverviewSection({
  dashboard,
  dashboardJobs,
  dashboardSchools,
  dashboardLoading,
  loadDashboard,
  setToast,
}: {
  dashboard: AdminDashboard | null;
  dashboardJobs: AdminJobRow[];
  dashboardSchools: AdminSchoolRow[];
  dashboardLoading: boolean;
  loadDashboard: () => void;
  setToast: (msg: string) => void;
}) {
  return (
    <>
      {/* Editorial Hero Header */}
      <div className="rounded-2xl border border-[#ddd4c8]/80 bg-gradient-to-r from-[#faf8f5] via-white to-[#faf7f2] p-5 shadow-[0_2px_12px_rgba(23,23,23,0.01)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[20px] font-extrabold tracking-tight text-[#171717]">
                Ikhtisar Operations
              </h2>
              {dashboard ? (
                (dashboard.jobsFailed ?? 0) > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#851925]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#851925]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#851925] animate-pulse" />
                    {dashboard.jobsFailed} Job Gagal
                  </span>
                ) : (dashboard.qualityOpen ?? 0) > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#8a5400]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#8a5400]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8a5400]" />
                    {dashboard.qualityOpen} Quality Open
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#176b45]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#176b45]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#176b45]" />
                    Sistem Optimal
                  </span>
                )
              ) : null}
            </div>
            <p className="mt-1 text-[13px] text-[#6d665d]">
              Ringkasan performa pemrosesan job, kesehatan tenant, dan aktivitas sistem superadmin secara real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              disabled={dashboardLoading}
              onClick={() => {
                loadDashboard();
                setToast('Memperbarui data ikhtisar...');
              }}
              className="gap-1.5"
            >
              <span
                className={`material-symbols-outlined text-[16px] ${
                  dashboardLoading ? 'animate-spin' : ''
                }`}
              >
                refresh
              </span>
              Refresh
            </Button>
            {(dashboard?.jobsFailed ?? 0) > 0 ? (
              <Button
                size="sm"
                onClick={() => {
                  window.location.href = '/ops/jobs?status=failed';
                }}
                className="bg-[#851925] hover:bg-[#6b131e] text-white gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">warning</span>
                Review job gagal ({dashboard?.jobsFailed})
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  window.location.href = '/ops/jobs';
                }}
                className="gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">work_history</span>
                Kelola Jobs
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stat Cards - 5 columns for symmetry */}
      <AdminStatCards
        items={[
          {
            label: 'Job Aktif',
            value: dashboard ? String(dashboard.jobsActive) : '—',
            hint: dashboardLoading ? 'memuat...' : 'running + queued',
            tone: 'info',
            delta: 'live',
          },
          {
            label: 'Job Gagal',
            value: dashboard ? String(dashboard.jobsFailed) : '—',
            hint: dashboardLoading
              ? 'memuat...'
              : (dashboard?.jobsFailed ?? 0) > 0
                ? 'perlu di-retry'
                : 'semua normal',
            tone: (dashboard?.jobsFailed ?? 0) > 0 ? 'bad' : 'ok',
            delta: (dashboard?.jobsFailed ?? 0) > 0 ? 'P0' : '✓',
          },
          {
            label: 'Quality Open',
            value: dashboard ? String(dashboard.qualityOpen) : '—',
            hint: dashboardLoading
              ? 'memuat...'
              : (dashboard?.qualityOpen ?? 0) > 0
                ? 'perlu ditinjau'
                : 'tidak ada isu',
            tone: (dashboard?.qualityOpen ?? 0) > 0 ? 'warn' : 'ok',
            delta: (dashboard?.qualityOpen ?? 0) > 0 ? 'P1' : '✓',
          },
          {
            label: 'Pengguna',
            value: dashboard ? String(dashboard.users) : '—',
            hint: dashboardLoading ? 'memuat...' : `${dashboard?.schools ?? '—'} sekolah terdaftar`,
            tone: 'ok',
          },
          {
            label: 'Flag Aktif',
            value: dashboard ? String(dashboard.flagsEnabled) : '—',
            hint: dashboardLoading ? 'memuat...' : 'feature flags aktif',
            tone: 'ok',
            delta: 'on',
          },
        ]}
      />

      {/* Data Tables Grid */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Jobs Terbaru Card */}
        <div className="flex flex-col space-y-4 rounded-2xl border border-[#ddd4c8]/80 bg-white p-5 shadow-[0_2px_12px_rgba(23,23,23,0.01),0_1px_2px_rgba(23,23,23,0.02)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(23,23,23,0.04)]">
          <div className="flex items-center justify-between gap-2 border-b border-[#eee6da]/60 pb-3.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#6d665d]">
                view_list
              </span>
              <div>
                <h3 className="text-[14px] font-bold text-[#171717]">Jobs Terbaru</h3>
                <p className="text-[11px] text-[#8a8379]">Antrean & status eksekusi job terkini</p>
              </div>
            </div>
            <a
              href="/ops/jobs"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
            >
              Lihat semua
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
          </div>
          <AdminDataTable
            rows={dashboardJobs}
            footerNote={dashboardJobs.length > 0 ? undefined : 'Memuat data job...'}
            flat={true}
            columns={[
              {
                key: 'id',
                header: 'ID Job',
                render: (row) => (
                  <code className="text-[11px] font-mono bg-[#f4eade] px-1.5 py-0.5 rounded text-[#514b44] font-medium">
                    {row.id}
                  </code>
                ),
              },
              {
                key: 'tenant',
                header: 'Tenant',
                render: (row) => (
                  <span className="font-medium text-[#171717] text-[13px]">{row.tenant}</span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <AdminPill tone={jobTone(row.status)}>{row.status}</AdminPill>,
              },
              {
                key: 'progress',
                header: 'Progress',
                render: (row) => {
                  const num = parseInt(row.progress, 10);
                  const hasPct = !isNaN(num) && num >= 0 && num <= 100;
                  return (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums text-[#171717] text-[12px]">
                        {row.progress}
                      </span>
                      {hasPct ? (
                        <div className="w-12 h-1.5 bg-[#f4ede4] rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-[#176b45] rounded-full transition-all duration-300"
                            style={{ width: `${num}%` }}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                },
              },
            ]}
          />
        </div>

        {/* Tenant Perlu Perhatian Card */}
        <div className="flex flex-col space-y-4 rounded-2xl border border-[#ddd4c8]/80 bg-white p-5 shadow-[0_2px_12px_rgba(23,23,23,0.01),0_1px_2px_rgba(23,23,23,0.02)] transition-all duration-200 hover:shadow-[0_8px_24px_rgba(23,23,23,0.04)]">
          <div className="flex items-center justify-between gap-2 border-b border-[#eee6da]/60 pb-3.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#8a5400]">
                warning
              </span>
              <div>
                <h3 className="text-[14px] font-bold text-[#171717]">Tenant Perlu Perhatian</h3>
                <p className="text-[11px] text-[#8a8379]">
                  Sekolah dalam status masa tenggang atau diblokir
                </p>
              </div>
            </div>
            <a
              href="/ops/schools"
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
            >
              Lihat semua
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </a>
          </div>
          <AdminDataTable
            rows={dashboardSchools.filter((s) => s.plan === 'grace' || s.plan === 'blocked')}
            footerNote={dashboardSchools.length > 0 ? undefined : 'Memuat data sekolah...'}
            emptyLabel="Tidak ada tenant berisiko."
            emptyHint="Semua sekolah terdaftar berada dalam status aktif / pilot yang aman."
            flat={true}
            columns={[
              {
                key: 'name',
                header: 'Sekolah',
                render: (row) => (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f4ede4] text-[11px] font-bold text-[#514b44]">
                      {row.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-[#171717] text-[13px]">{row.name}</span>
                  </div>
                ),
              },
              {
                key: 'plan',
                header: 'Status Paket',
                render: (row) => <AdminPill tone={planTone(row.plan)}>{row.plan}</AdminPill>,
              },
              {
                key: 'seats',
                header: 'Seats',
                render: (row) => (
                  <span className="font-semibold tabular-nums text-[#171717] text-[12px]">
                    {String(row.seats)} seats
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* 7-day trend charts */}
      <DashboardTrendsChart />

      {/* Operational Health Footer Note */}
      <div className="flex items-center justify-between rounded-xl border border-[#ddd4c8]/60 bg-[#faf8f5] px-4 py-3 text-[12px] text-[#6d665d]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#176b45]" aria-hidden />
          <span>
            Infrastruktur Superadmin lembar beroperasi normal — API, Database, Worker Queue, dan Storage terpantau stabil.
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#8a8379] hidden md:inline-block">
          v1.0.0-ops
        </span>
      </div>
    </>
  );
}
