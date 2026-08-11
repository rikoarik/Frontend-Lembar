'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/app/components/ui';
import { AdminContentLoading, AdminPageHeader, AdminPill } from '@/src/features/admin/AdminChrome';
import { adminService, type MarketingOpsPage, type MarketingPageSlug } from '@/src/services/admin/adminService';

const PAGES: { slug: MarketingPageSlug; label: string; href: string }[] = [
  { slug: 'home', label: 'Beranda', href: '/' },
  { slug: 'harga', label: 'Harga', href: '/harga' },
  { slug: 'untuk-sekolah', label: 'Untuk sekolah', href: '/untuk-sekolah' },
];

export function OpsContentSection({ setToast }: { setToast: (message: string) => void }) {
  const [selected, setSelected] = useState<MarketingPageSlug>('home');
  const [page, setPage] = useState<MarketingOpsPage | null>(null);
  const [draftJson, setDraftJson] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = (slug = selected) => {
    setLoading(true);
    adminService.marketingPage(slug).then((result) => {
      if (result.ok) {
        setPage(result.value);
        setDraftJson(result.value.draft ? JSON.stringify(result.value.draft, null, 2) : '');
      } else setToast(`Gagal memuat konten: ${result.error.safeMessage}`);
      setLoading(false);
    });
  };

  useEffect(() => { load(selected); }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = () => {
    if (!page) return;
    let draft: unknown;
    try { draft = JSON.parse(draftJson); } catch { setToast('JSON draft tidak valid.'); return; }
    setSaving(true);
    adminService.saveMarketingDraft(selected, draft, page.summary.revision).then((result) => {
      setSaving(false);
      if (result.ok) { setPage(result.value); setDraftJson(JSON.stringify(result.value.draft, null, 2)); setToast('Draft tersimpan.'); }
      else setToast(result.error.code === 'STATE_CONFLICT' ? 'Draft berubah di tempat lain. Muat ulang sebelum menyimpan.' : `Gagal menyimpan: ${result.error.safeMessage}`);
    });
  };

  const changePublication = (action: 'publish' | 'unpublish') => {
    if (!page || !window.confirm(`${action === 'publish' ? 'Terbitkan' : 'Tarik'} halaman ini?`)) return;
    setSaving(true);
    adminService[action === 'publish' ? 'publishPage' : 'unpublishPage'](selected, page.summary.revision).then((result) => {
      setSaving(false);
      if (result.ok) { setPage(result.value); setToast(action === 'publish' ? 'Halaman diterbitkan.' : 'Halaman ditarik dari publik.'); }
      else setToast(result.error.code === 'STATE_CONFLICT' ? 'Versi sudah berubah. Muat ulang sebelum melanjutkan.' : `Gagal: ${result.error.safeMessage}`);
    });
  };

  return <div className="space-y-4">
    <AdminPageHeader title="Konten marketing" description="Hanya tiga halaman yang memang tersedia pada situs publik dapat diedit." />
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Halaman marketing">
      {PAGES.map((item) => <Button key={item.slug} size="sm" variant={selected === item.slug ? undefined : 'secondary'} onClick={() => setSelected(item.slug)}>{item.label}</Button>)}
    </div>
    {loading ? <AdminContentLoading /> : <>
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#ddd4c8] bg-white p-3">
        <AdminPill tone={page?.summary.state === 'published' ? 'ok' : 'neutral'}>{page?.summary.state ?? 'draft'}</AdminPill>
        <span className="text-xs text-[#6d665d]">Revisi {page?.summary.revision ?? '—'}</span>
        <a className="ml-auto text-xs font-semibold underline" href={PAGES.find((item) => item.slug === selected)?.href} target="_blank" rel="noreferrer">Pratinjau publik</a>
        <Button size="sm" variant="secondary" disabled={saving} onClick={() => load()}>{'Muat ulang'}</Button>
        {page?.summary.state === 'published' ? <Button size="sm" variant="secondary" disabled={saving} onClick={() => changePublication('unpublish')}>Tarik publikasi</Button> : <Button size="sm" disabled={saving || !page?.draft} onClick={() => changePublication('publish')}>Terbitkan</Button>}
      </div>
      <label className="block space-y-2" htmlFor="marketing-draft-json"><span className="text-sm font-semibold">Draft terstruktur (JSON)</span><span className="block text-xs text-[#6d665d]">Sunting schemaVersion, seo, dan blocks yang didukung; HTML bebas tidak didukung.</span>
        <textarea id="marketing-draft-json" className="min-h-[420px] w-full rounded-xl border border-[#ddd4c8] bg-white p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#171717]/20" value={draftJson} onChange={(event) => setDraftJson(event.target.value)} placeholder={'{\n  "schemaVersion": 1,\n  "seo": { "title": "", "description": "" },\n  "blocks": []\n}'} />
      </label>
      <div className="flex gap-2"><Button disabled={saving || !draftJson.trim()} onClick={save}>{saving ? 'Menyimpan…' : 'Simpan draft'}</Button></div>
    </>}
  </div>;
}
