'use client';

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
import { jobTone } from '../utils/opsToneUtils';
import { adminService, type AdminJobRow } from '@/src/services/admin/adminService';

export function OpsJobsSection({
  jobs,
  jobsData,
  jobsLoading,
  jobsPage,
  setJobsPage,
  jobsMeta,
  jobDetailId,
  setJobDetailId,
  jobDetailData,
  setJobDetailData,
  jobDetailLoading,
  setJobDetailLoading,
  search,
  setSearch,
  filterJobStatus,
  setFilterJobStatus,
  loadJobs,
  setToast,
}: {
  jobs: AdminJobRow[];
  jobsData: AdminJobRow[];
  jobsLoading: boolean;
  jobsPage: number;
  setJobsPage: (p: number) => void;
  jobsMeta: { total: number; pages: number };
  jobDetailId: string | null;
  setJobDetailId: (id: string | null) => void;
  jobDetailData: Record<string, unknown> | null;
  setJobDetailData: (data: Record<string, unknown> | null) => void;
  jobDetailLoading: boolean;
  setJobDetailLoading: (v: boolean) => void;
  search: string;
  setSearch: (v: string) => void;
  filterJobStatus: '' | AdminJobRow['status'];
  setFilterJobStatus: (v: '' | AdminJobRow['status']) => void;
  loadJobs: (pg?: number, searchVal?: string, statusVal?: AdminJobRow['status']) => void;
  setToast: (msg: string) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-1 py-1">
        <h2 className="text-[18px] font-bold text-[#171717]">Jobs</h2>
        <Button
          size="sm"
          onClick={() => {
            const failedIds = jobsData.filter((j) => j.status === 'failed').map((j) => j.id);
            if (failedIds.length === 0) {
              setToast('Tidak ada job failed.');
              return;
            }
            Promise.all(failedIds.map((id) => adminService.retryJob(id))).then((results) => {
              const ok = results.filter((r) => r.ok).length;
              setToast(`${ok} dari ${failedIds.length} job failed di-retry.`);
              loadJobs();
            });
          }}
        >
          Retry semua failed
        </Button>
      </div>
      {jobsLoading ? <AdminContentLoading /> : null}

      {/* Job detail modal */}
      {jobDetailId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => {
            setJobDetailId(null);
            setJobDetailData(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[16px] text-[#171717]">Detail Job</h3>
              <button
                className="text-[#6d665d] hover:text-[#171717] text-xl"
                onClick={() => {
                  setJobDetailId(null);
                  setJobDetailData(null);
                }}
              >
                ×
              </button>
            </div>
            {jobDetailLoading ? (
              <div className="text-[13px] text-[#6d665d]">Memuat...</div>
            ) : jobDetailData ? (
              <div className="space-y-3 text-[13px]">
                <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                  <span className="font-semibold text-[#6d665d]">ID</span>
                  <span className="col-span-2 font-mono text-[11px] break-all">
                    {String(jobDetailData.id ?? '—')}
                  </span>
                  <span className="font-semibold text-[#6d665d]">Tipe</span>
                  <span className="col-span-2 font-mono">{String(jobDetailData.type ?? '—')}</span>
                  <span className="font-semibold text-[#6d665d]">Status</span>
                  <span className="col-span-2">
                    <AdminPill tone={jobTone((jobDetailData.status as AdminJobRow['status']) ?? 'failed')}>
                      {String(jobDetailData.status ?? '—')}
                    </AdminPill>
                  </span>
                  <span className="font-semibold text-[#6d665d]">Tenant</span>
                  <span className="col-span-2">{String(jobDetailData.workspace_id ?? '—')}</span>
                  <span className="font-semibold text-[#6d665d]">Attempt</span>
                  <span className="col-span-2 tabular-nums">{String(jobDetailData.attempt ?? 0)}</span>
                  <span className="font-semibold text-[#6d665d]">Dibuat</span>
                  <span className="col-span-2 text-[11px]">
                    {jobDetailData.created_at
                      ? new Date(String(jobDetailData.created_at)).toLocaleString('id-ID')
                      : '—'}
                  </span>
                  <span className="font-semibold text-[#6d665d]">Update</span>
                  <span className="col-span-2 text-[11px]">
                    {jobDetailData.updated_at
                      ? new Date(String(jobDetailData.updated_at)).toLocaleString('id-ID')
                      : '—'}
                  </span>
                </div>
                {jobDetailData.input ? (
                  <div>
                    <div className="font-semibold text-[#6d665d] mb-1 text-[12px]">Input payload</div>
                    <pre className="bg-[#f5f0eb] rounded-xl p-3 text-[10px] overflow-auto max-h-32">
                      {JSON.stringify(jobDetailData.input, null, 2)}
                    </pre>
                  </div>
                ) : null}
                {jobDetailData.error ? (
                  <div>
                    <div className="font-semibold text-[#c9703a] mb-1 text-[12px]">Error</div>
                    <pre className="bg-[#fff3ee] rounded-xl p-3 text-[10px] overflow-auto max-h-32 text-[#c9703a]">
                      {String(jobDetailData.error)}
                    </pre>
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
          { key: 'attempt', header: 'Attempt', render: (row) => <span className="tabular-nums text-[12px]">{row.attempt}</span> },
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
  );
}
