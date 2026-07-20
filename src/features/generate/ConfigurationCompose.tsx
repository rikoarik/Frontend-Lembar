'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { catalogService } from '@/src/services/catalog/catalogService';
import { useWorkspace } from '@/src/features/workspace/workspaceContext';
import { PrivatePdfSource } from '@/src/features/pdf-source';
import { OutputSettings } from './OutputSettings';
import { Button, Panel } from '@/app/components/ui';
import { validateComposition, getMissingSourceHint, getMissingOutcomesHint } from './validation';
import { useGenerateSubmit } from './state/useGenerateSubmit';
import type { components } from '@/src/lib/api/schema';
import type {
  CompositionState,
  CompositionValues,
  CompositionFieldKey,
  CompositionError,
  SourceMode,
  AssessmentType,
  Difficulty,
  ReviewMode,
} from './types';
import { INITIAL_COMPOSITION_VALUES } from './types';

type CatalogOption = components['schemas']['CatalogOption'];

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

const MIN_QUESTIONS = 1;
const MAX_QUESTIONS = 200;

const clampQuestionCount = (raw: number): number =>
  Math.min(MAX_QUESTIONS, Math.max(MIN_QUESTIONS, raw || MIN_QUESTIONS));

const LABELS: Record<CompositionFieldKey, string> = {
  sourceMode: 'Sumber materi',
  curriculumVersionId: 'Kurikulum',
  gradeId: 'Kelas',
  subjectId: 'Mata Pelajaran',
  materialIds: 'Materi',
  sourceId: 'Sumber PDF',
  assessmentType: 'Jenis Lembar',
  difficulty: 'Tingkat Kesulitan',
  questionCount: 'Jumlah Soal',
  reviewMode: 'Mode Review',
  teacherFocus: 'Fokus / Tujuan Guru',
  exampleQuestion: 'Contoh Soal',
};

export default function ConfigurationCompose() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace.id;

  const [values, setValues] = useState<CompositionValues>(INITIAL_COMPOSITION_VALUES);
  const [localErrors, setLocalErrors] = useState<Partial<Record<CompositionFieldKey, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const [loading, setLoading] = useState<Partial<Record<CompositionFieldKey, boolean>>>({
    gradeId: true,
  });
  const [grades, setGrades] = useState<CatalogOption[]>([]);
  const [subjects, setSubjects] = useState<CatalogOption[]>([]);
  const [materials, setMaterials] = useState<CatalogOption[]>([]);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);

  const [compositionError, setCompositionError] = useState<CompositionError | null>(null);
  const [permissionState, setPermissionState] = useState(false);
  const [successState, setSuccessState] = useState(false);

  const loadGrades = useCallback(async () => {
    setLoading((prev) => ({ ...prev, gradeId: true }));
    setInitialLoadError(null);
    const result = await catalogService.listGrades(workspaceId);
    setLoading((prev) => ({ ...prev, gradeId: false }));
    if (result.ok) {
      setGrades(result.value);
    } else {
      if (result.error.code === 'RATE_LIMITED') {
        setPermissionState(true);
      } else {
        setInitialLoadError(result.error.safeMessage);
      }
    }
  }, [workspaceId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading((prev) => ({ ...prev, gradeId: true }));
      setInitialLoadError(null);
      const result = await catalogService.listGrades(workspaceId);
      if (cancelled) return;
      setLoading((prev) => ({ ...prev, gradeId: false }));
      if (result.ok) {
        setGrades(result.value);
      } else {
        if (result.error.code === 'RATE_LIMITED') {
          setPermissionState(true);
        } else {
          setInitialLoadError(result.error.safeMessage);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  useEffect(() => {
    if (!values.gradeId || !values.curriculumVersionId) return;
    let cancelled = false;
    void (async () => {
      setLoading((prev) => ({ ...prev, subjectId: true }));
      const result = await catalogService.listSubjects(
        workspaceId,
        values.gradeId,
        values.curriculumVersionId,
      );
      if (cancelled) return;
      setLoading((prev) => ({ ...prev, subjectId: false }));
      if (result.ok) {
        setSubjects(result.value);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [values.gradeId, values.curriculumVersionId, workspaceId]);

  useEffect(() => {
    if (!values.gradeId || !values.subjectId || !values.curriculumVersionId) return;
    let cancelled = false;
    void (async () => {
      setLoading((prev) => ({ ...prev, materialIds: true }));
      const result = await catalogService.listMaterials(
        workspaceId,
        values.gradeId,
        values.subjectId,
        values.curriculumVersionId,
      );
      if (cancelled) return;
      setLoading((prev) => ({ ...prev, materialIds: false }));
      if (result.ok) {
        setMaterials(result.value);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [values.gradeId, values.subjectId, values.curriculumVersionId, workspaceId]);

  const generateSubmit = useGenerateSubmit({
    onSuccess: () => {
      setSuccessState(true);
    },
    onPermissionError: () => {
      setPermissionState(true);
    },
  });

  const isAnyLoading = useMemo(
    () => Object.values(loading).some(Boolean) || generateSubmit.busy,
    [loading, generateSubmit.busy],
  );

  const compositionState = useMemo((): CompositionState => {
    if (permissionState) return 'permission';
    if (successState) return 'success';
    if (compositionError) return 'error';
    if (submitted) {
      const validation = validateComposition(values);
      if (!validation.ok) return 'invalid';
    }
    const hasAnyValue =
      values.curriculumVersionId ||
      values.gradeId ||
      values.subjectId ||
      values.materialIds.length > 0 ||
      values.sourceId;
    if (hasAnyValue) return 'composing';
    return 'empty';
  }, [values, submitted, compositionError, permissionState, successState]);

  const hasKatalog = values.sourceMode === 'katalog' || values.sourceMode === 'katalog+pdf';
  const hasPdf = values.sourceMode === 'pdf' || values.sourceMode === 'katalog+pdf';

  const update = useCallback(
    <K extends CompositionFieldKey>(key: K, value: CompositionValues[K]) => {
      setValues((prev) => {
        const next = { ...prev, [key]: value };

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

      setLocalErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      if (compositionError) {
        setCompositionError(null);
      }
      if (permissionState) {
        setPermissionState(false);
      }
      if (successState) {
        setSuccessState(false);
      }
    },
    [compositionError, permissionState, successState],
  );

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

  const handleSourceSuccess = useCallback(
    (sourceId: string) => {
      update('sourceId', sourceId);
    },
    [update],
  );

  const onSubmitForm = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitted(true);
      const validation = validateComposition(values);
      if (!validation.ok) {
        const next: Partial<Record<CompositionFieldKey, string>> = {};
        for (const failure of validation.failures) {
          next[failure.field] = failure.message;
        }
        setLocalErrors(next);

        const first = validation.failures[0]?.field;
        const node = document.getElementById(`compose-${first}`);
        if (node instanceof HTMLElement) node.focus();
        return;
      }
      setLocalErrors({});
      void generateSubmit.submit(values, workspaceId);
    },
    [values, workspaceId, generateSubmit],
  );

  const summaryItems = useMemo(() => {
    const items: { label: string; value: string }[] = [];
    const gradeLabel = grades.find((g) => g.id === values.gradeId)?.label;
    const subjectLabel = subjects.find((s) => s.id === values.subjectId)?.label;
    const curriculumLabel = CURRICULUM_OPTIONS.find(
      (c) => c.id === values.curriculumVersionId,
    )?.label;

    if (curriculumLabel) items.push({ label: 'Kurikulum', value: curriculumLabel });
    if (gradeLabel) items.push({ label: 'Kelas', value: gradeLabel });
    if (subjectLabel) items.push({ label: 'Mata Pelajaran', value: subjectLabel });
    if (values.materialIds.length > 0) {
      const names = values.materialIds
        .map((id) => materials.find((m) => m.id === id)?.label)
        .filter(Boolean) as string[];
      items.push({ label: 'Materi', value: `${names.length} topik` });
    }
    if (values.sourceId) {
      items.push({ label: 'Sumber PDF', value: 'Terunggah' });
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

  const readinessChecks: Array<{ ok: boolean }> = hasKatalog
    ? [
        { ok: Boolean(values.curriculumVersionId) },
        { ok: Boolean(values.gradeId) },
        { ok: Boolean(values.subjectId) },
        { ok: values.materialIds.length > 0 },
        ...(hasPdf ? [{ ok: Boolean(values.sourceId) }] : []),
        { ok: Boolean(values.assessmentType) },
        { ok: Boolean(values.difficulty) },
        { ok: Boolean(values.reviewMode) },
      ]
    : hasPdf
      ? [
          { ok: Boolean(values.sourceId) },
          { ok: Boolean(values.assessmentType) },
          { ok: Boolean(values.difficulty) },
          { ok: Boolean(values.reviewMode) },
        ]
      : [
          { ok: Boolean(values.assessmentType) },
          { ok: Boolean(values.difficulty) },
          { ok: Boolean(values.reviewMode) },
        ];
  const readyCount = readinessChecks.filter((c) => c.ok).length;
  const totalRequired = readinessChecks.length;
  const readinessLabel = `${readyCount}/${totalRequired}`;

  const fieldClass =
    'w-full rounded-md border border-brand-line bg-brand-surface-raised px-3 py-2 text-body-default text-brand-ink placeholder:text-brand-ink-subtle transition-colors focus-visible:border-brand-line-strong focus-visible:outline-2 focus-visible:outline focus-visible:outline-brand-focus disabled:cursor-not-allowed disabled:bg-brand-paper';
  const errorClass = 'text-body-sm text-brand-danger';
  const labelClass = 'text-label-semibold text-brand-ink';
  const helpClass = 'text-body-sm text-brand-ink-muted';
  const selectClass = `${fieldClass} appearance-none`;
  const radioGroupClass = 'flex flex-wrap gap-3';

  return (
    <>
      <div aria-live="polite" role="status" className="sr-only">
        {announcement}
      </div>

      {compositionState === 'empty' && (
        <div
          role="status"
          className="rounded-md border border-brand-line bg-brand-paper p-6 text-center"
        >
          <p className="text-body-sm text-brand-ink-muted">
            Belum ada konfigurasi. Pilih sumber materi dan pengaturan untuk memulai.
          </p>
        </div>
      )}

      {compositionState === 'error' && compositionError && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-brand-danger/30 bg-brand-danger-soft p-4"
        >
          <p className="text-body-sm text-brand-danger">{compositionError.safeMessage}</p>
          {compositionError.hint && (
            <p className="mt-1 text-body-sm text-brand-ink-muted">{compositionError.hint}</p>
          )}
          {compositionError.retryable && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setCompositionError(null);
                void loadGrades();
              }}
              className="mt-3"
            >
              Coba lagi
            </Button>
          )}
        </div>
      )}

      {compositionState === 'permission' && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-brand-warning/30 bg-brand-warning-soft p-4"
        >
          <p className="text-body-sm text-brand-warning font-medium">Kuota habis</p>
          <p className="mt-1 text-body-sm text-brand-ink-muted">
            Anda telah mencapai batas lembar yang dapat dibuat. Hubungi admin atau tingkatkan paket
            Anda.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setPermissionState(false);
              void loadGrades();
            }}
            className="mt-3"
          >
            Coba lagi
          </Button>
        </div>
      )}

      {compositionState === 'success' && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md border border-brand-accent/30 bg-brand-accent-soft p-4"
        >
          <p className="text-body-sm text-brand-accent font-medium">Konfigurasi diterima</p>
          <p className="mt-1 text-body-sm text-brand-ink-muted">
            Konfigurasi tersimpan. Lanjutkan ke langkah berikutnya untuk membuat draft.
          </p>
        </div>
      )}

      {summaryItems.length > 0 && (
        <div className="mb-4 md:hidden">
          <button
            type="button"
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="flex w-full items-center justify-between rounded-md border border-brand-line bg-brand-surface-raised px-4 py-3 text-left"
            aria-expanded={summaryOpen}
          >
            <span className="text-label-semibold text-brand-ink">Ringkasan ({readinessLabel})</span>
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
        <form
          onSubmit={onSubmitForm}
          className="min-w-0 flex-1"
          noValidate
          aria-busy={isAnyLoading ? true : undefined}
        >
          <div className="flex flex-col gap-8">
            <Panel title="Materi Ujian" description="Pilih sumber dan lingkup materi.">
              <div className="flex flex-col gap-5">
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

                {hasKatalog && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="compose-curriculumVersionId" className={labelClass}>
                        Kurikulum <span className="text-brand-danger">*</span>
                      </label>
                      <select
                        id="compose-curriculumVersionId"
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

                    <div className="flex flex-col gap-2">
                      <label htmlFor="compose-gradeId" className={labelClass}>
                        Kelas <span className="text-brand-danger">*</span>
                      </label>
                      {initialLoadError ? (
                        <div className="flex flex-col gap-2" role="alert">
                          <p className={errorClass}>{initialLoadError}</p>
                          <Button variant="secondary" size="sm" onClick={() => void loadGrades()}>
                            Coba lagi
                          </Button>
                        </div>
                      ) : (
                        <>
                          <select
                            id="compose-gradeId"
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

                    <div className="flex flex-col gap-2">
                      <label htmlFor="compose-subjectId" className={labelClass}>
                        Mata Pelajaran <span className="text-brand-danger">*</span>
                      </label>
                      <select
                        id="compose-subjectId"
                        value={values.subjectId}
                        onChange={(e) => update('subjectId', e.target.value)}
                        className={selectClass}
                        disabled={!values.gradeId || loading.subjectId}
                        aria-invalid={localErrors.subjectId ? true : undefined}
                      >
                        <option value="">
                          {loading.subjectId
                            ? 'Memuat…'
                            : values.gradeId
                              ? 'Pilih mata pelajaran'
                              : 'Pilih kelas terlebih dahulu'}
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

                    <div className="flex flex-col gap-2">
                      <fieldset>
                        <legend className={labelClass}>
                          Materi <span className="text-brand-danger">*</span>
                          <p className={`${helpClass} mt-0.5`}>Pilih minimal satu materi</p>
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

                {hasPdf && (
                  <div className="flex flex-col gap-2">
                    <label className={labelClass}>
                      Sumber PDF <span className="text-brand-danger">*</span>
                    </label>
                    <PrivatePdfSource workspaceId={workspaceId} onSuccess={handleSourceSuccess} />
                    {localErrors.sourceId ? (
                      <p className={errorClass} role="alert">
                        {localErrors.sourceId}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </Panel>

            <Panel title="Pengaturan Soal" description="Konfigurasi jenis dan jumlah soal.">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="compose-assessmentType" className={labelClass}>
                    Jenis Lembar <span className="text-brand-danger">*</span>
                  </label>
                  <select
                    id="compose-assessmentType"
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
                  <label htmlFor="compose-difficulty" className={labelClass}>
                    Tingkat Kesulitan <span className="text-brand-danger">*</span>
                  </label>
                  <select
                    id="compose-difficulty"
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
                  <label htmlFor="compose-questionCount" className={labelClass}>
                    Jumlah Soal <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    id="compose-questionCount"
                    type="number"
                    min={MIN_QUESTIONS}
                    max={MAX_QUESTIONS}
                    value={values.questionCount}
                    onChange={(e) =>
                      update('questionCount', clampQuestionCount(Number(e.target.value)))
                    }
                    onBlur={(e) =>
                      update('questionCount', clampQuestionCount(Number(e.target.value)))
                    }
                    className={fieldClass}
                    aria-invalid={localErrors.questionCount ? true : undefined}
                    aria-describedby="compose-questionCount-help"
                  />
                  <p className={helpClass} id="compose-questionCount-help">
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

            <Panel
              title="Konteks & Referensi"
              description="Tambahan informasi untuk AI (opsional)."
            >
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="compose-teacherFocus" className={labelClass}>
                    Fokus / Tujuan Guru
                  </label>
                  <textarea
                    id="compose-teacherFocus"
                    value={values.teacherFocus}
                    onChange={(e) => update('teacherFocus', e.target.value)}
                    className={`${fieldClass} min-h-24 resize-y`}
                    placeholder="Contoh: Fokus pada pemahaman konsep pecahan"
                    maxLength={500}
                    aria-invalid={localErrors.teacherFocus ? true : undefined}
                  />
                  <p className={helpClass}>Maksimal 500 karakter. Tidak dikirim ke analitik.</p>
                  {localErrors.teacherFocus ? (
                    <p className={errorClass} role="alert">
                      {localErrors.teacherFocus}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="compose-exampleQuestion" className={labelClass}>
                    Contoh Soal
                  </label>
                  <textarea
                    id="compose-exampleQuestion"
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

            <OutputSettings />

            {submitted && !validateComposition(values).ok && (
              <div
                role="alert"
                className="rounded-md border border-brand-danger bg-brand-danger-soft px-4 py-3"
              >
                <p className="text-body-sm text-brand-danger">
                  Perbaiki isian yang belum lengkap sebelum melanjutkan.
                </p>
                <ul className="mt-2 list-disc pl-5">
                  {validateComposition(values).failures.map((f) => (
                    <li key={f.field} className="text-body-sm text-brand-danger">
                      {LABELS[f.field]}: {f.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {getMissingSourceHint(values) && (
              <p className="text-body-sm text-brand-warning" role="status">
                {getMissingSourceHint(values)}
              </p>
            )}

            {getMissingOutcomesHint(values) && (
              <p className="text-body-sm text-brand-warning" role="status">
                {getMissingOutcomesHint(values)}
              </p>
            )}

            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                disabled={
                  compositionState === 'permission' ||
                  compositionState === 'success' ||
                  !!initialLoadError ||
                  generateSubmit.busy
                }
                aria-busy={generateSubmit.busy ? true : undefined}
              >
                {generateSubmit.busy ? 'Membuat draft…' : `Buat draft ${values.questionCount} soal`}
              </Button>
              <p className={helpClass}>
                AI membuat draft sesuai konteks terpilih. Anda meninjau sebelum final.
              </p>
            </div>
          </div>
        </form>

        <aside className="hidden w-72 shrink-0 self-start lg:block lg:sticky lg:top-6">
          <div className="rounded-md border border-brand-line bg-brand-surface-raised px-4 py-4">
            <h3 className="text-label-semibold text-brand-ink">Ringkasan Konfigurasi</h3>
            <p className={`${helpClass} mb-3`}>Kesiapan: {readinessLabel}</p>
            {summaryItems.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {summaryItems.map((item) => (
                  <li key={item.label} className="flex items-start justify-between gap-2">
                    <span className="text-body-sm text-brand-ink-muted shrink-0">{item.label}</span>
                    <span className="text-body-sm text-brand-ink text-right truncate max-w-[140px]">
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={helpClass}>Pilih materi dan pengaturan untuk melihat ringkasan.</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function SummaryContent({
  items,
  readinessLabel,
}: {
  items: { label: string; value: string }[];
  readinessLabel: string;
}) {
  return (
    <>
      <p className="text-body-sm text-brand-ink-muted mb-2">Kesiapan: {readinessLabel}</p>
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
        <p className="text-body-sm text-brand-ink-muted">
          Pilih materi dan pengaturan untuk melihat ringkasan.
        </p>
      )}
    </>
  );
}
