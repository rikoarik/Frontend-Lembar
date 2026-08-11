'use client';

import { useState } from 'react';
import { Button } from '@/app/components/ui';
import { AdminContentLoading, AdminDataTable, AdminFilterChip, AdminPill, AdminToolbar } from '@/src/features/admin/AdminChrome';
import { adminService, type AdminPromptDetail, type AdminPromptRow, type AdminPromptVersion } from '@/src/services/admin/adminService';

type Props = {
  promptsData: AdminPromptRow[]; promptsLoading: boolean; createPromptOpen: boolean; setCreatePromptOpen: (v: boolean) => void;
  createPromptName: string; setCreatePromptName: (v: string) => void; createPromptSlug: string; setCreatePromptSlug: (v: string) => void;
  createPromptDesc: string; setCreatePromptDesc: (v: string) => void; createPromptText: string; setCreatePromptText: (v: string) => void;
  createPromptLoading: boolean; setCreatePromptLoading: (v: boolean) => void; search: string; setSearch: (v: string) => void;
  loadPrompts: (status?: AdminPromptRow['status']) => void; setToast: (msg: string) => void;
};

export function OpsPromptsSection(props: Props) {
  const [statusFilter, setStatusFilter] = useState<'' | AdminPromptRow['status']>('');
  const [selected, setSelected] = useState<AdminPromptRow | null>(null);
  const [detail, setDetail] = useState<AdminPromptDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [metadataSaving, setMetadataSaving] = useState(false);
  const [versionSaving, setVersionSaving] = useState(false);
  const [name, setName] = useState(''); const [description, setDescription] = useState('');
  const [descriptionLong, setDescriptionLong] = useState(''); const [contextWindow, setContextWindow] = useState(''); const [schemaId, setSchemaId] = useState('');
  const [newVersionText, setNewVersionText] = useState(''); const [newVersionNotes, setNewVersionNotes] = useState('');

  const hydrate = (value: AdminPromptDetail) => {
    setDetail(value); setName(value.name); setDescription(value.description ?? ''); setDescriptionLong(value.descriptionLong ?? '');
    setContextWindow(value.contextWindow ?? ''); setSchemaId(value.schemaId ?? ''); setNewVersionText(''); setNewVersionNotes('');
  };
  const loadDetail = async (id: string) => {
    setDetailLoading(true); setDetailError('');
    const result = await adminService.promptDetail(id);
    setDetailLoading(false);
    if (result.ok) hydrate(result.value); else setDetailError(result.error.safeMessage);
  };
  const close = () => { setSelected(null); setDetail(null); setDetailError(''); };
  const refresh = async () => { if (selected) await loadDetail(selected.id); };

  const saveMetadata = async () => {
    if (!detail || !name.trim()) return;
    setMetadataSaving(true);
    const result = await adminService.updatePromptMetadata(detail.id, {
      name: name.trim(), description: description.trim(), description_long: descriptionLong.trim(),
      context_window: contextWindow.trim() || undefined, schema_id: schemaId.trim() || null,
    });
    setMetadataSaving(false);
    if (!result.ok) return props.setToast(`Gagal menyimpan metadata: ${result.error.safeMessage}`);
    props.setToast('Metadata prompt diperbarui.'); props.loadPrompts(); await refresh();
  };
  const createVersion = async () => {
    if (!detail || !newVersionText.trim()) return;
    if (!window.confirm('Buat versi baru dan jadikan versi ini aktif? Versi aktif saat ini akan diarsipkan; teks lama tidak ditimpa.')) return;
    setVersionSaving(true);
    const result = await adminService.createPromptVersion(detail.id, { prompt_text: newVersionText.trim(), notes: newVersionNotes.trim() || undefined });
    setVersionSaving(false);
    if (!result.ok) return props.setToast(`Gagal membuat versi: ${result.error.safeMessage}`);
    props.setToast(`Versi v${result.value.version} dibuat sebagai versi aktif.`); props.loadPrompts(); await refresh();
  };
  const activateVersion = async (version: AdminPromptVersion) => {
    if (!detail || version.status === 'active') return;
    if (!window.confirm(`Pulihkan v${version.version} sebagai versi aktif? Ini adalah rollback: versi aktif saat ini akan diarsipkan, bukan dihapus.`)) return;
    setVersionSaving(true); const result = await adminService.activatePromptVersion(detail.id, version.version); setVersionSaving(false);
    if (!result.ok) return props.setToast(`Gagal memulihkan versi: ${result.error.safeMessage}`);
    props.setToast(`v${version.version} sekarang aktif. Versi sebelumnya diarsipkan.`); props.loadPrompts(); await refresh();
  };

  return <>
    <div className="flex items-center justify-between px-1 py-1"><h2 className="text-[18px] font-bold text-[#171717]">Prompt</h2><Button size="sm" onClick={() => props.setCreatePromptOpen(true)}>Buat prompt</Button></div>
    {props.promptsLoading ? <AdminContentLoading /> : null}
    {props.createPromptOpen ? <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-3 shadow-sm"><h3 className="text-[13px] font-bold">Prompt baru</h3><div className="grid grid-cols-2 gap-3"><Field label="Nama *" id="create-prompt-name" value={props.createPromptName} onChange={(v) => { props.setCreatePromptName(v); if (!props.createPromptSlug) props.setCreatePromptSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }}/><Field label="Slug *" id="create-prompt-slug" value={props.createPromptSlug} onChange={props.setCreatePromptSlug}/><Field label="Deskripsi singkat" id="create-prompt-desc" value={props.createPromptDesc} onChange={props.setCreatePromptDesc} wide/><TextField label="Teks prompt awal" id="create-prompt-text" value={props.createPromptText} onChange={props.setCreatePromptText} wide/></div><div className="flex gap-2"><Button size="sm" disabled={props.createPromptLoading || !props.createPromptName.trim() || !props.createPromptSlug.trim()} onClick={async () => { props.setCreatePromptLoading(true); const r = await adminService.createPrompt({ name: props.createPromptName.trim(), slug: props.createPromptSlug.trim(), description: props.createPromptDesc.trim() || undefined, promptText: props.createPromptText.trim() || undefined }); props.setCreatePromptLoading(false); if (!r.ok) return props.setToast(`Gagal: ${r.error.safeMessage}`); props.setToast(`Prompt "${props.createPromptName}" berhasil dibuat.`); props.setCreatePromptOpen(false); props.setCreatePromptName(''); props.setCreatePromptSlug(''); props.setCreatePromptDesc(''); props.setCreatePromptText(''); props.loadPrompts(); }}>{props.createPromptLoading ? 'Menyimpan...' : 'Buat prompt'}</Button><Button size="sm" variant="secondary" onClick={() => props.setCreatePromptOpen(false)}>Batal</Button></div></div> : null}
    <AdminToolbar search={props.search} onSearchChange={props.setSearch} searchPlaceholder="Cari nama prompt / slug / owner" filters={<>{(['', 'active', 'draft', 'archived'] as const).map((s) => <AdminFilterChip key={s || 'all'} active={statusFilter === s} onClick={() => { setStatusFilter(s); props.loadPrompts(s || undefined); }}>{s || 'Semua'}</AdminFilterChip>)}</>}/>
    <AdminDataTable rows={props.promptsData.filter((p) => { const q = props.search.trim().toLowerCase(); return (!q || p.name.toLowerCase().includes(q) || p.owner?.toLowerCase().includes(q) || (p as any).slug?.toLowerCase().includes(q)) && (!statusFilter || p.status === statusFilter); })} emptyLabel="Belum ada prompt." emptyHint="Belum ada prompt yang tersimpan." columns={[{ key: 'name', header: 'Prompt', render: (r) => <div><div className="font-semibold text-[13px]">{r.name}</div>{(r as any).slug ? <div className="font-mono text-[10px] text-[#6d665d]">{(r as any).slug}</div> : null}</div> }, { key: 'owner', header: 'Owner', render: (r) => <span>{r.owner ?? '—'}</span> }, { key: 'version', header: 'Ver', render: (r) => <span className="font-mono">v{(r as any).activeVersion ?? (r as any).version ?? 1}</span> }, { key: 'status', header: 'Status', render: (r) => <AdminPill tone={r.status === 'active' ? 'ok' : 'neutral'}>{r.status}</AdminPill> }]} rowActions={(r) => <div className="flex items-center gap-1.5"><Button size="sm" variant="secondary" aria-label={`Kelola ${r.name}`} onClick={() => { setSelected(r); void loadDetail(r.id); }}>Kelola</Button>{r.status === 'draft' ? <Button size="sm" onClick={async () => { const x = await adminService.activatePrompt(r.id); x.ok ? (props.setToast(`Prompt ${r.name} diaktifkan.`), props.loadPrompts()) : props.setToast(`Gagal: ${x.error.safeMessage}`); }}>Aktifkan</Button> : <Button size="sm" variant="secondary" onClick={async () => { const x = await adminService.deactivatePrompt(r.id); x.ok ? (props.setToast(`Prompt ${r.name} dinonaktifkan.`), props.loadPrompts()) : props.setToast(`Gagal: ${x.error.safeMessage}`); }}>Nonaktifkan</Button>}</div>}/>
    {selected ? <div className="fixed inset-0 z-50 flex justify-end bg-black/30" role="presentation" onMouseDown={close}><aside role="dialog" aria-modal="true" aria-labelledby="prompt-detail-title" className="h-full w-full max-w-2xl overflow-y-auto bg-[#faf8f5] p-5 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}><div className="mb-5 flex items-start justify-between"><div><h2 id="prompt-detail-title" className="text-lg font-bold">Kelola prompt</h2><p className="text-xs text-[#6d665d]">{selected.name}</p></div><Button size="sm" variant="secondary" onClick={close}>Tutup</Button></div>{detailLoading ? <AdminContentLoading /> : detailError ? <div role="alert" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{detailError}</p><Button size="sm" variant="secondary" onClick={() => void refresh()}>Coba lagi</Button></div> : detail ? <div className="space-y-7"><section className="space-y-3"><h3 className="font-bold">Metadata</h3><Field label="Nama *" id="prompt-name" value={name} onChange={setName}/><Field label="Deskripsi singkat" id="prompt-description" value={description} onChange={setDescription}/><TextField label="Deskripsi panjang / konteks" id="prompt-description-long" value={descriptionLong} onChange={setDescriptionLong}/><Field label="Context window" id="prompt-context-window" value={contextWindow} onChange={setContextWindow}/><Field label="Schema ID" id="prompt-schema-id" value={schemaId} onChange={setSchemaId}/><Button size="sm" disabled={metadataSaving || !name.trim()} onClick={() => void saveMetadata()}>{metadataSaving ? 'Menyimpan...' : 'Simpan metadata'}</Button></section><section className="space-y-3 border-t border-[#ddd4c8] pt-5"><div><h3 className="font-bold">Buat versi baru</h3><p className="text-xs text-[#6d665d]">Selalu membuat versi baru; versi yang ada tidak dapat ditimpa.</p></div><TextField label="Teks prompt baru *" id="prompt-new-version-text" value={newVersionText} onChange={setNewVersionText}/><TextField label="Catatan perubahan" id="prompt-new-version-notes" value={newVersionNotes} onChange={setNewVersionNotes}/><Button size="sm" disabled={versionSaving || !newVersionText.trim()} onClick={() => void createVersion()}>{versionSaving ? 'Membuat versi...' : 'Buat versi baru'}</Button></section><section className="space-y-3 border-t border-[#ddd4c8] pt-5"><h3 className="font-bold">Riwayat versi</h3>{detail.versions.length ? detail.versions.map((v) => <article key={v.id} className="space-y-2 rounded-xl border border-[#ddd4c8] bg-white p-3"><div className="flex items-center justify-between gap-2"><div><strong>v{v.version}</strong> <AdminPill tone={v.status === 'active' ? 'ok' : 'neutral'}>{v.status === 'active' ? 'aktif' : 'diarsipkan'}</AdminPill>{v.notes ? <p className="mt-1 text-xs text-[#6d665d]">{v.notes}</p> : null}</div>{v.status !== 'active' ? <Button size="sm" variant="secondary" disabled={versionSaving} onClick={() => void activateVersion(v)}>Pulihkan v{v.version}</Button> : null}</div><label className="block text-xs font-semibold text-[#6d665d]">Preview teks prompt<textarea aria-label={`Preview teks prompt v${v.version}`} readOnly rows={5} value={v.promptText} className="mt-1 w-full resize-y rounded-lg border border-[#ddd4c8] bg-[#faf8f5] p-2 font-mono text-xs text-[#333]" /></label></article>) : <p className="text-sm text-[#6d665d]">Belum ada versi.</p>}</section></div> : null}</aside></div> : null}
  </>;
}

function Field({ label, id, value, onChange, wide }: { label: string; id: string; value: string; onChange: (value: string) => void; wide?: boolean }) { return <label className={`block ${wide ? 'col-span-2' : ''} text-[11px] font-semibold text-[#6d665d]`}>{label}<input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-9 w-full rounded-xl border border-[#ddd4c8] bg-white px-3 text-[12px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20" /></label>; }
function TextField({ label, id, value, onChange, wide }: { label: string; id: string; value: string; onChange: (value: string) => void; wide?: boolean }) { return <label className={`block ${wide ? 'col-span-2' : ''} text-[11px] font-semibold text-[#6d665d]`}>{label}<textarea id={id} rows={4} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full resize-y rounded-xl border border-[#ddd4c8] bg-white px-3 py-2 font-mono text-[12px] text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#171717]/20" /></label>; }
