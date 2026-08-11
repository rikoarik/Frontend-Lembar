'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/app/components/ui';
import { AdminPageHeader, AdminPill, AdminConfirmModal } from '@/src/features/admin/AdminChrome';
import {
  adminService,
  type AdminAccountRow,
  type AdminAccountDetail,
  type AdminAccountAuditItem,
  type AdminAccountPatchResult,
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
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('free');
  const [entitlementConfirmOpen, setEntitlementConfirmOpen] = useState(false);
  const [entitlementSaving, setEntitlementSaving] = useState(false);
  const [entitlementMessage, setEntitlementMessage] = useState<string | null>(null);
  const AVAILABLE_ROLES = ['teacher', 'school_admin', 'subscriber'] as const;
  const [editRoles, setEditRoles] = useState<string[]>([]);

  const currentPlan = detail?.billing?.plan === 'pro' ? 'pro' : 'free';
  const planLabel = (plan: 'free' | 'pro') => (plan === 'pro' ? 'Pro' : 'Free');
  const tokenUsage = detail?.workspacePlan ?? null;
  const formatTokens = (value: number) => new Intl.NumberFormat('id-ID').format(value);
  const tokenUsageLabel = tokenUsage
    ? `${formatTokens(tokenUsage.tokenUsedThisMonth)} / ${
        tokenUsage.tokenMonthlyLimit === null
          ? 'Tidak terbatas'
          : formatTokens(tokenUsage.tokenMonthlyLimit)
      }`
    : 'Data penggunaan token belum tersedia';

  useEffect(() => {
    setLoading(true);
    adminService.accountDetail(accountId).then((res) => {
      if (res.ok) {
        setDetail(res.value);
        setEditName(res.value.name || res.value.displayName || '');
        setEditPhone(res.value.phone || '');
        setSelectedPlan(res.value.billing?.plan === 'pro' ? 'pro' : 'free');
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
          const patch = res.value;
          setDetail((prev) =>
            prev ? { ...prev, name: patch.name, email: patch.email, phone: patch.phone } : prev,
          );
          setToast(`Detail akun ${patch.name} berhasil diperbarui.`);
          onUpdated();
        } else {
          setToast(`Gagal memperbarui: ${res.error.safeMessage}`);
        }
      })
      .finally(() => setSaving(false));
  };

  const handleSetEntitlement = () => {
    if (!detail?.workspaceId) return;
    setEntitlementSaving(true);
    setEntitlementMessage(null);
    adminService
      .setEntitlement(detail.workspaceId, { plan: selectedPlan })
      .then((res) => {
        if (res.ok) {
          const newPlan = res.value.newPlan === 'pro' ? 'pro' : 'free';
          setDetail((prev) =>
            prev
              ? {
                  ...prev,
                  billing: {
                    state: prev.billing?.state ?? newPlan,
                    plan: newPlan,
                    seats: prev.billing?.seats ?? 0,
                    renewsAt: prev.billing?.renewsAt,
                  },
                }
              : prev,
          );
          setSelectedPlan(newPlan);
          setEntitlementMessage(`Entitlement berhasil diubah ke ${planLabel(newPlan)}.`);
          setToast(`Entitlement workspace diubah ke ${planLabel(newPlan)}.`);
          onUpdated();
          setEntitlementConfirmOpen(false);
        } else {
          setEntitlementMessage(`Gagal mengubah entitlement: ${res.error.safeMessage}`);
        }
      })
      .finally(() => setEntitlementSaving(false));
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
            <form
              onSubmit={handleSave}
              className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-5 shadow-sm space-y-4"
            >
              <h3 className="text-[15px] font-bold text-[#171717]">Edit Profil Akun</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="account-edit-name"
                    className="block text-[12px] font-medium text-[#6d665d] mb-1.5"
                  >
                    Nama Lengkap
                  </label>
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
                  <label
                    htmlFor="account-edit-phone"
                    className="block text-[12px] font-medium text-[#6d665d] mb-1.5"
                  >
                    No. Telepon
                  </label>
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
                <h3 className="text-[15px] font-bold text-[#171717]">
                  Log Audit Riwayat Aktivitas
                </h3>
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
                          <td className="px-3.5 py-2.5 font-mono text-[11px] text-[#171717]">
                            {log.action}
                          </td>
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
            <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-5 shadow-sm space-y-4 text-[13px]">
              <div className="flex items-center justify-between border-b border-[#eee6da]/70 pb-3">
                <h3 className="text-[15px] font-bold text-[#171717]">Informasi Sistem</h3>
                <AdminPill
                  tone={
                    detail.billing?.state === 'active' || detail.billing?.state === 'pro'
                      ? 'ok'
                      : 'neutral'
                  }
                >
                  {detail.billing?.state || 'free'}
                </AdminPill>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#6d665d] text-[12px] font-medium shrink-0">Username</span>
                  <span className="font-semibold text-[#171717] truncate">
                    {detail.username || '—'}
                  </span>
                </div>

                <div className="space-y-1 pt-1 border-t border-[#eee6da]/50">
                  <span className="text-[#6d665d] text-[12px] font-medium block">
                    Sekolah / Instansi
                  </span>
                  <div className="p-2 rounded-xl bg-[#faf7f2] border border-[#eee6da] text-[12px] text-[#171717] font-medium break-all leading-snug">
                    {detail.school || detail.schoolSlug || '—'}
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-[#eee6da]/50">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6d665d] text-[12px] font-medium">Workspace ID</span>
                    {detail.workspaceId && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(detail.workspaceId || '');
                          setToast('Workspace ID disalin ke clipboard');
                        }}
                        className="text-[11px] font-medium text-[#171717] hover:underline inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">content_copy</span>
                        Salin
                      </button>
                    )}
                  </div>
                  <div className="p-2 rounded-xl bg-[#faf7f2] border border-[#eee6da] font-mono text-[11px] text-[#57534e] break-all">
                    {detail.workspaceId || '—'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#eee6da]/50 text-[12px]">
                  <div className="p-2.5 rounded-xl bg-[#faf7f2] border border-[#eee6da]/60">
                    <span className="block text-[11px] text-[#6d665d] font-medium">
                      Token Bulan Ini
                    </span>
                    <span className="text-[14px] font-bold text-[#171717] tabular-nums mt-0.5 block">
                      {tokenUsageLabel}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#faf7f2] border border-[#eee6da]/60">
                    <span className="block text-[11px] text-[#6d665d] font-medium">Total Job</span>
                    <span className="text-[14px] font-bold text-[#171717] tabular-nums mt-0.5 block">
                      {detail.stats?.jobsTotal ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <section
              className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm space-y-3 text-[13px]"
              aria-labelledby="entitlement-heading"
            >
              <div>
                <h3 id="entitlement-heading" className="text-[15px] font-bold text-[#171717]">
                  Entitlement Workspace
                </h3>
                <p className="mt-1 text-[12px] leading-relaxed text-[#6d665d]">
                  Ubah paket akses workspace ini. Tindakan ini tidak mengubah kuota pemakaian yang
                  sudah tercatat.
                </p>
              </div>

              {detail.workspaceId ? (
                <>
                  <div className="rounded-xl border border-amber-200/80 bg-white/80 p-3 space-y-1">
                    <p className="font-semibold text-[#171717]">
                      Paket saat ini: {planLabel(currentPlan)}
                    </p>
                    <p className="text-[12px] text-[#6d665d]">
                      Token terpakai bulan ini: {tokenUsageLabel}
                    </p>
                  </div>
                  <label
                    htmlFor="workspace-entitlement-plan"
                    className="block text-[12px] font-medium text-[#57534e]"
                  >
                    Paket baru
                  </label>
                  <select
                    id="workspace-entitlement-plan"
                    value={selectedPlan}
                    onChange={(event) => {
                      setSelectedPlan(event.target.value as 'free' | 'pro');
                      setEntitlementMessage(null);
                    }}
                    disabled={entitlementSaving}
                    className="h-10 w-full rounded-xl border border-[#ddd4c8] bg-white px-3 text-[13px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                  {entitlementMessage ? (
                    <p
                      role={entitlementMessage.startsWith('Gagal') ? 'alert' : 'status'}
                      className="text-[12px] text-[#57534e]"
                    >
                      {entitlementMessage}
                    </p>
                  ) : null}
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={entitlementSaving || selectedPlan === currentPlan}
                    onClick={() => setEntitlementConfirmOpen(true)}
                  >
                    Ubah entitlement
                  </Button>
                </>
              ) : (
                <p className="rounded-xl border border-[#ddd4c8] bg-white/80 p-3 text-[12px] text-[#6d665d]">
                  Workspace ID tidak tersedia, sehingga entitlement tidak dapat diubah dari akun
                  ini.
                </p>
              )}
            </section>

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
                    <AdminPill
                      key={r}
                      tone={r === 'superadmin' ? 'bad' : r === 'school_admin' ? 'info' : 'neutral'}
                    >
                      {r}
                    </AdminPill>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-[11px] text-[#6d665d]">
                    Pilih role untuk akun ini. Perubahan langsung disimpan.
                  </div>
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
                            setDetail({
                              ...detail,
                              roles: res.value.roles,
                              role: (res.value.roles[0] as typeof detail.role) ?? detail.role,
                            });
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
                    <Button size="sm" variant="secondary" onClick={() => setRolesEditing(false)}>
                      Batal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <AdminConfirmModal
        open={entitlementConfirmOpen}
        title="Ubah entitlement workspace?"
        description={`Paket workspace akan diubah dari ${planLabel(currentPlan)} ke ${planLabel(selectedPlan)}. Kuota pemakaian yang sudah tercatat tidak akan diubah.`}
        confirmLabel={`Ya, ubah ke ${planLabel(selectedPlan)}`}
        variant="danger"
        loading={entitlementSaving}
        onConfirm={handleSetEntitlement}
        onCancel={() => !entitlementSaving && setEntitlementConfirmOpen(false)}
      />
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
  impersonatingId?: string | null;
  handleImpersonate?: (row: AdminAccountRow) => void;
  loadAccounts: () => void;
  setToast: (msg: string) => void;
  onOpenDetail?: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const isSuspended = row.status === 'ditangguhkan';

  const toggleOpen = () => {
    if (!isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 160;
      if (spaceBelow < menuHeight) {
        setCoords({
          top: Math.max(8, rect.top - menuHeight - 4),
          right: Math.max(8, window.innerWidth - rect.right),
        });
      } else {
        setCoords({
          top: rect.bottom + 4,
          right: Math.max(8, window.innerWidth - rect.right),
        });
      }
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative flex items-center justify-end gap-1.5">
      <Button
        size="sm"
        disabled={impersonatingId === row.id || row.role === 'superadmin'}
        onClick={() => {
          if (handleImpersonate) handleImpersonate(row);
        }}
      >
        {impersonatingId === row.id ? 'Mengalihkan...' : 'Impersonate'}
      </Button>

      <div className="relative">
        <Button
          ref={btnRef}
          size="sm"
          variant="secondary"
          onClick={toggleOpen}
          aria-label="Aksi untuk akun ini"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          Aksi{' '}
          <span className="text-[10px] ml-0.5" aria-hidden>
            ▼
          </span>
        </Button>

        {isOpen && coords && (
          <>
            <div className="fixed inset-0 z-[999998]" onClick={() => setIsOpen(false)} />
            <div
              className="fixed w-44 rounded-xl border border-[#ddd4c8] bg-white p-1 shadow-2xl z-[999999] text-left animate-in fade-in zoom-in-95 duration-100 overflow-hidden font-sans"
              style={{ top: `${coords.top}px`, right: `${coords.right}px` }}
              role="menu"
            >
              <button
                type="button"
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-[#171717] hover:bg-[#faf7f2] text-left transition-colors font-medium whitespace-nowrap"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenDetail) {
                    onOpenDetail(row.id);
                  }
                }}
              >
                <span className="material-symbols-outlined text-[16px] text-[#6d665d]" aria-hidden>
                  visibility
                </span>
                <span className="truncate">Detail</span>
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-[#171717] hover:bg-[#faf7f2] text-left transition-colors font-medium whitespace-nowrap"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  adminService.resetPassword(row.id).then((res) => {
                    if (res.ok) {
                      const details = [res.value.token, res.value.resetUrl]
                        .filter(Boolean)
                        .join(' · ');
                      setToast(
                        details
                          ? `Reset sandi untuk ${row.email}: ${details}`
                          : `Reset sandi berhasil dikirim ke ${row.email}.`,
                      );
                    } else {
                      setToast(`Gagal: ${res.error.safeMessage}`);
                    }
                  });
                }}
              >
                <span className="material-symbols-outlined text-[16px] text-[#6d665d]" aria-hidden>
                  lock_reset
                </span>
                <span className="truncate">Reset Sandi</span>
              </button>

              {row.role !== 'superadmin' && (
                <>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-[#171717] hover:bg-[#faf7f2] text-left transition-colors font-medium whitespace-nowrap"
                    role="menuitem"
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
                    <span
                      className="material-symbols-outlined text-[16px] text-[#6d665d]"
                      aria-hidden
                    >
                      {isSuspended ? 'check_circle' : 'block'}
                    </span>
                    <span className="truncate">{isSuspended ? 'Aktifkan' : 'Suspend'}</span>
                  </button>

                  <div className="border-t border-[#eee6da] my-1" />

                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-red-600 hover:bg-red-50 text-left transition-colors font-semibold whitespace-nowrap"
                    role="menuitem"
                    onClick={() => {
                      setIsOpen(false);
                      setConfirmDeleteOpen(true);
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-[16px] text-red-500"
                      aria-hidden
                    >
                      delete
                    </span>
                    <span className="truncate">Hapus</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <AdminConfirmModal
        open={confirmDeleteOpen}
        title="Hapus Akun"
        description={`Apakah Anda yakin ingin menghapus akun ${row.displayName}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Akun"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          adminService.deleteAccount(row.id).then((res) => {
            if (res.ok) {
              setToast(`Akun ${row.displayName} berhasil dihapus.`);
              loadAccounts();
            } else {
              setToast(`Gagal: ${res.error.safeMessage}`);
            }
          });
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
