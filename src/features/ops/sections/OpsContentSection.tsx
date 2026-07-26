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
import { adminService, type AdminContentRow } from '@/src/services/admin/adminService';

export function OpsContentSection({
  content,
  contentLoading,
  createSchoolOpen,
  setCreateSchoolOpen,
  createSchoolName,
  setCreateSchoolName,
  createSchoolSlug,
  setCreateSchoolSlug,
  createSchoolLoading,
  setCreateSchoolLoading,
  search,
  setSearch,
  filterContent,
  setFilterContent,
  contentPage,
  setContentPage,
  contentMeta,
  loadContent,
  setToast,
}: {
  content: AdminContentRow[];
  contentLoading: boolean;
  createSchoolOpen: boolean;
  setCreateSchoolOpen: (v: boolean) => void;
  createSchoolName: string;
  setCreateSchoolName: (v: string) => void;
  createSchoolSlug: string;
  setCreateSchoolSlug: (v: string) => void;
  createSchoolLoading: boolean;
  setCreateSchoolLoading: (v: boolean) => void;
  search: string;
  setSearch: (v: string) => void;
  filterContent: '' | AdminContentRow['status'];
  setFilterContent: (v: '' | AdminContentRow['status']) => void;
  contentPage: number;
  setContentPage: (p: number) => void;
  contentMeta: { total: number; pages: number };
  loadContent: () => void;
  setToast: (msg: string) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-1 py-1">
        <h2 className="text-[18px] font-bold text-[#171717]">Konten</h2>
        <Button size="sm" onClick={() => setCreateSchoolOpen(true)}>
          Draft baru
        </Button>
      </div>
      {contentLoading ? <AdminContentLoading /> : null}

      {/* Inline create content form */}
      {createSchoolOpen ? (
        <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-3 shadow-sm">
          <h4 className="text-[13px] font-bold text-[#171717]">Draft halaman baru</h4>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="create-content-slug" className="block text-[11px] font-semibold text-[#6d665d] mb-1">
                Slug * (cth: tentang-kami)
              </label>
              <input
                id="create-content-slug"
                type="text"
                value={createSchoolName}
                onChange={(e) => setCreateSchoolName(e.target.value)}
                placeholder="tentang-kami"
                className="h-9 w-52 rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] text-[#171717] placeholder:text-[#b0a89f] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
              />
            </div>
            <div>
              <label htmlFor="create-content-title" className="block text-[11px] font-semibold text-[#6d665d] mb-1">
                Judul
              </label>
              <input
                id="create-content-title"
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
                adminService
                  .createMarketingPage({
                    slug: createSchoolName.trim(),
                    title: createSchoolSlug.trim() || createSchoolName.trim(),
                  })
                  .then((res) => {
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
                const action =
                  row.status === 'published'
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
  );
}
