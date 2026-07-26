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
import { adminService, type AdminPromptRow } from '@/src/services/admin/adminService';

export function OpsPromptsSection({
  promptsData,
  promptsLoading,
  createPromptOpen,
  setCreatePromptOpen,
  createPromptName,
  setCreatePromptName,
  createPromptSlug,
  setCreatePromptSlug,
  createPromptDesc,
  setCreatePromptDesc,
  createPromptText,
  setCreatePromptText,
  createPromptLoading,
  setCreatePromptLoading,
  search,
  setSearch,
  loadPrompts,
  setToast,
}: {
  promptsData: AdminPromptRow[];
  promptsLoading: boolean;
  createPromptOpen: boolean;
  setCreatePromptOpen: (v: boolean) => void;
  createPromptName: string;
  setCreatePromptName: (v: string) => void;
  createPromptSlug: string;
  setCreatePromptSlug: (v: string) => void;
  createPromptDesc: string;
  setCreatePromptDesc: (v: string) => void;
  createPromptText: string;
  setCreatePromptText: (v: string) => void;
  createPromptLoading: boolean;
  setCreatePromptLoading: (v: boolean) => void;
  search: string;
  setSearch: (v: string) => void;
  loadPrompts: () => void;
  setToast: (msg: string) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-1 py-1">
        <h2 className="text-[18px] font-bold text-[#171717]">Prompt</h2>
        <Button size="sm" onClick={() => setCreatePromptOpen(true)}>
          Buat prompt
        </Button>
      </div>
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
                id="create-prompt-name"
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
                id="create-prompt-slug"
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
        emptyHint="Belum ada prompt yang tersimpan."
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
  );
}
