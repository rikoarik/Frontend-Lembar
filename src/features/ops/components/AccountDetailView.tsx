'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui';
import { AdminPageHeader, AdminPill } from '@/src/features/admin/AdminChrome';
import {
  adminService,
  type AdminAccountRow,
  type AdminAccountDetail,
  type AdminAccountAuditItem,
} from '@/src/services/admin/adminService';

export function AccountDetailView({
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
                            setDetail({ ...detail, roles: res.value.roles, role: (res.value.roles[0] as typeof detail.role) ?? detail.role });
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

export function AccountRowActions({
  row,
  impersonatingId,
  handleImpersonate,
  loadAccounts,
  setToast,
  onOpenDetail,
}: {
  row: AdminAccountRow;
  impersonatingId: string | null;
  handleImpersonate: (row: AdminAccountRow) => void;
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
