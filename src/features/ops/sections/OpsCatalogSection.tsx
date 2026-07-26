'use client';

import { Button } from '@/app/components/ui';
import {
  AdminPageHeader,
  AdminPill,
  AdminStatCards,
  AdminContentLoading,
  AdminEmptyState,
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
            ) : (
              <div className="space-y-1.5">
                {catalogGrades.map((g) => {
                  const isUpdating = catalogUpdatingIds.has(g.id);
                  const isSelected = catalogSelectedGrade === g.id;
                  return (
                    <div
                      key={g.id}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] transition-all ${
                        isSelected
                          ? 'bg-[#171717] text-white shadow-sm font-semibold'
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
                      </button>

                      <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        <AdminPill tone={g.status === 'active' ? 'ok' : 'neutral'}>{g.status}</AdminPill>
                        <Button
                          size="sm"
                          variant={isSelected ? 'secondary' : 'secondary'}
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
                          onClick={async () => {
                            if (!confirm(`Hapus grade "${g.label}"?`)) return;
                            setCatalogUpdatingIds((s) => new Set(s).add(g.id));
                            const res = await adminService.archiveGrade(g.id);
                            if (res.ok) {
                              setCatalogGrades((prev) => prev.filter((x) => x.id !== g.id));
                              setToast(`Grade "${g.label}" diarsip/hapus.`);
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

        {/* ── Subjects Panel ── */}
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
                const res = await adminService.createSubject({ label });
                if (res.ok) {
                  setToast(`Mapel "${label}" berhasil ditambahkan.`);
                  setCatalogShowAddSubject(false);
                  setCatalogNewSubjectLabel('');
                  setCatalogSubjectsLoading(true);
                  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
                  fetch(`${base}/catalog/subjects?gradeId=${catalogSelectedGrade}`, { credentials: 'include' })
                    .then((r) => r.json())
                    .then((j) => {
                      setCatalogSubjects(j?.data ?? []);
                      setCatalogSubjectsLoading(false);
                    })
                    .catch(() => setCatalogSubjectsLoading(false));
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
            {catalogSubjectsLoading ? (
              <div className="flex items-center justify-center py-12 text-[13px] text-[#57534e]">
                Memuat daftar mata pelajaran...
              </div>
            ) : catalogSubjects.length === 0 ? (
              <div className="h-full flex items-center justify-center py-10">
                <AdminEmptyState
                  title={catalogSelectedGrade ? 'Belum Ada Mapel' : 'Pilih Grade Terlebih Dahulu'}
                  description={
                    catalogSelectedGrade
                      ? `Belum ada mata pelajaran yang dikonfigurasi untuk ${selectedGradeObj?.label ?? 'grade ini'}.`
                      : 'Klik salah satu grade di panel kiri untuk menampilkan dan mengelola mata pelajaran.'
                  }
                  icon="auto_stories"
                  flat={true}
                  action={
                    catalogSelectedGrade ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setCatalogShowAddSubject(true);
                        }}
                        className="inline-flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px] leading-none inline-flex items-center justify-center shrink-0 align-middle">add</span>
                        <span className="leading-none">Tambah Mapel Pertama</span>
                      </Button>
                    ) : null
                  }
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                {catalogSubjects.map((s) => {
                  const isUpdating = catalogUpdatingIds.has(s.id);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#faf8f5]/60 hover:bg-[#f4ede4]/70 border border-[#ddd4c8]/40 text-[13px] transition-all"
                    >
                      <span className="font-medium text-[#171717] flex-1 truncate">{s.label}</span>
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
                          onClick={async () => {
                            if (!confirm(`Hapus mapel "${s.label}"?`)) return;
                            setCatalogUpdatingIds((prev) => new Set(prev).add(s.id));
                            const res = await adminService.archiveSubject(s.id);
                            if (res.ok) {
                              setCatalogSubjects((prev) => prev.filter((x) => x.id !== s.id));
                              setToast(`Mapel "${s.label}" diarsip/hapus.`);
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
    </>
  );
}
