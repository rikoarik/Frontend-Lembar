'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/app/components/ui';
import {
  AdminAvatar,
  AdminBulkBar,
  AdminDataTable,
  AdminFilterChip,
  AdminPageHeader,
  AdminPill,
  AdminStatCards,
  AdminToolbar,
} from '@/src/features/admin/AdminChrome';
import { useAdminSectionState } from '@/src/features/admin/adminPanelState';
import { adminService, type AdminDashboard, type AdminJobRow } from '@/src/services/admin/adminService';

type AccountRow = {
  id: string;
  displayName: string;
  email: string;
  role: 'teacher' | 'school_admin' | 'superadmin';
  status: 'aktif' | 'ditangguhkan' | 'baru';
  school: string;
};

type SchoolRow = {
  id: string;
  name: string;
  plan: 'pilot' | 'active' | 'grace' | 'blocked';
  teachers: number;
  usage: string;
  owner: string;
};

type JobRow = {
  id: string;
  type: string;
  tenant: string;
  status: 'queued' | 'running' | 'failed' | 'succeeded';
  progress: string;
  updatedAt: string;
};

type QualityRow = {
  id: string;
  reason: string;
  status: 'open' | 'triaged' | 'closed';
  reporter: string;
  createdAt: string;
};

type BillingRow = {
  id: string;
  school: string;
  state: 'active' | 'grace' | 'blocked' | 'expired';
  seats: string;
  renewsAt: string;
};

type FlagRow = {
  id: string;
  key: string;
  description: string;
  enabled: boolean;
  scope: 'global' | 'pilot';
};

type ContentRow = {
  id: string;
  slug: string;
  title: string;
  status: 'published' | 'draft';
  updatedAt: string;
};

const ACCOUNTS: AccountRow[] = [
  {
    id: 'acct_demo',
    displayName: 'Demo Guru',
    email: 'demo@lembar.id',
    role: 'teacher',
    status: 'aktif',
    school: '—',
  },
  {
    id: 'acct_admin',
    displayName: 'Admin Sekolah',
    email: 'admin@sdncontoh.sch.id',
    role: 'school_admin',
    status: 'aktif',
    school: 'SDN Contoh 01',
  },
  {
    id: 'acct_ops',
    displayName: 'Ops Superadmin',
    email: 'ops@lembar.id',
    role: 'superadmin',
    status: 'aktif',
    school: 'Platform',
  },
  {
    id: 'acct_04',
    displayName: 'Guru Baru',
    email: 'baru@sekolah.sch.id',
    role: 'teacher',
    status: 'baru',
    school: 'SMP Harapan',
  },
  {
    id: 'acct_05',
    displayName: 'Admin Grace',
    email: 'grace@sekolah.sch.id',
    role: 'school_admin',
    status: 'ditangguhkan',
    school: 'SMA Nusantara',
  },
];

const SCHOOLS: SchoolRow[] = [
  {
    id: 'sch_01',
    name: 'SDN Contoh 01',
    plan: 'pilot',
    teachers: 24,
    usage: '312/500',
    owner: 'admin@sdncontoh.sch.id',
  },
  {
    id: 'sch_02',
    name: 'SMP Harapan',
    plan: 'grace',
    teachers: 41,
    usage: '480/500',
    owner: 'admin@smpharapan.sch.id',
  },
  {
    id: 'sch_03',
    name: 'SMA Nusantara',
    plan: 'blocked',
    teachers: 60,
    usage: '500/500',
    owner: 'admin@smanusantara.sch.id',
  },
  {
    id: 'sch_04',
    name: 'SD Mawar',
    plan: 'active',
    teachers: 18,
    usage: '120/400',
    owner: 'admin@sdmawar.sch.id',
  },
];

const JOBS: JobRow[] = [
  {
    id: 'job_8f2a',
    type: 'generate',
    tenant: 'SDN Contoh 01',
    status: 'running',
    progress: '58%',
    updatedAt: '1 mnt lalu',
  },
  {
    id: 'job_11bc',
    type: 'generate',
    tenant: 'SMP Harapan',
    status: 'queued',
    progress: '0%',
    updatedAt: '3 mnt lalu',
  },
  {
    id: 'job_99aa',
    type: 'export',
    tenant: 'SMA Nusantara',
    status: 'failed',
    progress: '—',
    updatedAt: '12 mnt lalu',
  },
  {
    id: 'job_22cd',
    type: 'generate',
    tenant: 'SD Mawar',
    status: 'succeeded',
    progress: '100%',
    updatedAt: '25 mnt lalu',
  },
];

const QUALITY: QualityRow[] = [
  {
    id: 'rep_a1',
    reason: 'kualitas_soal',
    status: 'open',
    reporter: 'guru.siti',
    createdAt: '2026-07-23',
  },
  {
    id: 'rep_b2',
    reason: 'kunci_salah',
    status: 'triaged',
    reporter: 'guru.rina',
    createdAt: '2026-07-22',
  },
  {
    id: 'rep_c3',
    reason: 'privasi',
    status: 'closed',
    reporter: 'guru.budi',
    createdAt: '2026-07-20',
  },
];

const BILLING: BillingRow[] = [
  { id: 'bill_1', school: 'SDN Contoh 01', state: 'active', seats: '30', renewsAt: '2026-08-24' },
  { id: 'bill_2', school: 'SMP Harapan', state: 'grace', seats: '50', renewsAt: '2026-07-28' },
  { id: 'bill_3', school: 'SMA Nusantara', state: 'blocked', seats: '80', renewsAt: '2026-07-10' },
  { id: 'bill_4', school: 'SD Mawar', state: 'active', seats: '20', renewsAt: '2026-09-01' },
];

const FLAGS: FlagRow[] = [
  {
    id: 'f1',
    key: 'share.links',
    description: 'Controlled share links',
    enabled: true,
    scope: 'global',
  },
  {
    id: 'f2',
    key: 'cms.marketing',
    description: 'Structured marketing CMS',
    enabled: true,
    scope: 'global',
  },
  {
    id: 'f3',
    key: 'analytics.creator',
    description: 'Creator analytics screen',
    enabled: true,
    scope: 'pilot',
  },
  {
    id: 'f4',
    key: 'ops.bulk_actions',
    description: 'Bulk tenant actions',
    enabled: false,
    scope: 'pilot',
  },
];

const CONTENT: ContentRow[] = [
  { id: 'c1', slug: 'home', title: 'Beranda', status: 'published', updatedAt: '2026-07-20' },
  { id: 'c2', slug: 'harga', title: 'Harga', status: 'draft', updatedAt: '2026-07-23' },
  {
    id: 'c3',
    slug: 'untuk-sekolah',
    title: 'Untuk Sekolah',
    status: 'published',
    updatedAt: '2026-07-18',
  },
];

function planTone(plan: SchoolRow['plan']): 'ok' | 'warn' | 'bad' | 'info' | 'neutral' {
  if (plan === 'active' || plan === 'pilot') return 'ok';
  if (plan === 'grace') return 'warn';
  if (plan === 'blocked') return 'bad';
  return 'neutral';
}

function jobTone(status: JobRow['status']): 'ok' | 'warn' | 'bad' | 'info' | 'neutral' {
  if (status === 'succeeded') return 'ok';
  if (status === 'running') return 'info';
  if (status === 'queued') return 'neutral';
  return 'bad';
}

function accountStatusTone(
  status: AccountRow['status'],
): 'ok' | 'warn' | 'bad' | 'info' | 'neutral' {
  if (status === 'aktif') return 'ok';
  if (status === 'baru') return 'info';
  return 'warn';
}

function billingTone(state: BillingRow['state']): 'ok' | 'warn' | 'bad' | 'info' | 'neutral' {
  if (state === 'active') return 'ok';
  if (state === 'grace') return 'warn';
  if (state === 'blocked' || state === 'expired') return 'bad';
  return 'neutral';
}

function qualityTone(status: QualityRow['status']): 'ok' | 'warn' | 'bad' | 'info' | 'neutral' {
  if (status === 'open') return 'bad';
  if (status === 'triaged') return 'warn';
  return 'ok';
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-[#ddd4c8]/50 bg-[#faf8f5]/60 px-4 py-3 sm:px-6 rounded-b-2xl">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          size="sm"
          variant="secondary"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Sebelumnya
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Berikutnya
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-[12px] text-[#6d665d]">
            Menampilkan <span className="font-semibold text-[#171717]">{start}</span> ke{' '}
            <span className="font-semibold text-[#171717]">{end}</span> dari{' '}
            <span className="font-semibold text-[#171717]">{totalItems}</span> hasil
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-xl shadow-sm bg-white"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-xl px-2 py-1.5 text-[#6d665d] ring-1 ring-inset ring-[#ddd4c8]/60 hover:bg-[#faf7f2] focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:hover:bg-white"
            >
              <span className="sr-only">Sebelumnya</span>
              <span className="material-symbols-outlined text-[16px]" aria-hidden>
                chevron_left
              </span>
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`relative inline-flex items-center px-3 py-1.5 text-[11px] font-semibold ${
                    isCurrent
                      ? 'z-10 bg-[#171717] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]'
                      : 'text-[#171717] ring-1 ring-inset ring-[#ddd4c8]/60 hover:bg-[#faf7f2] focus:outline-offset-0'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-xl px-2 py-1.5 text-[#6d665d] ring-1 ring-inset ring-[#ddd4c8]/60 hover:bg-[#faf7f2] focus:z-20 focus:outline-offset-0 disabled:opacity-40 disabled:hover:bg-white"
            >
              <span className="sr-only">Berikutnya</span>
              <span className="material-symbols-outlined text-[16px]" aria-hidden>
                chevron_right
              </span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

export function OpsConsoleView({ section = '' }: { section?: string }) {
  const key = section || '';
  const { search, setSearch, selectedIds, setSelectedIds, toggleSelectedId, setToast } =
    useAdminSectionState(key || 'ringkasan');

  // ── Live dashboard state ──────────────────────────────────────────────
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [dashboardJobs, setDashboardJobs] = useState<AdminJobRow[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const loadDashboard = () => {
    setDashboardLoading(true);
    Promise.all([adminService.dashboard(), adminService.jobs(4)]).then(([kpiRes, jobsRes]) => {
      if (kpiRes.ok) setDashboard(kpiRes.value);
      if (jobsRes.ok) setDashboardJobs(jobsRes.value);
      setDashboardLoading(false);
    });
  };

  useEffect(() => {
    if (key === '') loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  // ─────────────────────────────────────────────────────────────────────

  const [flags, setFlags] = useState(FLAGS);
  const [filterRole, setFilterRole] = useState<'' | AccountRow['role']>('');
  const [filterStatus, setFilterStatus] = useState<'' | AccountRow['status']>('');
  const [filterPlan, setFilterPlan] = useState<'' | SchoolRow['plan']>('');
  const [filterJobStatus, setFilterJobStatus] = useState<'' | JobRow['status']>('');
  const [filterQuality, setFilterQuality] = useState<'' | QualityRow['status']>('');
  const [filterBilling, setFilterBilling] = useState<'' | BillingRow['state']>('');
  const [filterContent, setFilterContent] = useState<'' | ContentRow['status']>('');

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    filterRole,
    filterStatus,
    filterPlan,
    filterJobStatus,
    filterQuality,
    filterBilling,
    filterContent,
    key,
  ]);

  const accounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ACCOUNTS.filter((row) => {
      const matchSearch =
        !q ||
        row.displayName.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.role.includes(q) ||
        row.school.toLowerCase().includes(q);
      const matchRole = filterRole === '' || row.role === filterRole;
      const matchStatus = filterStatus === '' || row.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }, [search, filterRole, filterStatus]);

  const schools = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SCHOOLS.filter((row) => {
      const matchSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.owner.toLowerCase().includes(q) ||
        row.plan.includes(q);
      const matchPlan = filterPlan === '' || row.plan === filterPlan;
      return matchSearch && matchPlan;
    });
  }, [search, filterPlan]);

  const jobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return JOBS.filter((row) => {
      const matchSearch =
        !q ||
        row.id.includes(q) ||
        row.tenant.toLowerCase().includes(q) ||
        row.type.includes(q) ||
        row.status.includes(q);
      const matchStatus = filterJobStatus === '' || row.status === filterJobStatus;
      return matchSearch && matchStatus;
    });
  }, [search, filterJobStatus]);

  const quality = useMemo(() => {
    const q = search.trim().toLowerCase();
    return QUALITY.filter((row) => {
      const matchSearch =
        !q ||
        row.id.includes(q) ||
        row.reason.includes(q) ||
        row.reporter.includes(q) ||
        row.status.includes(q);
      const matchStatus = filterQuality === '' || row.status === filterQuality;
      return matchSearch && matchStatus;
    });
  }, [search, filterQuality]);

  const billing = useMemo(() => {
    const q = search.trim().toLowerCase();
    return BILLING.filter((row) => {
      const matchSearch = !q || row.school.toLowerCase().includes(q) || row.state.includes(q);
      const matchState = filterBilling === '' || row.state === filterBilling;
      return matchSearch && matchState;
    });
  }, [search, filterBilling]);

  const content = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CONTENT.filter((row) => {
      const matchSearch =
        !q || row.slug.includes(q) || row.title.toLowerCase().includes(q) || row.status.includes(q);
      const matchStatus = filterContent === '' || row.status === filterContent;
      return matchSearch && matchStatus;
    });
  }, [search, filterContent]);

  const clearSelection = () => setSelectedIds([]);

  return (
    <div className="space-y-4">
      {key === '' ? (
        <>
          <AdminPageHeader
            title="Ringkasan platform"
            description="Pantau kesehatan job, tenant berisiko, quality report, dan flag pilot dari satu tempat."
            meta={
              <>
                <AdminPill tone={dashboardLoading ? 'info' : dashboard ? 'ok' : 'warn'}>
                  {dashboardLoading ? 'memuat...' : dashboard ? 'live' : 'staging mock'}
                </AdminPill>
                <AdminPill tone="ok">least privilege</AdminPill>
              </>
            }
            actions={
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => { loadDashboard(); setToast('Refresh ringkasan...'); }}
                >
                  Refresh
                </Button>
                <Button size="sm" onClick={() => setToast('Buka antrian job gagal.')}>
                  Review job gagal
                </Button>
              </>
            }
          />
          <AdminStatCards
            items={[
              {
                label: 'Job aktif',
                value: dashboard ? String(dashboard.jobsActive) : '—',
                hint: dashboardLoading ? 'memuat...' : 'total job berjalan',
                tone: 'info',
                delta: 'live',
              },
              {
                label: 'Quality open',
                value: dashboard ? String(dashboard.qualityOpen) : '—',
                hint: dashboardLoading ? 'memuat...' : 'butuh triage',
                tone: (dashboard?.qualityOpen ?? 0) > 0 ? 'warn' : 'ok',
                delta: (dashboard?.qualityOpen ?? 0) > 0 ? 'P1' : '✓',
              },
              {
                label: 'Pengguna',
                value: dashboard ? String(dashboard.users) : '—',
                hint: dashboardLoading ? 'memuat...' : 'total akun aktif',
                tone: 'ok',
                delta: String(dashboard?.users ?? '—'),
              },
              {
                label: 'Flag aktif',
                value: dashboard ? String(dashboard.flagsEnabled) : '—',
                hint: dashboardLoading ? 'memuat...' : 'scope terbatas',
                tone: 'ok',
                delta: 'on',
              },
            ]}
          />
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-[#ddd4c8]/70 bg-white p-5 shadow-[0_2px_12px_rgba(23,23,23,0.01),0_1px_2px_rgba(23,23,23,0.02)]">
              <div className="flex items-center justify-between gap-2 border-b border-[#eee6da]/50 pb-3">
                <h2 className="text-[14px] font-semibold text-[#171717]">Jobs terbaru</h2>
                <a
                  href="/ops/jobs"
                  className="text-[12px] font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
                >
                  Lihat semua
                </a>
              </div>
              <AdminDataTable
                rows={dashboardJobs.length > 0 ? dashboardJobs : JOBS.slice(0, 4)}
                footerNote={dashboardJobs.length > 0 ? 'Live · BE' : 'Preview · staging'}
                flat={true}
                columns={[
                  {
                    key: 'id',
                    header: 'Job',
                    render: (row) => (
                      <code className="text-[11px] font-mono bg-[#f4eade] px-1.5 py-0.5 rounded text-[#514b44]">
                        {row.id}
                      </code>
                    ),
                  },
                  { key: 'tenant', header: 'Tenant', render: (row) => row.tenant },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (row) => <AdminPill tone={jobTone(row.status)}>{row.status}</AdminPill>,
                  },
                  {
                    key: 'progress',
                    header: 'Progress',
                    render: (row) => (
                      <span className="font-semibold tabular-nums text-[#171717]">
                        {row.progress}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
            <div className="space-y-4 rounded-2xl border border-[#ddd4c8]/70 bg-white p-5 shadow-[0_2px_12px_rgba(23,23,23,0.01),0_1px_2px_rgba(23,23,23,0.02)]">
              <div className="flex items-center justify-between gap-2 border-b border-[#eee6da]/50 pb-3">
                <h2 className="text-[14px] font-semibold text-[#171717]">
                  Tenant yang perlu perhatian
                </h2>
                <a
                  href="/ops/schools"
                  className="text-[12px] font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
                >
                  Lihat semua
                </a>
              </div>
              <AdminDataTable
                rows={SCHOOLS.filter((s) => s.plan === 'grace' || s.plan === 'blocked')}
                footerNote="Preview · staging"
                emptyLabel="Tidak ada tenant berisiko."
                emptyHint="Semua sekolah dalam status aman."
                flat={true}
                columns={[
                  { key: 'name', header: 'Sekolah', render: (row) => row.name },
                  {
                    key: 'plan',
                    header: 'Status',
                    render: (row) => <AdminPill tone={planTone(row.plan)}>{row.plan}</AdminPill>,
                  },
                  {
                    key: 'usage',
                    header: 'Usage',
                    render: (row) => (
                      <span className="font-semibold tabular-nums text-[#171717]">{row.usage}</span>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </>
      ) : null}

      {key === 'accounts' ? (
        <>
          <AdminPageHeader
            title="Akun platform"
            description="Cari, filter, dan kelola akun guru, admin sekolah, serta superadmin."
            meta={<AdminPill tone="info">{accounts.length} ditampilkan</AdminPill>}
            actions={
              <Button size="sm" onClick={() => setToast('Undang akun baru (mock).')}>
                Undang akun
              </Button>
            }
          />
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari akun, email, role, sekolah"
            filters={
              <>
                <AdminFilterChip active={filterRole === ''} onClick={() => setFilterRole('')}>
                  Semua role
                </AdminFilterChip>
                <AdminFilterChip
                  active={filterRole === 'teacher'}
                  onClick={() => setFilterRole('teacher')}
                >
                  teacher
                </AdminFilterChip>
                <AdminFilterChip
                  active={filterRole === 'school_admin'}
                  onClick={() => setFilterRole('school_admin')}
                >
                  school_admin
                </AdminFilterChip>
                <AdminFilterChip
                  active={filterRole === 'superadmin'}
                  onClick={() => setFilterRole('superadmin')}
                >
                  superadmin
                </AdminFilterChip>
                <AdminFilterChip active={filterStatus === ''} onClick={() => setFilterStatus('')}>
                  Semua status
                </AdminFilterChip>
                <AdminFilterChip
                  active={filterStatus === 'aktif'}
                  onClick={() => setFilterStatus('aktif')}
                >
                  aktif
                </AdminFilterChip>
                <AdminFilterChip
                  active={filterStatus === 'baru'}
                  onClick={() => setFilterStatus('baru')}
                >
                  baru
                </AdminFilterChip>
                <AdminFilterChip
                  active={filterStatus === 'ditangguhkan'}
                  onClick={() => setFilterStatus('ditangguhkan')}
                >
                  ditangguhkan
                </AdminFilterChip>
              </>
            }
          />
          <AdminBulkBar count={selectedIds.length} onClear={clearSelection}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setToast(`Suspend ${selectedIds.length} akun (mock).`)}
            >
              Suspend
            </Button>
            <Button
              size="sm"
              onClick={() => setToast(`Kirim reset sandi ke ${selectedIds.length} akun.`)}
            >
              Reset sandi
            </Button>
          </AdminBulkBar>
          <AdminDataTable
            rows={accounts.slice((page - 1) * 3, page * 3)}
            selectable
            selectedIds={selectedIds}
            onToggleRow={toggleSelectedId}
            onToggleAll={setSelectedIds}
            emptyLabel="Tidak ada akun yang cocok."
            emptyHint="Ubah filter atau kata kunci pencarian."
            emptyAction={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setFilterRole('');
                  setFilterStatus('');
                }}
              >
                Reset filter
              </Button>
            }
            columns={[
              {
                key: 'user',
                header: 'Pengguna',
                render: (row) => (
                  <div className="flex items-center gap-3">
                    <AdminAvatar name={row.displayName} />
                    <div className="min-w-0">
                      <div className="font-semibold text-[#171717]">{row.displayName}</div>
                      <div className="text-[12px] text-[#6d665d]">{row.email}</div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'role',
                header: 'Role',
                render: (row) => (
                  <AdminPill tone={row.role === 'superadmin' ? 'info' : 'neutral'}>
                    {row.role}
                  </AdminPill>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <AdminPill tone={accountStatusTone(row.status)}>{row.status}</AdminPill>
                ),
              },
              { key: 'school', header: 'Sekolah', render: (row) => row.school },
            ]}
            rowActions={(row) => (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setToast(`Detail ${row.displayName}`)}
                >
                  Detail
                </Button>
                <Button size="sm" onClick={() => setToast(`Impersonate ${row.email} (mock).`)}>
                  Impersonate
                </Button>
              </>
            )}
          />
          <AdminPagination
            currentPage={page}
            totalPages={Math.ceil(accounts.length / 3)}
            totalItems={accounts.length}
            pageSize={3}
            onPageChange={setPage}
          />
        </>
      ) : null}

      {key === 'schools' ? (
        <>
          <AdminPageHeader
            title="Sekolah / tenant"
            description="Pantau status plan, usage, dan owner setiap tenant sekolah."
            meta={
              <AdminPill tone="warn">
                {schools.filter((s) => s.plan !== 'active' && s.plan !== 'pilot').length} perlu
                perhatian
              </AdminPill>
            }
            actions={
              <Button size="sm" onClick={() => setToast('Tambah tenant sekolah (mock).')}>
                Tambah sekolah
              </Button>
            }
          />
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari sekolah / owner / plan"
            filters={
              <>
                {(['', 'pilot', 'active', 'grace', 'blocked'] as const).map((plan) => (
                  <AdminFilterChip
                    key={plan || 'all'}
                    active={filterPlan === plan}
                    onClick={() => setFilterPlan(plan)}
                  >
                    {plan || 'Semua plan'}
                  </AdminFilterChip>
                ))}
              </>
            }
          />
          <AdminDataTable
            rows={schools.slice((page - 1) * 3, page * 3)}
            emptyLabel="Tidak ada sekolah yang cocok."
            emptyHint="Coba hapus filter plan atau ubah kata kunci."
            columns={[
              { key: 'name', header: 'Sekolah', render: (row) => row.name },
              {
                key: 'plan',
                header: 'Plan',
                render: (row) => <AdminPill tone={planTone(row.plan)}>{row.plan}</AdminPill>,
              },
              { key: 'teachers', header: 'Guru', render: (row) => String(row.teachers) },
              { key: 'usage', header: 'Usage', render: (row) => row.usage },
              { key: 'owner', header: 'Owner', render: (row) => row.owner },
            ]}
            rowActions={(row) => (
              <>
                <Button size="sm" variant="secondary" onClick={() => setToast(`Buka ${row.name}`)}>
                  Buka
                </Button>
                <Button size="sm" onClick={() => setToast(`Ubah plan ${row.name}`)}>
                  Ubah plan
                </Button>
              </>
            )}
          />
          <AdminPagination
            currentPage={page}
            totalPages={Math.ceil(schools.length / 3)}
            totalItems={schools.length}
            pageSize={3}
            onPageChange={setPage}
          />
        </>
      ) : null}

      {key === 'catalog' ? (
        <>
          <AdminPageHeader
            title="Katalog"
            description="Kelola grade, mapel, dan material yang dipakai generator."
            actions={
              <Button size="sm" onClick={() => setToast('Sync katalog (mock).')}>
                Sync katalog
              </Button>
            }
          />
          <AdminStatCards
            items={[
              { label: 'Grade', value: '12', hint: 'aktif', tone: 'ok' },
              { label: 'Mapel', value: '28', hint: 'published', tone: 'info' },
              { label: 'Material', value: '146', hint: 'siap pakai', tone: 'neutral' },
              { label: 'Draft', value: '7', hint: 'perlu review', tone: 'warn' },
            ]}
          />
          <AdminDataTable
            rows={[
              { id: 'cat_1', label: 'Kelas 7', type: 'grade', status: 'published' },
              { id: 'cat_2', label: 'Matematika', type: 'subject', status: 'published' },
              { id: 'cat_3', label: 'IPA', type: 'subject', status: 'draft' },
              { id: 'cat_4', label: 'Buku paket tema 1', type: 'material', status: 'published' },
            ]}
            columns={[
              { key: 'label', header: 'Item', render: (row) => row.label },
              { key: 'type', header: 'Tipe', render: (row) => row.type },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <AdminPill tone={row.status === 'published' ? 'ok' : 'neutral'}>
                    {row.status}
                  </AdminPill>
                ),
              },
            ]}
            rowActions={(row) => (
              <Button size="sm" variant="secondary" onClick={() => setToast(`Edit ${row.label}`)}>
                Edit
              </Button>
            )}
          />
        </>
      ) : null}

      {key === 'prompts' ? (
        <>
          <AdminPageHeader
            title="Prompt library"
            description="Template prompt internal untuk generate, repair, dan quality check."
            actions={
              <Button size="sm" onClick={() => setToast('Buat prompt baru (mock).')}>
                Prompt baru
              </Button>
            }
          />
          <AdminDataTable
            rows={[
              { id: 'p1', name: 'generate.v3', owner: 'ops', status: 'active' },
              { id: 'p2', name: 'repair.schema', owner: 'eng', status: 'active' },
              { id: 'p3', name: 'quality.guard', owner: 'ops', status: 'draft' },
            ]}
            columns={[
              { key: 'name', header: 'Prompt', render: (row) => row.name },
              { key: 'owner', header: 'Owner', render: (row) => row.owner },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <AdminPill tone={row.status === 'active' ? 'ok' : 'neutral'}>
                    {row.status}
                  </AdminPill>
                ),
              },
            ]}
            rowActions={(row) => (
              <Button size="sm" variant="secondary" onClick={() => setToast(`Buka ${row.name}`)}>
                Buka
              </Button>
            )}
          />
        </>
      ) : null}

      {key === 'jobs' ? (
        <>
          <AdminPageHeader
            title="Jobs"
            description="Pantau antrian generate/export lintas tenant dan retry job gagal."
            meta={
              <AdminPill tone="bad">
                {jobs.filter((j) => j.status === 'failed').length} gagal
              </AdminPill>
            }
            actions={
              <Button size="sm" onClick={() => setToast('Retry semua failed (mock).')}>
                Retry failed
              </Button>
            }
          />
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari job / tenant / status"
            filters={
              <>
                {(['', 'running', 'queued', 'failed', 'succeeded'] as const).map((status) => (
                  <AdminFilterChip
                    key={status || 'all'}
                    active={filterJobStatus === status}
                    onClick={() => setFilterJobStatus(status)}
                  >
                    {status || 'Semua status'}
                  </AdminFilterChip>
                ))}
              </>
            }
          />
          <AdminDataTable
            rows={jobs.slice((page - 1) * 3, page * 3)}
            emptyLabel="Tidak ada job yang cocok."
            emptyHint="Ubah filter status atau kata kunci."
            columns={[
              { key: 'id', header: 'Job', render: (row) => row.id },
              { key: 'type', header: 'Tipe', render: (row) => row.type },
              { key: 'tenant', header: 'Tenant', render: (row) => row.tenant },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <AdminPill tone={jobTone(row.status)}>{row.status}</AdminPill>,
              },
              { key: 'progress', header: 'Progress', render: (row) => row.progress },
              { key: 'updated', header: 'Update', render: (row) => row.updatedAt },
            ]}
            rowActions={(row) => (
              <>
                <Button size="sm" variant="secondary" onClick={() => setToast(`Detail ${row.id}`)}>
                  Detail
                </Button>
                {row.status === 'failed' ? (
                  <Button size="sm" onClick={() => setToast(`Retry ${row.id}`)}>
                    Retry
                  </Button>
                ) : null}
              </>
            )}
          />
          <AdminPagination
            currentPage={page}
            totalPages={Math.ceil(jobs.length / 3)}
            totalItems={jobs.length}
            pageSize={3}
            onPageChange={setPage}
          />
        </>
      ) : null}

      {key === 'quality' ? (
        <>
          <AdminPageHeader
            title="Quality reports"
            description="Triage laporan kualitas soal, kunci, dan privasi dari pengguna."
            meta={
              <AdminPill tone="warn">
                {quality.filter((q) => q.status !== 'closed').length} open/triaged
              </AdminPill>
            }
          />
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari report / reason / reporter"
            filters={
              <>
                {(['', 'open', 'triaged', 'closed'] as const).map((status) => (
                  <AdminFilterChip
                    key={status || 'all'}
                    active={filterQuality === status}
                    onClick={() => setFilterQuality(status)}
                  >
                    {status || 'Semua status'}
                  </AdminFilterChip>
                ))}
              </>
            }
          />
          <AdminDataTable
            rows={quality.slice((page - 1) * 3, page * 3)}
            emptyLabel="Tidak ada report yang cocok."
            columns={[
              { key: 'id', header: 'Report', render: (row) => row.id },
              { key: 'reason', header: 'Reason', render: (row) => row.reason },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <AdminPill tone={qualityTone(row.status)}>{row.status}</AdminPill>,
              },
              { key: 'reporter', header: 'Reporter', render: (row) => row.reporter },
              { key: 'created', header: 'Dibuat', render: (row) => row.createdAt },
            ]}
            rowActions={(row) => (
              <>
                <Button size="sm" variant="secondary" onClick={() => setToast(`Triage ${row.id}`)}>
                  Triage
                </Button>
                <Button size="sm" onClick={() => setToast(`Tutup ${row.id}`)}>
                  Tutup
                </Button>
              </>
            )}
          />
          <AdminPagination
            currentPage={page}
            totalPages={Math.ceil(quality.length / 3)}
            totalItems={quality.length}
            pageSize={3}
            onPageChange={setPage}
          />
        </>
      ) : null}

      {key === 'audit' ? (
        <>
          <AdminPageHeader
            title="Audit trail"
            description="Jejak aksi superadmin untuk akuntabilitas platform."
          />
          <AdminDataTable
            rows={[
              {
                id: 'aud_1',
                actor: 'ops@lembar.id',
                action: 'role.update',
                target: 'admin@sdncontoh.sch.id',
                at: '2026-07-24 10:12',
              },
              {
                id: 'aud_2',
                actor: 'ops@lembar.id',
                action: 'tenant.plan_change',
                target: 'SMP Harapan',
                at: '2026-07-24 09:40',
              },
              {
                id: 'aud_3',
                actor: 'ops@lembar.id',
                action: 'flag.toggle',
                target: 'ops.bulk_actions',
                at: '2026-07-23 18:05',
              },
            ]}
            columns={[
              { key: 'at', header: 'Waktu', render: (row) => row.at },
              { key: 'actor', header: 'Actor', render: (row) => row.actor },
              { key: 'action', header: 'Aksi', render: (row) => row.action },
              { key: 'target', header: 'Target', render: (row) => row.target },
            ]}
            rowActions={(row) => (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setToast(`Detail audit ${row.id}`)}
              >
                Detail
              </Button>
            )}
          />
        </>
      ) : null}

      {key === 'billing' ? (
        <>
          <AdminPageHeader
            title="Billing"
            description="Pantau status langganan, seats, dan perpanjangan tenant."
            meta={
              <AdminPill tone="warn">
                {billing.filter((b) => b.state !== 'active').length} non-active
              </AdminPill>
            }
          />
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari sekolah / state"
            filters={
              <>
                {(['', 'active', 'grace', 'blocked', 'expired'] as const).map((state) => (
                  <AdminFilterChip
                    key={state || 'all'}
                    active={filterBilling === state}
                    onClick={() => setFilterBilling(state)}
                  >
                    {state || 'Semua state'}
                  </AdminFilterChip>
                ))}
              </>
            }
          />
          <AdminDataTable
            rows={billing.slice((page - 1) * 3, page * 3)}
            emptyLabel="Tidak ada data billing yang cocok."
            columns={[
              { key: 'school', header: 'Sekolah', render: (row) => row.school },
              {
                key: 'state',
                header: 'State',
                render: (row) => <AdminPill tone={billingTone(row.state)}>{row.state}</AdminPill>,
              },
              { key: 'seats', header: 'Seats', render: (row) => row.seats },
              { key: 'renew', header: 'Renew', render: (row) => row.renewsAt },
            ]}
            rowActions={(row) => (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setToast(`Billing detail ${row.school}`)}
              >
                Kelola
              </Button>
            )}
          />
          <AdminPagination
            currentPage={page}
            totalPages={Math.ceil(billing.length / 3)}
            totalItems={billing.length}
            pageSize={3}
            onPageChange={setPage}
          />
        </>
      ) : null}

      {key === 'flags' ? (
        <>
          <AdminPageHeader
            title="Feature flags"
            description="Nyalakan/matikan fitur global atau pilot tanpa deploy."
          />
          <AdminDataTable
            rows={flags}
            columns={[
              { key: 'key', header: 'Flag', render: (row) => row.key },
              { key: 'desc', header: 'Deskripsi', render: (row) => row.description },
              { key: 'scope', header: 'Scope', render: (row) => row.scope },
              {
                key: 'enabled',
                header: 'State',
                render: (row) => (
                  <AdminPill tone={row.enabled ? 'ok' : 'neutral'}>
                    {row.enabled ? 'on' : 'off'}
                  </AdminPill>
                ),
              },
            ]}
            rowActions={(row) => (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setFlags((prev) =>
                    prev.map((item) =>
                      item.id === row.id ? { ...item, enabled: !item.enabled } : item,
                    ),
                  );
                  setToast(`Flag ${row.key} diubah (mock).`);
                }}
              >
                Toggle
              </Button>
            )}
          />
        </>
      ) : null}

      {key === 'content' ? (
        <>
          <AdminPageHeader
            title="Marketing CMS"
            description="Kelola draft dan publish halaman marketing publik."
            actions={
              <Button size="sm" onClick={() => setToast('Buat draft CMS mock.')}>
                Draft baru
              </Button>
            }
          />
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari slug / judul / status"
            filters={
              <>
                {(['', 'published', 'draft'] as const).map((status) => (
                  <AdminFilterChip
                    key={status || 'all'}
                    active={filterContent === status}
                    onClick={() => setFilterContent(status)}
                  >
                    {status || 'Semua status'}
                  </AdminFilterChip>
                ))}
              </>
            }
          />
          <AdminDataTable
            rows={content.slice((page - 1) * 3, page * 3)}
            emptyLabel="Tidak ada konten yang cocok."
            columns={[
              { key: 'slug', header: 'Slug', render: (row) => row.slug },
              { key: 'title', header: 'Judul', render: (row) => row.title },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <AdminPill tone={row.status === 'published' ? 'ok' : 'neutral'}>
                    {row.status}
                  </AdminPill>
                ),
              },
              { key: 'updated', header: 'Update', render: (row) => row.updatedAt },
            ]}
            rowActions={(row) => (
              <>
                <Button size="sm" variant="secondary" onClick={() => setToast(`Edit ${row.slug}`)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    setToast(`${row.status === 'published' ? 'Unpublish' : 'Publish'} ${row.slug}`)
                  }
                >
                  {row.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>
              </>
            )}
          />
          <AdminPagination
            currentPage={page}
            totalPages={Math.ceil(content.length / 3)}
            totalItems={content.length}
            pageSize={3}
            onPageChange={setPage}
          />
        </>
      ) : null}

      {key === 'profile' ? (
        <>
          <AdminPageHeader
            title="Profil Saya"
            description="Informasi akun Superadmin dan kredensial akses."
            meta={<AdminPill tone="info">Platform Level</AdminPill>}
          />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-[#ddd4c8]/70 bg-white p-6 shadow-[0_2px_12px_rgba(23,23,23,0.01)]">
              <h3 className="text-[14px] font-bold text-[#171717] border-b border-[#eee6da]/50 pb-2">
                Detail Akun
              </h3>
              <div className="flex items-center gap-4">
                <AdminAvatar name="Ops Superadmin" />
                <div>
                  <div className="text-[16px] font-bold text-[#171717]">Ops Superadmin</div>
                  <div className="text-[12px] text-[#6d665d]">ops@lembar.id</div>
                  <div className="mt-1.5">
                    <AdminPill tone="info">superadmin</AdminPill>
                  </div>
                </div>
              </div>
              <div className="border-t border-[#eee6da]/50 pt-4 space-y-2.5 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#8a8379]">Akses Hak</span>
                  <span className="font-semibold text-brand-accent">FULL_CONTROL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a8379]">Masa Berlaku</span>
                  <span className="font-medium text-[#171717]">Selamanya</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a8379]">Metode Masuk</span>
                  <span className="font-medium text-[#171717]">Google Workspace SSO</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#ddd4c8]/70 bg-white p-6 shadow-[0_2px_12px_rgba(23,23,23,0.01)]">
              <h3 className="text-[14px] font-bold text-[#171717] border-b border-[#eee6da]/50 pb-2">
                Informasi Sesi
              </h3>
              <div className="space-y-2.5 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#8a8379]">IP Address Saat Ini</span>
                  <span className="font-mono text-[#171717]">192.168.1.100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a8379]">Browser / OS</span>
                  <span className="font-medium text-[#171717]">Chrome · macOS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a8379]">Akses Terakhir</span>
                  <span className="font-medium text-[#171717]">Baru saja</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a8379]">Enkripsi Sesi</span>
                  <span className="font-semibold text-[#8a8379]">TLS_AES_256_GCM_SHA384</span>
                </div>
              </div>
              <div className="border-t border-[#eee6da]/50 pt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => setToast('Log out dari perangkat lain (mock).')}
                >
                  Log Out dari Perangkat Lain
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {key !== '' &&
      ![
        'accounts',
        'schools',
        'catalog',
        'prompts',
        'jobs',
        'quality',
        'audit',
        'billing',
        'flags',
        'content',
        'profile',
      ].includes(key) ? (
        <AdminPageHeader
          title={`Section ${key}`}
          description="Halaman ini belum punya konten management. Pilih menu ops yang tersedia di sidebar."
          meta={<AdminPill tone="warn">coming soon</AdminPill>}
        />
      ) : null}
    </div>
  );
}
