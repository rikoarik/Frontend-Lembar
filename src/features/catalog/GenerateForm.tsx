'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { catalogService } from '@/src/services/catalog/catalogService';
import { useWorkspace } from '@/src/features/workspace/workspaceContext';
import { Button, Panel } from '@/app/components/ui';
import type { components } from '@/src/lib/api/schema';

type CatalogOption = components['schemas']['CatalogOption'];

type SourceMode = 'katalog' | 'pdf' | 'katalog+pdf';
type AssessmentType = 'practice' | 'daily' | 'midterm' | 'final' | 'tka';
type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
type ReviewMode = 'quick' | 'detail';

const CURRICULUM_OPTIONS = [
  { id: 'kurmer-1', label: 'Kurikulum Merdeka (Fase A)' },
  { id: 'kurmer-2', label: 'Kurikulum Merdeka (Fase B)' },
  { id: 'kurmer-3', label: 'Kurikulum Merdeka (Fase C)' },
  { id: 'k13', label: 'Kurikulum 2013' },
] as const;

const ASSESSMENT_TYPE_OPTIONS: { value: AssessmentType; label: string }[] = [
  { value: 'practice', label: 'Latihan Soal' },
  { value: 'daily', label: 'Ulangan Harian' },
  { value: 'midterm', label: 'UTS' },
  { value: 'final', label: 'UAS' },
  { value: 'tka', label: 'TKA' },
];

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Mudah' },
  { value: 'medium', label: 'Sedang' },
  { value: 'hard', label: 'Sulit' },
  { value: 'mixed', label: 'Campuran' },
];

const REVIEW_MODE_OPTIONS: { value: ReviewMode; label: string; desc: string }[] = [
  { value: 'quick', label: 'Cepat', desc: 'Tinjau dalam satu daftar' },
  { value: 'detail', label: 'Detail', desc: 'Tinjau satu per satu' },
];

// ── Types ──────────────────────────────────────

export type GenerateFormValues = {
  sourceMode: SourceMode;
  curriculumVersionId: string;
  gradeId: string;
  subjectId: string;
  materialIds: string[];
  assessmentType: AssessmentType;
  difficulty: Difficulty;
  questionCount: number;
  reviewMode: ReviewMode;
  teacherFocus: string;
  exampleQuestion: string;
};

type FieldKey = keyof GenerateFormValues;

const INITIAL_VALUES: GenerateFormValues = {
  sourceMode: 'katalog',
  curriculumVersionId: '',
  gradeId: '',
  subjectId: '',
  materialIds: [],
  assessmentType: 'practice',
  difficulty: 'medium',
  questionCount: 20,
  reviewMode: 'quick',
  teacherFocus: '',
  exampleQuestion: '',
};

// ── Validation ─────────────────────────────────

export type ValidationFailure = { field: FieldKey; message: string };
export type ValidationResult =
  | { ok: true; failures: [] }
  | { ok: false; failures: ValidationFailure[] };

export function validateGenerateForm(values: GenerateFormValues): ValidationResult {
  const failures: ValidationFailure[] = [];

  if (values.sourceMode === 'katalog' || values.sourceMode === 'katalog+pdf') {
    if (!values.curriculumVersionId) {
      failures.push({ field: 'curriculumVersionId', message: 'Pilih kurikulum.' });
    }
    if (!values.gradeId) {
      failures.push({ field: 'gradeId', message: 'Pilih kelas.' });
    }
    if (!values.subjectId) {
      failures.push({ field: 'subjectId', message: 'Pilih mata pelajaran.' });
    }
    if (values.materialIds.length === 0) {
      failures.push({ field: 'materialIds', message: 'Pilih minimal satu materi.' });
    }
  }

  if (!values.assessmentType) {
    failures.push({ field: 'assessmentType', message: 'Pilih jenis lembar.' });
  }
  if (!values.difficulty) {
    failures.push({ field: 'difficulty', message: 'Pilih tingkat kesulitan.' });
  }
  if (values.questionCount < 1 || values.questionCount > 200) {
    failures.push({ field: 'questionCount', message: 'Jumlah soal antara 1–200.' });
  }
  if (!values.reviewMode) {
    failures.push({ field: 'reviewMode', message: 'Pilih mode review.' });
  }
  if (values.teacherFocus && values.teacherFocus.length > 500) {
    failures.push({ field: 'teacherFocus', message: 'Maksimal 500 karakter.' });
  }
  if (values.exampleQuestion && values.exampleQuestion.length > 2000) {
    failures.push({ field: 'exampleQuestion', message: 'Maksimal 2.000 karakter.' });
  }

  return failures.length > 0 ? { ok: false, failures } : { ok: true, failures: [] };
}

// ── Helpers ────────────────────────────────────

const LABELS: Record<FieldKey, string> = {
  sourceMode: 'Sumber materi',
  curriculumVersionId: 'Kurikulum',
  gradeId: 'Kelas',
  subjectId: 'Mata Pelajaran',
  materialIds: 'Materi',
  assessmentType: 'Jenis Lembar',
  difficulty: 'Tingkat Kesulitan',
  questionCount: 'Jumlah Soal',
  reviewMode: 'Mode Review',
  teacherFocus: 'Fokus / Tujuan Guru',
  exampleQuestion: 'Contoh Soal',
};

// ── Component ──────────────────────────────────

export default function GenerateForm() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace.id;

  const [values, setValues] = useState<GenerateFormValues>(INITIAL_VALUES);
  const [localErrors, setLocalErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Loading state per dependent field; grades load on mount
  const [loading, setLoading] = useState<Partial<Record<FieldKey, boolean>>>({ gradeId: true });

  // Available options from the API
  const [grades, setGrades] = useState<CatalogOption[]>([]);
  const [subjects, setSubjects] = useState<CatalogOption[]>([]);
  const [materials, setMaterials] = useState<CatalogOption[]>([]);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  // Cascade announcement
  const [announcement, setAnnouncement] = useState('');

  // ── Load grades on mount ──────────────────────
  useEffect(() => {
    let cancelled = false;
    catalogService.listGrades(workspaceId).then((result) => {
      if (cancelled) return;
      setLoading((prev) => ({ ...prev, gradeId: false }));
      if (result.ok) {
        setGrades(result.value);
        setInitialLoadError(null);
      } else {
        setInitialLoadError(result.error.safeMessage);
      }
    });
    return () => { cancelled = true; };
    // gradeId loading starts as true; no sync setState
  }, [workspaceId]);

  // ── Load subjects when grade changes ──────────
  useEffect(() => {
    if (!values.gradeId || !values.curriculumVersionId) return;
    let cancelled = false;
    catalogService.listSubjects(workspaceId, values.gradeId, values.curriculumVersionId).then((result) => {
      if (cancelled) return;
      setLoading((prev) => ({ ...prev, subjectId: false }));
      if (result.ok) {
        setSubjects(result.value);
      }
    });
    return () => { cancelled = true; };
  }, [values.gradeId, values.curriculumVersionId, workspaceId]);

  // ── Load materials when subject changes ───────
  useEffect(() => {
    if (!values.gradeId || !values.subjectId || !values.curriculumVersionId) return;
    let cancelled = false;
    catalogService.listMaterials(workspaceId, values.gradeId, values.subjectId, values.curriculumVersionId).then((result) => {
      if (cancelled) return;
      setLoading((prev) => ({ ...prev, materialIds: false }));
      if (result.ok) {
        setMaterials(result.value);
      }
    });
    return () => { cancelled = true; };
  }, [values.gradeId, values.subjectId, values.curriculumVersionId, workspaceId]);

  // ── Update helper with cascade ────────────────
  const update = useCallback(<K extends FieldKey>(key: K, value: GenerateFormValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };

      // Cascade reset
      let ann: string | null = null;
      if (key === 'curriculumVersionId' && value !== prev.curriculumVersionId) {
        next.gradeId = '';
        next.subjectId = '';
        next.materialIds = [];
        setSubjects([]);
        setMaterials([]);
        ann = 'Kurikulum diperbarui. Kelas, mata pelajaran, dan materi dihapus.';
      } else if (key === 'gradeId' && value !== prev.gradeId) {
        next.subjectId = '';
        next.materialIds = [];
        setSubjects([]);
        setMaterials([]);
        ann = 'Kelas diperbarui. Mata pelajaran dan materi dihapus.';
      } else if (key === 'subjectId' && value !== prev.subjectId) {
        next.materialIds = [];
        setMaterials([]);
        ann = 'Mata pelajaran diperbarui. Materi dihapus.';
      }

      if (ann) {
        setAnnouncement(ann);
        setTimeout(() => setAnnouncement(''), 2000);
      }

      return next;
    });

    // Clear local error for the changed field
    setLocalErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // ── Toggle material selection ─────────────────
  const toggleMaterial = useCallback((materialId: string) => {
    setValues((prev) => {
      const ids = prev.materialIds.includes(materialId)
        ? prev.materialIds.filter((id) => id !== materialId)
        : [...prev.materialIds, materialId];
      return { ...prev, materialIds: ids };
    });
    setLocalErrors((prev) => {
      const next = { ...prev };
      delete next.materialIds;
      return next;
    });
  }, []);

  // ── Submit ────────────────────────────────────
  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitted(true);
      const validation = validateGenerateForm(values);
      if (!validation.ok) {
        const next: Partial<Record<FieldKey, string>> = {};
        for (const failure of validation.failures) {
          next[failure.field] = failure.message;
        }
        setLocalErrors(next);

        // Focus first invalid field
        const first = validation.failures[0]?.field;
        const node = document.getElementById(`gen-${first}`);
        if (node instanceof HTMLElement) node.focus();
        return;
      }
      setLocalErrors({});

      // ponytail: actual submission via assessment create endpoint.
      // Add idempotency-key, X-CSRF-Token, POST /v1/assessments when integrating.
      // For now, alert the values so the flow is testable.
      alert(`Draft akan dibuat:\n${JSON.stringify(values, null, 2)}`);
    },
    [values],
  );

  // ── Summary data ──────────────────────────────
  const summaryItems = useMemo(() => {
    const items: { label: string; value: string }[] = [];
    const gradeLabel = grades.find((g) => g.id === values.gradeId)?.label;
    const subjectLabel = subjects.find((s) => s.id === values.subjectId)?.label;
    const curriculumLabel = CURRICULUM_OPTIONS.find((c) => c.id === values.curriculumVersionId)?.label;

    if (curriculumLabel) items.push({ label: 'Kurikulum', value: curriculumLabel });
    if (gradeLabel) items.push({ label: 'Kelas', value: gradeLabel });
    if (subjectLabel) items.push({ label: 'Mata Pelajaran', value: subjectLabel });
    if (values.materialIds.length > 0) {
      const names = values.materialIds
        .map((id) => materials.find((m) => m.id === id)?.label)
        .filter(Boolean) as string[];
      items.push({ label: 'Materi', value: `${names.length} topik` });
    }
    const atype = ASSESSMENT_TYPE_OPTIONS.find((a) => a.value === values.assessmentType);
    if (atype) items.push({ label: 'Jenis', value: atype.label });
    const diff = DIFFICULTY_OPTIONS.find((d) => d.value === values.difficulty);
    if (diff) items.push({ label: 'Kesulitan', value: diff.label });
    items.push({ label: 'Jumlah Soal', value: String(values.questionCount) });
    const rm = REVIEW_MODE_OPTIONS.find((r) => r.value === values.reviewMode);
    if (rm) items.push({ label: 'Mode Review', value: rm.label });
    return items;
  }, [values, grades, subjects, materials]);

  const hasKatalog = values.sourceMode === 'katalog' || values.sourceMode === 'katalog+pdf';
  const readyCount = [
    hasKatalog && values.gradeId,
    hasKatalog && values.subjectId,
    hasKatalog && values.materialIds.length > 0,
    values.assessmentType,
    values.difficulty,
    values.reviewMode,
  ].filter(Boolean).length;
  const readinessLabel = `${readyCount}/${hasKatalog ? 6 : 3}`;

  // ── Form field classes ────────────────────────
  const fieldClass =
    'w-full rounded-md border border-brand-line bg-brand-surface-raised px-3 py-2 text-body-default text-brand-ink placeholder:text-brand-ink-subtle transition-colors focus-visible:border-brand-line-strong focus-visible:outline-2 focus-visible:outline focus-visible:outline-brand-focus disabled:cursor-not-allowed disabled:bg-brand-paper';
  const errorClass = 'text-body-sm text-brand-danger';
  const labelClass = 'text-label-semibold text-brand-ink';
  const helpClass = 'text-body-sm text-brand-ink-muted';
  const selectClass = `${fieldClass} appearance-none`;
  const radioGroupClass = 'flex flex-wrap gap-3';

  return (
    <>
      {/* Screen-reader cascade announcement */}
      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>

      {/* Mobile: collapsible summary before submit */}
      {summaryItems.length > 0 && (
        <div className="mb-4 md:hidden">
          <button
            type="button"
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="flex w-full items-center justify-between rounded-md border border-brand-line bg-brand-surface-raised px-4 py-3 text-left"
            aria-expanded={summaryOpen}
          >
            <span className="text-label-semibold text-brand-ink">
              Ringkasan ({readinessLabel})
            </span>
            <span className="text-brand-ink-muted">{summaryOpen ? 'Sembunyikan' : 'Lihat'}</span>
          </button>
          {summaryOpen && (
            <div className="mt-2 rounded-md border border-brand-line bg-brand-paper px-4 py-3">
              <SummaryContent items={summaryItems} readinessLabel={readinessLabel} />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ── Main form ─────────────────────────── */}
        <form
          onSubmit={onSubmit}
          className="min-w-0 flex-1"
          noValidate
          aria-busy={loading.gradeId ? true : undefined}
        >
          <div className="flex flex-col gap-8">
            {/* ── Section A: Materi Ujian ──────────── */}
            <Panel title="Materi Ujian" description="Pilih sumber dan lingkup materi.">
              <div className="flex flex-col gap-5">
                {/* Source mode radio */}
                <fieldset>
                  <legend className={`${labelClass} mb-2`}>Sumber materi</legend>
                  <div className={radioGroupClass}>
                    {(['katalog', 'pdf', 'katalog+pdf'] as const).map((mode) => (
                      <label
                        key={mode}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-3 transition-colors ${
                          values.sourceMode === mode
                            ? 'border-brand-accent bg-brand-accent-soft ring-1 ring-brand-accent'
                            : 'border-brand-line hover:bg-brand-paper'
                        }`}
                      >
                        <input
                          type="radio"
                          name="sourceMode"
                          value={mode}
                          checked={values.sourceMode === mode}
                          onChange={() => update('sourceMode', mode)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            values.sourceMode === mode
                              ? 'border-brand-accent'
                              : 'border-brand-line-strong'
                          }`}
                        >
                          {values.sourceMode === mode && (
                            <span className="h-2.5 w-2.5 rounded-full bg-brand-accent" />
                          )}
                        </span>
                        <span className="text-body-default">
                          {mode === 'katalog'
                            ? 'Buku/katalog yang tersedia'
                            : mode === 'pdf'
                              ? 'PDF saya saja'
                              : 'Buku/katalog + PDF saya'}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {/* Dependent selectors — shown only when source includes katalog */}
                {hasKatalog && (
                  <>
                    {/* Kurikulum */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="gen-curriculumVersionId" className={labelClass}>
                        Kurikulum <span className="text-brand-danger">*</span>
                      </label>
                      <select
                        id="gen-curriculumVersionId"
                        value={values.curriculumVersionId}
                        onChange={(e) => update('curriculumVersionId', e.target.value)}
                        className={selectClass}
                        aria-invalid={localErrors.curriculumVersionId ? true : undefined}
                      >
                        <option value="">Pilih kurikulum</option>
                        {CURRICULUM_OPTIONS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      {localErrors.curriculumVersionId ? (
                        <p className={errorClass} role="alert">
                          {localErrors.curriculumVersionId}
                        </p>
                      ) : null}
                    </div>

                    {/* Grades */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="gen-gradeId" className={labelClass}>
                        Kelas <span className="text-brand-danger">*</span>
                      </label>
                      {initialLoadError ? (
                        <p className={errorClass} role="alert">
                          {initialLoadError}
                        </p>
                      ) : (
                        <>
                          <select
                            id="gen-gradeId"
                            value={values.gradeId}
                            onChange={(e) => update('gradeId', e.target.value)}
                            className={selectClass}
                            disabled={loading.gradeId}
                            aria-invalid={localErrors.gradeId ? true : undefined}
                          >
                            <option value="">
                              {loading.gradeId ? 'Memuat daftar kelas…' : 'Pilih kelas'}
                            </option>
                            {!loading.gradeId &&
                              grades.map((g) => (
                                <option key={g.id} value={g.id}>
                                  {g.label}
                                </option>
                              ))}
                          </select>
                          {localErrors.gradeId ? (
                            <p className={errorClass} role="alert">
                              {localErrors.gradeId}
                            </p>
                          ) : null}
                        </>
                      )}
                    </div>

                    {/* Subjects */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="gen-subjectId" className={labelClass}>
                        Mata Pelajaran <span className="text-brand-danger">*</span>
                      </label>
                      <select
                        id="gen-subjectId"
                        value={values.subjectId}
                        onChange={(e) => update('subjectId', e.target.value)}
                        className={selectClass}
                        disabled={!values.gradeId}
                        aria-invalid={localErrors.subjectId ? true : undefined}
                      >
                        <option value="">
                          {loading.subjectId ? 'Memuat…' : values.gradeId ? 'Pilih mata pelajaran' : 'Pilih kelas terlebih dahulu'}
                        </option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      {localErrors.subjectId ? (
                        <p className={errorClass} role="alert">
                          {localErrors.subjectId}
                        </p>
                      ) : null}
                    </div>

                    {/* Materials multi-select */}
                    <div className="flex flex-col gap-2">
                      <fieldset>
                        <legend className={labelClass}>
                          Materi <span className="text-brand-danger">*</span>
                          <p className={`${helpClass} mt-0.5`}>
                            Pilih minimal satu materi
                          </p>
                        </legend>
                        <div
                          className="mt-2 max-h-48 overflow-y-auto rounded-md border border-brand-line bg-brand-surface-raised"
                          role="group"
                          aria-label="Pilih materi"
                        >
                          {loading.materialIds ? (
                            <div className="px-3 py-4 text-body-sm text-brand-ink-muted">
                              Memuat daftar materi…
                            </div>
                          ) : !values.subjectId ? (
                            <div className="px-3 py-4 text-body-sm text-brand-ink-muted">
                              Pilih mata pelajaran terlebih dahulu
                            </div>
                          ) : materials.length === 0 ? (
                            <div className="px-3 py-4 text-body-sm text-brand-ink-muted">
                              Tidak ada materi tersedia
                            </div>
                          ) : (
                            materials.map((m) => {
                              const selected = values.materialIds.includes(m.id);
                              return (
                                <label
                                  key={m.id}
                                  className={`flex cursor-pointer items-center gap-3 border-b border-brand-line px-3 py-2.5 transition-colors last:border-b-0 hover:bg-brand-paper ${
                                    selected ? 'bg-brand-accent-soft' : ''
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={() => toggleMaterial(m.id)}
                                    className="h-4 w-4 shrink-0 rounded border-brand-line-strong text-brand-accent focus-visible:outline-2 focus-visible:outline-brand-focus"
                                  />
                                  <span className="text-body-default text-brand-ink truncate">
                                    {m.label}
                                  </span>
                                </label>
                              );
                            })
                          )}
                        </div>
                        {localErrors.materialIds ? (
                          <p className={errorClass} role="alert">
                            {localErrors.materialIds}
                          </p>
                        ) : null}
                      </fieldset>
                    </div>
                  </>
                )}
              </div>
            </Panel>

            {/* ── Section B: Pengaturan Soal ───────── */}
            <Panel title="Pengaturan Soal" description="Konfigurasi jenis dan jumlah soal.">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="gen-assessmentType" className={labelClass}>
                    Jenis Lembar <span className="text-brand-danger">*</span>
                  </label>
                  <select
                    id="gen-assessmentType"
                    value={values.assessmentType}
                    onChange={(e) => update('assessmentType', e.target.value as AssessmentType)}
                    className={selectClass}
                    aria-invalid={localErrors.assessmentType ? true : undefined}
                  >
                    {ASSESSMENT_TYPE_OPTIONS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                  {localErrors.assessmentType ? (
                    <p className={errorClass} role="alert">
                      {localErrors.assessmentType}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="gen-difficulty" className={labelClass}>
                    Tingkat Kesulitan <span className="text-brand-danger">*</span>
                  </label>
                  <select
                    id="gen-difficulty"
                    value={values.difficulty}
                    onChange={(e) => update('difficulty', e.target.value as Difficulty)}
                    className={selectClass}
                    aria-invalid={localErrors.difficulty ? true : undefined}
                  >
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  {localErrors.difficulty ? (
                    <p className={errorClass} role="alert">
                      {localErrors.difficulty}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="gen-questionCount" className={labelClass}>
                    Jumlah Soal <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    id="gen-questionCount"
                    type="number"
                    min={1}
                    max={200}
                    value={values.questionCount}
                    onChange={(e) =>
                      update('questionCount', Math.max(1, Number(e.target.value)))
                    }
                    className={fieldClass}
                    aria-invalid={localErrors.questionCount ? true : undefined}
                  />
                  <p className={helpClass} id="gen-questionCount-help">
                    Antara 1–200 soal
                  </p>
                  {localErrors.questionCount ? (
                    <p className={errorClass} role="alert">
                      {localErrors.questionCount}
                    </p>
                  ) : null}
                </div>

                <fieldset>
                  <legend className={`${labelClass} mb-2`}>
                    Mode Review <span className="text-brand-danger">*</span>
                  </legend>
                  <div className={radioGroupClass}>
                    {REVIEW_MODE_OPTIONS.map((r) => (
                      <label
                        key={r.value}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-3 transition-colors ${
                          values.reviewMode === r.value
                            ? 'border-brand-accent bg-brand-accent-soft ring-1 ring-brand-accent'
                            : 'border-brand-line hover:bg-brand-paper'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reviewMode"
                          value={r.value}
                          checked={values.reviewMode === r.value}
                          onChange={() => update('reviewMode', r.value)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            values.reviewMode === r.value
                              ? 'border-brand-accent'
                              : 'border-brand-line-strong'
                          }`}
                        >
                          {values.reviewMode === r.value && (
                            <span className="h-2.5 w-2.5 rounded-full bg-brand-accent" />
                          )}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-body-default font-medium">{r.label}</span>
                          <span className="text-body-sm text-brand-ink-muted">{r.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {localErrors.reviewMode ? (
                    <p className={errorClass} role="alert">
                      {localErrors.reviewMode}
                    </p>
                  ) : null}
                </fieldset>
              </div>
            </Panel>

            {/* ── Section C: Konteks & Referensi ──── */}
            <Panel title="Konteks & Referensi" description="Tambahan informasi untuk AI (opsional).">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="gen-teacherFocus" className={labelClass}>
                    Fokus / Tujuan Guru
                  </label>
                  <textarea
                    id="gen-teacherFocus"
                    value={values.teacherFocus}
                    onChange={(e) => update('teacherFocus', e.target.value)}
                    className={`${fieldClass} min-h-24 resize-y`}
                    placeholder="Contoh: Fokus pada pemahaman konsep pecahan"
                    maxLength={500}
                    aria-invalid={localErrors.teacherFocus ? true : undefined}
                  />
                  <p className={helpClass}>
                    Maksimal 500 karakter. Tidak dikirim ke analitik.
                  </p>
                  {localErrors.teacherFocus ? (
                    <p className={errorClass} role="alert">
                      {localErrors.teacherFocus}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="gen-exampleQuestion" className={labelClass}>
                    Contoh Soal
                  </label>
                  <textarea
                    id="gen-exampleQuestion"
                    value={values.exampleQuestion}
                    onChange={(e) => update('exampleQuestion', e.target.value)}
                    className={`${fieldClass} min-h-24 resize-y`}
                    placeholder="Tulis contoh soal untuk dijadikan gaya atau referensi"
                    maxLength={2000}
                    aria-invalid={localErrors.exampleQuestion ? true : undefined}
                  />
                  <p className={helpClass}>
                    Maksimal 2.000 karakter. Memandu gaya, tidak menjamin penyalinan.
                  </p>
                  {localErrors.exampleQuestion ? (
                    <p className={errorClass} role="alert">
                      {localErrors.exampleQuestion}
                    </p>
                  ) : null}
                </div>
              </div>
            </Panel>

            {/* Submit */}
            <div className="flex flex-col gap-4">
              {submitted && !validateGenerateForm(values).ok && (
                <p className="rounded-md border border-brand-danger bg-brand-danger-soft px-4 py-3 text-body-sm text-brand-danger" role="alert">
                  Perbaiki isian yang belum lengkap sebelum melanjutkan.
                </p>
              )}
              <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
                Buat draft {values.questionCount} soal
              </Button>
              <p className={helpClass}>
                AI membuat draft sesuai konteks terpilih. Anda meninjau sebelum final.
              </p>
            </div>
          </div>
        </form>

        {/* ── Desktop sticky summary ─────────────── */}
        <aside className="hidden w-72 shrink-0 self-start lg:block lg:sticky lg:top-6">
          <div className="rounded-md border border-brand-line bg-brand-surface-raised px-4 py-4">
            <h3 className="text-label-semibold text-brand-ink">
              Ringkasan Konfigurasi
            </h3>
            <p className={`${helpClass} mb-3`}>
              Kesiapan: {readinessLabel}
            </p>
            {summaryItems.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {summaryItems.map((item) => (
                  <li key={item.label} className="flex items-start justify-between gap-2">
                    <span className="text-body-sm text-brand-ink-muted shrink-0">
                      {item.label}
                    </span>
                    <span className="text-body-sm text-brand-ink text-right truncate max-w-[140px]">
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={helpClass}>
                Pilih materi dan pengaturan untuk melihat ringkasan.
              </p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

// ── Summary content (shared between mobile/desktop) ──
function SummaryContent({
  items,
  readinessLabel,
}: {
  items: { label: string; value: string }[];
  readinessLabel: string;
}) {
  return (
    <>
      <p className="text-body-sm text-brand-ink-muted mb-2">
        Kesiapan: {readinessLabel}
      </p>
      {items.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.label} className="flex items-start justify-between gap-2">
              <span className="text-body-sm text-brand-ink-muted">{item.label}</span>
              <span className="text-body-sm text-brand-ink text-right truncate max-w-[160px]">
                {item.value}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body-sm text-brand-ink-muted">Pilih materi dan pengaturan untuk melihat ringkasan.</p>
      )}
    </>
  );
}
