import { Button } from '@/app/components/ui';
import {
  AdminPageHeader,
  AdminPill,
  AdminDataTable,
  AdminContentLoading,
} from '@/src/features/admin/AdminChrome';
import { AdminPagination } from '../components/AdminPagination';
import {
  adminService,
  type AdminAuditRow,
  type AdminAuditDetail,
  type AdminMeta,
} from '@/src/services/admin/adminService';

export function OpsAuditSection({
  auditData,
  setAuditData,
  auditMeta,
  setAuditMeta,
  auditPage,
  setAuditPage,
  auditLoading,
  auditDetailId,
  setAuditDetailId,
  auditDetailData,
  setAuditDetailData,
  auditDetailLoading,
  setAuditDetailLoading,
  filterAuditAction,
  setFilterAuditAction,
  filterAuditActor,
  setFilterAuditActor,
  loadAudit,
}: {
  auditData: AdminAuditRow[];
  setAuditData: (data: AdminAuditRow[]) => void;
  auditMeta: AdminMeta;
  setAuditMeta: (meta: AdminMeta) => void;
  auditPage: number;
  setAuditPage: (p: number) => void;
  auditLoading: boolean;
  auditDetailId: string | null;
  setAuditDetailId: (id: string | null) => void;
  auditDetailData: AdminAuditDetail | null;
  setAuditDetailData: (data: AdminAuditDetail | null) => void;
  auditDetailLoading: boolean;
  setAuditDetailLoading: (v: boolean) => void;
  filterAuditAction: string;
  setFilterAuditAction: (v: string) => void;
  filterAuditActor: string;
  setFilterAuditActor: (v: string) => void;
  loadAudit: (page: number) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-1 py-1">
        <h2 className="text-[18px] font-bold text-[#171717]">Audit Log</h2>
      </div>
      {auditLoading ? <AdminContentLoading /> : null}

      {/* Audit detail modal */}
      {auditDetailId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => {
            setAuditDetailId(null);
            setAuditDetailData(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setAuditDetailId(null);
              setAuditDetailData(null);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-detail-title"
          >
            <div className="flex items-center justify-between">
              <h3 id="audit-detail-title" className="font-bold text-[16px] text-[#171717]">
                Detail Audit
              </h3>
              <button
                type="button"
                aria-label="Tutup detail audit"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6d665d] hover:bg-[#faf7f2] hover:text-[#171717] text-xl leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]/30"
                onClick={() => {
                  setAuditDetailId(null);
                  setAuditDetailData(null);
                }}
              >
                ×
              </button>
            </div>
            {auditDetailLoading ? (
              <div className="text-[13px] text-[#6d665d]">Memuat detail...</div>
            ) : auditDetailData ? (
              <div className="space-y-2 text-[13px]">
                <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                  <span className="font-semibold text-[#6d665d]">ID</span>
                  <span className="col-span-2 font-mono text-[11px] break-all">
                    {auditDetailData.id}
                  </span>
                  <span className="font-semibold text-[#6d665d]">Waktu</span>
                  <span className="col-span-2">{auditDetailData.at}</span>
                  <span className="font-semibold text-[#6d665d]">Actor</span>
                  <span className="col-span-2">
                    {auditDetailData.actorName ?? auditDetailData.actor}
                  </span>
                  <span className="font-semibold text-[#6d665d]">Aksi</span>
                  <span className="col-span-2 font-mono">{auditDetailData.action}</span>
                  <span className="font-semibold text-[#6d665d]">Target</span>
                  <span className="col-span-2">
                    {auditDetailData.targetType ? `${auditDetailData.targetType}:` : ''}
                    {auditDetailData.target}
                  </span>
                </div>
                {auditDetailData.metadata && Object.keys(auditDetailData.metadata).length > 0 ? (
                  <div>
                    <div className="font-semibold text-[#6d665d] mb-1">Metadata</div>
                    <pre className="bg-[#f5f0eb] rounded-xl p-3 text-[11px] overflow-auto max-h-40">
                      {JSON.stringify(auditDetailData.metadata, null, 2)}
                    </pre>
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
            adminService
              .audit({
                action: filterAuditAction || undefined,
                actor: filterAuditActor || undefined,
                page: 1,
                limit: 20,
              })
              .then((res) => {
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
        {filterAuditAction || filterAuditActor ? (
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
          {
            key: 'at',
            header: 'Waktu',
            render: (row) => <span className="text-[11px] tabular-nums">{row.at}</span>,
          },
          {
            key: 'actor',
            header: 'Actor',
            render: (row) => <span className="font-mono text-[11px]">{row.actor}</span>,
          },
          {
            key: 'action',
            header: 'Aksi',
            render: (row) => <span className="font-mono text-[12px]">{row.action}</span>,
          },
          {
            key: 'target',
            header: 'Target',
            render: (row) => <span className="text-[11px] text-[#6d665d]">{row.target}</span>,
          },
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
                else
                  setAuditDetailData({
                    id: row.id,
                    at: row.at,
                    actor: row.actor,
                    action: row.action,
                    targetId: row.target,
                    metadata: {},
                    createdAt: row.at,
                  } as any);
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
  );
}
