'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { catalogService } from '@/src/services/catalog/catalogService';
import { useWorkspace } from '@/src/features/workspace/workspaceContext';
import { PrivatePdfSource } from '@/src/features/pdf-source';
import { writeActiveJob } from '@/src/features/jobs/activeJobStorage';
import { OutputSettings } from './OutputSettings';
import { Button, Panel } from '@/app/components/ui';
import { validateComposition, getMissingSourceHint, getMissingOutcomesHint } from './validation';
import { useGenerateSubmit } from './state/useGenerateSubmit';
import type { Translate } from '@/src/i18n/types';
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
  QuestionType,
  ImageStyle,
} from './types';
import {
  INITIAL_COMPOSITION_VALUES,
  QUESTION_TYPES,
  buildEvenQuestionTypeCounts,
  clampImageMaxCount,
  clampQuestionCount,
  ensureCompositionValues,
  getQuestionTypeLabel,
  parseQuestionCountInput,
  parseQuestionTypeCountInput,
  rebalanceQuestionTypeCounts,
} from './types';

type CatalogOption = components['schemas']['CatalogOption'];

const CURRICULUM_IDS = ['kurmer-1', 'kurmer-2', 'kurmer-3', 'k13'] as const;
const ASSESSMENT_TYPES: AssessmentType[] = [
  'practice',
  'daily',
  'midterm',
  'final',
  'promotion',
  'tka',
];
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'mixed'];
const REVIEW_MODES: ReviewMode[] = ['quick', 'detail'];
const IMAGE_STYLES: ImageStyle[] = ['auto', 'diagram', 'illustration'];

const MIN_QUESTIONS = 1;
const MAX_QUESTIONS = 200;

/** Exhaustive field labels. The `Record<CompositionFieldKey, string>` return type
 *  preserves the compile-time guarantee that every composition field is labelled. */
function buildLabels(t: Translate): Record<CompositionFieldKey, string> {
  return {
    sourceMode: t('fields.sourceMode'),
    curriculumVersionId: t('fields.curriculumVersionId'),
    gradeId: t('fields.gradeId'),
    subjectId: t('fields.subjectId'),
    gradeLabel: t('fields.gradeLabel'),
    subjectLabel: t('fields.subjectLabel'),
    materialIds: t('fields.materialIds'),
    sourceId: t('fields.sourceId'),
    assessmentType: t('fields.assessmentType'),
    academicYear: t('fields.academicYear'),
    difficulty: t('fields.difficulty'),
    questionCount: t('fields.questionCount'),
    durationMinutes: t('fields.durationMinutes'),
    questionTypeCounts: t('fields.questionTypeCounts'),
    imageMode: t('fields.imageMode'),
    imageMaxCount: t('fields.imageMaxCount'),
    imageStyle: t('fields.imageStyle'),
    reviewMode: t('fields.reviewMode'),
    teacherFocus: t('fields.teacherFocus'),
    exampleQuestion: t('fields.exampleQuestion'),
  };
}

export default function ConfigurationCompose() {
  const t = useTranslations('generate');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace.id;

  const [values, setValues] = useState<CompositionValues>(INITIAL_COMPOSITION_VALUES);
  const [templateName, setTemplateName] = useState('');
  const [templateStatus, setTemplateStatus] = useState('');
  const [templateBusy, setTemplateBusy] = useState(false);
  const [localErrors, setLocalErrors] = useState<Partial<Record<CompositionFieldKey, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const announcementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const LABELS = useMemo(() => buildLabels(t), [t]);
  const curriculumOptions = useMemo(
    () => CURRICULUM_IDS.map((id) => ({ id, label: t(`curriculum.${id}`) })),
    [t],
  );
  const assessmentTypeOptions = useMemo(
    () => ASSESSMENT_TYPES.map((value) => ({ value, label: t(`assessmentType.${value}`) })),
    [t],
  );
  const difficultyOptions = useMemo(
    () => DIFFICULTIES.map((value) => ({ value, label: t(`difficulty.${value}`) })),
    [t],
  );
  const reviewModeOptions = useMemo(
    () =>
      REVIEW_MODES.map((value) => ({
        value,
        label: t(`reviewMode.${value}.label`),
        desc: t(`reviewMode.${value}.desc`),
      })),
    [t],
  );
  const imageStyleOptions = useMemo(
    () => IMAGE_STYLES.map((value) => ({ value, label: t(`imageStyle.${value}`) })),
    [t],
  );

  useEffect(() => {
    return () => {
      if (announcementTimerRef.current) clearTimeout(announcementTimerRef.current);
    };
  }, []);

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

  useEffect(() => {
    const templateId = searchParams.get('templateId');
    if (!templateId) return;
    let cancelled = false;
    void (async () => {
      const response = await fetch('/v1/templates', { credentials: 'include' });
      const payload = await response.json().catch(() => null);
      const template = payload?.data?.find((item: { id?: string }) => item.id === templateId);
      if (cancelled) return;
      if (!response.ok || !template?.config) {
        setTemplateStatus(t('template.notFound'));
        return;
      }
      setValues(
        ensureCompositionValues({
          ...INITIAL_COMPOSITION_VALUES,
          ...template.config,
          sourceId: '',
        }),
      );
      setTemplateName(template.name ?? '');
      setTemplateStatus(t('template.applied', { name: template.name }));
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams, t]);

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
    onSuccess: (result) => {
      setSuccessState(true);
      if (result.jobId) {
        writeActiveJob({
          jobId: result.jobId,
          workspaceId,
          reviewMode: values.reviewMode,
          savedAt: new Date().toISOString(),
        });
        router.push(`/app/jobs/${result.jobId}`);
      }
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
      const validation = validateComposition(values, t);
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
  }, [values, submitted, compositionError, permissionState, successState, t]);

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
          ann = t('announce.curriculumUpdated');
        } else if (key === 'gradeId' && value !== prev.gradeId) {
          next.subjectId = '';
          next.materialIds = [];
          setSubjects([]);
          setMaterials([]);
          ann = t('announce.gradeUpdated');
        } else if (key === 'subjectId' && value !== prev.subjectId) {
          next.materialIds = [];
          setMaterials([]);
          ann = t('announce.subjectUpdated');
        }

        if (key === 'questionCount') {
          next.questionTypeCounts = rebalanceQuestionTypeCounts(
            value as number,
            prev.questionTypeCounts,
          );
        }

        if (ann) {
          setAnnouncement(ann);
          if (announcementTimerRef.current) clearTimeout(announcementTimerRef.current);
          announcementTimerRef.current = setTimeout(() => setAnnouncement(''), 2000);
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
    [compositionError, permissionState, successState, t],
  );

  const updateQuestionTypeCount = useCallback((type: QuestionType, rawValue: number) => {
    setValues((prev) => {
      const sanitized = parseQuestionTypeCountInput(String(rawValue));
      const nextCounts = rebalanceQuestionTypeCounts(
        prev.questionCount,
        { ...prev.questionTypeCounts, [type]: sanitized },
        type,
      );
      return { ...prev, questionTypeCounts: nextCounts };
    });
  }, []);

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
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitted(true);
      const validation = validateComposition(values, t);
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
      const gradeLabel = grades.find((g) => g.id === values.gradeId)?.label;
      const subjectLabel = subjects.find((s) => s.id === values.subjectId)?.label;
      const result = await generateSubmit.submit(
        { ...values, gradeLabel, subjectLabel },
        workspaceId,
      );
      if (
        !result.ok &&
        !['ENTITLEMENT_REQUIRED', 'SUBSCRIPTION_INACTIVE', 'QUOTA_EXHAUSTED'].includes(
          result.error.code,
        )
      ) {
        setCompositionError(result.error);
      }
    },
    [values, workspaceId, generateSubmit, grades, subjects, t],
  );

  const saveTemplate = useCallback(async () => {
    const name = templateName.trim();
    if (!name) {
      setTemplateStatus(t('template.nameRequired'));
      return;
    }
    setTemplateBusy(true);
    setTemplateStatus('');
    const response = await fetch('/v1/templates', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, config: { ...values, sourceId: '' } }),
    });
    const payload = await response.json().catch(() => null);
    setTemplateBusy(false);
    if (!response.ok) {
      setTemplateStatus(payload?.error?.message ?? t('template.saveFailed'));
      return;
    }
    setTemplateStatus(t('template.saved', { name }));
  }, [templateName, values, t]);

  const summaryItems = useMemo(() => {
    const items: { label: string; value: string }[] = [];
    const gradeLabel = grades.find((g) => g.id === values.gradeId)?.label;
    const subjectLabel = subjects.find((s) => s.id === values.subjectId)?.label;
    const curriculumLabel = curriculumOptions.find(
      (c) => c.id === values.curriculumVersionId,
    )?.label;

    if (curriculumLabel)
      items.push({ label: t('summary.labels.curriculum'), value: curriculumLabel });
    if (gradeLabel) items.push({ label: t('summary.labels.grade'), value: gradeLabel });
    if (subjectLabel) items.push({ label: t('summary.labels.subject'), value: subjectLabel });
    if (values.materialIds.length > 0) {
      const names = values.materialIds
        .map((id) => materials.find((m) => m.id === id)?.label)
        .filter(Boolean) as string[];
      items.push({
        label: t('summary.labels.material'),
        value: t('summary.topics', { count: names.length }),
      });
    }
    if (values.sourceId) {
      items.push({ label: t('summary.labels.sourcePdf'), value: t('summary.uploaded') });
    }
    const atype = assessmentTypeOptions.find((a) => a.value === values.assessmentType);
    if (atype) items.push({ label: t('summary.labels.type'), value: atype.label });
    if (values.academicYear.trim()) {
      items.push({ label: t('summary.labels.academicYear'), value: values.academicYear.trim() });
    }
    const diff = difficultyOptions.find((d) => d.value === values.difficulty);
    if (diff) items.push({ label: t('summary.labels.difficulty'), value: diff.label });
    items.push({ label: t('summary.labels.questionCount'), value: String(values.questionCount) });
    if (values.imageMode === 'auto') {
      const imageStyle = imageStyleOptions.find((style) => style.value === values.imageStyle);
      items.push({
        label: t('summary.labels.image'),
        value: t('summary.maxImages', {
          count: values.imageMaxCount,
          style: imageStyle?.label ?? t('imageStyle.auto'),
        }),
      });
    }
    const rm = reviewModeOptions.find((r) => r.value === values.reviewMode);
    if (rm) items.push({ label: t('summary.labels.reviewMode'), value: rm.label });
    return items;
  }, [
    values,
    grades,
    subjects,
    materials,
    curriculumOptions,
    assessmentTypeOptions,
    difficultyOptions,
    reviewModeOptions,
    imageStyleOptions,
    t,
  ]);

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
          <p className="text-body-sm text-brand-ink-muted">{t('status.empty')}</p>
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
              {t('submit.retry')}
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
          <p className="text-body-sm text-brand-warning font-medium">
            {t('status.permissionTitle')}
          </p>
          <p className="mt-1 text-body-sm text-brand-ink-muted">{t('status.permissionBody')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setPermissionState(false);
                void loadGrades();
              }}
            >
              {t('submit.retry')}
            </Button>
            <Link
              href="/app/pengaturan/langganan"
              className="inline-flex items-center rounded-md border border-brand-accent px-3 py-1.5 text-body-sm font-medium text-brand-accent hover:bg-brand-accent/5 transition-colors"
            >
              {t('status.upgrade')}
            </Link>
          </div>
        </div>
      )}

      {compositionState === 'success' && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-md border border-brand-accent/30 bg-brand-accent-soft p-4"
        >
          <p className="text-body-sm text-brand-accent font-medium">{t('status.successTitle')}</p>
          <p className="mt-1 text-body-sm text-brand-ink-muted">{t('status.successBody')}</p>
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
            <span className="text-label-semibold text-brand-ink">
              {t('summary.label', { readiness: readinessLabel })}
            </span>
            <span className="text-brand-ink-muted">
              {summaryOpen ? t('summary.hide') : t('summary.show')}
            </span>
          </button>
          {summaryOpen && (
            <div className="mt-2 rounded-md border border-brand-line bg-brand-paper px-4 py-3">
              <SummaryContent
                items={summaryItems}
                readinessLabel={readinessLabel}
                readiness={t('summary.readiness', { label: readinessLabel })}
                empty={t('summary.empty')}
              />
            </div>
          )}
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <form
          onSubmit={onSubmitForm}
          className="min-w-0"
          noValidate
          aria-busy={isAnyLoading ? true : undefined}
        >
          <div className="flex flex-col gap-8">
            <Panel title={t('panels.materi.title')} description={t('panels.materi.desc')}>
              <div className="flex flex-col gap-5">
                <fieldset>
                  <legend className={`${labelClass} mb-2`}>{t('sourceMode.label')}</legend>
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
                            ? t('sourceMode.katalog')
                            : mode === 'pdf'
                              ? t('sourceMode.pdf')
                              : t('sourceMode.both')}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {hasKatalog && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="compose-curriculumVersionId" className={labelClass}>
                        {LABELS.curriculumVersionId} <span className="text-brand-danger">*</span>
                      </label>
                      <select
                        id="compose-curriculumVersionId"
                        value={values.curriculumVersionId}
                        onChange={(e) => update('curriculumVersionId', e.target.value)}
                        className={selectClass}
                        aria-invalid={localErrors.curriculumVersionId ? true : undefined}
                      >
                        <option value="">{t('select.curriculum')}</option>
                        {curriculumOptions.map((c) => (
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
                        {LABELS.gradeId} <span className="text-brand-danger">*</span>
                      </label>
                      {initialLoadError ? (
                        <div className="flex flex-col gap-2" role="alert">
                          <p className={errorClass}>{initialLoadError}</p>
                          <Button variant="secondary" size="sm" onClick={() => void loadGrades()}>
                            {t('submit.retry')}
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
                              {loading.gradeId ? t('select.loadingGrades') : t('select.grade')}
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
                        {LABELS.subjectId} <span className="text-brand-danger">*</span>
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
                            ? t('select.loadingMaterials')
                            : values.gradeId
                              ? t('select.subject')
                              : t('select.gradeFirst')}
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

                    <div className="flex min-w-0 flex-col gap-2">
                      <fieldset className="min-w-0">
                        <legend className={labelClass}>
                          {LABELS.materialIds} <span className="text-brand-danger">*</span>
                          <p className={`${helpClass} mt-0.5`}>{t('select.materialHelp')}</p>
                        </legend>
                        <div
                          className="mt-2 max-h-48 overflow-hidden overflow-y-auto rounded-md border border-brand-line bg-brand-surface-raised"
                          role="group"
                          aria-label={t('select.materialAria')}
                        >
                          {loading.materialIds ? (
                            <div className="px-3 py-4 text-body-sm text-brand-ink-muted">
                              {t('select.loadingMaterials')}
                            </div>
                          ) : !values.subjectId ? (
                            <div className="px-3 py-4 text-body-sm text-brand-ink-muted">
                              {t('select.gradeFirst')}
                            </div>
                          ) : materials.length === 0 ? (
                            <div className="px-3 py-4 text-body-sm text-brand-ink-muted">
                              {t('select.noMaterials')}
                            </div>
                          ) : (
                            materials.map((m) => {
                              const selected = values.materialIds.includes(m.id);
                              return (
                                <label
                                  key={m.id}
                                  title={m.label}
                                  className={`flex min-w-0 cursor-pointer items-center gap-3 border-b border-brand-line px-3 py-2.5 transition-colors last:border-b-0 hover:bg-brand-paper ${
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
                      {LABELS.sourceId} <span className="text-brand-danger">*</span>
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

            <Panel title={t('panels.questions.title')} description={t('panels.questions.desc')}>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="compose-assessmentType" className={labelClass}>
                    {LABELS.assessmentType} <span className="text-brand-danger">*</span>
                  </label>
                  <select
                    id="compose-assessmentType"
                    value={values.assessmentType}
                    onChange={(e) => update('assessmentType', e.target.value as AssessmentType)}
                    className={selectClass}
                    aria-invalid={localErrors.assessmentType ? true : undefined}
                  >
                    {assessmentTypeOptions.map((a) => (
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
                  <label htmlFor="compose-academicYear" className={labelClass}>
                    {LABELS.academicYear}
                  </label>
                  <input
                    id="compose-academicYear"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{4}/[0-9]{4}"
                    placeholder={t('academicYear.placeholder')}
                    value={values.academicYear}
                    onChange={(event) => update('academicYear', event.target.value)}
                    className={fieldClass}
                    aria-describedby="compose-academicYear-help"
                  />
                  <p className={helpClass} id="compose-academicYear-help">
                    {t('academicYear.help')}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="compose-difficulty" className={labelClass}>
                    {LABELS.difficulty} <span className="text-brand-danger">*</span>
                  </label>
                  <select
                    id="compose-difficulty"
                    value={values.difficulty}
                    onChange={(e) => update('difficulty', e.target.value as Difficulty)}
                    className={selectClass}
                    aria-invalid={localErrors.difficulty ? true : undefined}
                  >
                    {difficultyOptions.map((d) => (
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
                    {LABELS.questionCount} <span className="text-brand-danger">*</span>
                  </label>
                  <input
                    id="compose-questionCount"
                    type="number"
                    min={MIN_QUESTIONS}
                    max={MAX_QUESTIONS}
                    value={values.questionCount}
                    onChange={(e) =>
                      update(
                        'questionCount',
                        clampQuestionCount(parseQuestionCountInput(e.target.value)),
                      )
                    }
                    onBlur={(e) =>
                      update(
                        'questionCount',
                        clampQuestionCount(parseQuestionCountInput(e.target.value)),
                      )
                    }
                    className={fieldClass}
                    aria-invalid={localErrors.questionCount ? true : undefined}
                    aria-describedby="compose-questionCount-help"
                  />
                  <p className={helpClass} id="compose-questionCount-help">
                    {t('questionCount.help')}
                  </p>
                  {localErrors.questionCount ? (
                    <p className={errorClass} role="alert">
                      {localErrors.questionCount}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="compose-durationMinutes" className={labelClass}>
                    {LABELS.durationMinutes}
                  </label>
                  <input
                    id="compose-durationMinutes"
                    type="number"
                    min={0}
                    max={480}
                    value={values.durationMinutes}
                    onChange={(e) =>
                      update(
                        'durationMinutes',
                        Math.min(480, Math.max(0, Number(e.target.value) || 0)),
                      )
                    }
                    className={fieldClass}
                    aria-describedby="compose-durationMinutes-help"
                  />
                  <p className={helpClass} id="compose-durationMinutes-help">
                    {t('duration.help')}
                  </p>
                </div>

                <fieldset>
                  <legend className={labelClass}>{t('distribution.label')}</legend>
                  <p className={`${helpClass} mt-0.5`}>{t('distribution.help')}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {QUESTION_TYPES.map((type) => (
                      <div key={type} className="flex flex-col gap-2">
                        <label
                          htmlFor={`compose-questionTypeCounts-${type}`}
                          className={labelClass}
                        >
                          {getQuestionTypeLabel(type, t)}
                        </label>
                        <input
                          id={`compose-questionTypeCounts-${type}`}
                          type="number"
                          min={0}
                          max={MAX_QUESTIONS}
                          value={values.questionTypeCounts[type]}
                          onChange={(e) =>
                            updateQuestionTypeCount(
                              type,
                              parseQuestionTypeCountInput(e.target.value),
                            )
                          }
                          onBlur={(e) =>
                            updateQuestionTypeCount(
                              type,
                              parseQuestionTypeCountInput(e.target.value),
                            )
                          }
                          className={fieldClass}
                        />
                      </div>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="rounded-md border border-brand-line p-4">
                  <legend className="px-1 text-label-semibold text-brand-ink">
                    {t('image.label')}
                  </legend>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      id="compose-imageMode"
                      type="checkbox"
                      checked={values.imageMode === 'auto'}
                      onChange={(event) =>
                        update('imageMode', event.target.checked ? 'auto' : 'none')
                      }
                      className="mt-0.5 h-4 w-4 rounded border-brand-line text-brand-accent focus:ring-brand-accent"
                    />
                    <span className="flex flex-col gap-1">
                      <span className="text-body-default font-medium text-brand-ink">
                        {t('image.toggleTitle')}
                      </span>
                      <span className={helpClass}>{t('image.toggleHelp')}</span>
                    </span>
                  </label>

                  {values.imageMode === 'auto' ? (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="compose-imageMaxCount" className={labelClass}>
                          {LABELS.imageMaxCount}
                        </label>
                        <input
                          id="compose-imageMaxCount"
                          type="number"
                          min={1}
                          max={5}
                          value={values.imageMaxCount}
                          onChange={(event) =>
                            update('imageMaxCount', clampImageMaxCount(Number(event.target.value)))
                          }
                          onBlur={(event) =>
                            update('imageMaxCount', clampImageMaxCount(Number(event.target.value)))
                          }
                          className={fieldClass}
                          aria-describedby="compose-imageMaxCount-help"
                        />
                        <p id="compose-imageMaxCount-help" className={helpClass}>
                          {t('image.maxCountHelp')}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="compose-imageStyle" className={labelClass}>
                          {LABELS.imageStyle}
                        </label>
                        <select
                          id="compose-imageStyle"
                          value={values.imageStyle}
                          onChange={(event) =>
                            update('imageStyle', event.target.value as ImageStyle)
                          }
                          className={selectClass}
                        >
                          {imageStyleOptions.map((style) => (
                            <option key={style.value} value={style.value}>
                              {style.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : null}
                </fieldset>

                <fieldset>
                  <legend className={`${labelClass} mb-2`}>
                    {LABELS.reviewMode} <span className="text-brand-danger">*</span>
                  </legend>
                  <div className={radioGroupClass}>
                    {reviewModeOptions.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        role="radio"
                        aria-checked={values.reviewMode === r.value}
                        onClick={() => update('reviewMode', r.value)}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-3 text-left transition-colors ${
                          values.reviewMode === r.value
                            ? 'border-brand-accent bg-brand-accent-soft ring-1 ring-brand-accent'
                            : 'border-brand-line hover:bg-brand-paper'
                        }`}
                      >
                        <span
                          aria-hidden="true"
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
                        <span className="flex flex-col">
                          <span className="text-body-default font-medium">{r.label}</span>
                          <span className="text-body-sm text-brand-ink-muted">{r.desc}</span>
                        </span>
                      </button>
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

            <Panel title={t('panels.context.title')} description={t('panels.context.desc')}>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="compose-teacherFocus" className={labelClass}>
                    {LABELS.teacherFocus}
                  </label>
                  <textarea
                    id="compose-teacherFocus"
                    value={values.teacherFocus}
                    onChange={(e) => update('teacherFocus', e.target.value)}
                    className={`${fieldClass} min-h-24 max-h-64 resize-y overflow-y-auto`}
                    placeholder={t('teacherFocus.placeholder')}
                    maxLength={500}
                    rows={4}
                    data-lenis-prevent
                    aria-invalid={localErrors.teacherFocus ? true : undefined}
                  />
                  <p className={helpClass}>{t('teacherFocus.help')}</p>
                  {localErrors.teacherFocus ? (
                    <p className={errorClass} role="alert">
                      {localErrors.teacherFocus}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="compose-exampleQuestion" className={labelClass}>
                    {LABELS.exampleQuestion}
                  </label>
                  <textarea
                    id="compose-exampleQuestion"
                    value={values.exampleQuestion}
                    onChange={(e) => update('exampleQuestion', e.target.value)}
                    className={`${fieldClass} min-h-28 max-h-80 resize-y overflow-y-auto`}
                    placeholder={t('exampleQuestion.placeholder')}
                    maxLength={2000}
                    rows={5}
                    data-lenis-prevent
                    aria-invalid={localErrors.exampleQuestion ? true : undefined}
                  />
                  <p className={helpClass}>{t('exampleQuestion.help')}</p>
                  {localErrors.exampleQuestion ? (
                    <p className={errorClass} role="alert">
                      {localErrors.exampleQuestion}
                    </p>
                  ) : null}
                </div>
              </div>
            </Panel>

            <OutputSettings />

            <Panel title={t('panels.template.title')} description={t('panels.template.desc')}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={templateName}
                  onChange={(event) => setTemplateName(event.target.value)}
                  maxLength={100}
                  placeholder={t('template.namePlaceholder')}
                  className={`${fieldClass} flex-1`}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void saveTemplate()}
                  disabled={templateBusy || !templateName.trim()}
                >
                  {templateBusy ? t('template.saving') : t('template.save')}
                </Button>
              </div>
              {templateStatus ? (
                <p className="mt-2 text-body-sm text-brand-ink-muted" role="status">
                  {templateStatus}
                </p>
              ) : null}
            </Panel>

            {submitted && !validateComposition(values, t).ok && (
              <div
                role="alert"
                className="rounded-md border border-brand-danger bg-brand-danger-soft px-4 py-3"
              >
                <p className="text-body-sm text-brand-danger">{t('submit.fixIncomplete')}</p>
                <ul className="mt-2 list-disc pl-5">
                  {validateComposition(values, t).failures.map((f) => (
                    <li key={f.field} className="text-body-sm text-brand-danger">
                      {LABELS[f.field]}: {f.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {getMissingSourceHint(values, t) && (
              <p className="text-body-sm text-brand-warning" role="status">
                {getMissingSourceHint(values, t)}
              </p>
            )}

            {getMissingOutcomesHint(values, t) && (
              <p className="text-body-sm text-brand-warning" role="status">
                {getMissingOutcomesHint(values, t)}
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
                {generateSubmit.busy
                  ? t('submit.creating')
                  : t('submit.create', { count: values.questionCount })}
              </Button>
              <p className={helpClass}>{t('submit.help')}</p>
            </div>
          </div>
        </form>

        <aside className="hidden min-w-0 self-start lg:block lg:sticky lg:top-6">
          <div className="rounded-md border border-brand-line bg-brand-surface-raised px-4 py-4">
            <h3 className="text-label-semibold text-brand-ink">{t('summary.title')}</h3>
            <p className={`${helpClass} mb-3`}>
              {t('summary.readiness', { label: readinessLabel })}
            </p>
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
              <p className={helpClass}>{t('summary.empty')}</p>
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
  readiness,
  empty,
}: {
  items: { label: string; value: string }[];
  readinessLabel: string;
  readiness: string;
  empty: string;
}) {
  return (
    <>
      <p className="text-body-sm text-brand-ink-muted mb-2">{readiness}</p>
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
        <p className="text-body-sm text-brand-ink-muted">{empty}</p>
      )}
    </>
  );
}
