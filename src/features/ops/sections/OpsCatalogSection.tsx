import { useState } from 'react';
import { Button } from '@/app/components/ui';
import {
  AdminPageHeader,
  AdminPill,
  AdminStatCards,
  AdminContentLoading,
  AdminEmptyState,
  AdminConfirmModal,
} from '@/src/features/admin/AdminChrome';
import { adminService } from '@/src/services/admin/adminService';

const JENJANG_LIST = ['SD', 'SMP', 'SMA', 'SMK'] as const;
type Jenjang = (typeof JENJANG_LIST)[number];

const PREDEFINED_GRADES: Record<Jenjang, string[]> = {
  SD: ['Kelas 1 SD', 'Kelas 2 SD', 'Kelas 3 SD', 'Kelas 4 SD', 'Kelas 5 SD', 'Kelas 6 SD'],
  SMP: ['Kelas 7 SMP', 'Kelas 8 SMP', 'Kelas 9 SMP'],
  SMA: ['Kelas 10 SMA', 'Kelas 11 SMA', 'Kelas 12 SMA'],
  SMK: ['Kelas 10 SMK', 'Kelas 11 SMK', 'Kelas 12 SMK'],
};

/** Infer jenjang from grade label — fallback to 'SD' if no match */
function inferJenjang(label: string): Jenjang {
  const upper = label.toUpperCase().trim();
  if (upper.includes('SMK')) return 'SMK';
  if (upper.includes('SMA')) return 'SMA';
  if (upper.includes('SMP')) return 'SMP';
  if (upper.includes('SD')) return 'SD';
  if (/\b(10|11|12)\b/.test(upper)) return 'SMA';
  if (/\b(7|8|9)\b/.test(upper)) return 'SMP';
  if (/\b([1-6])\b/.test(upper)) return 'SD';
  return 'SD';
}

export function OpsCatalogSection({
  catalogGrades,
  setCatalogGrades,
  catalogSubjects,
  setCatalogSubjects,
  catalogSelectedGrade,
  setCatalogSelectedGrade,
  catalogLoading,
  setCatalogLoading,
  catalogSubjectsLoading,
  setCatalogSubjectsLoading,
  catalogUpdatingIds,
  setCatalogUpdatingIds,
  catalogShowAddGrade,
  setCatalogShowAddGrade,
  catalogAddingGrade,
  setCatalogAddingGrade,
  catalogShowAddSubject,
  setCatalogShowAddSubject,
  catalogNewSubjectLabel,
  setCatalogNewSubjectLabel,
  catalogAddingSubject,
  setCatalogAddingSubject,
  catalogJenjangFilter,
  setCatalogJenjangFilter,
  catalogAddGradeJenjang,
  setCatalogAddGradeJenjang,
  catalogAddGradePredefined,
  setCatalogAddGradePredefined,
  setToast,
}: {
  catalogGrades: { id: string; label: string; status: string; jenjang?: string }[];
  setCatalogGrades: React.Dispatch<React.SetStateAction<{ id: string; label: string; status: string; jenjang?: string }[]>>;
  catalogSubjects: { id: string; label: string; status: string }[];
  setCatalogSubjects: React.Dispatch<React.SetStateAction<{ id: string; label: string; status: string }[]>>;
  catalogSelectedGrade: string;
  setCatalogSelectedGrade: (v: string) => void;
  catalogLoading: boolean;
  setCatalogLoading: (v: boolean) => void;
  catalogSubjectsLoading: boolean;
  setCatalogSubjectsLoading: (v: boolean) => void;
  catalogUpdatingIds: Set<string>;
  setCatalogUpdatingIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  catalogShowAddGrade: boolean;
  setCatalogShowAddGrade: React.Dispatch<React.SetStateAction<boolean>>;
  catalogAddingGrade: boolean;
  setCatalogAddingGrade: (v: boolean) => void;
  catalogShowAddSubject: boolean;
  setCatalogShowAddSubject: React.Dispatch<React.SetStateAction<boolean>>;
  catalogNewSubjectLabel: string;
  setCatalogNewSubjectLabel: (v: string) => void;
  catalogAddingSubject: boolean;
  setCatalogAddingSubject: (v: boolean) => void;
  catalogJenjangFilter: string;
  setCatalogJenjangFilter: (v: string) => void;
  catalogAddGradeJenjang: string | null;
  setCatalogAddGradeJenjang: (v: string | null) => void;
  catalogAddGradePredefined: string;
  setCatalogAddGradePredefined: (v: string) => void;
  setToast: (msg: string) => void;
}) {
  const [confirmDeleteGrade, setConfirmDeleteGrade] = useState<{ id: string; label: string } | null>(null);
  const [confirmDeleteSubject, setConfirmDeleteSubject] = useState<{ id: string; label: string } | null>(null);
  const [addGradeCustom, setAddGradeCustom] = useState(false);
  const [addGradeCustomLabel, setAddGradeCustomLabel] = useState('');
  const activeGradesCount = catalogGrades.filter((g) => g.status === 'active').length;
  const selectedGradeObj = catalogGrades.find((g) => g.id === catalogSelectedGrade);
  const activeSubjectsCount = catalogSubjects.filter((s) => s.status === 'active').length;

  const refreshCatalog = () => {
    setCatalogLoading(true);
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
    fetch(`${base}/catalog/grades`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => {
        setCatalogGrades(j?.data ?? []);
        setCatalogLoading(false);
        const cur = catalogSelectedGrade || j?.data?.[0]?.id;
        if (cur) {
          setCatalogSelectedGrade(cur);
          setCatalogSubjectsLoading(true);
          fetch(`${base}/catalog/subjects?gradeId=${cur}`, { credentials: 'include' })
            .then((r) => r.json())
            .then((js) => {
              setCatalogSubjects(js?.data ?? []);
              setCatalogSubjectsLoading(false);
            })
            .catch(() => setCatalogSubjectsLoading(false));
        }
      })
      .catch(() => setCatalogLoading(false));
  };

  /** Normalize jenjang to uppercase SD/SMP/SMA/SMK */
function normalizeJenjang(raw?: string): Jenjang | undefined {
  if (!raw) return undefined;
  const upper = raw.toUpperCase().trim();
  if (upper === 'SMK') return 'SMK';
  if (upper === 'SMA') return 'SMA';
  if (upper === 'SMP') return 'SMP';
  if (upper === 'SD') return 'SD';
  return undefined;
}

/** Filter & group grades by jenjang */
  const gradeJenjang = (g: { label: string; jenjang?: string }) =>
    normalizeJenjang(g.jenjang) || inferJenjang(g.label);

  const filteredGrades =
    catalogJenjangFilter === 'semua'
      ? catalogGrades
      : catalogGrades.filter(
          (g) => gradeJenjang(g).toLowerCase() === catalogJenjangFilter.toLowerCase(),
        );

  // Grouped: { SD: [...], SMP: [...], ... }
  const groupedGrades: Partial<Record<Jenjang, typeof catalogGrades>> = {};
  if (catalogJenjangFilter === 'semua') {
    for (const j of JENJANG_LIST) {
      const items = filteredGrades.filter((g) => gradeJenjang(g) === j);
      if (items.length > 0) groupedGrades[j] = items;
    }
  } else {
    const matchKey =
      JENJANG_LIST.find(
        (j) => j.toLowerCase() === catalogJenjangFilter.toLowerCase(),
      ) || 'SD';
    groupedGrades[matchKey] = filteredGrades;
  }

  const resetAddGradeForm = () => {
    setCatalogShowAddGrade(false);
    setCatalogAddGradeJenjang(null);
    setCatalogAddGradePredefined('');
    setAddGradeCustom(false);
    setAddGradeCustomLabel('');
  };

  const submitGrade = async () => {
    const jenjang = catalogAddGradeJenjang as Jenjang;
    const label = addGradeCustom ? addGradeCustomLabel.trim() : catalogAddGradePredefined;
    if (!label) return;
    setCatalogAddingGrade(true);
    const res = await adminService.createGrade({ label, jenjang } as any);
    if (res.ok) {
      setToast(`Grade "${label}" berhasil ditambahkan.`);
      resetAddGradeForm();
      refreshCatalog();
    } else {
      setToast(`Gagal: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
    }
    setCatalogAddingGrade(false);
  };

  return (
    <>
      <div className="flex items-center justify-between px-1 py-1">
        <h2 className="text-[18px] font-bold text-[#171717]">Katalog</h2>
        <Button
          size="sm"
          variant="secondary"
          disabled={catalogLoading}
          onClick={() => {
            refreshCatalog();
            setToast('Memperbarui data katalog...');
          }}
          className="inline-flex items-center justify-center gap-1.5"
        >
          <span className={`material-symbols-outlined text-[16px] leading-none inline-flex items-center justify-center shrink-0 align-middle ${catalogLoading ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span className="leading-none">Refresh</span>
        </Button>
      </div>

      {/* ── Jenjang Filter Tabs ── */}
      <div className="flex items-center gap-2 px-1 pb-2">
        {[{ key: 'semua', label: 'Semua' }, ...JENJANG_LIST.map((j) => ({ key: j.toLowerCase(), label: j }))].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCatalogJenjangFilter(tab.key)}
            className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
              catalogJenjangFilter === tab.key
                ? 'bg-[#171717] text-white'
                : 'bg-[#faf8f5] border border-[#ddd4c8] text-[#57534e] hover:bg-[#f4ede4]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {catalogLoading ? <AdminContentLoading /> : null}

      {/* Grade list + Subjects list grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Grades Panel ── */}
        <div className="flex flex-col min-h-[420px] rounded-2xl border border-[#ddd4c8]/80 bg-white p-5 shadow-[0_2px_12px_rgba(23,23,23,0.01)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#eee6da]/60 pb-3">
            <div>
              <h3 className="text-[14px] font-bold text-[#171717]">
                Tingkat Kelas / Grade ({catalogGrades.length})
              </h3>
              <p className="text-[12px] text-[#57534e]">Jenjang pendidikan yang tersedia</p>
            </div>
            <Button
              size="sm"
              variant={catalogShowAddGrade ? 'secondary' : undefined}
              onClick={() => {
                if (catalogShowAddGrade) {
                  resetAddGradeForm();
                } else {
                  setCatalogShowAddGrade(true);
                }
              }}
              className="inline-flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] leading-none inline-flex items-center justify-center shrink-0 align-middle">
                {catalogShowAddGrade ? 'close' : 'add'}
              </span>
              <span className="leading-none">{catalogShowAddGrade ? 'Batal' : 'Tambah Grade'}</span>
            </Button>
          </div>

          {/* ── Form tambah grade — multi-step ── */}
          {catalogShowAddGrade && (
            <div className="p-3 rounded-xl bg-[#faf8f5] border border-[#ddd4c8]/70 space-y-3">
              {/* Step 1: Pilih jenjang */}
              <div>
                <p className="text-[11px] font-semibold text-[#57534e] uppercase tracking-wide mb-2">
                  1. Pilih Jenjang
                </p>
                <div className="flex gap-2">
                  {JENJANG_LIST.map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => {
                        setCatalogAddGradeJenjang(j);
                        setCatalogAddGradePredefined('');
                        setAddGradeCustom(false);
                        setAddGradeCustomLabel('');
                      }}
                      className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                        catalogAddGradeJenjang === j
                          ? 'bg-[#171717] text-white'
                          : 'bg-white border border-[#ddd4c8] text-[#57534e] hover:bg-[#f4ede4]'
                      }`}
                    >
                      {j}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Pilih predefined atau custom */}
              {catalogAddGradeJenjang && (
                <div>
                  <p className="text-[11px] font-semibold text-[#57534e] uppercase tracking-wide mb-2">
                    2. Pilih Grade
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {PREDEFINED_GRADES[catalogAddGradeJenjang as Jenjang].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setCatalogAddGradePredefined(g);
                          setAddGradeCustom(false);
                        }}
                        className={`px-3 py-1 rounded-lg text-[12px] transition-all ${
                          catalogAddGradePredefined === g && !addGradeCustom
                            ? 'bg-[#171717] text-white font-medium'
                            : 'bg-white border border-[#ddd4c8] text-[#57534e] hover:bg-[#f4ede4]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setAddGradeCustom(true);
                        setCatalogAddGradePredefined('');
                      }}
                      className={`px-3 py-1 rounded-lg text-[12px] transition-all ${
                        addGradeCustom
                          ? 'bg-[#171717] text-white font-medium'
                          : 'bg-white border border-[#ddd4c8] text-[#57534e] hover:bg-[#f4ede4]'
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {addGradeCustom && (
                    <input
                      className="w-full rounded-xl border border-[#ddd4c8] bg-white px-3 py-1.5 text-[12px] text-[#171717] placeholder:text-[#8a8379] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                      placeholder={`Nama grade custom (mis. Kelas X ${catalogAddGradeJenjang})`}
                      value={addGradeCustomLabel}
                      onChange={(e) => setAddGradeCustomLabel(e.target.value)}
                      disabled={catalogAddingGrade}
                      autoFocus
                    />
                  )}
                </div>
              )}

              {/* Step 3: Submit */}
              {catalogAddGradeJenjang && (catalogAddGradePredefined || (addGradeCustom && addGradeCustomLabel.trim())) && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    disabled={catalogAddingGrade}
                    onClick={submitGrade}
                    className="inline-flex items-center justify-center gap-1.5"
                  >
                    {catalogAddingGrade ? 'Menyimpan…' : 'Simpan Grade'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Grade list container */}
          <div className="flex-1">
            {catalogGrades.length === 0 && !catalogLoading ? (
              <div className="h-full flex items-center justify-center py-10">
                <AdminEmptyState
                  title="Belum Ada Data Grade"
                  description="Tambahkan jenjang/tingkat kelas pertama untuk mulai menyusun katalog mapel."
                  icon="layers_clear"
                  flat={true}
                  action={
                    <Button
                      size="sm"
                      onClick={() => {
                        setCatalogShowAddGrade(true);
                      }}
                      className="inline-flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px] leading-none inline-flex items-center justify-center shrink-0 align-middle">add</span>
                      <span className="leading-none">Tambah Grade Baru</span>
                    </Button>
                  }
                />
              </div>
            ) : filteredGrades.length === 0 && !catalogLoading ? (
              <div className="h-full flex items-center justify-center py-10 text-[13px] text-[#8a8379]">
                Tidak ada grade untuk jenjang ini.
              </div>
            ) : (
              <div className="space-y-3">
                {(Object.keys(groupedGrades) as Jenjang[]).map((j) => {
                  const items = groupedGrades[j]!;
                  const showSectionHeader = catalogJenjangFilter === 'semua';
                  return (
                    <div key={j}>
                      {showSectionHeader && (
                        <p className="text-[11px] font-bold text-[#8a8379] uppercase tracking-wider mb-1.5 px-1">
                          {j}
                        </p>
                      )}
                      <div className="space-y-1.5">
                        {items.map((g) => {
                          const isUpdating = catalogUpdatingIds.has(g.id);
                          const isSelected = catalogSelectedGrade === g.id;
                          const isArchived = g.status === 'archived';
                          const gJenjang = gradeJenjang(g);
                          return (
                            <div
                              key={g.id}
                              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition-all ${
                                isSelected
                                  ? 'bg-[#171717] text-white shadow-sm font-semibold'
                                  : isArchived
                                    ? 'bg-[#faf8f5]/40 border border-[#ddd4c8]/30 text-[#8a8379] opacity-60'
                                    : 'bg-[#faf8f5]/60 hover:bg-[#f4ede4]/70 text-[#171717] border border-[#ddd4c8]/40'
                              }`}
                            >
                              <button
                                className="flex-1 text-left flex items-center gap-2 min-w-0"
                                onClick={() => {
                                  setCatalogSelectedGrade(g.id);
                                  setCatalogSubjectsLoading(true);
                                  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
                                  fetch(`${base}/catalog/subjects?gradeId=${g.id}`, { credentials: 'include' })
                                    .then((r) => r.json())
                                    .then((j) => {
                                      setCatalogSubjects(j?.data ?? []);
                                      setCatalogSubjectsLoading(false);
                                    })
                                    .catch(() => setCatalogSubjectsLoading(false));
                                }}
                              >
                                <span
                                  className={`material-symbols-outlined text-[18px] leading-none inline-flex items-center justify-center shrink-0 ${
                                    isSelected ? 'text-brand-accent-soft' : 'text-[#8a8379]'
                                  }`}
                                >
                                  school
                                </span>
                                <span className="truncate">{g.label}</span>
                                {/* Jenjang pill */}
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                                    isSelected
                                      ? 'bg-white/20 text-white/90'
                                      : 'bg-[#eee6da]/80 text-[#57534e]'
                                  }`}
                                >
                                  {gJenjang}
                                </span>
                              </button>

                              <div className="flex items-center gap-1.5 ml-2 shrink-0">
                                <AdminPill tone={g.status === 'active' ? 'ok' : 'neutral'}>{g.status}</AdminPill>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  disabled={isUpdating}
                                  onClick={async () => {
                                    setCatalogUpdatingIds((s) => new Set(s).add(g.id));
                                    const next = g.status === 'active' ? 'archived' : 'active';
                                    const res = await adminService.updateGradeStatus(g.id, next);
                                    if (res.ok) {
                                      setCatalogGrades((prev) =>
                                        prev.map((x) => (x.id === g.id ? { ...x, status: next } : x)),
                                      );
                                      setToast(`Grade "${g.label}" diubah ke ${next}.`);
                                    } else {
                                      setToast(
                                        `Gagal: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`,
                                      );
                                    }
                                    setCatalogUpdatingIds((s) => {
                                      const n = new Set(s);
                                      n.delete(g.id);
                                      return n;
                                    });
                                  }}
                                >
                                  {isUpdating ? '…' : g.status === 'active' ? 'Archive' : 'Aktifkan'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  disabled={isUpdating}
                                  onClick={() => {
                                    setConfirmDeleteGrade({ id: g.id, label: g.label });
                                  }}
                                >
                                  Hapus
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Subjects Panel (unchanged) ── */}
        <div className="flex flex-col min-h-[420px] rounded-2xl border border-[#ddd4c8]/80 bg-white p-5 shadow-[0_2px_12px_rgba(23,23,23,0.01)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#eee6da]/60 pb-3">
            <div>
              <h3 className="text-[14px] font-bold text-[#171717]">
                Mata Pelajaran — {selectedGradeObj?.label ?? 'Pilih Grade'}
              </h3>
              <p className="text-[12px] text-[#57534e]">
                {selectedGradeObj
                  ? `Daftar mapel untuk ${selectedGradeObj.label}`
                  : 'Pilih grade di panel sebelah kiri'}
              </p>
            </div>
            {catalogSelectedGrade ? (
              <Button
                size="sm"
                variant={catalogShowAddSubject ? 'secondary' : undefined}
                onClick={() => {
                  setCatalogShowAddSubject((v) => !v);
                  setCatalogNewSubjectLabel('');
                }}
                className="inline-flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] leading-none inline-flex items-center justify-center shrink-0 align-middle">
                  {catalogShowAddSubject ? 'close' : 'add'}
                </span>
                <span className="leading-none">{catalogShowAddSubject ? 'Batal' : 'Tambah Mapel'}</span>
              </Button>
            ) : null}
          </div>

          {/* Form tambah mapel */}
          {catalogShowAddSubject && catalogSelectedGrade ? (
            <form
              className="flex gap-2 p-3 rounded-xl bg-[#faf8f5] border border-[#ddd4c8]/70"
              onSubmit={async (e) => {
                e.preventDefault();
                const label = catalogNewSubjectLabel.trim();
                if (!label) return;
                setCatalogAddingSubject(true);
                const res = await adminService.createSubject({
                  label,
                });
                if (res.ok) {
                  setToast(`Mapel "${label}" berhasil ditambahkan.`);
                  setCatalogShowAddSubject(false);
                  setCatalogNewSubjectLabel('');
                  // Reload subjects
                  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
                  fetch(`${base}/catalog/subjects?gradeId=${catalogSelectedGrade}`, { credentials: 'include' })
                    .then((r) => r.json())
                    .then((j) => setCatalogSubjects(j?.data ?? []));
                } else {
                  setToast(
                    `Gagal: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`,
                  );
                }
                setCatalogAddingSubject(false);
              }}
            >
              <input
                className="flex-1 rounded-xl border border-[#ddd4c8] bg-white px-3 py-1.5 text-[12px] text-[#171717] placeholder:text-[#8a8379] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                placeholder="Nama mapel baru (mis. Matematika, Fisika)"
                value={catalogNewSubjectLabel}
                onChange={(e) => setCatalogNewSubjectLabel(e.target.value)}
                disabled={catalogAddingSubject}
              />
              <Button size="sm" type="submit" disabled={catalogAddingSubject || !catalogNewSubjectLabel.trim()}>
                {catalogAddingSubject ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </form>
          ) : null}

          {/* Mapel list container */}
          <div className="flex-1">
            {!catalogSelectedGrade ? (
              <div className="h-full flex items-center justify-center py-12 text-[#8a8379] text-[13px]">
                ← Pilih grade terlebih dahulu untuk melihat daftar mata pelajaran.
              </div>
            ) : catalogSubjectsLoading ? (
              <AdminContentLoading />
            ) : catalogSubjects.length === 0 ? (
              <div className="h-full flex items-center justify-center py-10">
                <AdminEmptyState
                  title="Belum Ada Mapel"
                  description="Belum ada mata pelajaran untuk grade ini."
                  icon="menu_book"
                  flat={true}
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                {catalogSubjects.map((s) => {
                  const isUpdating = catalogUpdatingIds.has(s.id);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#faf8f5]/60 border border-[#ddd4c8]/40 text-[13px]"
                    >
                      <span className="font-semibold text-[#171717]">{s.label}</span>
                      <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        <AdminPill tone={s.status === 'active' ? 'ok' : 'neutral'}>{s.status}</AdminPill>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isUpdating}
                          onClick={async () => {
                            setCatalogUpdatingIds((prev) => new Set(prev).add(s.id));
                            const next = s.status === 'active' ? 'archived' : 'active';
                            const res = await adminService.updateSubjectStatus(s.id, next);
                            if (res.ok) {
                              setCatalogSubjects((prev) =>
                                prev.map((x) => (x.id === s.id ? { ...x, status: next } : x)),
                              );
                              setToast(`Mapel "${s.label}" diubah ke ${next}.`);
                            } else {
                              setToast(
                                `Gagal: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`,
                              );
                            }
                            setCatalogUpdatingIds((prev) => {
                              const n = new Set(prev);
                              n.delete(s.id);
                              return n;
                            });
                          }}
                        >
                          {isUpdating ? '…' : s.status === 'active' ? 'Archive' : 'Aktifkan'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={isUpdating}
                          onClick={() => {
                            setConfirmDeleteSubject({ id: s.id, label: s.label });
                          }}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <AdminConfirmModal
        open={!!confirmDeleteGrade}
        title="Hapus Grade Katalog"
        description={`Apakah Anda yakin ingin menghapus grade "${confirmDeleteGrade?.label}"?`}
        confirmLabel="Ya, Hapus Grade"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={async () => {
          if (!confirmDeleteGrade) return;
          const { id, label } = confirmDeleteGrade;
          setConfirmDeleteGrade(null);
          setCatalogUpdatingIds((s) => new Set(s).add(id));
          const res = await adminService.archiveGrade(id);
          if (res.ok) {
            setCatalogGrades((prev) => prev.filter((x) => x.id !== id));
            setToast(`Grade "${label}" diarsip/hapus.`);
          } else {
            setToast(`Gagal: ${res.error.safeMessage}`);
          }
          setCatalogUpdatingIds((s) => {
            const n = new Set(s);
            n.delete(id);
            return n;
          });
        }}
        onCancel={() => setConfirmDeleteGrade(null)}
      />

      <AdminConfirmModal
        open={!!confirmDeleteSubject}
        title="Hapus Mata Pelajaran"
        description={`Apakah Anda yakin ingin menghapus mapel "${confirmDeleteSubject?.label}"?`}
        confirmLabel="Ya, Hapus Mapel"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={async () => {
          if (!confirmDeleteSubject) return;
          const { id, label } = confirmDeleteSubject;
          setConfirmDeleteSubject(null);
          setCatalogUpdatingIds((prev) => new Set(prev).add(id));
          const res = await adminService.archiveSubject(id);
          if (res.ok) {
            setCatalogSubjects((prev) => prev.filter((x) => x.id !== id));
            setToast(`Mapel "${label}" diarsip/hapus.`);
          } else {
            setToast(`Gagal: ${res.error.safeMessage}`);
          }
          setCatalogUpdatingIds((prev) => {
            const n = new Set(prev);
            n.delete(id);
            return n;
          });
        }}
        onCancel={() => setConfirmDeleteSubject(null)}
      />
    </>
  );
}
