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
  AdminContentLoading,
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
  type AdminMeta,
  type AdminAuditDetail,
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
  const [rolesEditing, setRolesEditing] = useState(false);
  const [rolesSaving, setRolesSaving] = useState(false);
  const AVAILABLE_ROLES = ['teacher', 'school_admin', 'subscriber'] as const;
  const [editRoles, setEditRoles] = useState<string[]>([]);

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
                  <label htmlFor="account-edit-name" className="block text-[12px] font-medium text-[#6d665d] mb-1.5">Nama Lengkap</label>
                  <input
                    id="account-edit-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-[#ddd4c8] bg-white px-3.5 text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                    placeholder="Nama akun"
                  />
                </div>
                <div>
                  <label htmlFor="account-edit-phone" className="block text-[12px] font-medium text-[#6d665d] mb-1.5">No. Telepon</label>
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

            {/* Role Editor Card */}
            <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-5 shadow-sm space-y-3 text-[13px]">
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-bold text-[#171717]">Role & Akses</h3>
                {!rolesEditing ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditRoles(detail.roles ?? [detail.role]);
                      setRolesEditing(true);
                    }}
                  >
                    Edit role
                  </Button>
                ) : null}
              </div>

              {!rolesEditing ? (
                <div className="flex flex-wrap gap-1.5">
                  {(detail.roles ?? [detail.role]).map((r) => (
                    <AdminPill key={r} tone={r === 'superadmin' ? 'bad' : r === 'school_admin' ? 'info' : 'neutral'}>
                      {r}
                    </AdminPill>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-[11px] text-[#6d665d]">Pilih role untuk akun ini. Perubahan langsung disimpan.</div>
                  <div className="space-y-1.5">
                    {AVAILABLE_ROLES.map((r) => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editRoles.includes(r)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditRoles((prev) => [...prev, r]);
                            } else {
                              setEditRoles((prev) => prev.filter((x) => x !== r));
                            }
                          }}
                          className="rounded accent-[#171717]"
                        />
                        <span className="text-[13px] font-medium text-[#171717]">{r}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={rolesSaving || editRoles.length === 0}
                      onClick={() => {
                        setRolesSaving(true);
                        adminService.updateRoles(accountId, editRoles).then((res) => {
                          if (res.ok) {
                            setToast(`Role akun diperbarui: ${res.value.roles.join(', ')}`);
                            setDetail({ ...detail, roles: res.value.roles, role: res.value.roles[0] as typeof detail.role ?? detail.role });
                            setRolesEditing(false);
                            onUpdated();
                          } else {
                            setToast(`Gagal: ${res.error.safeMessage}`);
                          }
                          setRolesSaving(false);
                        });
                      }}
                    >
                      {rolesSaving ? 'Menyimpan...' : 'Simpan role'}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setRolesEditing(false)}>Batal</Button>
                  </div>
                </div>
              )}
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
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Aksi untuk akun ini"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          Aksi <span className="text-[10px] ml-0.5" aria-hidden>▼</span>
        </Button>

        {isOpen && (
          <>
            {/* Backdrop to close dropdown when clicking outside */}
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 mt-1 w-40 rounded-lg border border-[#ddd4c8] bg-white py-1 shadow-lg z-40 text-left" role="menu">
              <button
                type="button"
                className="w-full px-3 py-1.5 text-[12px] text-[#171717] hover:bg-[#faf7f2] text-left transition-colors font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#171717]/30"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenDetail) {
                    onOpenDetail(row.id);
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

// ── Dashboard Trends Chart Component ────────────────────────────────────────
function DashboardTrendsChart() {
  const [trends, setTrends] = useState<{
    jobs: { day: string; count: number }[];
    quality: { day: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.dashboardTrends().then((res) => {
      if (res.ok) setTrends(res.value as any);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-5">
      <AdminContentLoading />
    </div>
  );

  if (!trends || (trends.jobs.length === 0 && trends.quality.length === 0)) return null;

  const maxJobs = Math.max(...trends.jobs.map((d) => d.count), 1);
  const maxQuality = Math.max(...trends.quality.map((d) => d.count), 1);
  const BAR_H = 48;

  function MiniBar({ data, max, color }: { data: { day: string; count: number }[]; max: number; color: string }) {
    if (data.length === 0) return <div className="text-[12px] text-[#b0a89f]">Belum ada data</div>;
    return (
      <div className="flex items-end gap-1 h-12">
        {data.map((d) => {
          const h = Math.max(2, Math.round((d.count / max) * BAR_H));
          const label = d.day.slice(5); // MM-DD
          return (
            <div key={d.day} className="flex flex-col items-center gap-0.5 flex-1" title={`${d.day}: ${d.count}`}>
              <div
                className={`w-full rounded-t-sm ${color}`}
                style={{ height: `${h}px` }}
              />
              <span className="text-[9px] text-[#b0a89f] tabular-nums">{label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[#171717]">Jobs 7 hari</h3>
          <span className="text-[11px] text-[#6d665d]">total: {trends.jobs.reduce((s, d) => s + d.count, 0)}</span>
        </div>
        <MiniBar data={trends.jobs} max={maxJobs} color="bg-[#4a7c59]" />
      </div>
      <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[#171717]">Quality reports 7 hari</h3>
          <span className="text-[11px] text-[#6d665d]">total: {trends.quality.reduce((s, d) => s + d.count, 0)}</span>
        </div>
        <MiniBar data={trends.quality} max={maxQuality} color="bg-[#c9703a]" />
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
    Promise.all([
      adminService.dashboard(),
      adminService.jobs({ limit: 4 }),
      adminService.schools({ limit: 4 }),
    ]).then(([kpiRes, jobsRes, schoolsRes]) => {
      if (kpiRes.ok) setDashboard(kpiRes.value);
      if (jobsRes.ok) {
        const jv = jobsRes.value as { data: AdminJobRow[]; meta: unknown };
        setDashboardJobs(jv.data ?? []);
      }
      if (schoolsRes.ok) {
        const sv = schoolsRes.value as { data: AdminSchoolRow[]; meta: unknown };
        setDashboardSchools(sv.data ?? []);
      }
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
  const [schoolsMeta, setSchoolsMeta] = useState({ total: 0, pages: 1 });
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolsPage, setSchoolsPage] = useState(1);
  // School detail modal
  const [schoolDetailId, setSchoolDetailId] = useState<string | null>(null);
  const [schoolDetailData, setSchoolDetailData] = useState<{
    school: { id: string; name: string; slug: string; plan: string; state: string; seats: number; renewsAt: string };
    members: { id: string; email: string; name: string; username: string | null; roles: string[]; createdAt: string }[];
    memberCount: number;
  } | null>(null);
  const [schoolDetailLoading, setSchoolDetailLoading] = useState(false);
  const [schoolRenameValue, setSchoolRenameValue] = useState('');
  const [schoolRenameSaving, setSchoolRenameSaving] = useState(false);

  const [jobsData, setJobsData] = useState<JobRow[]>([]);
  const [jobsMeta, setJobsMeta] = useState({ total: 0, pages: 1 });
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsPage, setJobsPage] = useState(1);
  // Job detail modal
  const [jobDetailId, setJobDetailId] = useState<string | null>(null);
  const [jobDetailData, setJobDetailData] = useState<Record<string, unknown> | null>(null);
  const [jobDetailLoading, setJobDetailLoading] = useState(false);

  const [qualityData, setQualityData] = useState<QualityRow[]>([]);
  const [qualityMeta, setQualityMeta] = useState({ total: 0, pages: 1 });
  const [qualityLoading, setQualityLoading] = useState(false);
  // Quality detail modal
  const [qualityDetailId, setQualityDetailId] = useState<string | null>(null);
  const [qualityDetailData, setQualityDetailData] = useState<{ id: string; reason: string; status: string; reporter: string; notes: string; workspaceId: string; createdAt: string } | null>(null);
  const [qualityDetailLoading, setQualityDetailLoading] = useState(false);
  const [qualityNotesDraft, setQualityNotesDraft] = useState('');
  const [qualityNotesSaving, setQualityNotesSaving] = useState(false);
  const [qualityPage, setQualityPage] = useState(1);

  const [billingData, setBillingData] = useState<BillingRow[]>([]);
  const [billingMeta, setBillingMeta] = useState({ total: 0, pages: 1 });
  const [billingLoading, setBillingLoading] = useState(false);

  const [flagsData, setFlagsData] = useState<FlagRow[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(false);

  const [promptsData, setPromptsData] = useState<AdminPromptRow[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(false);

  const [auditData, setAuditData] = useState<AdminAuditRow[]>([]);
  const [auditMeta, setAuditMeta] = useState<AdminMeta>({ total: 0, page: 1, limit: 20, pages: 1 });
  const [auditPage, setAuditPage] = useState(1);
  const [auditLoading, setAuditLoading] = useState(false);

  const [contentData, setContentData] = useState<ContentRow[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentPage, setContentPage] = useState(1);
  const [contentMeta, setContentMeta] = useState({ total: 0, pages: 1 });

  // ── Audit detail modal state ─────────────────────────────────────────
  const [auditDetailId, setAuditDetailId] = useState<string | null>(null);
  const [auditDetailData, setAuditDetailData] = useState<AdminAuditDetail | null>(null);
  const [auditDetailLoading, setAuditDetailLoading] = useState(false);
  const [filterAuditAction, setFilterAuditAction] = useState('');
  const [filterAuditActor, setFilterAuditActor] = useState('');

  // ── Billing modal state ───────────────────────────────────────────────
  const [billingEditRow, setBillingEditRow] = useState<BillingRow | null>(null);
  const [billingEditState, setBillingEditState] = useState<BillingRow['state']>('active');
  const [billingEditSeats, setBillingEditSeats] = useState('');
  const [billingEditRenews, setBillingEditRenews] = useState('');
  const [billingEditLoading, setBillingEditLoading] = useState(false);
  const [billingPage, setBillingPage] = useState(1);

  // Payment orders state
  const [billingTab, setBillingTab] = useState<'langganan' | 'orders'>('langganan');
  const [paymentOrdersData, setPaymentOrdersData] = useState<import('@/src/services/admin/adminService').PaymentOrder[]>([]);
  const [paymentOrdersMeta, setPaymentOrdersMeta] = useState({ total: 0, pages: 1 });
  const [paymentOrdersLoading, setPaymentOrdersLoading] = useState(false);
  const [paymentOrdersPage, setPaymentOrdersPage] = useState(1);
  const [filterOrderStatus, setFilterOrderStatus] = useState('');

  // ── Catalog state ─────────────────────────────────────────────────────
  const [catalogGrades, setCatalogGrades] = useState<{ id: string; label: string; status: string }[]>([]);
  const [catalogSubjects, setCatalogSubjects] = useState<{ id: string; label: string; status: string }[]>([]);
  const [catalogSelectedGrade, setCatalogSelectedGrade] = useState<string>('');
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogSubjectsLoading, setCatalogSubjectsLoading] = useState(false);
  const [catalogUpdatingIds, setCatalogUpdatingIds] = useState<Set<string>>(new Set());
  const [catalogShowAddGrade, setCatalogShowAddGrade] = useState(false);
  const [catalogNewGradeLabel, setCatalogNewGradeLabel] = useState('');
  const [catalogAddingGrade, setCatalogAddingGrade] = useState(false);
  const [catalogShowAddSubject, setCatalogShowAddSubject] = useState(false);
  const [catalogNewSubjectLabel, setCatalogNewSubjectLabel] = useState('');
  const [catalogAddingSubject, setCatalogAddingSubject] = useState(false);
  const [createPromptOpen, setCreatePromptOpen] = useState(false);
  const [createPromptName, setCreatePromptName] = useState('');
  const [createPromptSlug, setCreatePromptSlug] = useState('');
  const [createPromptDesc, setCreatePromptDesc] = useState('');
  const [createPromptText, setCreatePromptText] = useState('');
  const [createPromptLoading, setCreatePromptLoading] = useState(false);

  // ── Learning Signals state ────────────────────────────────────────────
  const [signalsData, setSignalsData] = useState<{ prompt_template_id: string; pattern: string; frequency: number; avg_rating: number; suggested_action: string }[]>([]);
  const [signalsLoading, setSignalsLoading] = useState(false);
  const [createFlagOpen, setCreateFlagOpen] = useState(false);
  const [createFlagKey, setCreateFlagKey] = useState('');
  const [createFlagDesc, setCreateFlagDesc] = useState('');
  const [createFlagScope, setCreateFlagScope] = useState<'global' | 'pilot'>('global');
  const [createFlagLoading, setCreateFlagLoading] = useState(false);

  // ── Create School modal state ─────────────────────────────────────────
  const [createSchoolOpen, setCreateSchoolOpen] = useState(false);
  const [createSchoolName, setCreateSchoolName] = useState('');
  const [createSchoolSlug, setCreateSchoolSlug] = useState('');
  const [createSchoolLoading, setCreateSchoolLoading] = useState(false);

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
  const loadSchools = (
    pg = schoolsPage,
    searchVal = search,
    planVal = filterPlan,
  ) => {
    setSchoolsLoading(true);
    adminService
      .schools({ q: searchVal || undefined, plan: planVal || undefined, page: pg, limit: 10 })
      .then((res) => {
        if (res.ok) {
          const val = res.value as { data: SchoolRow[]; meta: { total: number; pages: number } };
          setSchoolsData(val.data ?? []);
          setSchoolsMeta({ total: val.meta?.total ?? 0, pages: val.meta?.pages ?? 1 });
        }
        setSchoolsLoading(false);
      });
  };
  const loadJobs = (
    pg = jobsPage,
    searchVal = search,
    statusVal = filterJobStatus,
  ) => {
    setJobsLoading(true);
    adminService
      .jobs({ q: searchVal || undefined, status: statusVal || undefined, page: pg, limit: 20 })
      .then((res) => {
        if (res.ok) {
          const val = res.value as { data: JobRow[]; meta: { total: number; pages: number } };
          setJobsData(val.data ?? []);
          setJobsMeta({ total: val.meta?.total ?? 0, pages: val.meta?.pages ?? 1 });
        }
        setJobsLoading(false);
      });
  };
  const loadQuality = (
    pg = qualityPage,
    searchVal = search,
    statusVal = filterQuality,
  ) => {
    setQualityLoading(true);
    adminService
      .qualityReports({ status: statusVal || undefined, q: searchVal || undefined, page: pg, limit: 20 })
      .then((res) => {
        if (res.ok) {
          const val = res.value as { data: QualityRow[]; meta: { total: number; pages: number } };
          setQualityData(val.data ?? []);
          setQualityMeta({ total: val.meta?.total ?? 0, pages: val.meta?.pages ?? 1 });
        }
        setQualityLoading(false);
      });
  };
  const loadBilling = (stateFilter = filterBilling, searchVal = search, pg = billingPage) => {
    setBillingLoading(true);
    adminService.billing({
      state: stateFilter || undefined,
      q: searchVal || undefined,
      page: pg,
      limit: 10,
    }).then((res) => {
      if (res.ok) {
        const val = res.value as any;
        if (val?.data && val?.meta) {
          setBillingData(val.data);
          setBillingMeta({ total: val.meta.total, pages: val.meta.pages });
        } else {
          setBillingData(Array.isArray(val) ? val : []);
        }
      }
      setBillingLoading(false);
    });
  };
  const loadPaymentOrders = (statusFilter = filterOrderStatus, pg = paymentOrdersPage) => {
    setPaymentOrdersLoading(true);
    adminService.paymentOrders({ status: statusFilter || undefined, page: pg, limit: 20 })
      .then((res) => {
        if (res.ok) {
          const val = res.value as any;
          setPaymentOrdersData(Array.isArray(val) ? val : (val?.data ?? []));
          setPaymentOrdersMeta(val?.meta ?? { total: 0, pages: 1 });
        }
        setPaymentOrdersLoading(false);
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
  const loadAudit = (page: number) => {
    setAuditLoading(true);
    adminService.auditLogs({ page, limit: 20 }).then((res) => {
      if (res.ok) {
        const val = res.value as any;
        if (val?.data && val?.meta) {
          setAuditData(val.data);
          setAuditMeta(val.meta);
        } else {
          setAuditData(Array.isArray(val) ? val : (val?.data ?? []));
        }
      }
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
  // accounts — reactive to page, search, role, status
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'accounts') {
      loadAccounts(page, search, filterRole, filterStatus);
    }
  }, [key, page, search, filterRole, filterStatus]);

  // schools — reactive to search + plan filter; page managed separately
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'schools') {
      setSchoolsPage(1);
      loadSchools(1, search, filterPlan);
    }
  }, [key, search, filterPlan]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'schools') loadSchools(schoolsPage, search, filterPlan);
  }, [schoolsPage]);

  // jobs — reactive to search + status filter; page managed separately
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'jobs') {
      setJobsPage(1);
      loadJobs(1, search, filterJobStatus);
    }
  }, [key, search, filterJobStatus]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'jobs') loadJobs(jobsPage, search, filterJobStatus);
  }, [jobsPage]);

  // quality — reactive to search + status filter; page managed separately
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'quality') {
      setQualityPage(1);
      loadQuality(1, search, filterQuality);
    }
  }, [key, search, filterQuality]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'quality') loadQuality(qualityPage, search, filterQuality);
  }, [qualityPage]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'billing') loadBilling(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'billing') loadBilling(filterBilling, search, billingPage); }, [billingPage]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'billing' && billingTab === 'orders') loadPaymentOrders(); }, [key, billingTab]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'billing' && billingTab === 'orders') loadPaymentOrders(filterOrderStatus, paymentOrdersPage); }, [paymentOrdersPage]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'flags') loadFlags(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'prompts') loadPrompts(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'content') loadContent(); }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (key === 'content') loadContent(); }, [contentPage]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'catalog') {
      setCatalogLoading(true);
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
      fetch(`${base}/catalog/grades`, { credentials: 'include' })
        .then((r) => r.json())
        .then((j) => {
          setCatalogGrades(j?.data ?? []);
          setCatalogLoading(false);
          const firstGrade = j?.data?.[0]?.id;
          if (firstGrade) {
            setCatalogSelectedGrade(firstGrade);
            setCatalogSubjectsLoading(true);
            fetch(`${base}/catalog/subjects?gradeId=${firstGrade}`, { credentials: 'include' })
              .then((r) => r.json())
              .then((js) => {
                setCatalogSubjects(js?.data ?? []);
                setCatalogSubjectsLoading(false);
              })
              .catch(() => setCatalogSubjectsLoading(false));
          }
        })
        .catch(() => setCatalogLoading(false));
    }
  }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'learning-signals') {
      setSignalsLoading(true);
      adminService.learningSignals().then((res) => {
        if (res.ok) {
          const val = res.value as any;
          setSignalsData(Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : []);
        }
        setSignalsLoading(false);
      });
    }
  }, [key]);

  // audit — reactive to page
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'audit') {
      setAuditPage(1);
      loadAudit(1);
    }
  }, [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (key === 'audit') loadAudit(auditPage);
  }, [auditPage]);

  
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

  // Reset shared `page` (accounts) when its filters change; schools/jobs/quality have own page state
  useEffect(() => {
    setPage(1);
  }, [
    search,
    filterRole,
    filterStatus,
    filterBilling,
    filterContent,
    key,
  ]);

  // accounts — server-filtered; client memo just exposes data as-is
  const accounts = useMemo(() => accountsData, [accountsData]);

  // schools — server-filtered; client memo just exposes data as-is
  const schools = useMemo(() => schoolsData, [schoolsData]);

  // jobs — server-filtered; client memo just exposes data as-is
  const jobs = useMemo(() => jobsData, [jobsData]);

  // quality — server-filtered; client memo just exposes data as-is
  const quality = useMemo(() => qualityData, [qualityData]);

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
          <div className="flex items-center justify-between px-1 py-1">
            <h2 className="text-[18px] font-bold text-[#171717]">Ringkasan platform</h2>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => { loadDashboard(); setToast('Refresh ringkasan...'); }}
              >
                Refresh
              </Button>
              <Button size="sm" onClick={() => { window.location.href = '/ops/jobs?status=failed'; }}>
                Review job gagal
              </Button>
            </div>
          </div>
          <AdminStatCards
            items={[
              {
                label: 'Job aktif',
                value: dashboard ? String(dashboard.jobsActive) : '—',
                hint: dashboardLoading ? 'memuat...' : 'running + queued',
                tone: 'info',
                delta: 'live',
              },
              {
                label: 'Job gagal',
                value: dashboard ? String(dashboard.jobsFailed) : '—',
                hint: dashboardLoading ? 'memuat...' : 'butuh retry',
                tone: (dashboard?.jobsFailed ?? 0) > 0 ? 'bad' : 'ok',
                delta: (dashboard?.jobsFailed ?? 0) > 0 ? 'P0' : '✓',
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
                delta: String(dashboard?.schools ?? '—') + ' sekolah',
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

          {/* 7-day trend charts from /v1/admin/dashboard/trends */}
          <DashboardTrendsChart />
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
          {accountsLoading ? <AdminContentLoading /> : null}
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
          <div className="flex items-center justify-between px-1 py-1">
            <h2 className="text-[18px] font-bold text-[#171717]">Sekolah / tenant</h2>
            <Button size="sm" onClick={() => setCreateSchoolOpen(true)}>
              Tambah sekolah
            </Button>
          </div>

          {/* Create School inline form */}
          {createSchoolOpen && key === 'schools' ? (
            <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-3 shadow-sm">
              <h4 className="text-[13px] font-bold text-[#171717]">Sekolah baru</h4>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="create-school-name" className="block text-[11px] font-semibold text-[#6d665d] mb-1">Nama sekolah *</label>
                  <input
                    id="create-school-name"
                    type="text"
                    value={createSchoolName}
                    onChange={(e) => setCreateSchoolName(e.target.value)}
                    placeholder="cth: SMA Negeri 1 Jakarta"
                    className="h-9 w-64 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] text-[#171717] placeholder:text-[#b0a89f] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                  />
                </div>
                <div>
                  <label htmlFor="create-school-slug" className="block text-[11px] font-semibold text-[#6d665d] mb-1">Slug (opsional)</label>
                  <input
                    id="create-school-slug"
                    type="text"
                    value={createSchoolSlug}
                    onChange={(e) => setCreateSchoolSlug(e.target.value)}
                    placeholder="sma-negeri-1-jakarta"
                    className="h-9 w-52 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] text-[#171717] placeholder:text-[#b0a89f] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                  />
                </div>
                <Button
                  size="sm"
                  disabled={createSchoolLoading || !createSchoolName.trim()}
                  onClick={() => {
                    setCreateSchoolLoading(true);
                    adminService.createSchool({
                      name: createSchoolName.trim(),
                      slug: createSchoolSlug.trim() || undefined,
                    }).then((res) => {
                      if (res.ok) {
                        setToast(`Sekolah "${createSchoolName}" berhasil dibuat.`);
                        setCreateSchoolName('');
                        setCreateSchoolSlug('');
                        setCreateSchoolOpen(false);
                        loadSchools(1);
                      } else {
                        setToast(`Gagal: ${res.error.safeMessage}`);
                      }
                      setCreateSchoolLoading(false);
                    });
                  }}
                >
                  {createSchoolLoading ? 'Menyimpan...' : 'Buat'}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => { setCreateSchoolOpen(false); setCreateSchoolName(''); setCreateSchoolSlug(''); }}>Batal</Button>
              </div>
            </div>
          ) : null}

          {schoolsLoading ? <AdminContentLoading /> : null}

          {/* School detail modal */}
          {schoolDetailId ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setSchoolDetailId(null); setSchoolDetailData(null); }}>
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[16px] text-[#171717]">Detail Sekolah</h3>
                  <button className="text-[#6d665d] hover:text-[#171717] text-xl" onClick={() => { setSchoolDetailId(null); setSchoolDetailData(null); }}>×</button>
                </div>
                {schoolDetailLoading ? (
                  <div className="text-[13px] text-[#6d665d]">Memuat...</div>
                ) : schoolDetailData ? (
                  <div className="space-y-4">
                    {/* Info + rename */}
                    <div className="grid grid-cols-3 gap-x-3 gap-y-2 text-[13px]">
                      <span className="font-semibold text-[#6d665d]">Nama</span>
                      <span className="col-span-2 font-semibold">{schoolDetailData.school.name}</span>
                      <span className="font-semibold text-[#6d665d]">Slug</span>
                      <span className="col-span-2 font-mono text-[11px]">{schoolDetailData.school.slug}</span>
                      <span className="font-semibold text-[#6d665d]">Plan</span>
                      <span className="col-span-2"><AdminPill tone={planTone(schoolDetailData.school.plan as SchoolRow['plan'])}>{schoolDetailData.school.plan}</AdminPill></span>
                      <span className="font-semibold text-[#6d665d]">State</span>
                      <span className="col-span-2"><AdminPill tone={billingTone(schoolDetailData.school.state as BillingRow['state'])}>{schoolDetailData.school.state}</AdminPill></span>
                      <span className="font-semibold text-[#6d665d]">Seats</span>
                      <span className="col-span-2 tabular-nums">{schoolDetailData.school.seats}</span>
                      <span className="font-semibold text-[#6d665d]">Member</span>
                      <span className="col-span-2 tabular-nums">{schoolDetailData.memberCount}</span>
                    </div>

                    {/* Rename */}
                    <div className="border-t border-[#eee6da] pt-3 space-y-2">
                      <div className="text-[12px] font-semibold text-[#171717]">Ganti nama sekolah</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={schoolRenameValue}
                          onChange={(e) => setSchoolRenameValue(e.target.value)}
                          className="flex-1 h-9 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                        />
                        <Button
                          size="sm"
                          disabled={schoolRenameSaving || !schoolRenameValue.trim() || schoolRenameValue === schoolDetailData.school.name}
                          onClick={() => {
                            setSchoolRenameSaving(true);
                            adminService.renameSchool(schoolDetailId, schoolRenameValue.trim()).then((res) => {
                              if (res.ok) {
                                setToast(`Sekolah berhasil diganti nama.`);
                                loadSchools();
                                setSchoolDetailData({ ...schoolDetailData, school: { ...schoolDetailData.school, name: schoolRenameValue.trim() } });
                              } else {
                                setToast(`Gagal: ${res.error.safeMessage}`);
                              }
                              setSchoolRenameSaving(false);
                            });
                          }}
                        >
                          {schoolRenameSaving ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                      </div>
                    </div>

                    {/* Members list */}
                    <div className="border-t border-[#eee6da] pt-3 space-y-2">
                      <div className="text-[12px] font-semibold text-[#171717]">Anggota ({schoolDetailData.memberCount})</div>
                      <div className="rounded-xl border border-[#ddd4c8]/60 overflow-hidden">
                        {schoolDetailData.members.length === 0 ? (
                          <div className="p-4 text-[12px] text-[#6d665d]">Belum ada anggota.</div>
                        ) : (
                          <table className="w-full text-[12px]">
                            <thead className="bg-[#faf8f5]">
                              <tr>
                                <th className="text-left px-3 py-2 font-semibold text-[#6d665d]">Nama</th>
                                <th className="text-left px-3 py-2 font-semibold text-[#6d665d]">Email</th>
                                <th className="text-left px-3 py-2 font-semibold text-[#6d665d]">Role</th>
                              </tr>
                            </thead>
                            <tbody>
                              {schoolDetailData.members.map((m) => (
                                <tr key={m.id} className="border-t border-[#f0e8de]">
                                  <td className="px-3 py-2">{m.name || m.username || '—'}</td>
                                  <td className="px-3 py-2 text-[#6d665d]">{m.email}</td>
                                  <td className="px-3 py-2">
                                    <AdminPill tone={m.roles.includes('school_admin') ? 'info' : 'neutral'}>
                                      {m.roles[0] ?? 'subscriber'}
                                    </AdminPill>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <div className="border-t border-[#eee6da] pt-3">
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm(`Hapus sekolah "${schoolDetailData.school.name}"? Aksi ini tidak bisa dibatalkan.`)) {
                            adminService.deleteSchool(schoolDetailId).then((res) => {
                              if (res.ok) {
                                setToast(`Sekolah dihapus.`);
                                setSchoolDetailId(null);
                                setSchoolDetailData(null);
                                loadSchools();
                              } else {
                                setToast(`Gagal: ${res.error.safeMessage}`);
                              }
                            });
                          }
                        }}
                      >
                        Hapus sekolah ini
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[13px] text-[#6d665d]">Tidak ada data.</div>
                )}
              </div>
            </div>
          ) : null}
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari sekolah / owner / plan"
            filters={
              <div className="flex items-center gap-2">
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value as typeof filterPlan)}
                  className="h-9 rounded-xl border border-[#ddd4c8] bg-white pl-3 pr-8 text-[12px] font-medium text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20 cursor-pointer"
                >
                  <option value="">Semua plan</option>
                  <option value="pilot">pilot</option>
                  <option value="active">active</option>
                  <option value="grace">grace</option>
                  <option value="blocked">blocked</option>
                </select>
              </div>
            }
          />
          <AdminDataTable
            rows={schools}
            emptyLabel="Tidak ada sekolah yang cocok."
            emptyHint="Coba hapus filter plan atau ubah kata kunci."
            columns={[
              { key: 'name', header: 'Sekolah', render: (row) => <span className="font-semibold">{row.name}</span> },
              {
                key: 'plan',
                header: 'Plan',
                render: (row) => <AdminPill tone={planTone(row.plan)}>{row.plan}</AdminPill>,
              },
              { key: 'teachers', header: 'Guru', render: (row) => <span className="tabular-nums">{String(row.teachers)}</span> },
              { key: 'seats', header: 'Seats', render: (row) => <span className="tabular-nums">{String(row.seats)}</span> },
              { key: 'renew', header: 'Perpanjangan', render: (row) => <span className="text-[11px] text-[#6d665d]">{row.renewsAt}</span> },
              { key: 'owner', header: 'Owner', render: (row) => <span className="text-[12px]">{row.owner}</span> },
            ]}
            rowActions={(row) => (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSchoolDetailId(row.id);
                    setSchoolDetailLoading(true);
                    setSchoolDetailData(null);
                    setSchoolRenameValue(row.name);
                    adminService.schoolDetail(row.id).then((res) => {
                      if (res.ok) setSchoolDetailData(res.value);
                      setSchoolDetailLoading(false);
                    });
                  }}
                >
                  Detail
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(`/ops?section=billing&q=${encodeURIComponent(row.name)}`, '_self')}
                >
                  Billing
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const nextPlan = row.plan === 'active' ? 'grace' : row.plan === 'grace' ? 'blocked' : 'active';
                    const entitlementPlan: 'pro' | 'free' = (nextPlan === 'active') ? 'pro' : 'free';
                    if (confirm(`Ubah plan ${row.name} dari "${row.plan}" ke "${nextPlan}"?`)) {
                      adminService.setEntitlement(row.id, { plan: entitlementPlan }).then((res) => {
                        if (res.ok) {
                          setToast(`Entitlement ${row.name} diperbarui ke ${nextPlan}.`);
                          loadSchools();
                        } else {
                          setToast(`Gagal: ${res.error.safeMessage}`);
                        }
                      });
                    }
                  }}
                >
                  Ubah plan
                </Button>
              </div>
            )}
          />
          <AdminPagination
            currentPage={schoolsPage}
            totalPages={schoolsMeta.pages}
            totalItems={schoolsMeta.total}
            pageSize={10}
            onPageChange={setSchoolsPage}
          />
        </>
      ) : null}

      {key === 'catalog' ? (
        <>
          <AdminPageHeader
            title="Katalog"
            description="Grade, mapel, dan material yang dipakai generator soal."
            meta={
              catalogGrades.length > 0 ? (
                <AdminPill tone="ok">{catalogGrades.filter((g) => g.status === 'active').length} grade aktif</AdminPill>
              ) : null
            }
            actions={
              <Button size="sm" variant="secondary" onClick={() => {
                setCatalogLoading(true);
                const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
                fetch(`${base}/catalog/grades`, { credentials: 'include' }).then((r) => r.json()).then((j) => {
                  setCatalogGrades(j?.data ?? []);
                  setCatalogLoading(false);
                  const cur = catalogSelectedGrade || j?.data?.[0]?.id;
                  if (cur) {
                    setCatalogSelectedGrade(cur);
                    setCatalogSubjectsLoading(true);
                    fetch(`${base}/catalog/subjects?gradeId=${cur}`, { credentials: 'include' })
                      .then((r) => r.json()).then((js) => { setCatalogSubjects(js?.data ?? []); setCatalogSubjectsLoading(false); })
                      .catch(() => setCatalogSubjectsLoading(false));
                  }
                }).catch(() => setCatalogLoading(false));
              }}>
                Refresh
              </Button>
            }
          />
          {catalogLoading ? <AdminContentLoading /> : null}

          <AdminStatCards
            items={[
              {
                label: 'Grade',
                value: catalogLoading ? '…' : String(catalogGrades.length),
                hint: `${catalogGrades.filter((g) => g.status === 'active').length} aktif`,
                tone: 'ok',
              },
              {
                label: 'Mapel',
                value: catalogSubjectsLoading ? '…' : String(catalogSubjects.length),
                hint: catalogSelectedGrade ? `untuk ${catalogGrades.find((g) => g.id === catalogSelectedGrade)?.label ?? catalogSelectedGrade}` : 'pilih grade',
                tone: 'info',
              },
            ]}
          />

          {/* Grade list + Subjects list */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* ── Grades ── */}
            <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-3">
              {/* Header grade */}
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-[#171717]">Grade ({catalogGrades.length})</h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => { setCatalogShowAddGrade((v) => !v); setCatalogNewGradeLabel(''); }}
                >
                  {catalogShowAddGrade ? 'Batal' : '+ Tambah'}
                </Button>
              </div>

              {/* Form tambah grade */}
              {catalogShowAddGrade && (
                <form
                  className="flex gap-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const label = catalogNewGradeLabel.trim();
                    if (!label) return;
                    setCatalogAddingGrade(true);
                    const res = await adminService.createGrade({ label });
                    if (res.ok) {
                      setToast(`Grade "${label}" berhasil ditambahkan.`);
                      setCatalogShowAddGrade(false);
                      setCatalogNewGradeLabel('');
                      // reload grades
                      setCatalogLoading(true);
                      const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
                      fetch(`${base}/catalog/grades`, { credentials: 'include' }).then((r) => r.json()).then((j) => {
                        setCatalogGrades(j?.data ?? []);
                        setCatalogLoading(false);
                      }).catch(() => setCatalogLoading(false));
                    } else {
                      setToast(`Gagal tambah grade: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
                    }
                    setCatalogAddingGrade(false);
                  }}
                >
                  <input
                    className="flex-1 rounded-xl border border-[#ddd4c8] px-3 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                    placeholder="Label grade, mis. Kelas 10"
                    value={catalogNewGradeLabel}
                    onChange={(e) => setCatalogNewGradeLabel(e.target.value)}
                    disabled={catalogAddingGrade}
                  />
                  <Button size="sm" type="submit" disabled={catalogAddingGrade || !catalogNewGradeLabel.trim()}>
                    {catalogAddingGrade ? '…' : 'Simpan'}
                  </Button>
                </form>
              )}

              {/* Grade list */}
              {catalogGrades.length === 0 && !catalogLoading ? (
                <div className="text-[12px] text-[#6d665d]">Belum ada data grade.</div>
              ) : (
                <div className="space-y-1">
                  {catalogGrades.map((g) => {
                    const isUpdating = catalogUpdatingIds.has(g.id);
                    return (
                      <div
                        key={g.id}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12px] transition-colors ${
                          catalogSelectedGrade === g.id ? 'bg-[#171717] text-white font-semibold' : 'hover:bg-[#faf8f5] text-[#171717]'
                        }`}
                      >
                        {/* Label — klik untuk pilih grade */}
                        <button
                          className="flex-1 text-left"
                          onClick={() => {
                            setCatalogSelectedGrade(g.id);
                            setCatalogSubjectsLoading(true);
                            const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
                            fetch(`${base}/catalog/subjects?gradeId=${g.id}`, { credentials: 'include' })
                              .then((r) => r.json()).then((j) => { setCatalogSubjects(j?.data ?? []); setCatalogSubjectsLoading(false); })
                              .catch(() => setCatalogSubjectsLoading(false));
                          }}
                        >
                          <span>{g.label}</span>
                        </button>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 ml-2 shrink-0">
                          <AdminPill tone={g.status === 'active' ? 'ok' : 'neutral'}>{g.status}</AdminPill>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={isUpdating}
                            onClick={async () => {
                              setCatalogUpdatingIds((s) => new Set(s).add(g.id));
                              const next = g.status === 'active' ? 'archived' : 'active';
                              const res = await adminService.updateGradeStatus(g.id, next);
                              if (res.ok) {
                                setCatalogGrades((prev) => prev.map((x) => x.id === g.id ? { ...x, status: next } : x));
                                setToast(`Status grade "${g.label}" → ${next}.`);
                              } else {
                                setToast(`Gagal: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
                              }
                              setCatalogUpdatingIds((s) => { const n = new Set(s); n.delete(g.id); return n; });
                            }}
                          >
                            {isUpdating ? '…' : g.status === 'active' ? 'Archive' : 'Aktifkan'}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={isUpdating}
                            onClick={async () => {
                              if (!confirm(`Archive & hapus grade "${g.label}"?`)) return;
                              setCatalogUpdatingIds((s) => new Set(s).add(g.id));
                              const res = await adminService.archiveGrade(g.id);
                              if (res.ok) {
                                setCatalogGrades((prev) => prev.filter((x) => x.id !== g.id));
                                setToast(`Grade "${g.label}" diarsipkan.`);
                              } else {
                                setToast(`Gagal: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
                              }
                              setCatalogUpdatingIds((s) => { const n = new Set(s); n.delete(g.id); return n; });
                            }}
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Subjects ── */}
            <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-3">
              {/* Header subjects */}
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-[#171717]">
                  Mapel — {catalogGrades.find((g) => g.id === catalogSelectedGrade)?.label ?? 'pilih grade'}
                </h3>
                {catalogSelectedGrade && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { setCatalogShowAddSubject((v) => !v); setCatalogNewSubjectLabel(''); }}
                  >
                    {catalogShowAddSubject ? 'Batal' : '+ Tambah'}
                  </Button>
                )}
              </div>

              {/* Form tambah mapel */}
              {catalogShowAddSubject && catalogSelectedGrade && (
                <form
                  className="flex gap-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const label = catalogNewSubjectLabel.trim();
                    if (!label) return;
                    setCatalogAddingSubject(true);
                    const res = await adminService.createSubject({ label });
                    if (res.ok) {
                      setToast(`Mapel "${label}" berhasil ditambahkan.`);
                      setCatalogShowAddSubject(false);
                      setCatalogNewSubjectLabel('');
                      // reload subjects
                      setCatalogSubjectsLoading(true);
                      const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
                      fetch(`${base}/catalog/subjects?gradeId=${catalogSelectedGrade}`, { credentials: 'include' })
                        .then((r) => r.json()).then((j) => { setCatalogSubjects(j?.data ?? []); setCatalogSubjectsLoading(false); })
                        .catch(() => setCatalogSubjectsLoading(false));
                    } else {
                      setToast(`Gagal tambah mapel: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
                    }
                    setCatalogAddingSubject(false);
                  }}
                >
                  <input
                    className="flex-1 rounded-xl border border-[#ddd4c8] px-3 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                    placeholder="Label mapel, mis. Matematika"
                    value={catalogNewSubjectLabel}
                    onChange={(e) => setCatalogNewSubjectLabel(e.target.value)}
                    disabled={catalogAddingSubject}
                  />
                  <Button size="sm" type="submit" disabled={catalogAddingSubject || !catalogNewSubjectLabel.trim()}>
                    {catalogAddingSubject ? '…' : 'Simpan'}
                  </Button>
                </form>
              )}

              {/* Subjects list */}
              {catalogSubjectsLoading ? (
                <div className="text-[12px] text-[#6d665d]">Memuat mapel...</div>
              ) : catalogSubjects.length === 0 ? (
                <div className="text-[12px] text-[#6d665d]">
                  {catalogSelectedGrade ? 'Belum ada mapel untuk grade ini.' : 'Pilih grade untuk melihat mapel.'}
                </div>
              ) : (
                <div className="space-y-1">
                  {catalogSubjects.map((s) => {
                    const isUpdating = catalogUpdatingIds.has(s.id);
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#faf8f5] text-[12px]"
                      >
                        <span className="text-[#171717] flex-1">{s.label}</span>
                        <div className="flex items-center gap-1.5 ml-2 shrink-0">
                          <AdminPill tone={s.status === 'active' ? 'ok' : 'neutral'}>{s.status}</AdminPill>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={isUpdating}
                            onClick={async () => {
                              setCatalogUpdatingIds((prev) => new Set(prev).add(s.id));
                              const next = s.status === 'active' ? 'archived' : 'active';
                              const res = await adminService.updateSubjectStatus(s.id, next);
                              if (res.ok) {
                                setCatalogSubjects((prev) => prev.map((x) => x.id === s.id ? { ...x, status: next } : x));
                                setToast(`Status mapel "${s.label}" → ${next}.`);
                              } else {
                                setToast(`Gagal: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
                              }
                              setCatalogUpdatingIds((prev) => { const n = new Set(prev); n.delete(s.id); return n; });
                            }}
                          >
                            {isUpdating ? '…' : s.status === 'active' ? 'Archive' : 'Aktifkan'}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={isUpdating}
                            onClick={async () => {
                              if (!confirm(`Archive & hapus mapel "${s.label}"?`)) return;
                              setCatalogUpdatingIds((prev) => new Set(prev).add(s.id));
                              const res = await adminService.archiveSubject(s.id);
                              if (res.ok) {
                                setCatalogSubjects((prev) => prev.filter((x) => x.id !== s.id));
                                setToast(`Mapel "${s.label}" diarsipkan.`);
                              } else {
                                setToast(`Gagal: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
                              }
                              setCatalogUpdatingIds((prev) => { const n = new Set(prev); n.delete(s.id); return n; });
                            }}
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      {key === 'prompts' ? (
        <>
          <AdminPageHeader
            title="Prompt library"
            description="Template prompt internal untuk generate, repair, dan quality check."
            meta={
              <AdminPill tone="ok">
                {promptsData.filter((p) => p.status === 'active').length} aktif
              </AdminPill>
            }
            actions={
              <Button size="sm" onClick={() => setCreatePromptOpen(true)}>
                Buat prompt
              </Button>
            }
          />
          {promptsLoading ? <AdminContentLoading /> : null}

          {/* Create Prompt inline form */}
          {createPromptOpen ? (
            <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-3 shadow-sm">
              <h4 className="text-[13px] font-bold text-[#171717]">Prompt baru</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="create-prompt-name" className="block text-[11px] font-semibold text-[#6d665d] mb-1">Nama *</label>
                  <input
                    type="text"
                    value={createPromptName}
                    onChange={(e) => {
                      setCreatePromptName(e.target.value);
                      if (!createPromptSlug) {
                        setCreatePromptSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                      }
                    }}
                    placeholder="cth: Question Generator v3"
                    className="w-full h-9 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                  />
                </div>
                <div>
                  <label htmlFor="create-prompt-slug" className="block text-[11px] font-semibold text-[#6d665d] mb-1">Slug *</label>
                  <input
                    type="text"
                    value={createPromptSlug}
                    onChange={(e) => setCreatePromptSlug(e.target.value)}
                    placeholder="question-generator-v3"
                    className="w-full h-9 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="create-prompt-desc" className="block text-[11px] font-semibold text-[#6d665d] mb-1">Deskripsi singkat</label>
                  <input
                    type="text"
                    id="create-prompt-desc"
                    value={createPromptDesc}
                    onChange={(e) => setCreatePromptDesc(e.target.value)}
                    placeholder="Untuk apa prompt ini dipakai?"
                    className="w-full h-9 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="create-prompt-text" className="block text-[11px] font-semibold text-[#6d665d] mb-1">Teks prompt awal</label>
                  <textarea
                    rows={4}
                    id="create-prompt-text"
                    value={createPromptText}
                    onChange={(e) => setCreatePromptText(e.target.value)}
                    placeholder="Tulis instruksi prompt di sini. Bisa diubah lagi setelah dibuat."
                    className="w-full rounded-xl border border-[#ddd4c8] bg-white px-3 py-2 text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-[#171717]/20 resize-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  disabled={createPromptLoading || !createPromptName.trim() || !createPromptSlug.trim()}
                  onClick={() => {
                    setCreatePromptLoading(true);
                    adminService.createPrompt({
                      name: createPromptName.trim(),
                      slug: createPromptSlug.trim(),
                      description: createPromptDesc.trim() || undefined,
                      promptText: createPromptText.trim() || undefined,
                    }).then((res) => {
                      if (res.ok) {
                        setToast(`Prompt "${createPromptName}" berhasil dibuat.`);
                        setCreatePromptOpen(false);
                        setCreatePromptName('');
                        setCreatePromptSlug('');
                        setCreatePromptDesc('');
                        setCreatePromptText('');
                        loadPrompts();
                      } else {
                        setToast(`Gagal: ${res.error.safeMessage}`);
                      }
                      setCreatePromptLoading(false);
                    });
                  }}
                >
                  {createPromptLoading ? 'Menyimpan...' : 'Buat prompt'}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => { setCreatePromptOpen(false); setCreatePromptName(''); setCreatePromptSlug(''); setCreatePromptDesc(''); setCreatePromptText(''); }}>
                  Batal
                </Button>
              </div>
            </div>
          ) : null}

          {/* Search prompts */}
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari nama prompt / slug / owner"
            filters={
              <>
                {(['', 'active', 'draft'] as const).map((s) => (
                  <AdminFilterChip
                    key={s || 'all'}
                    active={search === '' && s === ''}
                    onClick={() => {
                      if (s) setSearch(s);
                      else setSearch('');
                    }}
                  >
                    {s || 'Semua'}
                  </AdminFilterChip>
                ))}
              </>
            }
          />

          <AdminDataTable
            rows={promptsData.filter((p) => {
              const q = search.trim().toLowerCase();
              return !q || p.name.toLowerCase().includes(q) || p.owner?.toLowerCase().includes(q) || (p as any).slug?.toLowerCase().includes(q);
            })}
            emptyLabel="Belum ada prompt."
            emptyHint="Prompt akan muncul setelah data dimuat dari server."
            columns={[
              {
                key: 'name',
                header: 'Prompt',
                render: (row) => (
                  <div>
                    <div className="font-semibold text-[13px]">{row.name}</div>
                    {(row as any).slug ? <div className="font-mono text-[10px] text-[#6d665d]">{(row as any).slug}</div> : null}
                  </div>
                ),
              },
              { key: 'owner', header: 'Owner', render: (row) => <span className="text-[12px]">{row.owner ?? '—'}</span> },
              {
                key: 'version',
                header: 'Ver',
                render: (row) => <span className="font-mono text-[11px]">{(row as any).version ?? 'v1'}</span>,
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <AdminPill tone={row.status === 'active' ? 'ok' : 'neutral'}>
                    {row.status}
                  </AdminPill>
                ),
              },
              {
                key: 'metrics',
                header: 'Performa',
                render: (row) => {
                  const r = row as any;
                  const latency = r.avgLatencyMs ? `${Number(r.avgLatencyMs).toFixed(0)}ms` : null;
                  const success = r.successRate ? `${(Number(r.successRate) * 100).toFixed(0)}%` : null;
                  const runs = r.totalRuns ? `${r.totalRuns}×` : null;
                  const cost = r.avgCostUsd ? `$${Number(r.avgCostUsd).toFixed(4)}` : null;
                  if (!latency && !success && !runs) return <span className="text-[11px] text-[#b0a89f]">—</span>;
                  return (
                    <div className="flex flex-col gap-0.5">
                      {success ? <span className="text-[11px] text-[#4a7c59]">{success} ok</span> : null}
                      {latency ? <span className="text-[11px] text-[#6d665d]">{latency}</span> : null}
                      {runs ? <span className="text-[11px] text-[#9e9792]">{runs} runs</span> : null}
                      {cost ? <span className="text-[11px] text-[#9e9792]">{cost}/call</span> : null}
                    </div>
                  );
                },
              },
            ]}
            rowActions={(row) => (
              <div className="flex items-center gap-1.5">
                {row.status === 'draft' ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      adminService.activatePrompt(row.id).then((res) => {
                        if (res.ok) {
                          setToast(`Prompt ${row.name} diaktifkan.`);
                          loadPrompts();
                        } else {
                          setToast(`Gagal: ${res.error.safeMessage}`);
                        }
                      });
                    }}
                  >
                    Aktifkan
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      adminService.deactivatePrompt(row.id).then((res) => {
                        if (res.ok) {
                          setToast(`Prompt ${row.name} dinonaktifkan.`);
                          loadPrompts();
                        } else {
                          setToast(`Gagal: ${res.error.safeMessage}`);
                        }
                      });
                    }}
                  >
                    Nonaktifkan
                  </Button>
                )}
              </div>
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
              <Button
                size="sm"
                onClick={() => {
                  const failedIds = jobsData.filter((j) => j.status === 'failed').map((j) => j.id);
                  if (failedIds.length === 0) { setToast('Tidak ada job failed.'); return; }
                  Promise.all(failedIds.map((id) => adminService.retryJob(id))).then((results) => {
                    const ok = results.filter((r) => r.ok).length;
                    setToast(`${ok} dari ${failedIds.length} job failed di-retry.`);
                    loadJobs();
                  });
                }}
              >
                Retry semua failed
              </Button>
            }
          />
          {jobsLoading ? <AdminContentLoading /> : null}

          {/* Job detail modal */}
          {jobDetailId ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setJobDetailId(null); setJobDetailData(null); }}>
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[16px] text-[#171717]">Detail Job</h3>
                  <button className="text-[#6d665d] hover:text-[#171717] text-xl" onClick={() => { setJobDetailId(null); setJobDetailData(null); }}>×</button>
                </div>
                {jobDetailLoading ? (
                  <div className="text-[13px] text-[#6d665d]">Memuat...</div>
                ) : jobDetailData ? (
                  <div className="space-y-3 text-[13px]">
                    <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                      <span className="font-semibold text-[#6d665d]">ID</span>
                      <span className="col-span-2 font-mono text-[11px] break-all">{String(jobDetailData.id ?? '—')}</span>
                      <span className="font-semibold text-[#6d665d]">Tipe</span>
                      <span className="col-span-2 font-mono">{String(jobDetailData.type ?? '—')}</span>
                      <span className="font-semibold text-[#6d665d]">Status</span>
                      <span className="col-span-2">
                        <AdminPill tone={jobTone((jobDetailData.status as JobRow['status']) ?? 'failed')}>
                          {String(jobDetailData.status ?? '—')}
                        </AdminPill>
                      </span>
                      <span className="font-semibold text-[#6d665d]">Tenant</span>
                      <span className="col-span-2">{String(jobDetailData.workspace_id ?? '—')}</span>
                      <span className="font-semibold text-[#6d665d]">Attempt</span>
                      <span className="col-span-2 tabular-nums">{String(jobDetailData.attempt ?? 0)}</span>
                      <span className="font-semibold text-[#6d665d]">Dibuat</span>
                      <span className="col-span-2 text-[11px]">{jobDetailData.created_at ? new Date(String(jobDetailData.created_at)).toLocaleString('id-ID') : '—'}</span>
                      <span className="font-semibold text-[#6d665d]">Update</span>
                      <span className="col-span-2 text-[11px]">{jobDetailData.updated_at ? new Date(String(jobDetailData.updated_at)).toLocaleString('id-ID') : '—'}</span>
                    </div>
                    {jobDetailData.input ? (
                      <div>
                        <div className="font-semibold text-[#6d665d] mb-1 text-[12px]">Input payload</div>
                        <pre className="bg-[#f5f0eb] rounded-xl p-3 text-[10px] overflow-auto max-h-32">{JSON.stringify(jobDetailData.input, null, 2)}</pre>
                      </div>
                    ) : null}
                    {jobDetailData.error ? (
                      <div>
                        <div className="font-semibold text-[#c9703a] mb-1 text-[12px]">Error</div>
                        <pre className="bg-[#fff3ee] rounded-xl p-3 text-[10px] overflow-auto max-h-32 text-[#c9703a]">{String(jobDetailData.error)}</pre>
                      </div>
                    ) : null}
                    {jobDetailData.status === 'failed' ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          adminService.retryJob(jobDetailId).then((res) => {
                            if (res.ok) {
                              setToast('Job di-retry.');
                              setJobDetailId(null);
                              setJobDetailData(null);
                              loadJobs();
                            } else {
                              setToast(`Gagal retry: ${res.error.safeMessage}`);
                            }
                          });
                        }}
                      >
                        Retry job ini
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-[13px] text-[#6d665d]">Tidak ada data.</div>
                )}
              </div>
            </div>
          ) : null}

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
            rows={jobs}
            emptyLabel="Tidak ada job yang cocok."
            emptyHint="Ubah filter status atau kata kunci."
            columns={[
              {
                key: 'id',
                header: 'Job',
                render: (row) => (
                  <code className="text-[11px] font-mono bg-[#f4eade] px-1.5 py-0.5 rounded text-[#514b44]">
                    {row.id.slice(0, 8)}…
                  </code>
                ),
              },
              { key: 'type', header: 'Tipe', render: (row) => <span className="font-mono text-[11px]">{row.type}</span> },
              { key: 'tenant', header: 'Tenant', render: (row) => <span className="text-[12px]">{row.tenant}</span> },
              {
                key: 'status',
                header: 'Status',
                render: (row) => <AdminPill tone={jobTone(row.status)}>{row.status}</AdminPill>,
              },
              { key: 'progress', header: 'Progress', render: (row) => <span className="tabular-nums text-[12px]">{row.progress}</span> },
              { key: 'updated', header: 'Update', render: (row) => <span className="text-[11px] text-[#6d665d]">{row.updatedAt}</span> },
            ]}
            rowActions={(row) => (
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setJobDetailId(row.id);
                    setJobDetailLoading(true);
                    setJobDetailData(null);
                    adminService.jobDetail(row.id).then((res) => {
                      if (res.ok) setJobDetailData(res.value);
                      setJobDetailLoading(false);
                    });
                  }}
                >
                  Detail
                </Button>
                {row.status === 'failed' ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      adminService.retryJob(row.id).then((res) => {
                        setToast(res.ok ? `Job ${row.id.slice(0, 8)} di-retry.` : `Gagal: ${res.error.safeMessage}`);
                        loadJobs();
                      });
                    }}
                  >
                    Retry
                  </Button>
                ) : null}
              </div>
            )}
          />
          <AdminPagination
            currentPage={jobsPage}
            totalPages={jobsMeta.pages}
            totalItems={jobsMeta.total}
            pageSize={20}
            onPageChange={setJobsPage}
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
          {qualityLoading ? <AdminContentLoading /> : null}

          {/* Quality detail modal */}
          {qualityDetailId ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setQualityDetailId(null); setQualityDetailData(null); }}>
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[16px] text-[#171717]">Detail Quality Report</h3>
                  <button className="text-[#6d665d] hover:text-[#171717] text-xl" onClick={() => { setQualityDetailId(null); setQualityDetailData(null); }}>×</button>
                </div>
                {qualityDetailLoading ? (
                  <div className="text-[13px] text-[#6d665d]">Memuat...</div>
                ) : qualityDetailData ? (
                  <div className="space-y-4 text-[13px]">
                    <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                      <span className="font-semibold text-[#6d665d]">ID</span>
                      <span className="col-span-2 font-mono text-[10px] break-all">{qualityDetailData.id}</span>
                      <span className="font-semibold text-[#6d665d]">Reporter</span>
                      <span className="col-span-2">{qualityDetailData.reporter}</span>
                      <span className="font-semibold text-[#6d665d]">Workspace</span>
                      <span className="col-span-2 font-mono text-[10px]">{qualityDetailData.workspaceId}</span>
                      <span className="font-semibold text-[#6d665d]">Status</span>
                      <span className="col-span-2">
                        <AdminPill tone={qualityTone(qualityDetailData.status as QualityRow['status'])}>{qualityDetailData.status}</AdminPill>
                      </span>
                      <span className="font-semibold text-[#6d665d]">Dibuat</span>
                      <span className="col-span-2 text-[11px]">{new Date(qualityDetailData.createdAt).toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-[#6d665d] mb-1">Alasan laporan</div>
                      <div className="bg-[#faf8f5] rounded-xl p-3 text-[12px]">{qualityDetailData.reason}</div>
                    </div>
                    {/* Notes editor */}
                    <div>
                      <div className="font-semibold text-[#171717] mb-1 text-[12px]">Catatan internal</div>
                      <textarea
                        rows={4}
                        value={qualityNotesDraft}
                        onChange={(e) => setQualityNotesDraft(e.target.value)}
                        className="w-full rounded-xl border border-[#ddd4c8] bg-white px-3 py-2 text-[12px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20 resize-none"
                        placeholder="Tambah catatan internal untuk report ini..."
                      />
                      <Button
                        size="sm"
                        disabled={qualityNotesSaving}
                        onClick={() => {
                          setQualityNotesSaving(true);
                          adminService.updateQualityNotes(qualityDetailId, { notes: qualityNotesDraft }).then((res) => {
                            if (res.ok) {
                              setToast('Catatan disimpan.');
                              setQualityDetailData({ ...qualityDetailData, notes: qualityNotesDraft });
                            } else {
                              setToast(`Gagal: ${res.error.safeMessage}`);
                            }
                            setQualityNotesSaving(false);
                          });
                        }}
                      >
                        {qualityNotesSaving ? 'Menyimpan...' : 'Simpan catatan'}
                      </Button>
                    </div>
                    {/* Quick triage actions */}
                    <div className="flex items-center gap-2 border-t border-[#eee6da] pt-3">
                      {qualityDetailData.status !== 'triaged' ? (
                        <Button size="sm" variant="secondary" onClick={() => {
                          adminService.updateQualityNotes(qualityDetailId, { status: 'triaged' }).then((res) => {
                            if (res.ok) { setToast('Report ditriage.'); setQualityDetailData({ ...qualityDetailData, status: 'triaged' }); loadQuality(); }
                            else setToast(`Gagal: ${res.error.safeMessage}`);
                          });
                        }}>Triage</Button>
                      ) : null}
                      {qualityDetailData.status !== 'closed' ? (
                        <Button size="sm" onClick={() => {
                          adminService.updateQualityNotes(qualityDetailId, { status: 'closed' }).then((res) => {
                            if (res.ok) { setToast('Report ditutup.'); setQualityDetailData({ ...qualityDetailData, status: 'closed' }); loadQuality(); }
                            else setToast(`Gagal: ${res.error.safeMessage}`);
                          });
                        }}>Tutup report</Button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="text-[13px] text-[#6d665d]">Tidak ada data.</div>
                )}
              </div>
            </div>
          ) : null}
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
            rows={quality}
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
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setQualityDetailId(row.id);
                    setQualityDetailLoading(true);
                    setQualityDetailData(null);
                    adminService.qualityDetail(row.id).then((res) => {
                      if (res.ok) {
                        setQualityDetailData(res.value);
                        setQualityNotesDraft(res.value.notes ?? '');
                      }
                      setQualityDetailLoading(false);
                    });
                  }}
                >
                  Detail
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    adminService.triageReport(row.id, 'triaged').then((res) => {
                      setToast(res.ok ? `Report ditriage.` : `Gagal triage: ${res.error.safeMessage}`);
                      loadQuality();
                    });
                  }}
                >
                  Triage
                </Button>
                <Button size="sm" onClick={() => {
                  adminService.triageReport(row.id, 'closed').then((res) => {
                    setToast(res.ok ? `Report ditutup.` : `Gagal tutup: ${res.error.safeMessage}`);
                    loadQuality();
                  });
                }}>
                  Tutup
                </Button>
              </div>
            )}
          />
          <AdminPagination
            currentPage={qualityPage}
            totalPages={qualityMeta.pages}
            totalItems={qualityMeta.total}
            pageSize={20}
            onPageChange={setQualityPage}
          />
        </>
      ) : null}

      {key === 'audit' ? (
        <>
          <AdminPageHeader
            title="Audit trail"
            description="Jejak aksi superadmin untuk akuntabilitas platform."
            meta={<AdminPill tone="neutral">{auditMeta.total} entri</AdminPill>}
          />
          {auditLoading ? <AdminContentLoading /> : null}

          {/* Audit detail modal */}
          {auditDetailId ? (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
              onClick={() => { setAuditDetailId(null); setAuditDetailData(null); }}
              onKeyDown={(e) => { if (e.key === 'Escape') { setAuditDetailId(null); setAuditDetailData(null); } }}
            >
              <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="audit-detail-title"
              >
                <div className="flex items-center justify-between">
                  <h3 id="audit-detail-title" className="font-bold text-[16px] text-[#171717]">Detail Audit</h3>
                  <button
                    type="button"
                    aria-label="Tutup detail audit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6d665d] hover:bg-[#faf7f2] hover:text-[#171717] text-xl leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]/30"
                    onClick={() => { setAuditDetailId(null); setAuditDetailData(null); }}
                  >×</button>
                </div>
                {auditDetailLoading ? (
                  <div className="text-[13px] text-[#6d665d]">Memuat detail...</div>
                ) : auditDetailData ? (
                  <div className="space-y-2 text-[13px]">
                    <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                      <span className="font-semibold text-[#6d665d]">ID</span>
                      <span className="col-span-2 font-mono text-[11px] break-all">{auditDetailData.id}</span>
                      <span className="font-semibold text-[#6d665d]">Waktu</span>
                      <span className="col-span-2">{auditDetailData.at}</span>
                      <span className="font-semibold text-[#6d665d]">Actor</span>
                      <span className="col-span-2">{auditDetailData.actorName ?? auditDetailData.actor}</span>
                      <span className="font-semibold text-[#6d665d]">Aksi</span>
                      <span className="col-span-2 font-mono">{auditDetailData.action}</span>
                      <span className="font-semibold text-[#6d665d]">Target</span>
                      <span className="col-span-2">{auditDetailData.targetType ? `${auditDetailData.targetType}:` : ''}{auditDetailData.target}</span>
                    </div>
                    {auditDetailData.metadata && Object.keys(auditDetailData.metadata).length > 0 ? (
                      <div>
                        <div className="font-semibold text-[#6d665d] mb-1">Metadata</div>
                        <pre className="bg-[#f5f0eb] rounded-xl p-3 text-[11px] overflow-auto max-h-40">{JSON.stringify(auditDetailData.metadata, null, 2)}</pre>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-[13px] text-[#6d665d]">Tidak ada data.</div>
                )}
              </div>
            </div>
          ) : null}

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <input
              type="text"
              value={filterAuditAction}
              onChange={(e) => setFilterAuditAction(e.target.value)}
              placeholder="Filter aksi (cth: account.suspend)"
              className="h-9 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] text-[#171717] placeholder:text-[#b0a89f] focus:outline-none focus:ring-2 focus:ring-[#171717]/20 w-52"
            />
            <input
              type="text"
              value={filterAuditActor}
              onChange={(e) => setFilterAuditActor(e.target.value)}
              placeholder="Filter actor (email / ID)"
              className="h-9 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] text-[#171717] placeholder:text-[#b0a89f] focus:outline-none focus:ring-2 focus:ring-[#171717]/20 w-52"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setAuditPage(1);
                adminService.audit({
                  action: filterAuditAction || undefined,
                  actor: filterAuditActor || undefined,
                  page: 1,
                  limit: 20,
                }).then((res) => {
                  if (res.ok) {
                    const val = res.value as { data: AdminAuditRow[]; meta: AdminMeta };
                    setAuditData(val.data ?? []);
                    setAuditMeta(val.meta ?? auditMeta);
                  }
                });
              }}
            >
              Terapkan filter
            </Button>
            {(filterAuditAction || filterAuditActor) ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setFilterAuditAction('');
                  setFilterAuditActor('');
                  loadAudit(1);
                }}
              >
                Reset
              </Button>
            ) : null}
          </div>

          <AdminDataTable
            rows={auditData}
            emptyLabel="Belum ada jejak audit."
            emptyHint="Audit trail akan muncul setelah ada aksi superadmin."
            columns={[
              { key: 'at', header: 'Waktu', render: (row) => <span className="text-[11px] tabular-nums">{row.at}</span> },
              { key: 'actor', header: 'Actor', render: (row) => <span className="font-mono text-[11px]">{row.actor}</span> },
              { key: 'action', header: 'Aksi', render: (row) => <span className="font-mono text-[12px]">{row.action}</span> },
              { key: 'target', header: 'Target', render: (row) => <span className="text-[11px] text-[#6d665d]">{row.target}</span> },
            ]}
            rowActions={(row) => (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setAuditDetailId(row.id);
                  setAuditDetailLoading(true);
                  setAuditDetailData(null);
                  adminService.auditDetail(row.id).then((res) => {
                    if (res.ok) setAuditDetailData(res.value);
                    else setAuditDetailData({ id: row.id, at: row.at, actor: row.actor, action: row.action, targetId: row.target, metadata: {}, createdAt: row.at } as any);
                    setAuditDetailLoading(false);
                  });
                }}
              >
                Detail
              </Button>
            )}
          />
          <AdminPagination
            currentPage={auditPage}
            totalPages={auditMeta.pages}
            totalItems={auditMeta.total}
            pageSize={20}
            onPageChange={setAuditPage}
          />
        </>
      ) : null}

      {key === 'billing' ? (
        <>
          <AdminPageHeader
            title="Billing"
            description="Pantau status langganan, seats, perpanjangan tenant, dan payment orders."
            meta={
              <AdminPill tone="warn">
                {billingData.filter((b) => b.state !== 'active').length} non-active
              </AdminPill>
            }
          />
          {billingLoading ? <AdminContentLoading /> : null}

          {/* Tab switcher */}
          <div className="flex gap-1 mb-4 border-b border-[#ddd4c8]/60">
            {(['langganan', 'orders'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setBillingTab(tab)}
                className={`px-4 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
                  billingTab === tab
                    ? 'border-[#171717] text-[#171717]'
                    : 'border-transparent text-[#6d665d] hover:text-[#171717]'
                }`}
              >
                {tab === 'langganan' ? 'Langganan' : 'Payment Orders'}
              </button>
            ))}
          </div>

          {billingTab === 'langganan' ? (
            <>
              {/* Billing edit modal */}
              {billingEditRow ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setBillingEditRow(null)}>
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-[16px] text-[#171717]">Kelola Billing — {billingEditRow.school}</h3>
                      <button className="text-[#6d665d] hover:text-[#171717] text-xl leading-none" onClick={() => setBillingEditRow(null)}>×</button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="billing-edit-state" className="block text-[12px] font-semibold text-[#6d665d] mb-1">State</label>
                        <select
                          value={billingEditState}
                          onChange={(e) => setBillingEditState(e.target.value as BillingRow['state'])}
                          className="w-full h-9 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                        >
                          <option value="active">active</option>
                          <option value="grace">grace</option>
                          <option value="blocked">blocked</option>
                          <option value="expired">expired</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="billing-edit-seats" className="block text-[12px] font-semibold text-[#6d665d] mb-1">Seats</label>
                        <input
                          type="number"
                          min="0"
                          value={billingEditSeats}
                          onChange={(e) => setBillingEditSeats(e.target.value)}
                          className="w-full h-9 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                        />
                      </div>
                      <div>
                        <label htmlFor="billing-edit-renews" className="block text-[12px] font-semibold text-[#6d665d] mb-1">Tanggal Perpanjangan</label>
                        <input
                          type="date"
                          value={billingEditRenews}
                          onChange={(e) => setBillingEditRenews(e.target.value)}
                          className="w-full h-9 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        disabled={billingEditLoading}
                        onClick={() => {
                          setBillingEditLoading(true);
                          adminService.updateBilling(billingEditRow.id, {
                            state: billingEditState,
                            seats: billingEditSeats ? Number(billingEditSeats) : undefined,
                            renewsAt: billingEditRenews || undefined,
                          }).then((res) => {
                            if (res.ok) {
                              setToast(`Billing ${billingEditRow.school} berhasil diperbarui.`);
                              setBillingEditRow(null);
                              loadBilling();
                            } else {
                              setToast(`Gagal: ${res.error.safeMessage}`);
                            }
                            setBillingEditLoading(false);
                          });
                        }}
                      >
                        {billingEditLoading ? 'Menyimpan...' : 'Simpan'}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setBillingEditRow(null)}>Batal</Button>
                    </div>
                  </div>
                </div>
              ) : null}

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
                rows={billingData}
                emptyLabel="Tidak ada data billing yang cocok."
                columns={[
                  { key: 'school', header: 'Sekolah', render: (row) => <span className="font-semibold">{row.school}</span> },
                  {
                    key: 'state',
                    header: 'State',
                    render: (row) => <AdminPill tone={billingTone(row.state)}>{row.state}</AdminPill>,
                  },
                  { key: 'seats', header: 'Seats', render: (row) => <span className="tabular-nums">{row.seats}</span> },
                  { key: 'renew', header: 'Perpanjangan', render: (row) => <span className="text-[12px] text-[#6d665d]">{row.renewsAt ?? '—'}</span> },
                ]}
                rowActions={(row) => (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setBillingEditRow(row);
                      setBillingEditState(row.state);
                      setBillingEditSeats(String(row.seats ?? ''));
                      setBillingEditRenews(row.renewsAt ? row.renewsAt.split('T')[0] : '');
                    }}
                  >
                    Kelola
                  </Button>
                )}
              />
              <AdminPagination
                currentPage={billingPage}
                totalPages={billingMeta.pages}
                totalItems={billingMeta.total}
                pageSize={10}
                onPageChange={setBillingPage}
              />
            </>
          ) : null}

          {billingTab === 'orders' ? (
            <>
              {paymentOrdersLoading ? <AdminContentLoading /> : null}
              <AdminToolbar
                search={''}
                onSearchChange={() => {}}
                searchPlaceholder="Cari workspace ID"
                filters={
                  <>
                    {(['', 'pending', 'paid', 'failed', 'expired', 'cancelled'] as const).map((s) => (
                      <AdminFilterChip
                        key={s || 'all'}
                        active={filterOrderStatus === s}
                        onClick={() => { setFilterOrderStatus(s); setPaymentOrdersPage(1); loadPaymentOrders(s, 1); }}
                      >
                        {s || 'Semua'}
                      </AdminFilterChip>
                    ))}
                  </>
                }
              />
              <AdminDataTable
                rows={paymentOrdersData}
                emptyLabel="Tidak ada payment orders."
                columns={[
                  { key: 'school', header: 'Workspace', render: (row: any) => <span className="font-semibold">{row.school || row.workspaceId}</span> },
                  { key: 'amount', header: 'Amount', render: (row: any) => <span className="tabular-nums">{row.currency} {Number(row.amount).toLocaleString('id-ID')}</span> },
                  { key: 'status', header: 'Status', render: (row: any) => {
                    const tone = row.status === 'paid' ? 'ok' : row.status === 'pending' ? 'warn' : row.status === 'failed' ? 'bad' : 'neutral';
                    return <AdminPill tone={tone}>{row.status}</AdminPill>;
                  }},
                  { key: 'gateway', header: 'Gateway', render: (row: any) => <span className="text-[12px] text-[#6d665d]">{row.gateway}</span> },
                  { key: 'createdAt', header: 'Tanggal', render: (row: any) => <span className="text-[11px] tabular-nums text-[#6d665d]">{row.createdAt?.slice(0, 10) ?? '—'}</span> },
                ]}
              />
              <AdminPagination
                currentPage={paymentOrdersPage}
                totalPages={paymentOrdersMeta.pages}
                totalItems={paymentOrdersMeta.total}
                pageSize={20}
                onPageChange={(p) => setPaymentOrdersPage(p)}
              />
            </>
          ) : null}
        </>
      ) : null}

      {key === 'flags' ? (
        <>
          <AdminPageHeader
            title="Feature flags"
            description="Nyalakan/matikan fitur global atau pilot tanpa deploy."
            actions={
              <Button size="sm" onClick={() => setCreateFlagOpen(true)}>
                Tambah flag
              </Button>
            }
          />
          {flagsLoading ? <AdminContentLoading /> : null}

          {/* Create Flag inline form */}
          {createFlagOpen ? (
            <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-3 shadow-sm">
              <h4 className="text-[13px] font-bold text-[#171717]">Flag baru</h4>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="create-flag-key" className="block text-[11px] font-semibold text-[#6d665d] mb-1">Key *</label>
                  <input
                    type="text"
                    value={createFlagKey}
                    onChange={(e) => setCreateFlagKey(e.target.value)}
                    placeholder="cth: enable_pdf_v2"
                    className="h-9 w-52 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] text-[#171717] placeholder:text-[#b0a89f] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                  />
                </div>
                <div>
                  <label htmlFor="create-flag-desc" className="block text-[11px] font-semibold text-[#6d665d] mb-1">Deskripsi</label>
                  <input
                    type="text"
                    value={createFlagDesc}
                    onChange={(e) => setCreateFlagDesc(e.target.value)}
                    placeholder="Deskripsi singkat flag"
                    className="h-9 w-64 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] text-[#171717] placeholder:text-[#b0a89f] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                  />
                </div>
                <div>
                  <label htmlFor="create-flag-scope" className="block text-[11px] font-semibold text-[#6d665d] mb-1">Scope</label>
                  <select
                    value={createFlagScope}
                    onChange={(e) => setCreateFlagScope(e.target.value as 'global' | 'pilot')}
                    className="h-9 rounded-xl border border-[#ddd4c8] bg-white pl-3 pr-8 text-[12px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                  >
                    <option value="global">global</option>
                    <option value="pilot">pilot</option>
                  </select>
                </div>
                <Button
                  size="sm"
                  disabled={createFlagLoading || !createFlagKey.trim()}
                  onClick={() => {
                    setCreateFlagLoading(true);
                    adminService.createFlag({
                      key: createFlagKey.trim(),
                      description: createFlagDesc.trim() || undefined,
                      scope: createFlagScope,
                    }).then((res) => {
                      if (res.ok) {
                        setToast(`Flag "${createFlagKey}" berhasil dibuat.`);
                        setCreateFlagKey('');
                        setCreateFlagDesc('');
                        setCreateFlagScope('global');
                        setCreateFlagOpen(false);
                        loadFlags();
                      } else {
                        setToast(`Gagal: ${res.error.safeMessage}`);
                      }
                      setCreateFlagLoading(false);
                    });
                  }}
                >
                  {createFlagLoading ? 'Menyimpan...' : 'Buat'}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => { setCreateFlagOpen(false); setCreateFlagKey(''); setCreateFlagDesc(''); }}>Batal</Button>
              </div>
            </div>
          ) : null}

          {/* Search flags */}
          <AdminToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Cari key / deskripsi"
          />

          <AdminDataTable
            rows={flagsData.filter((f) => {
              const q = search.trim().toLowerCase();
              return !q || f.key.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
            })}
            emptyLabel="Tidak ada feature flag."
            columns={[
              { key: 'key', header: 'Flag', render: (row) => <span className="font-mono text-[12px]">{row.key}</span> },
              { key: 'desc', header: 'Deskripsi', render: (row) => <span className="text-[12px] text-[#6d665d]">{row.description || '—'}</span> },
              { key: 'scope', header: 'Scope', render: (row) => <AdminPill tone={row.scope === 'pilot' ? 'warn' : 'neutral'}>{row.scope}</AdminPill> },
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
              <div className="flex items-center gap-1.5">
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
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    if (confirm(`Hapus flag "${row.key}"?`)) {
                      adminService.deleteFlag(row.key).then((res) => {
                        if (res.ok) {
                          setToast(`Flag "${row.key}" dihapus.`);
                        } else {
                          setToast(`Gagal hapus: ${res.error.safeMessage}`);
                        }
                        loadFlags();
                      });
                    }
                  }}
                >
                  Hapus
                </Button>
              </div>
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
              <Button size="sm" onClick={() => setCreateSchoolOpen(true)}>
                Draft baru
              </Button>
            }
          />
          {contentLoading ? <AdminContentLoading /> : null}

          {/* Inline create content form — reuse createSchool modal state as createContent */}
          {createSchoolOpen ? (
            <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-3 shadow-sm">
              <h4 className="text-[13px] font-bold text-[#171717]">Draft halaman baru</h4>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="create-content-slug" className="block text-[11px] font-semibold text-[#6d665d] mb-1">Slug * (cth: tentang-kami)</label>
                  <input
                    type="text"
                    value={createSchoolName}
                    onChange={(e) => setCreateSchoolName(e.target.value)}
                    placeholder="tentang-kami"
                    className="h-9 w-52 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] text-[#171717] placeholder:text-[#b0a89f] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                  />
                </div>
                <div>
                  <label htmlFor="create-content-title" className="block text-[11px] font-semibold text-[#6d665d] mb-1">Judul</label>
                  <input
                    type="text"
                    value={createSchoolSlug}
                    onChange={(e) => setCreateSchoolSlug(e.target.value)}
                    placeholder="Tentang Kami"
                    className="h-9 w-64 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] text-[#171717] placeholder:text-[#b0a89f] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                  />
                </div>
                <Button
                  size="sm"
                  disabled={createSchoolLoading || !createSchoolName.trim()}
                  onClick={() => {
                    setCreateSchoolLoading(true);
                    adminService.createMarketingPage({
                      slug: createSchoolName.trim(),
                      title: createSchoolSlug.trim() || createSchoolName.trim(),
                    }).then((res) => {
                      if (res.ok) {
                        setToast(`Draft "${createSchoolSlug || createSchoolName}" berhasil dibuat.`);
                        setCreateSchoolName('');
                        setCreateSchoolSlug('');
                        setCreateSchoolOpen(false);
                        loadContent();
                      } else {
                        setToast(`Gagal: ${res.error.safeMessage}`);
                      }
                      setCreateSchoolLoading(false);
                    });
                  }}
                >
                  {createSchoolLoading ? 'Menyimpan...' : 'Buat draft'}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => { setCreateSchoolOpen(false); setCreateSchoolName(''); setCreateSchoolSlug(''); }}>Batal</Button>
              </div>
            </div>
          ) : null}

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
            rows={content}
            emptyLabel="Tidak ada konten yang cocok."
            columns={[
              { key: 'slug', header: 'Slug', render: (row) => <span className="font-mono text-[11px]">{row.slug}</span> },
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
              { key: 'updated', header: 'Update', render: (row) => <span className="text-[11px] text-[#6d665d]">{row.updatedAt}</span> },
            ]}
            rowActions={(row) => (
              <div className="flex items-center gap-1.5">
                <Button size="sm" variant="secondary" onClick={() => window.open(`/ops/content/${row.slug}`, '_blank')}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={row.status === 'published' ? 'secondary' : undefined}
                  onClick={() => {
                    const action = row.status === 'published'
                      ? adminService.unpublishPage(row.slug)
                      : adminService.publishPage(row.slug);
                    action.then((res) => {
                      if (res.ok) {
                        setToast(`${row.status === 'published' ? 'Unpublish' : 'Publish'} ${row.slug} berhasil.`);
                        loadContent();
                      } else {
                        setToast(`Gagal: ${res.error.safeMessage}`);
                      }
                    });
                  }}
                >
                  {row.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>
              </div>
            )}
          />
          <AdminPagination
            currentPage={contentPage}
            totalPages={contentMeta.pages}
            totalItems={contentMeta.total}
            pageSize={10}
            onPageChange={setContentPage}
          />
        </>
      ) : null}

      {key === 'profile-disabled' ? (
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
                  <span className="font-medium text-[#171717]">JWT Multi-role</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-[#ddd4c8]/70 bg-white p-6 shadow-[0_2px_12px_rgba(23,23,23,0.01)]">
              <h3 className="text-[14px] font-bold text-[#171717] border-b border-[#eee6da]/50 pb-2">
                Informasi Sesi
              </h3>
              <div className="space-y-2.5 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-[#8a8379]">Browser</span>
                  <span className="font-medium text-[#171717] text-right max-w-[60%] truncate">
                    {typeof navigator !== 'undefined'
                      ? navigator.userAgent.match(/Chrome\/[\d.]+/)?.[0]
                        ?? navigator.userAgent.match(/Firefox\/[\d.]+/)?.[0]
                        ?? navigator.userAgent.match(/Safari\/[\d.]+/)?.[0]
                        ?? 'Browser'
                      : 'Browser'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a8379]">Platform</span>
                  <span className="font-medium text-[#171717]">
                    {typeof navigator !== 'undefined' ? navigator.platform || 'Web' : 'Web'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a8379]">Zona Waktu</span>
                  <span className="font-medium text-[#171717]">
                    {typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a8379]">Sesi Dimulai</span>
                  <span className="font-medium text-[#171717]">
                    {new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
              <div className="border-t border-[#eee6da]/50 pt-4 space-y-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full justify-center"
                  onClick={() => {
                    if (confirm('Logout dari sesi ini?')) {
                      fetch('/v1/auth/logout', { method: 'POST', credentials: 'include' })
                        .then(() => { window.location.href = '/ops/login'; })
                        .catch(() => { window.location.href = '/ops/login'; });
                    }
                  }}
                >
                  Log Out Sesi Ini
                </Button>
                <div className="text-[11px] text-[#b0a89f] text-center">
                  Multi-device logout belum tersedia — fitur dalam pengembangan BE
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {key === 'learning-signals' ? (
        <>
          <AdminPageHeader
            title="Learning Signals"
            description="Pola AI yang terdeteksi dari feedback pengguna — prompt mana yang underperform dan perlu diperbaiki."
            meta={
              signalsData.length > 0 ? (
                <AdminPill tone="warn">{signalsData.length} sinyal aktif</AdminPill>
              ) : null
            }
            actions={
              <Button size="sm" variant="secondary" onClick={() => {
                setSignalsLoading(true);
                adminService.learningSignals().then((res) => {
                  if (res.ok) {
                    const val = res.value as any;
                    setSignalsData(Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : []);
                  }
                  setSignalsLoading(false);
                });
              }}>
                Refresh
              </Button>
            }
          />
          {signalsLoading ? <AdminContentLoading /> : null}

          {signalsData.length === 0 && !signalsLoading ? (
            <div className="rounded-2xl border border-[#ddd4c8]/60 bg-[#faf8f5] p-8 text-center space-y-2">
              <div className="text-[14px] font-semibold text-[#171717]">Belum ada learning signal</div>
              <div className="text-[13px] text-[#6d665d]">Sinyal muncul ketika pengguna memberikan feedback pada hasil generate. Data dari tabel ai_learning_signals.</div>
            </div>
          ) : (
            <AdminDataTable
              rows={signalsData.map((s, i) => ({ ...s, id: `signal-${i}` }))}
              emptyLabel="Tidak ada sinyal."
              columns={[
                {
                  key: 'prompt',
                  header: 'Prompt Template',
                  render: (row) => (
                    <span className="font-mono text-[11px] text-[#514b44]">{(row as any).prompt_template_id ?? '—'}</span>
                  ),
                },
                {
                  key: 'pattern',
                  header: 'Pola',
                  render: (row) => <span className="text-[12px]">{(row as any).pattern ?? '—'}</span>,
                },
                {
                  key: 'frequency',
                  header: 'Frekuensi',
                  render: (row) => <span className="tabular-nums font-semibold">{String((row as any).frequency ?? 0)}</span>,
                },
                {
                  key: 'rating',
                  header: 'Avg Rating',
                  render: (row) => {
                    const r = Number((row as any).avg_rating ?? 0);
                    const tone = r < 2.5 ? 'bad' : r < 3.5 ? 'warn' : 'ok';
                    return <AdminPill tone={tone}>{r.toFixed(1)} ★</AdminPill>;
                  },
                },
                {
                  key: 'action',
                  header: 'Aksi yang Disarankan',
                  render: (row) => (
                    <span className="text-[12px] text-[#c9703a] font-medium">{(row as any).suggested_action ?? '—'}</span>
                  ),
                },
              ]}
              rowActions={(row) => (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(`/ops/prompts`, '_self')}
                >
                  Lihat prompt
                </Button>
              )}
            />
          )}
        </>
      ) : null}

      {key !== '' &&
      ![
        'accounts',
        'schools',
        'catalog',
        'prompts',
        'learning-signals',
        'jobs',
        'quality',
        'audit',
        'billing',
        'flags',
        'content',
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
