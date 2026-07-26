import { useState } from 'react';
import { Button } from '@/app/components/ui';
import {
  AdminAvatar,
  AdminBulkBar,
  AdminDataTable,
  AdminPill,
  AdminToolbar,
  AdminContentLoading,
  AdminConfirmModal,
} from '@/src/features/admin/AdminChrome';
import { AccountDetailView, AccountRowActions } from '../components/AccountDetailView';
import { AdminPagination } from '../components/AdminPagination';
import { accountStatusTone } from '../utils/opsToneUtils';
import { adminService, type AdminAccountRow } from '@/src/services/admin/adminService';

export function OpsAccountsSection({
  keyStr,
  detailAccountId,
  setDetailAccountId,
  accountsLoading,
  inviteOpen,
  setInviteOpen,
  inviteEmail,
  setInviteEmail,
  inviteName,
  setInviteName,
  inviteRole,
  setInviteRole,
  inviteLoading,
  setInviteLoading,
  search,
  setSearch,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
  selectedIds,
  setSelectedIds,
  toggleSelectedId,
  clearSelection,
  accounts,
  accountsData,
  accountsMeta,
  page,
  setPage,
  impersonatingId,
  handleImpersonate,
  loadAccounts,
  setToast,
}: {
  keyStr: string;
  detailAccountId: string | null;
  setDetailAccountId: (id: string | null) => void;
  accountsLoading: boolean;
  inviteOpen: boolean;
  setInviteOpen: React.Dispatch<React.SetStateAction<boolean>>;
  inviteEmail: string;
  setInviteEmail: (v: string) => void;
  inviteName: string;
  setInviteName: (v: string) => void;
  inviteRole: '' | 'teacher' | 'school_admin' | 'superadmin';
  setInviteRole: (v: '' | 'teacher' | 'school_admin' | 'superadmin') => void;
  inviteLoading: boolean;
  setInviteLoading: (v: boolean) => void;
  search: string;
  setSearch: (v: string) => void;
  filterRole: '' | AdminAccountRow['role'];
  setFilterRole: (v: '' | AdminAccountRow['role']) => void;
  filterStatus: '' | AdminAccountRow['status'];
  setFilterStatus: (v: '' | AdminAccountRow['status']) => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  toggleSelectedId: (id: string) => void;
  clearSelection: () => void;
  accounts: AdminAccountRow[];
  accountsData: AdminAccountRow[];
  accountsMeta: { total: number; pages: number };
  page: number;
  setPage: (p: number) => void;
  impersonatingId: string | null;
  handleImpersonate: (row: AdminAccountRow) => void;
  loadAccounts: () => void;
  setToast: (msg: string) => void;
}) {
  const [confirmDeleteBulkOpen, setConfirmDeleteBulkOpen] = useState(false);

  if (detailAccountId) {
    return (
      <AccountDetailView
        accountId={detailAccountId}
        onBack={() => setDetailAccountId(null)}
        setToast={setToast}
        onUpdated={loadAccounts}
      />
    );
  }

  if (keyStr.startsWith('accounts/')) {
    const routeId = keyStr.replace('accounts/', '');
    return (
      <AccountDetailView
        accountId={routeId}
        onBack={() => {
          window.location.href = '/ops/accounts';
        }}
        setToast={setToast}
        onUpdated={loadAccounts}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-1 py-1">
        <h2 className="text-[18px] font-bold text-[#171717]">Akun</h2>
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
              .inviteAccount({
                email: inviteEmail,
                name: inviteName || undefined,
                role: inviteRole || undefined,
              })
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
              onClick={() => {
                setInviteOpen(false);
                setInviteEmail('');
                setInviteName('');
                setInviteRole('');
              }}
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
            if (selectedIds.length > 0) {
              setConfirmDeleteBulkOpen(true);
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
        rows={
          accountsMeta.total !== accountsData.length
            ? accounts
            : accounts.slice((page - 1) * 10, page * 10)
        }
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

      <AdminConfirmModal
        open={confirmDeleteBulkOpen}
        title="Hapus Akun Terpilih"
        description={`Apakah Anda yakin ingin menghapus ${selectedIds.length} akun terpilih? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Akun"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          const ids = [...selectedIds];
          setConfirmDeleteBulkOpen(false);
          adminService.bulkDelete(ids).then((res) => {
            if (res.ok) {
              setToast(`${res.value.succeeded} akun berhasil dihapus, ${res.value.failed} gagal.`);
            } else {
              setToast(`Gagal: ${res.error.safeMessage}`);
            }
            clearSelection();
            loadAccounts();
          });
        }}
        onCancel={() => setConfirmDeleteBulkOpen(false)}
      />
    </>
  );
}
