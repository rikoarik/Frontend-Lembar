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
  catalogNewGradeLabel,
  setCatalogNewGradeLabel,
  catalogAddingGrade,
  setCatalogAddingGrade,
  catalogShowAddSubject,
  setCatalogShowAddSubject,
  catalogNewSubjectLabel,
  setCatalogNewSubjectLabel,
  catalogAddingSubject,
  setCatalogAddingSubject,
  setToast,
}: {
  catalogGrades: { id: string; label: string; status: string }[];
  setCatalogGrades: React.Dispatch<React.SetStateAction<{ id: string; label: string; status: string }[]>>;
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
  catalogNewGradeLabel: string;
  setCatalogNewGradeLabel: (v: string) => void;
  catalogAddingGrade: boolean;
  setCatalogAddingGrade: (v: boolean) => void;
  catalogShowAddSubject: boolean;
  setCatalogShowAddSubject: React.Dispatch<React.SetStateAction<boolean>>;
  catalogNewSubjectLabel: string;
  setCatalogNewSubjectLabel: (v: string) => void;
  catalogAddingSubject: boolean;
  setCatalogAddingSubject: (v: boolean) => void;
  setToast: (msg: string) => void;
}) {
  const [confirmDeleteGrade, setConfirmDeleteGrade] = useState<{ id: string; label: string } | null>(null);
  const [confirmDeleteSubject, setConfirmDeleteSubject] = useState<{ id: string; label: string } | null>(null);
  const [gradeLevelFilter, setGradeLevelFilter] = useState<'all' | 'sd' | 'smp' | 'sma' | 'other'>('all');
  const [gradeSearch, setGradeSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');

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

  // Filter grades by level & search query
  const filteredGrades = catalogGrades.filter((g) => {
    const labelLower = g.label.toLowerCase();
    if (gradeSearch.trim() && !labelLower.includes(gradeSearch.trim().toLowerCase())) {
      return false;
    }
    if (gradeLevelFilter === 'sd') {
      return labelLower.includes('sd') || /kelas\s*[1-6]\b/.test(labelLower);
    }
    if (gradeLevelFilter === 'smp') {
      return labelLower.includes('smp') || /kelas\s*[7-9]\b/.test(labelLower);
    }
    if (gradeLevelFilter === 'sma') {
      return labelLower.includes('sma') || labelLower.includes('smk') || /kelas\s*(10|11|12)\b/.test(labelLower);
    }
    if (gradeLevelFilter === 'other') {
      const isSd = labelLower.includes('sd') || /kelas\s*[1-6]\b/.test(labelLower);
      const isSmp = labelLower.includes('smp') || /kelas\s*[7-9]\b/.test(labelLower);
      const isSma = labelLower.includes('sma') || labelLower.includes('smk') || /kelas\s*(10|11|12)\b/.test(labelLower);
      return !isSd && !isSmp && !isSma;
    }
    return true;
  });

  // Filter subjects by search query
  const filteredSubjects = catalogSubjects.filter((s) => {
    if (!subjectSearch.trim()) return true;
    return s.label.toLowerCase().includes(subjectSearch.trim().toLowerCase());
  });

  const PRESET_SUBJECTS = [
    'Matematika',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Fisika',
    'Kimia',
    'Biologi',
    'Ekonomi',
    'Geografi',
    'Sosiologi',
    'PPKn',
    'PJOK',
    'Informatika',
    'PAI',
    'Sejarah',
  ];

  return (
    <div className="space-y-5">
      {/* Header & Compact Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-bold text-[#171717]">Katalog Pendidikan</h2>
            <AdminPill tone="ok">{catalogGrades.length} Grade</AdminPill>
            {selectedGradeObj && (
              <AdminPill tone="info">{catalogSubjects.length} Mapel ({selectedGradeObj.label})</AdminPill>
            )}
          </div>
          <p className="text-[13px] text-[#6d665d] mt-0.5">
            Kelola jenjang grade sekolah dan mata pelajaran terpusat.
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          disabled={catalogLoading}
          onClick={() => {
            refreshCatalog();
            setToast('Memperbarui data katalog...');
          }}
          className="inline-flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <span className={`material-symbols-outlined text-[16px] leading-none inline-flex items-center justify-center shrink-0 align-middle ${catalogLoading ? 'animate-spin' : ''}`}>
            refresh
          </span>
          <span className="leading-none">Refresh Katalog</span>
        </Button>
      </div>

      {catalogLoading ? <AdminContentLoading /> : null}

      {/* Grade list + Subjects list grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* ── Grades Panel ── */}
        <div className="flex flex-col min-h-[480px] rounded-2xl border border-[#ddd4c8]/80 bg-white p-5 shadow-[0_2px_12px_rgba(23,23,23,0.01)] space-y-4">
          <div className="flex flex-col gap-3 border-b border-[#eee6da]/60 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[#171717]">
                  Tingkat Kelas / Grade ({filteredGrades.length})
                </h3>
                <p className="text-[12px] text-[#6d665d]">Pilih grade untuk mengelola mapel</p>
              </div>
              <Button
                size="sm"
                variant={catalogShowAddGrade ? 'secondary' : undefined}
                onClick={() => {
                  setCatalogShowAddGrade((v) => !v);
                  setCatalogNewGradeLabel('');
                }}
                className="inline-flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] leading-none inline-flex items-center justify-center shrink-0 align-middle">
                  {catalogShowAddGrade ? 'close' : 'add'}
                </span>
                <span className="leading-none">{catalogShowAddGrade ? 'Batal' : 'Tambah Grade'}</span>
              </Button>
            </div>

            {/* Level Filter Tabs + Search Input */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[12px]">
                {(
                  [
                    { id: 'all', label: `Semua (${catalogGrades.length})` },
                    { id: 'sd', label: 'SD' },
                    { id: 'smp', label: 'SMP' },
                    { id: 'sma', label: 'SMA / SMK' },
                    { id: 'other', label: 'Lainnya' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setGradeLevelFilter(tab.id)}
                    className={`px-3 py-1 rounded-xl transition-all font-medium whitespace-nowrap ${
                      gradeLevelFilter === tab.id
                        ? 'bg-[#171717] text-white shadow-xs'
                        : 'bg-[#faf8f5] text-[#6d665d] hover:bg-[#eee6da] hover:text-[#171717]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[#8a8379]" aria-hidden>
                  search
                </span>
                <input
                  type="text"
                  value={gradeSearch}
                  onChange={(e) => setGradeSearch(e.target.value)}
                  placeholder="Cari grade (cth: Kelas 10, SD 1)..."
                  className="w-full h-8 rounded-xl border border-[#ddd4c8] bg-[#faf8f5] pl-9 pr-3 text-[12px] text-[#171717] placeholder:text-[#a0988e] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#171717]/20"
                />
              </div>
            </div>
          </div>

          {/* Form tambah grade */}
          {catalogShowAddGrade && (
            <form
              className="flex gap-2 p-3 rounded-xl bg-[#faf8f5] border border-[#ddd4c8]/70"
              onSubmit={async (e) => {
                e.preventDefault();
                const label = catalogNewGradeLabel.trim();
                if (!label) return;
                setCatalogAddingGrade(true);
                const res = await adminService.createGrade({ label });
                if (res.ok) {
                  setToast(`Grade "${label}" berhasil ditambahkan.`);
                  setCatalogShowAddGrade(false);
                  setCatalogNewGradeLabel('');
                  refreshCatalog();
                } else {
                  setToast(`Gagal: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
                }
                setCatalogAddingGrade(false);
              }}
            >
              <input
                className="flex-1 rounded-xl border border-[#ddd4c8] bg-white px-3 py-1.5 text-[12px] text-[#171717] placeholder:text-[#8a8379] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                placeholder="Nama grade baru (mis. Kelas 10, SD 1)"
                value={catalogNewGradeLabel}
                onChange={(e) => setCatalogNewGradeLabel(e.target.value)}
                disabled={catalogAddingGrade}
              />
              <Button size="sm" type="submit" disabled={catalogAddingGrade || !catalogNewGradeLabel.trim()}>
                {catalogAddingGrade ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </form>
          )}

          {/* Grade list container */}
          <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 space-y-2">
            {filteredGrades.length === 0 && !catalogLoading ? (
              <div className="h-full flex items-center justify-center py-10">
                <AdminEmptyState
                  title="Tidak ada grade ditemukan"
                  description="Coba ubah kata kunci pencarian atau tab filter jenjang."
                  icon="layers_clear"
                  flat={true}
                />
              </div>
            ) : (
              filteredGrades.map((g) => {
                const isUpdating = catalogUpdatingIds.has(g.id);
                const isSelected = catalogSelectedGrade === g.id;
                return (
                  <div
                    key={g.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-[13px] transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#171717] text-white shadow-md border-transparent'
                        : 'bg-[#faf7f2]/80 hover:bg-[#f4ede4] text-[#171717] border border-[#ddd4c8]/50'
                    }`}
                    onClick={() => {
                      if (isSelected) return;
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
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/15 text-white'
                            : 'bg-[#eee6da] text-[#6d665d]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">school</span>
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold block truncate text-[13px]">
                          {g.label}
                        </span>
                        <span
                          className={`text-[11px] block ${
                            isSelected ? 'text-neutral-300' : 'text-[#8a8379]'
                          }`}
                        >
                          {isSelected ? 'Grade Terpilih' : 'Klik untuk lihat mapel'}
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2 ml-3 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <AdminPill tone={g.status === 'active' ? 'ok' : 'neutral'}>
                        {g.status}
                      </AdminPill>

                      <button
                        type="button"
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
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
                          isSelected
                            ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                            : 'bg-white hover:bg-neutral-100 text-[#57534e] border border-[#ddd4c8]'
                        }`}
                      >
                        {isUpdating ? '…' : g.status === 'active' ? 'Archive' : 'Aktifkan'}
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => {
                          setConfirmDeleteGrade({ id: g.id, label: g.label });
                        }}
                        className={`p-1.5 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 border border-rose-500/30'
                            : 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                        }`}
                        title="Hapus grade ini"
                      >
                        <span className="material-symbols-outlined text-[16px] block">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Subjects Panel ── */}
        <div className="flex flex-col min-h-[480px] rounded-2xl border border-[#ddd4c8]/80 bg-white p-5 shadow-[0_2px_12px_rgba(23,23,23,0.01)] space-y-4">
          <div className="flex flex-col gap-3 border-b border-[#eee6da]/60 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[#171717]">
                  Mata Pelajaran {selectedGradeObj ? `— ${selectedGradeObj.label}` : ''}
                </h3>
                <p className="text-[12px] text-[#6d665d]">
                  {selectedGradeObj
                    ? `Daftar mapel untuk ${selectedGradeObj.label} (${filteredSubjects.length} mapel)`
                    : 'Pilih grade di sebelah kiri'}
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

            {catalogSelectedGrade ? (
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[#8a8379]" aria-hidden>
                  search
                </span>
                <input
                  type="text"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  placeholder={`Cari mapel di ${selectedGradeObj?.label ?? 'grade ini'}...`}
                  className="w-full h-8 rounded-xl border border-[#ddd4c8] bg-[#faf8f5] pl-9 pr-3 text-[12px] text-[#171717] placeholder:text-[#a0988e] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#171717]/20"
                />
              </div>
            ) : null}
          </div>

          {/* Form tambah mapel dengan preset pills */}
          {catalogShowAddSubject && catalogSelectedGrade ? (
            <div className="space-y-2.5 p-3 rounded-2xl bg-[#faf7f2] border border-[#ddd4c8]/70">
              <form
                className="flex gap-2"
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

              {/* Preset Subjects Quick Pills */}
              <div>
                <span className="text-[11px] font-semibold text-[#8a8379] block mb-1">
                  Pilihan Cepat (Klik untuk memilih):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SUBJECTS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCatalogNewSubjectLabel(item)}
                      className="px-2 py-0.5 rounded-lg bg-white border border-[#ddd4c8] hover:border-[#171717] text-[11px] text-[#57534e] transition-all"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Mapel list container */}
          <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 space-y-2">
            {!catalogSelectedGrade ? (
              <div className="h-full flex items-center justify-center py-12 text-[#8a8379] text-[13px]">
                ← Pilih grade terlebih dahulu untuk melihat daftar mata pelajaran.
              </div>
            ) : catalogSubjectsLoading ? (
              <AdminContentLoading />
            ) : filteredSubjects.length === 0 ? (
              <div className="h-full flex items-center justify-center py-10">
                <AdminEmptyState
                  title="Belum Ada Mapel"
                  description="Belum ada mata pelajaran untuk grade ini atau kata kunci tidak sesuai."
                  icon="menu_book"
                  flat={true}
                />
              </div>
            ) : (
              filteredSubjects.map((s) => {
                const isUpdating = catalogUpdatingIds.has(s.id);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#faf7f2]/80 hover:bg-[#f4ede4] border border-[#ddd4c8]/50 text-[13px] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-xl bg-[#eee6da] text-[#6d665d] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">menu_book</span>
                      </div>
                      <span className="font-semibold text-[#171717] truncate">{s.label}</span>
                    </div>

                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <AdminPill tone={s.status === 'active' ? 'ok' : 'neutral'}>{s.status}</AdminPill>
                      <button
                        type="button"
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
                        className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white hover:bg-neutral-100 text-[#57534e] border border-[#ddd4c8] transition-all"
                      >
                        {isUpdating ? '…' : s.status === 'active' ? 'Archive' : 'Aktifkan'}
                      </button>
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => {
                          setConfirmDeleteSubject({ id: s.id, label: s.label });
                        }}
                        className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-all"
                        title="Hapus mapel ini"
                      >
                        <span className="material-symbols-outlined text-[16px] block">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
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
    </div>
  );
}
