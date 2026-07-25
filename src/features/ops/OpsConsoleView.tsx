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
import {
  adminService,
  type AdminDashboard,
  type AdminJobRow,
  type AdminAccountRow,
  type AdminAccountDetail,
  type AdminAccountAuditItem,
  type AdminSchoolRow,
  type AdminQualityRow,
  type AdminBillingRow,
  type AdminFlagRow,
  type AdminPromptRow,
  type AdminAuditRow,
  type AdminContentRow,
} from '@/src/services/admin/adminService';

// ── Type aliases — mapped to service types so UI code is decoupled ──────────
type AccountRow = AdminAccountRow;
type SchoolRow = AdminSchoolRow;
type JobRow = AdminJobRow;
type QualityRow = AdminQualityRow;
type BillingRow = AdminBillingRow;
type FlagRow = AdminFlagRow;
type ContentRow = AdminContentRow;


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

function getPaginationRange(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - 1, 1);
  const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftRange = Array.from({ length: 4 }, (_, i) => i + 1);
    return [...leftRange, '...', totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightRange = Array.from({ length: 4 }, (_, i) => totalPages - 3 + i);
    return [1, '...', ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i,
    );
    return [1, '...', ...middleRange, '...', totalPages];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
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
  if (totalItems <= 0) return null;
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const paginationRange = getPaginationRange(currentPage, totalPages);

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
            {paginationRange.map((item, idx) => {
              if (item === '...') {
                return (
                  <span
                    key={`dots-${idx}`}
                    className="relative inline-flex items-center px-3 py-1.5 text-[11px] font-semibold text-[#8a8379] ring-1 ring-inset ring-[#ddd4c8]/60 select-none bg-white"
                  >
                    …
                  </span>
                );
              }

              const p = item as number;
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

function AccountDetailView({
  accountId,
  onBack,
  setToast,
  onUpdated,
}: {
  accountId: string;
  onBack: () => void;
  setToast: (msg: string) => void;
  onUpdated: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<AdminAccountDetail | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    adminService.accountDetail(accountId).then((res) => {
      if (res.ok) {
        setDetail(res.value);
        setEditName(res.value.name || res.value.displayName || '');
        setEditPhone(res.value.phone || '');
      } else {
        setToast(`Gagal memuat detail: ${res.error.safeMessage}`);
      }
      setLoading(false);
    });
  }, [accountId, setToast]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    adminService
      .updateAccount(accountId, { name: editName, phone: editPhone })
      .then((res) => {
        if (res.ok) {
          setDetail(res.value);
          setToast(`Detail akun ${res.value.name} berhasil diperbarui.`);
          onUpdated();
        } else {
          setToast(`Gagal memperbarui: ${res.error.safeMessage}`);
        }
      })
      .finally(() => setSaving(false));
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6d665d] hover:text-[#171717] transition-colors"
        >
          ← Kembali ke Daftar Akun
        </button>
      </div>

      <AdminPageHeader
        title={detail?.name || 'Detail Akun'}
        description={detail?.email ? `ID: ${detail.id} · ${detail.email}` : `ID: ${accountId}`}
        meta={
          detail ? (
            <>
              <AdminPill tone={detail.status === 'aktif' ? 'ok' : 'warn'}>
                {detail.status}
              </AdminPill>
              <AdminPill tone="info">{detail.role}</AdminPill>
            </>
          ) : null
        }
      />

      {loading ? (
        <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white py-14 text-center text-[13px] text-[#6d665d]">
          Memuat detail akun...
        </div>
      ) : detail ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left / Main Column: Edit Profile Form */}
          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={handleSave} className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-[15px] font-bold text-[#171717]">Edit Profil Akun</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#6d665d] mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[#ddd4c8] bg-white px-3.5 text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                    placeholder="Nama akun"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#6d665d] mb-1.5">No. Telepon</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[#ddd4c8] bg-white px-3.5 text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                    placeholder="+628123456789"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button size="sm" type="submit" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>

            {/* Audit Log Timeline */}
            {detail.auditLog && detail.auditLog.length > 0 && (
              <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-[15px] font-bold text-[#171717]">Log Audit Riwayat Aktivitas</h3>
                <div className="rounded-xl border border-[#ddd4c8] bg-white overflow-hidden text-[12px]">
                  <table className="w-full text-left">
                    <thead className="border-b border-[#ddd4c8]/60 bg-[#faf7f2] text-[11px] text-[#6d665d]">
                      <tr>
                        <th className="px-3.5 py-2.5">Aksi</th>
                        <th className="px-3.5 py-2.5">Oleh</th>
                        <th className="px-3.5 py-2.5">Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ddd4c8]/40">
                      {detail.auditLog.map((log: AdminAccountAuditItem) => (
                        <tr key={log.id}>
                          <td className="px-3.5 py-2.5 font-mono text-[11px] text-[#171717]">{log.action}</td>
                          <td className="px-3.5 py-2.5">{log.by}</td>
                          <td className="px-3.5 py-2.5 text-[#6d665d]">{log.at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Metadata Overview */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-5 shadow-sm space-y-3 text-[13px]">
              <h3 className="text-[15px] font-bold text-[#171717]">Informasi Sistem</h3>
              
              <div className="divide-y divide-[#ddd4c8]/40">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-[#6d665d]">Username</span>
                  <span className="font-semibold text-[#171717]">{detail.username || '-'}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-[#6d665d]">Sekolah</span>
                  <span className="font-semibold text-[#171717]">{detail.school || detail.schoolSlug || '-'}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-[#6d665d]">Workspace ID</span>
                  <span className="font-mono text-[11px] text-[#171717]">{detail.workspaceId || '-'}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-[#6d665d]">Status Billing</span>
                  <span className="font-semibold text-[#171717]">{detail.billing?.state || 'free'}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-[#6d665d]">Kuota Terpakai</span>
                  <span className="font-semibold text-[#171717]">{detail.stats?.quotaUsed ?? 0}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-[#6d665d]">Total Job</span>
                  <span className="font-semibold text-[#171717]">{detail.stats?.jobsTotal ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AccountRowActions({
  row,
  impersonatingId,
  handleImpersonate,
  loadAccounts,
  setToast,
  onOpenDetail,
}: {
  row: AccountRow;
  impersonatingId: string | null;
  handleImpersonate: (row: AccountRow) => void;
  loadAccounts: () => void;
  setToast: (msg: string) => void;
  onOpenDetail?: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isSuspended = row.status === 'ditangguhkan';

  return (
    <div className="relative flex items-center gap-1.5">
      <Button
        size="sm"
        disabled={impersonatingId === row.id || row.role === 'superadmin'}
        onClick={() => handleImpersonate(row)}
      >
        {impersonatingId === row.id ? 'Mengalihkan...' : 'Impersonate'}
      </Button>

      <div className="relative">
        <Button size="sm" variant="secondary" onClick={() => setIsOpen((prev) => !prev)}>
          Aksi <span className="text-[10px] ml-0.5">▼</span>
        </Button>

        {isOpen && (
          <>
            {/* Backdrop to close dropdown when clicking outside */}
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-1 w-40 rounded-lg border border-[#ddd4c8] bg-white py-1 shadow-lg z-40 text-left">
              <button
                type="button"
                className="w-full px-3 py-1.5 text-[12px] text-[#171717] hover:bg-[#faf7f2] text-left transition-colors font-medium"
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenDetail) {
                    onOpenDetail(row.id);
                  } else {
                    setToast(`Detail ${row.displayName}`);
                  }
                }}
              >
                Detail
              </button>

              <button
                type="button"
                className="w-full px-3 py-1.5 text-[12px] text-[#171717] hover:bg-[#faf7f2] text-left transition-colors font-medium"
                onClick={() => {
                  setIsOpen(false);
                  adminService.resetPassword(row.id).then((res) => {
                    if (res.ok) {
                      setToast(`Reset sandi berhasil dikirim ke ${row.email}.`);
                    } else {
                      setToast(`Gagal: ${res.error.safeMessage}`);
                    }
                  });
                }}
              >
                Reset Sandi
              </button>

              {row.role !== 'superadmin' && (
                <>
                  <button
                    type="button"
                    className="w-full px-3 py-1.5 text-[12px] text-[#171717] hover:bg-[#faf7f2] text-left transition-colors font-medium"
                    onClick={() => {
                      setIsOpen(false);
                      const action = isSuspended
                        ? adminService.unsuspendAccount(row.id)
                        : adminService.suspendAccount(row.id);
                      action.then((res) => {
                        if (res.ok) {
                          setToast(
                            `Akun ${row.displayName} berhasil ${isSuspended ? 'diaktifkan' : 'ditangguhkan'}.`,
                          );
                          loadAccounts();
                        } else {
                          setToast(`Gagal: ${res.error.safeMessage}`);
                        }
                      });
                    }}
                  >
                    {isSuspended ? 'Aktifkan' : 'Suspend'}
                  </button>

                  <div className="border-t border-[#eee6da] my-1" />

                  <button
                    type="button"
                    className="w-full px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50 text-left transition-colors font-semibold"
                    onClick={() => {
                      setIsOpen(false);
                      if (confirm(`Apakah Anda yakin ingin menghapus akun ${row.displayName}?`)) {
                        adminService.deleteAccount(row.id).then((res) => {
                          if (res.ok) {
                            setToast(`Akun ${row.displayName} berhasil dihapus.`);
                            loadAccounts();
                          } else {
                            setToast(`Gagal: ${res.error.safeMessage}`);
                          }
                        });
                      }
                    }}
                  >
                    Hapus
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function OpsConsoleView({ section = '' }: { section?: string }) {
  const key = section || '';
  const { search, setSearch, selectedIds, setSelectedIds, toggleSelectedId, setToast } =
    useAdminSectionState(key || 'ringkasan');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'' | 'teacher' | 'school_admin' | 'superadmin'>('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const [filterRole, setFilterRole] = useState<'' | AccountRow['role']>('');
  const [filterStatus, setFilterStatus] = useState<'' | AccountRow['status']>('');
  const [filterPlan, setFilterPlan] = useState<'' | SchoolRow['plan']>('');
  const [filterJobStatus, setFilterJobStatus] = useState<'' | JobRow['status']>('');
  const [filterQuality, setFilterQuality] = useState<'' | QualityRow['status']>('');
  const [filterBilling, setFilterBilling] = useState<'' | BillingRow['state']>('');
  const [filterContent, setFilterContent] = useState<'' | ContentRow['status']>('');

  const [page, setPage] = useState(1);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

  // ── Live dashboard state ──────────────────────────────────────────────
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [dashboardJobs, setDashboardJobs] = useState<AdminJobRow[]>([]);
  const [dashboardSchools, setDashboardSchools] = useState<AdminSchoolRow[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const loadDashboard = () => {
    setDashboardLoading(true);
    Promise.all([adminService.dashboard(), adminService.jobs(4), adminService.schools()]).then(([kpiRes, jobsRes, schoolsRes]) => {
      if (kpiRes.ok) setDashboard(kpiRes.value);
      if (jobsRes.ok) setDashboardJobs(jobsRes.value);
      if (schoolsRes.ok) setDashboardSchools(schoolsRes.value);
      setDashboardLoading(false);
    });
  };

  useEffect(() => {
    if (key === '') loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  // ─────────────────────────────────────────────────────────────────────

  // ── Per-section live data state ────────────────────────────────────────
  const [accountsData, setAccountsData] = useState<AccountRow[]>([]);
  const [accountsMeta, setAccountsMeta] = useState({ total: 0, pages: 1 });
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [detailAccountId, setDetailAccountId] = useState<string | null>(null);

  const [schoolsData, setSchoolsData] = useState<SchoolRow[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);

  const [jobsData, setJobsData] = useState<JobRow[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const [qualityData, setQualityData] = useState<QualityRow[]>([]);
  const [qualityLoading, setQualityLoading] = useState(false);

  const [billingData, setBillingData] = useState<BillingRow[]>([]);
  const [billingLoading, setBillingLoading] = useState(false);

  const [flagsData, setFlagsData] = useState<FlagRow[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(false);

  const [promptsData, setPromptsData] = useState<AdminPromptRow[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);

  const [auditData, setAuditData] = useState<AdminAuditRow[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const [contentData, setContentData] = useState<ContentRow[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  // ── Fetch loaders ─────────────────────────────────────────────────────
  const loadAccounts = (
    currentPage = page,
    searchVal = search,
    roleVal = filterRole,
    statusVal = filterStatus,
  ) => {
    setAccountsLoading(true);
    adminService
      .accounts({
        q: searchVal || undefined,
        role: roleVal || undefined,
        status: statusVal || undefined,
        page: currentPage,
        limit: 10,
      })
      .then((res) => {
        if (res.ok) {
          const val = res.value as any;
          if (val && typeof val === 'object' && Array.isArray(val.data) && val.meta) {
            setAccountsData(val.data);
            setAccountsMeta({
              total: val.meta.total ?? val.data.length,
              pages: val.meta.pages ?? Math.max(1, Math.ceil((val.meta.total ?? val.data.length) / 10)),
            });
          } else if (Array.isArray(val)) {
            setAccountsData(val);
            setAccountsMeta({
              total: val.length,
              pages: Math.max(1, Math.ceil(val.length / 10)),
            });
          }
        }
        setAccountsLoading(false);
      });
  };
  const loadSchools = () => {
    setSchoolsLoading(true);
    adminService.schools().then((res) => {
      if (res.ok) setSchoolsData(res.value);
      setSchoolsLoading(false);
    });
  };
  const loadJobs = () => {
    setJobsLoading(true);
    adminService.jobs(50).then((res) => {
      if (res.ok) setJobsData(res.value);
      setJobsLoading(false);
    });
  };
  const loadQuality = () => {
    setQualityLoading(true);
    adminService.qualityReports().then((res) => {
      if (res.ok) setQualityData(res.value);
      setQualityLoading(false);
    });
  };
  const loadBilling = () => {
    setBillingLoading(true);
    adminService.billing().then((res) => {
      if (res.ok) setBillingData(res.value);
      setBillingLoading(false);
    });
  };
  const loadFlags = () => {
    setFlagsLoading(true);
    adminService.flags().then((res) => {
      if (res.ok) setFlagsData(res.value);
      setFlagsLoading(false);
    });
  };
  const loadPrompts = () => {
    setPromptsLoading(true);
    adminService.prompts().then((res) => {
      if (res.ok) setPromptsData(res.value);
      setPromptsLoading(false);
    });
  };
  const loadAudit = () => {
    setAuditLoading(true);
    adminService.audit().then((res) => {
      if (res.ok) setAuditData(res.value);
      setAuditLoading(false);
    });
  };
  const loadContent = () => {
    setContentLoading(true);
    adminService.marketingPages().then((res) => {
      if (res.ok) setContentData(res.value);
      setContentLoading(false);
    });
  };

  // ── Fetch on section change ──────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'accounts') {
      loadAccounts(page, search, filterRole, filterStatus);
    }
  }, [key, page, search, filterRole, filterStatus]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'schools') loadSchools(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'jobs') loadJobs(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'quality') loadQuality(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'billing') loadBilling(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'flags') loadFlags(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'prompts') loadPrompts(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'audit') loadAudit(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'content') loadContent(); }, [key]);

  
  // ── Impersonate Action ────────────────────────────────────────────────
  const handleImpersonate = (row: AccountRow) => {
    setImpersonatingId(row.id);
    setToast(`Memulai impersonasi sebagai ${row.displayName}...`);
    adminService.impersonateAccount(row.id).then((res) => {
      if (res.ok) {
        setToast(`Impersonasi ${res.value.targetName || res.value.targetEmail} berhasil. Mengalihkan...`);
        setTimeout(() => {
          window.location.href = res.value.homePath;
        }, 300);
      } else {
        setToast(`Gagal: ${res.error.safeMessage}`);
        setImpersonatingId(null);
      }
    });
  };

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
    return accountsData.filter((row) => {
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
  }, [accountsData, search, filterRole, filterStatus]);

  const schools = useMemo(() => {
    const q = search.trim().toLowerCase();
    return schoolsData.filter((row) => {
      const matchSearch =
        !q ||
        row.name.toLowerCase().includes(q) ||
        row.owner.toLowerCase().includes(q) ||
        row.plan.includes(q);
      const matchPlan = filterPlan === '' || row.plan === filterPlan;
      return matchSearch && matchPlan;
    });
  }, [schoolsData, search, filterPlan]);

  const jobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobsData.filter((row) => {
      const matchSearch =
        !q ||
        row.id.includes(q) ||
        row.tenant.toLowerCase().includes(q) ||
        row.type.includes(q) ||
        row.status.includes(q);
      const matchStatus = filterJobStatus === '' || row.status === filterJobStatus;
      return matchSearch && matchStatus;
    });
  }, [jobsData, search, filterJobStatus]);

  const quality = useMemo(() => {
    const q = search.trim().toLowerCase();
    return qualityData.filter((row) => {
      const matchSearch =
        !q ||
        row.id.includes(q) ||
        row.reason.includes(q) ||
        row.reporter.includes(q) ||
        row.status.includes(q);
      const matchStatus = filterQuality === '' || row.status === filterQuality;
      return matchSearch && matchStatus;
    });
  }, [qualityData, search, filterQuality]);

  const billing = useMemo(() => {
    const q = search.trim().toLowerCase();
    return billingData.filter((row) => {
      const matchSearch = !q || row.school.toLowerCase().includes(q) || row.state.includes(q);
      const matchState = filterBilling === '' || row.state === filterBilling;
      return matchSearch && matchState;
    });
  }, [billingData, search, filterBilling]);

  const content = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contentData.filter((row) => {
      const matchSearch =
        !q || row.slug.includes(q) || row.title.toLowerCase().includes(q) || row.status.includes(q);
      const matchStatus = filterContent === '' || row.status === filterContent;
      return matchSearch && matchStatus;
    });
  }, [contentData, search, filterContent]);

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
                {dashboardLoading ? (
                  <AdminPill tone="info">memuat...</AdminPill>
                ) : dashboard ? (
                  <AdminPill tone="ok">live</AdminPill>
                ) : null}
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
                rows={dashboardJobs}
                footerNote={dashboardJobs.length > 0 ? 'Live · BE' : 'Memuat...'}
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
                rows={dashboardSchools.filter((s) => s.plan === 'grace' || s.plan === 'blocked')}
                footerNote={dashboardSchools.length > 0 ? 'Live · BE' : 'Memuat...'}
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
                    key: 'seats',
                    header: 'Seats',
                    render: (row) => (
                      <span className="font-semibold tabular-nums text-[#171717]">{String(row.seats)}</span>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </>
      ) : null}

      {key === 'accounts' ? (
        detailAccountId ? (
          <AccountDetailView
            accountId={detailAccountId}
            onBack={() => setDetailAccountId(null)}
            setToast={setToast}
            onUpdated={loadAccounts}
          />
        ) : (
        <>
          <div className="flex items-center justify-between px-1 py-1">
            <h2 className="text-[18px] font-bold text-[#171717]">Akun platform</h2>
            <Button size="sm" onClick={() => setInviteOpen((o) => !o)}>
              Undang akun
            </Button>
          </div>
          {accountsLoading ? <div className="mb-2"><AdminPill tone="info">Memuat...</AdminPill></div> : null}
          {inviteOpen && (
            <form
              className="mb-4 flex flex-wrap gap-2 items-end rounded-xl border border-[#ddd4c8] bg-[#faf7f2] px-4 py-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!inviteEmail) return;
                setInviteLoading(true);
                adminService
                  .inviteAccount({ email: inviteEmail, name: inviteName || undefined, role: inviteRole || undefined })
                  .then((res) => {
                    if (res.ok) {
                      setToast(`Undangan terkirim ke ${inviteEmail}.`);
                      setInviteEmail('');
                      setInviteName('');
                      setInviteRole('');
                      setInviteOpen(false);
                      loadAccounts();
                    } else {
                      setToast(`Gagal: ${res.error.safeMessage}`);
                    }
                  })
                  .finally(() => setInviteLoading(false));
              }}
            >
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#6d665d]" htmlFor="invite-email">
                  Email *
                </label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="guru@sekolah.id"
                  className="rounded-lg border border-[#ddd4c8] bg-white px-3 py-1.5 text-[13px] text-[#171717] placeholder:text-[#b0a89e] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#6d665d]" htmlFor="invite-name">
                  Nama
                </label>
                <input
                  id="invite-name"
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Opsional"
                  className="rounded-lg border border-[#ddd4c8] bg-white px-3 py-1.5 text-[13px] text-[#171717] placeholder:text-[#b0a89e] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-[#6d665d]" htmlFor="invite-role">
                  Role
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)}
                  className="rounded-lg border border-[#ddd4c8] bg-white px-3 py-1.5 text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                >
                  <option value="">— pilih —</option>
                  <option value="teacher">teacher</option>
                  <option value="school_admin">school_admin</option>
                  <option value="superadmin">superadmin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" type="submit" disabled={inviteLoading}>
                  {inviteLoading ? 'Mengirim…' : 'Kirim undangan'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={() => { setInviteOpen(false); setInviteEmail(''); setInviteName(''); setInviteRole(''); }}
                >
                  Batal
                </Button>
              </div>
            </form>
          )}
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari akun, email, role, sekolah"
            filters={
              <div className="flex items-center gap-2">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as typeof filterRole)}
                  className="h-9 rounded-xl border border-[#ddd4c8] bg-white pl-3 pr-8 text-[12px] font-medium text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20 cursor-pointer"
                >
                  <option value="">Semua role</option>
                  <option value="teacher">teacher</option>
                  <option value="school_admin">school_admin</option>
                  <option value="superadmin">superadmin</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="h-9 rounded-xl border border-[#ddd4c8] bg-white pl-3 pr-8 text-[12px] font-medium text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20 cursor-pointer"
                >
                  <option value="">Semua status</option>
                  <option value="aktif">aktif</option>
                  <option value="baru">baru</option>
                  <option value="ditangguhkan">ditangguhkan</option>
                </select>
              </div>
            }
          />
          <AdminBulkBar count={selectedIds.length} onClear={clearSelection}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const ids = [...selectedIds];
                adminService.bulkSuspend(ids).then((res) => {
                  if (res.ok) {
                    setToast(`${res.value.succeeded} akun berhasil ditangguhkan, ${res.value.failed} gagal.`);
                  } else {
                    setToast(`Gagal: ${res.error.safeMessage}`);
                  }
                  clearSelection();
                  loadAccounts();
                });
              }}
            >
              Suspend
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const ids = [...selectedIds];
                adminService.bulkUnsuspend(ids).then((res) => {
                  if (res.ok) {
                    setToast(`${res.value.succeeded} akun berhasil diaktifkan, ${res.value.failed} gagal.`);
                  } else {
                    setToast(`Gagal: ${res.error.safeMessage}`);
                  }
                  clearSelection();
                  loadAccounts();
                });
              }}
            >
              Aktifkan
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                const ids = [...selectedIds];
                if (confirm(`Apakah Anda yakin ingin menghapus ${ids.length} akun terpilih?`)) {
                  adminService.bulkDelete(ids).then((res) => {
                    if (res.ok) {
                      setToast(`${res.value.succeeded} akun berhasil dihapus, ${res.value.failed} gagal.`);
                    } else {
                      setToast(`Gagal: ${res.error.safeMessage}`);
                    }
                    clearSelection();
                    loadAccounts();
                  });
                }
              }}
            >
              Hapus
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const ids = [...selectedIds];
                Promise.all(ids.map((id) => adminService.resetPassword(id))).then((results) => {
                  const ok = results.filter((r) => r.ok).length;
                  setToast(`Reset sandi terkirim ke ${ok} akun.`);
                  clearSelection();
                });
              }}
            >
              Reset sandi
            </Button>
          </AdminBulkBar>
          <AdminDataTable
            rows={accountsMeta.total !== accountsData.length ? accounts : accounts.slice((page - 1) * 10, page * 10)}
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
              <AccountRowActions
                row={row}
                impersonatingId={impersonatingId}
                handleImpersonate={handleImpersonate}
                loadAccounts={loadAccounts}
                setToast={setToast}
                onOpenDetail={setDetailAccountId}
              />
            )}
          />
          <AdminPagination
            currentPage={page}
            totalPages={
              accountsMeta.total !== accountsData.length
                ? accountsMeta.pages
                : Math.max(1, Math.ceil(accounts.length / 10))
            }
            totalItems={accountsMeta.total !== accountsData.length ? accountsMeta.total : accounts.length}
            pageSize={10}
            onPageChange={setPage}
          />
        </>
        )
      ) : key.startsWith('accounts/') ? (
        <AccountDetailView
          accountId={key.replace('accounts/', '')}
          onBack={() => { window.location.href = '/ops/accounts'; }}
          setToast={setToast}
          onUpdated={loadAccounts}
        />
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
          {schoolsLoading ? <div className="mb-2"><AdminPill tone="info">Memuat...</AdminPill></div> : null}
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
              { key: 'seats', header: 'Seats / Renew', render: (row) => `${String(row.seats)} / ${row.renewsAt}` },
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
          {promptsLoading ? <div className="mb-2"><AdminPill tone="info">Memuat...</AdminPill></div> : null}
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
          {jobsLoading ? <div className="mb-2"><AdminPill tone="info">Memuat...</AdminPill></div> : null}
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
                  <Button
                    size="sm"
                    onClick={() => {
                      adminService.retryJob(row.id).then((res) => {
                        setToast(res.ok ? `Job ${row.id} di-retry.` : `Gagal retry: ${res.error.safeMessage}`);
                        loadJobs();
                      });
                    }}
                  >
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
          {qualityLoading ? <div className="mb-2"><AdminPill tone="info">Memuat...</AdminPill></div> : null}
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
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    adminService.triageReport(row.id, 'triaged').then((res) => {
                      setToast(res.ok ? `Report ${row.id} ditriage.` : `Gagal triage: ${res.error.safeMessage}`);
                      loadQuality();
                    });
                  }}
                >
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
          {auditLoading ? <div className="mb-2"><AdminPill tone="info">Memuat...</AdminPill></div> : null}
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
          {billingLoading ? <div className="mb-2"><AdminPill tone="info">Memuat...</AdminPill></div> : null}
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
          {flagsLoading ? <div className="mb-2"><AdminPill tone="info">Memuat...</AdminPill></div> : null}
          <AdminDataTable
            rows={flagsData}
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
                  adminService.toggleFlag(row.key).then((res) => {
                    if (res.ok) {
                      setToast(`Flag ${row.key} ${res.value.enabled ? 'diaktifkan' : 'dimatikan'}.`);
                    } else {
                      setToast(`Gagal toggle: ${res.error.safeMessage}`);
                    }
                    loadFlags();
                  });
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
          {contentLoading ? <div className="mb-2"><AdminPill tone="info">Memuat...</AdminPill></div> : null}
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
