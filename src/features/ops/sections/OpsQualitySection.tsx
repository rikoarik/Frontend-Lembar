import { Button } from '@/app/components/ui';
import {
  AdminPageHeader,
  AdminPill,
  AdminToolbar,
  AdminFilterChip,
  AdminDataTable,
  AdminContentLoading,
} from '@/src/features/admin/AdminChrome';
import { AdminPagination } from '../components/AdminPagination';
import { qualityTone } from '../utils/opsToneUtils';
import { adminService, type AdminQualityRow } from '@/src/services/admin/adminService';

export function OpsQualitySection({
  quality,
  qualityLoading,
  qualityPage,
  setQualityPage,
  qualityMeta,
  qualityDetailId,
  setQualityDetailId,
  qualityDetailData,
  setQualityDetailData,
  qualityDetailLoading,
  setQualityDetailLoading,
  qualityNotesDraft,
  setQualityNotesDraft,
  qualityNotesSaving,
  setQualityNotesSaving,
  search,
  setSearch,
  filterQuality,
  setFilterQuality,
  loadQuality,
  setToast,
}: {
  quality: AdminQualityRow[];
  qualityLoading: boolean;
  qualityPage: number;
  setQualityPage: (p: number) => void;
  qualityMeta: { total: number; pages: number };
  qualityDetailId: string | null;
  setQualityDetailId: (id: string | null) => void;
  qualityDetailData: {
    id: string;
    reason: string;
    status: string;
    reporter: string;
    notes: string;
    workspaceId: string;
    createdAt: string;
  } | null;
  setQualityDetailData: (data: any) => void;
  qualityDetailLoading: boolean;
  setQualityDetailLoading: (v: boolean) => void;
  qualityNotesDraft: string;
  setQualityNotesDraft: (v: string) => void;
  qualityNotesSaving: boolean;
  setQualityNotesSaving: (v: boolean) => void;
  search: string;
  setSearch: (v: string) => void;
  filterQuality: '' | AdminQualityRow['status'];
  setFilterQuality: (v: '' | AdminQualityRow['status']) => void;
  loadQuality: (pg?: number, searchVal?: string, qualityVal?: AdminQualityRow['status']) => void;
  setToast: (msg: string) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-1 py-1">
        <h2 className="text-[18px] font-bold text-[#171717]">Quality</h2>
      </div>
      {qualityLoading ? <AdminContentLoading /> : null}

      {/* Quality detail modal */}
      {qualityDetailId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => {
            setQualityDetailId(null);
            setQualityDetailData(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[16px] text-[#171717]">Detail Quality Report</h3>
              <button
                className="text-[#6d665d] hover:text-[#171717] text-xl"
                onClick={() => {
                  setQualityDetailId(null);
                  setQualityDetailData(null);
                }}
              >
                ×
              </button>
            </div>
            {qualityDetailLoading ? (
              <div className="text-[13px] text-[#6d665d]">Memuat...</div>
            ) : qualityDetailData ? (
              <div className="space-y-4 text-[13px]">
                <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                  <span className="font-semibold text-[#6d665d]">ID</span>
                  <span className="col-span-2 font-mono text-[10px] break-all">
                    {qualityDetailData.id}
                  </span>
                  <span className="font-semibold text-[#6d665d]">Reporter</span>
                  <span className="col-span-2">{qualityDetailData.reporter}</span>
                  <span className="font-semibold text-[#6d665d]">Workspace</span>
                  <span className="col-span-2 font-mono text-[10px]">
                    {qualityDetailData.workspaceId}
                  </span>
                  <span className="font-semibold text-[#6d665d]">Status</span>
                  <span className="col-span-2">
                    <AdminPill
                      tone={qualityTone(qualityDetailData.status as AdminQualityRow['status'])}
                    >
                      {qualityDetailData.status}
                    </AdminPill>
                  </span>
                  <span className="font-semibold text-[#6d665d]">Dibuat</span>
                  <span className="col-span-2 text-[11px]">
                    {new Date(qualityDetailData.createdAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-[#6d665d] mb-1">Alasan laporan</div>
                  <div className="bg-[#faf8f5] rounded-xl p-3 text-[12px]">
                    {qualityDetailData.reason}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-[#171717] mb-1 text-[12px]">
                    Catatan internal
                  </div>
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
                      adminService
                        .updateQualityNotes(qualityDetailId, { notes: qualityNotesDraft })
                        .then((res) => {
                          if (res.ok) {
                            setToast('Catatan disimpan.');
                            setQualityDetailData({
                              ...qualityDetailData,
                              notes: qualityNotesDraft,
                            });
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
                <div className="flex items-center gap-2 border-t border-[#eee6da] pt-3">
                  {qualityDetailData.status !== 'triaged' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        adminService
                          .updateQualityNotes(qualityDetailId, {
                            status: 'triaged',
                            expectedStatus: qualityDetailData.status as
                              | 'open'
                              | 'triaged'
                              | 'closed',
                          })
                          .then((res) => {
                            if (res.ok) {
                              setToast('Report ditriage.');
                              setQualityDetailData({ ...qualityDetailData, status: 'triaged' });
                              loadQuality();
                            } else setToast(`Gagal: ${res.error.safeMessage}`);
                          });
                      }}
                    >
                      Triage
                    </Button>
                  ) : null}
                  {qualityDetailData.status !== 'closed' ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        adminService
                          .updateQualityNotes(qualityDetailId, {
                            status: 'closed',
                            expectedStatus: qualityDetailData.status as
                              | 'open'
                              | 'triaged'
                              | 'closed',
                          })
                          .then((res) => {
                            if (res.ok) {
                              setToast('Report ditutup.');
                              setQualityDetailData({ ...qualityDetailData, status: 'closed' });
                              loadQuality();
                            } else setToast(`Gagal: ${res.error.safeMessage}`);
                          });
                      }}
                    >
                      Tutup report
                    </Button>
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
  );
}
