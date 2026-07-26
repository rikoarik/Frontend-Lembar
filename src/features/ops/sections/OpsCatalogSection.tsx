'use client';

import { Button } from '@/app/components/ui';
import {
  AdminPageHeader,
  AdminPill,
  AdminStatCards,
  AdminContentLoading,
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
  return (
    <>
      <AdminPageHeader
        title="Katalog"
        description="Grade, mapel, dan material yang dipakai generator soal."
        meta={
          catalogGrades.length > 0 ? (
            <AdminPill tone="ok">{catalogGrades.filter((g) => g.status === 'active').length} grade aktif</AdminPill>
          ) : null
        }
        actions={
          <Button size="sm" variant="secondary" onClick={() => {
            setCatalogLoading(true);
            const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
            fetch(`${base}/catalog/grades`, { credentials: 'include' }).then((r) => r.json()).then((j) => {
              setCatalogGrades(j?.data ?? []);
              setCatalogLoading(false);
              const cur = catalogSelectedGrade || j?.data?.[0]?.id;
              if (cur) {
                setCatalogSelectedGrade(cur);
                setCatalogSubjectsLoading(true);
                fetch(`${base}/catalog/subjects?gradeId=${cur}`, { credentials: 'include' })
                  .then((r) => r.json()).then((js) => { setCatalogSubjects(js?.data ?? []); setCatalogSubjectsLoading(false); })
                  .catch(() => setCatalogSubjectsLoading(false));
              }
            }).catch(() => setCatalogLoading(false));
          }}>
            Refresh
          </Button>
        }
      />
      {catalogLoading ? <AdminContentLoading /> : null}

      <AdminStatCards
        items={[
          {
            label: 'Grade',
            value: catalogLoading ? '…' : String(catalogGrades.length),
            hint: `${catalogGrades.filter((g) => g.status === 'active').length} aktif`,
            tone: 'ok',
          },
          {
            label: 'Mapel',
            value: catalogSubjectsLoading ? '…' : String(catalogSubjects.length),
            hint: catalogSelectedGrade ? `untuk ${catalogGrades.find((g) => g.id === catalogSelectedGrade)?.label ?? catalogSelectedGrade}` : 'pilih grade',
            tone: 'info',
          },
        ]}
      />

      {/* Grade list + Subjects list */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Grades ── */}
        <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-3">
          {/* Header grade */}
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-[#171717]">Grade ({catalogGrades.length})</h3>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => { setCatalogShowAddGrade((v) => !v); setCatalogNewGradeLabel(''); }}
            >
              {catalogShowAddGrade ? 'Batal' : '+ Tambah'}
            </Button>
          </div>

          {/* Form tambah grade */}
          {catalogShowAddGrade && (
            <form
              className="flex gap-2"
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
                  setCatalogLoading(true);
                  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
                  fetch(`${base}/catalog/grades`, { credentials: 'include' }).then((r) => r.json()).then((j) => {
                    setCatalogGrades(j?.data ?? []);
                    setCatalogLoading(false);
                  }).catch(() => setCatalogLoading(false));
                } else {
                  setToast(`Gagal tambah grade: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
                }
                setCatalogAddingGrade(false);
              }}
            >
              <input
                className="flex-1 rounded-xl border border-[#ddd4c8] px-3 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                placeholder="Label grade, mis. Kelas 10"
                value={catalogNewGradeLabel}
                onChange={(e) => setCatalogNewGradeLabel(e.target.value)}
                disabled={catalogAddingGrade}
              />
              <Button size="sm" type="submit" disabled={catalogAddingGrade || !catalogNewGradeLabel.trim()}>
                {catalogAddingGrade ? '…' : 'Simpan'}
              </Button>
            </form>
          )}

          {/* Grade list */}
          {catalogGrades.length === 0 && !catalogLoading ? (
            <div className="text-[12px] text-[#6d665d]">Belum ada data grade.</div>
          ) : (
            <div className="space-y-1">
              {catalogGrades.map((g) => {
                const isUpdating = catalogUpdatingIds.has(g.id);
                return (
                  <div
                    key={g.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-[12px] transition-colors ${
                      catalogSelectedGrade === g.id ? 'bg-[#171717] text-white font-semibold' : 'hover:bg-[#faf8f5] text-[#171717]'
                    }`}
                  >
                    <button
                      className="flex-1 text-left"
                      onClick={() => {
                        setCatalogSelectedGrade(g.id);
                        setCatalogSubjectsLoading(true);
                        const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
                        fetch(`${base}/catalog/subjects?gradeId=${g.id}`, { credentials: 'include' })
                          .then((r) => r.json()).then((j) => { setCatalogSubjects(j?.data ?? []); setCatalogSubjectsLoading(false); })
                          .catch(() => setCatalogSubjectsLoading(false));
                      }}
                    >
                      <span>{g.label}</span>
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
                            setCatalogGrades((prev) => prev.map((x) => x.id === g.id ? { ...x, status: next } : x));
                            setToast(`Grade "${g.label}" diubah ke ${next}.`);
                          } else {
                            setToast(`Gagal: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
                          }
                          setCatalogUpdatingIds((s) => { const n = new Set(s); n.delete(g.id); return n; });
                        }}
                      >
                        {isUpdating ? '…' : g.status === 'active' ? 'Archive' : 'Aktifkan'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isUpdating}
                        onClick={async () => {
                          if (!confirm(`Archive & hapus grade "${g.label}"?`)) return;
                          setCatalogUpdatingIds((s) => new Set(s).add(g.id));
                          const res = await adminService.archiveGrade(g.id);
                          if (res.ok) {
                            setCatalogGrades((prev) => prev.filter((x) => x.id !== g.id));
                            setToast(`Grade "${g.label}" diarsipkan.`);
                          } else {
                            setToast(`Gagal: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
                          }
                          setCatalogUpdatingIds((s) => { const n = new Set(s); n.delete(g.id); return n; });
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

        {/* ── Subjects ── */}
        <div className="rounded-2xl border border-[#ddd4c8]/70 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-[#171717]">
              Mapel — {catalogGrades.find((g) => g.id === catalogSelectedGrade)?.label ?? 'pilih grade'}
            </h3>
            {catalogSelectedGrade && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => { setCatalogShowAddSubject((v) => !v); setCatalogNewSubjectLabel(''); }}
              >
                {catalogShowAddSubject ? 'Batal' : '+ Tambah'}
              </Button>
            )}
          </div>

          {catalogShowAddSubject && catalogSelectedGrade && (
            <form
              className="flex gap-2"
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
                    .then((r) => r.json()).then((j) => { setCatalogSubjects(j?.data ?? []); setCatalogSubjectsLoading(false); })
                    .catch(() => setCatalogSubjectsLoading(false));
                } else {
                  setToast(`Gagal tambah mapel: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
                }
                setCatalogAddingSubject(false);
              }}
            >
              <input
                className="flex-1 rounded-xl border border-[#ddd4c8] px-3 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#171717]/20"
                placeholder="Label mapel, mis. Matematika"
                value={catalogNewSubjectLabel}
                onChange={(e) => setCatalogNewSubjectLabel(e.target.value)}
                disabled={catalogAddingSubject}
              />
              <Button size="sm" type="submit" disabled={catalogAddingSubject || !catalogNewSubjectLabel.trim()}>
                {catalogAddingSubject ? '…' : 'Simpan'}
              </Button>
            </form>
          )}

          {catalogSubjectsLoading ? (
            <div className="text-[12px] text-[#6d665d]">Memuat mapel...</div>
          ) : catalogSubjects.length === 0 ? (
            <div className="text-[12px] text-[#6d665d]">
              {catalogSelectedGrade ? 'Belum ada mapel untuk grade ini.' : 'Pilih grade untuk melihat mapel.'}
            </div>
          ) : (
            <div className="space-y-1">
              {catalogSubjects.map((s) => {
                const isUpdating = catalogUpdatingIds.has(s.id);
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#faf8f5] text-[12px]"
                  >
                    <span className="text-[#171717] flex-1">{s.label}</span>
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
                            setCatalogSubjects((prev) => prev.map((x) => x.id === s.id ? { ...x, status: next } : x));
                            setToast(`Mapel "${s.label}" diubah ke ${next}.`);
                          } else {
                            setToast(`Gagal: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
                          }
                          setCatalogUpdatingIds((prev) => { const n = new Set(prev); n.delete(s.id); return n; });
                        }}
                      >
                        {isUpdating ? '…' : s.status === 'active' ? 'Archive' : 'Aktifkan'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isUpdating}
                        onClick={async () => {
                          if (!confirm(`Archive & hapus mapel "${s.label}"?`)) return;
                          setCatalogUpdatingIds((prev) => new Set(prev).add(s.id));
                          const res = await adminService.archiveSubject(s.id);
                          if (res.ok) {
                            setCatalogSubjects((prev) => prev.filter((x) => x.id !== s.id));
                            setToast(`Mapel "${s.label}" diarsipkan.`);
                          } else {
                            setToast(`Gagal: ${(res as { ok: false; error: { safeMessage: string } }).error.safeMessage}`);
                          }
                          setCatalogUpdatingIds((prev) => { const n = new Set(prev); n.delete(s.id); return n; });
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
    </>
  );
}
