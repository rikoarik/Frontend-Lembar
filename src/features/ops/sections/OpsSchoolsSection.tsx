import { useState } from 'react';
import { Button } from '@/app/components/ui';
import {
  AdminDataTable,
  AdminPill,
  AdminToolbar,
  AdminContentLoading,
  AdminConfirmModal,
  AdminSelect,
} from '@/src/features/admin/AdminChrome';
import { AdminPagination } from '../components/AdminPagination';
import { billingTone, planTone } from '../utils/opsToneUtils';
import { adminService, type AdminSchoolRow } from '@/src/services/admin/adminService';

export function OpsSchoolsSection({
  createSchoolOpen,
  setCreateSchoolOpen,
  createSchoolName,
  setCreateSchoolName,
  createSchoolSlug,
  setCreateSchoolSlug,
  createSchoolLoading,
  setCreateSchoolLoading,
  schoolsLoading,
  schoolDetailId,
  setSchoolDetailId,
  schoolDetailData,
  setSchoolDetailData,
  schoolDetailLoading,
  setSchoolDetailLoading,
  schoolRenameValue,
  setSchoolRenameValue,
  schoolRenameSaving,
  setSchoolRenameSaving,
  search,
  setSearch,
  filterPlan,
  setFilterPlan,
  schools,
  schoolsPage,
  setSchoolsPage,
  schoolsMeta,
  loadSchools,
  setToast,
}: {
  createSchoolOpen: boolean;
  setCreateSchoolOpen: (v: boolean) => void;
  createSchoolName: string;
  setCreateSchoolName: (v: string) => void;
  createSchoolSlug: string;
  setCreateSchoolSlug: (v: string) => void;
  createSchoolLoading: boolean;
  setCreateSchoolLoading: (v: boolean) => void;
  schoolsLoading: boolean;
  schoolDetailId: string | null;
  setSchoolDetailId: (id: string | null) => void;
  schoolDetailData: {
    school: {
      id: string;
      name: string;
      slug: string;
      plan: string;
      state: string;
      seats: number;
      renewsAt: string;
    };
    members: {
      id: string;
      email: string;
      name: string;
      username: string | null;
      roles: string[];
      createdAt: string;
    }[];
    memberCount: number;
  } | null;
  setSchoolDetailData: (data: any) => void;
  schoolDetailLoading: boolean;
  setSchoolDetailLoading: (v: boolean) => void;
  schoolRenameValue: string;
  setSchoolRenameValue: (v: string) => void;
  schoolRenameSaving: boolean;
  setSchoolRenameSaving: (v: boolean) => void;
  search: string;
  setSearch: (v: string) => void;
  filterPlan: '' | AdminSchoolRow['plan'];
  setFilterPlan: (v: '' | AdminSchoolRow['plan']) => void;
  schools: AdminSchoolRow[];
  schoolsPage: number;
  setSchoolsPage: (p: number) => void;
  schoolsMeta: { total: number; pages: number };
  loadSchools: (pg?: number, searchVal?: string, planVal?: AdminSchoolRow['plan']) => void;
  setToast: (msg: string) => void;
}) {
  const [confirmPlanModal, setConfirmPlanModal] = useState<{
    rowId: string;
    schoolName: string;
    currentPlan: string;
    nextPlan: string;
    entitlementPlan: 'pro' | 'plus' | 'free';
  } | null>(null);
  const [confirmDeleteSchoolModal, setConfirmDeleteSchoolModal] = useState<{
    id: string;
    name: string;
  } | null>(null);

  return (
    <>
      <div className="flex items-center justify-between px-1 py-1">
        <h2 className="text-[18px] font-bold text-[#171717]">Sekolah</h2>
        <Button size="sm" onClick={() => setCreateSchoolOpen(true)}>
          Tambah sekolah
        </Button>
      </div>

      {/* Create School inline form */}
      {createSchoolOpen ? (
        <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-3 shadow-sm">
          <h4 className="text-[13px] font-bold text-[#171717]">Sekolah baru</h4>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label
                htmlFor="create-school-name"
                className="block text-[11px] font-semibold text-[#6d665d] mb-1"
              >
                Nama sekolah *
              </label>
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
              <label
                htmlFor="create-school-slug"
                className="block text-[11px] font-semibold text-[#6d665d] mb-1"
              >
                Slug (opsional)
              </label>
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
                adminService
                  .createSchool({
                    name: createSchoolName.trim(),
                    slug: createSchoolSlug.trim() || undefined,
                  })
                  .then((res) => {
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
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setCreateSchoolOpen(false);
                setCreateSchoolName('');
                setCreateSchoolSlug('');
              }}
            >
              Batal
            </Button>
          </div>
        </div>
      ) : null}

      {schoolsLoading ? <AdminContentLoading /> : null}

      {/* School detail modal */}
      {schoolDetailId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => {
            setSchoolDetailId(null);
            setSchoolDetailData(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[16px] text-[#171717]">Detail Sekolah</h3>
              <button
                className="text-[#6d665d] hover:text-[#171717] text-xl"
                onClick={() => {
                  setSchoolDetailId(null);
                  setSchoolDetailData(null);
                }}
              >
                ×
              </button>
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
                  <span className="col-span-2 font-mono text-[11px]">
                    {schoolDetailData.school.slug}
                  </span>
                  <span className="font-semibold text-[#6d665d]">Plan</span>
                  <span className="col-span-2">
                    <AdminPill
                      tone={planTone(schoolDetailData.school.plan as AdminSchoolRow['plan'])}
                    >
                      {schoolDetailData.school.plan}
                    </AdminPill>
                  </span>
                  <span className="font-semibold text-[#6d665d]">State</span>
                  <span className="col-span-2">
                    <AdminPill tone={billingTone(schoolDetailData.school.state as any)}>
                      {schoolDetailData.school.state}
                    </AdminPill>
                  </span>
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
                      disabled={
                        schoolRenameSaving ||
                        !schoolRenameValue.trim() ||
                        schoolRenameValue === schoolDetailData.school.name
                      }
                      onClick={() => {
                        setSchoolRenameSaving(true);
                        adminService
                          .renameSchool(schoolDetailId, schoolRenameValue.trim())
                          .then((res) => {
                            if (res.ok) {
                              setToast(`Sekolah berhasil diganti nama.`);
                              loadSchools();
                              setSchoolDetailData({
                                ...schoolDetailData,
                                school: {
                                  ...schoolDetailData.school,
                                  name: schoolRenameValue.trim(),
                                },
                              });
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
                  <div className="text-[12px] font-semibold text-[#171717]">
                    Anggota ({schoolDetailData.memberCount})
                  </div>
                  <div className="rounded-xl border border-[#ddd4c8]/60 overflow-hidden">
                    {schoolDetailData.members.length === 0 ? (
                      <div className="p-4 text-[12px] text-[#6d665d]">Belum ada anggota.</div>
                    ) : (
                      <table className="w-full text-[12px]">
                        <thead className="bg-[#faf8f5]">
                          <tr>
                            <th className="text-left px-3 py-2 font-semibold text-[#6d665d]">
                              Nama
                            </th>
                            <th className="text-left px-3 py-2 font-semibold text-[#6d665d]">
                              Email
                            </th>
                            <th className="text-left px-3 py-2 font-semibold text-[#6d665d]">
                              Role
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {schoolDetailData.members.map((m) => (
                            <tr key={m.id} className="border-t border-[#f0e8de]">
                              <td className="px-3 py-2">{m.name || m.username || '—'}</td>
                              <td className="px-3 py-2 text-[#6d665d]">{m.email}</td>
                              <td className="px-3 py-2">
                                <AdminPill
                                  tone={m.roles.includes('school_admin') ? 'info' : 'neutral'}
                                >
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
                      setConfirmDeleteSchoolModal({
                        id: schoolDetailId,
                        name: schoolDetailData.school.name,
                      });
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
            <AdminSelect
              value={filterPlan}
              onChange={(val) => setFilterPlan(val as typeof filterPlan)}
              options={[
                { value: '', label: 'Semua plan' },
                { value: 'pilot', label: 'pilot' },
                { value: 'active', label: 'active' },
                { value: 'grace', label: 'grace' },
                { value: 'blocked', label: 'blocked' },
              ]}
            />
          </div>
        }
      />
      <AdminDataTable
        rows={schools}
        emptyLabel="Tidak ada sekolah yang cocok."
        emptyHint="Coba hapus filter plan atau ubah kata kunci."
        columns={[
          {
            key: 'name',
            header: 'Sekolah',
            render: (row) => <span className="font-semibold">{row.name}</span>,
          },
          {
            key: 'plan',
            header: 'Plan',
            render: (row) => <AdminPill tone={planTone(row.plan)}>{row.plan}</AdminPill>,
          },
          {
            key: 'teachers',
            header: 'Guru',
            render: (row) => <span className="tabular-nums">{String(row.teachers)}</span>,
          },
          {
            key: 'seats',
            header: 'Seats',
            render: (row) => <span className="tabular-nums">{String(row.seats)}</span>,
          },
          {
            key: 'renew',
            header: 'Perpanjangan',
            render: (row) => <span className="text-[11px] text-[#6d665d]">{row.renewsAt}</span>,
          },
          {
            key: 'owner',
            header: 'Owner',
            render: (row) => <span className="text-[12px]">{row.owner}</span>,
          },
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
              onClick={() =>
                window.open(`/ops?section=billing&q=${encodeURIComponent(row.name)}`, '_self')
              }
            >
              Billing
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const nextPlan =
                  row.plan === 'active' ? 'grace' : row.plan === 'grace' ? 'blocked' : 'active';
                const entitlementPlan: 'pro' | 'free' = nextPlan === 'active' ? 'pro' : 'free';
                setConfirmPlanModal({
                  rowId: row.id,
                  schoolName: row.name,
                  currentPlan: row.plan,
                  nextPlan,
                  entitlementPlan,
                });
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

      <AdminConfirmModal
        open={!!confirmPlanModal}
        title="Ubah Plan Sekolah"
        description={`Apakah Anda yakin ingin mengubah plan ${confirmPlanModal?.schoolName} dari "${confirmPlanModal?.currentPlan}" ke "${confirmPlanModal?.nextPlan}"?`}
        confirmLabel="Ya, Ubah Plan"
        cancelLabel="Batal"
        variant="warning"
        onConfirm={() => {
          if (!confirmPlanModal) return;
          const { rowId, schoolName, nextPlan, entitlementPlan } = confirmPlanModal;
          setConfirmPlanModal(null);
          adminService
            .schoolDetail(rowId)
            .then((detail) => {
              if (!detail.ok) {
                setToast(`Gagal: ${detail.error.safeMessage}`);
                return;
              }
              return adminService.setEntitlement(detail.value.school.workspaceId, {
                plan: entitlementPlan,
              });
            })
            .then((res) => {
              if (!res) return;
              if (res.ok) {
                setToast(`Plan ${schoolName} diperbarui ke ${nextPlan}.`);
                loadSchools();
              } else {
                setToast(`Gagal: ${res.error.safeMessage}`);
              }
            });
        }}
        onCancel={() => setConfirmPlanModal(null)}
      />

      <AdminConfirmModal
        open={!!confirmDeleteSchoolModal}
        title="Hapus Sekolah"
        description={`Apakah Anda yakin ingin menghapus sekolah "${confirmDeleteSchoolModal?.name}"? Aksi ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Sekolah"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={() => {
          if (!confirmDeleteSchoolModal) return;
          const { id } = confirmDeleteSchoolModal;
          setConfirmDeleteSchoolModal(null);
          adminService.deleteSchool(id).then((res) => {
            if (res.ok) {
              setToast(`Sekolah dihapus.`);
              setSchoolDetailId(null);
              setSchoolDetailData(null);
              loadSchools();
            } else {
              setToast(`Gagal: ${res.error.safeMessage}`);
            }
          });
        }}
        onCancel={() => setConfirmDeleteSchoolModal(null)}
      />
    </>
  );
}
