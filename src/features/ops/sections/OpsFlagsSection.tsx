import { useState } from 'react';
import { Button } from '@/app/components/ui';
import {
  AdminPageHeader,
  AdminPill,
  AdminToolbar,
  AdminDataTable,
  AdminContentLoading,
  AdminConfirmModal,
} from '@/src/features/admin/AdminChrome';
import { adminService, type AdminFlagRow } from '@/src/services/admin/adminService';

export function OpsFlagsSection({
  flagsData,
  flagsLoading,
  createFlagOpen,
  setCreateFlagOpen,
  createFlagKey,
  setCreateFlagKey,
  createFlagDesc,
  setCreateFlagDesc,
  createFlagScope,
  setCreateFlagScope,
  createFlagLoading,
  setCreateFlagLoading,
  search,
  setSearch,
  loadFlags,
  setToast,
}: {
  flagsData: AdminFlagRow[];
  flagsLoading: boolean;
  createFlagOpen: boolean;
  setCreateFlagOpen: (v: boolean) => void;
  createFlagKey: string;
  setCreateFlagKey: (v: string) => void;
  createFlagDesc: string;
  setCreateFlagDesc: (v: string) => void;
  createFlagScope: 'global' | 'pilot';
  setCreateFlagScope: (v: 'global' | 'pilot') => void;
  createFlagLoading: boolean;
  setCreateFlagLoading: (v: boolean) => void;
  search: string;
  setSearch: (v: string) => void;
  loadFlags: () => void;
  setToast: (msg: string) => void;
}) {
  const [confirmDeleteFlagKey, setConfirmDeleteFlagKey] = useState<string | null>(null);

  return (
    <>
      <div className="flex items-center justify-between px-1 py-1">
        <h2 className="text-[18px] font-bold text-[#171717]">Feature Flags</h2>
        <Button size="sm" onClick={() => setCreateFlagOpen(true)}>
          Tambah flag
        </Button>
      </div>
      {flagsLoading ? <AdminContentLoading /> : null}

      {/* Create Flag inline form */}
      {createFlagOpen ? (
        <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-3 shadow-sm">
          <h4 className="text-[13px] font-bold text-[#171717]">Flag baru</h4>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="create-flag-key"
                className="block text-[11px] font-semibold text-[#6d665d] mb-1"
              >
                Key *
              </label>
              <input
                id="create-flag-key"
                type="text"
                value={createFlagKey}
                onChange={(e) => setCreateFlagKey(e.target.value)}
                placeholder="cth: enable_pdf_v2"
                className="h-9 w-52 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] text-[#171717] placeholder:text-[#b0a89f] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
              />
            </div>
            <div>
              <label
                htmlFor="create-flag-desc"
                className="block text-[11px] font-semibold text-[#6d665d] mb-1"
              >
                Deskripsi
              </label>
              <input
                id="create-flag-desc"
                type="text"
                value={createFlagDesc}
                onChange={(e) => setCreateFlagDesc(e.target.value)}
                placeholder="Deskripsi singkat flag"
                className="h-9 w-64 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] text-[#171717] placeholder:text-[#b0a89f] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
              />
            </div>
            <div>
              <label
                htmlFor="create-flag-scope"
                className="block text-[11px] font-semibold text-[#6d665d] mb-1"
              >
                Scope
              </label>
              <select
                id="create-flag-scope"
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
                adminService
                  .createFlag({
                    key: createFlagKey.trim(),
                    description: createFlagDesc.trim() || undefined,
                    scope: createFlagScope,
                  })
                  .then((res) => {
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
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setCreateFlagOpen(false);
                setCreateFlagKey('');
                setCreateFlagDesc('');
              }}
            >
              Batal
            </Button>
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
          {
            key: 'key',
            header: 'Flag',
            render: (row) => <span className="font-mono text-[12px]">{row.key}</span>,
          },
          {
            key: 'desc',
            header: 'Deskripsi',
            render: (row) => (
              <span className="text-[12px] text-[#6d665d]">{row.description || '—'}</span>
            ),
          },
          {
            key: 'scope',
            header: 'Scope',
            render: (row) => (
              <AdminPill tone={row.scope === 'pilot' ? 'warn' : 'neutral'}>{row.scope}</AdminPill>
            ),
          },
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
                setConfirmDeleteFlagKey(row.key);
              }}
            >
              Hapus
            </Button>
          </div>
        )}
      />

      <AdminConfirmModal
        open={!!confirmDeleteFlagKey}
        title="Hapus Feature Flag"
        description={`Apakah Anda yakin ingin menghapus feature flag "${confirmDeleteFlagKey}"?`}
        confirmLabel="Ya, Hapus Flag"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          if (!confirmDeleteFlagKey) return;
          const flagKey = confirmDeleteFlagKey;
          setConfirmDeleteFlagKey(null);
          adminService.deleteFlag(flagKey).then((res) => {
            if (res.ok) {
              setToast(`Flag "${flagKey}" dihapus.`);
            } else {
              setToast(`Gagal hapus: ${res.error.safeMessage}`);
            }
            loadFlags();
          });
        }}
        onCancel={() => setConfirmDeleteFlagKey(null)}
      />
    </>
  );
}
