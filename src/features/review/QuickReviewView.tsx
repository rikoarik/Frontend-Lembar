'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Panel, StatusBadge } from '@/app/components/ui';
import type { StatusLabel } from '@/app/components/ui';
import { assessmentService } from '@/src/services/assessments/assessmentService';
import type { Translate } from '@/src/i18n/types';
import type {
  AssessmentDetail,
  QuestionRubricCriterion,
  QuestionReviewState,
  ReviewQuestion,
} from '@/src/features/review/types';
import { mapReviewStateFromBackend, reviewStateLabel } from '@/src/features/review/types';
import { QuestionImageDisplay } from '@/src/features/questions/QuestionImageDisplay';

type FilterKey = 'all' | 'unreviewed' | 'warnings' | 'accepted';

function badgeForLifecycle(lifecycle: AssessmentDetail['lifecycle'], t: Translate): StatusLabel {
  switch (lifecycle) {
    case 'final':
      return t('badge.final') as StatusLabel;
    case 'generating':
      return t('badge.generating') as StatusLabel;
    case 'review':
      return t('badge.review') as StatusLabel;
    case 'archived':
      return t('badge.archived') as StatusLabel;
    default:
      return t('badge.draft') as StatusLabel;
  }
}

function matchesFilter(question: ReviewQuestion, filter: FilterKey): boolean {
  if (filter === 'all') return true;
  if (filter === 'unreviewed') {
    return question.reviewState === 'unreviewed' || question.reviewState === 'needs_attention';
  }
  if (filter === 'warnings') return question.warnings.length > 0;
  return ['accepted', 'edited'].includes(question.reviewState);
}

function canAccept(question: ReviewQuestion): boolean {
  return question.reviewState === 'unreviewed' || question.reviewState === 'needs_attention';
}

export function QuickReviewView({
  assessmentId,
  mode = 'quick',
}: {
  assessmentId: string;
  mode?: 'quick' | 'detail';
}) {
  const t = useTranslations('review');
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [detailIndex, setDetailIndex] = useState(0);
  const [editStem, setEditStem] = useState('');
  const [editExplanation, setEditExplanation] = useState('');
  const [editAnswerKey, setEditAnswerKey] = useState('');
  const [editOptions, setEditOptions] = useState<{ id: string; label: string; text: string }[]>([]);
  const [editOptionsAnswerKey, setEditOptionsAnswerKey] = useState('');
  const [editRubric, setEditRubric] = useState<QuestionRubricCriterion[]>([]);
  const rubricCounterRef = useRef(0);
  const optionCounterRef = useRef(0);
  const [statusNote, setStatusNote] = useState('');
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await assessmentService.get(assessmentId);
      if (!result.ok) {
        setError(result.error.safeMessage);
        setAssessment(null);
        return;
      }

      const rawQuestions = Array.isArray(result.value.questions) ? result.value.questions : [];
      setAssessment({
        ...result.value,
        questions: rawQuestions.map((question) => ({
          ...question,
          reviewState: mapReviewStateFromBackend(String(question.reviewState)),
        })),
      });
      setConflictMessage(null);
      setSelected(new Set());
    } catch {
      setError(t('quickReview.loadError'));
      setAssessment(null);
    } finally {
      setLoading(false);
    }
  }, [assessmentId, t]);

  useEffect(() => {
    // Existing async load owns the component's request state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const questions = useMemo(() => {
    if (!assessment) return [];
    return assessment.questions.filter((q) => matchesFilter(q, filter));
  }, [assessment, filter]);
  const visibleActionableQuestions = useMemo(() => questions.filter(canAccept), [questions]);
  const allVisibleSelected =
    visibleActionableQuestions.length > 0 &&
    visibleActionableQuestions.every((question) => selected.has(question.id));

  useLayoutEffect(() => {
    if (mode !== 'detail') return;
    // Detail navigation and editor fields mirror the newly filtered question.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (detailIndex >= questions.length) setDetailIndex(0);
    const current = questions[detailIndex];
    if (current) {
      setEditStem(current.stem);
      setEditExplanation(current.explanation);
      setEditAnswerKey(current.answerKey);
      setEditOptions(current.options);
      setEditOptionsAnswerKey(current.answerKey);
      setEditRubric(current.rubric ?? []);
    }
  }, [mode, questions, detailIndex]);

  useEffect(() => {
    if (selected.size === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(new Set());
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [selected.size]);

  // Keyboard navigation for detail mode: ArrowLeft/ArrowRight to move between questions
  useEffect(() => {
    if (mode !== 'detail') return;
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing inside an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setDetailIndex((i) => Math.min(i + 1, questions.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setDetailIndex((i) => Math.max(i - 1, 0));
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [mode, questions.length]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      visibleActionableQuestions.forEach((question) => {
        if (allVisibleSelected) next.delete(question.id);
        else next.add(question.id);
      });
      return next;
    });
  };

  const changeFilter = (nextFilter: FilterKey) => {
    setFilter(nextFilter);
    if (!assessment) return;
    const actionableIds = new Set(
      assessment.questions
        .filter((question) => matchesFilter(question, nextFilter) && canAccept(question))
        .map((question) => question.id),
    );
    setSelected((prev) => new Set([...prev].filter((id) => actionableIds.has(id))));
  };

  const selectAllUnreviewed = () => {
    if (!assessment) return;
    setFilter('unreviewed');
    setSelected(new Set(assessment.questions.filter(canAccept).map((question) => question.id)));
  };

  const setState = async (questionId: string, reviewState: QuestionReviewState) => {
    setBusy(true);
    const result = await assessmentService.updateQuestionState(
      assessmentId,
      questionId,
      reviewState,
    );
    setBusy(false);
    if (!result.ok) {
      setStatusNote(result.error.safeMessage);
      return;
    }
    setAssessment(result.value);
    setStatusNote(t('quickReview.statusUpdated'));
  };

  const onBulkAccept = async () => {
    if (selected.size === 0) return;
    setBusy(true);
    const result = await assessmentService.bulkAccept(assessmentId, Array.from(selected));
    setBusy(false);
    if (!result.ok) {
      setStatusNote(result.error.safeMessage);
      return;
    }
    setAssessment(result.value);
    setSelected(new Set());
    setStatusNote(t('quickReview.bulkAccepted', { count: selected.size }));
  };

  const onSaveEdit = async (questionId: string) => {
    if (!assessment) return;
    setBusy(true);
    const expectedEtag = assessment.etag;
    const result = await assessmentService.updateQuestionContent(
      assessmentId,
      questionId,
      {
        stem: editStem,
        explanation: editExplanation,
        ...(current?.questionType === 'short_answer' || current?.questionType === 'essay'
          ? {
              answerKey: editAnswerKey,
              rubric: current?.questionType === 'essay' ? editRubric : undefined,
            }
          : {
              options: editOptions.length > 0 ? editOptions : (current?.options ?? []),
              answerKey: editOptionsAnswerKey || current?.answerKey || '',
            }),
      },
      expectedEtag ? { expectedEtag } : {},
    );
    setBusy(false);
    if (!result.ok) {
      if (result.error.code === 'STATE_CONFLICT') {
        setStatusNote('');
        setConflictMessage(result.error.safeMessage);
        return;
      }
      setStatusNote(result.error.safeMessage);
      return;
    }
    setConflictMessage(null);
    setAssessment(result.value);
    setStatusNote(t('quickReview.editSaved'));
  };

  if (loading) {
    return (
      <div
        className="flex flex-col gap-3"
        aria-busy="true"
        aria-label={t('quickReview.loadingLabel')}
      >
        <div className="h-10 w-64 animate-pulse rounded bg-brand-line" />
        <div className="h-40 animate-pulse rounded bg-brand-line" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <Panel title={t('quickReview.errorTitle')} description={error ?? t('quickReview.notFound')}>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void load()}>{t('quickReview.retry')}</Button>
          <Link
            href="/app/riwayat"
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
          >
            {t('quickReview.openHistory')}
          </Link>
        </div>
      </Panel>
    );
  }

  const current = questions[detailIndex];
  const visibleEditOptions = editOptions.length > 0 ? editOptions : (current?.options ?? []);
  const canFinalize = assessment.canFinalize;
  const canOpenOutput = assessment.canOpenOutput;
  const lifecycleSubtitle = canOpenOutput
    ? t('quickReview.outputReady')
    : assessment.lifecycle === 'final'
      ? t('quickReview.outputNotReady')
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-h1 font-semibold text-brand-ink">{assessment.title}</h1>
            <StatusBadge label={badgeForLifecycle(assessment.lifecycle, t)} />
          </div>
          <p className="text-body-sm text-brand-ink-muted">
            {lifecycleSubtitle ? (
              <span data-testid="lifecycle-subtitle">{lifecycleSubtitle}</span>
            ) : null}{' '}
            {assessment.subject} · {assessment.gradeLabel} ·{' '}
            {t('quickReview.reviewedCount', {
              reviewed: assessment.reviewedCount,
              total: assessment.questionCount,
            })}{' '}
            · {t('quickReview.warnings', { count: assessment.warningCount })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/app/review/${assessment.id}?mode=quick`}
            className={`inline-flex min-h-[var(--control-md)] items-center rounded-md border px-3 text-body-sm ${mode === 'quick' ? 'border-brand-accent bg-brand-accent-soft text-brand-accent' : 'border-brand-line text-brand-ink'}`}
          >
            {t('quickReview.modeQuick')}
          </Link>
          <Link
            href={`/app/review/${assessment.id}?mode=detail`}
            className={`inline-flex min-h-[var(--control-md)] items-center rounded-md border px-3 text-body-sm ${mode === 'detail' ? 'border-brand-accent bg-brand-accent-soft text-brand-accent' : 'border-brand-line text-brand-ink'}`}
          >
            {t('quickReview.modeDetail')}
          </Link>
          {canFinalize ? (
            <Link
              href={`/app/review/${assessment.id}/finalize`}
              aria-disabled={busy || undefined}
              tabIndex={busy ? -1 : undefined}
              onClick={(event) => {
                if (busy) event.preventDefault();
              }}
              className={[
                'inline-flex min-h-[var(--control-md)] items-center justify-center gap-2 rounded-md bg-brand-accent px-4 text-body-default font-medium text-white transition-colors duration-[var(--motion-fast)] ease-[ease-out] hover:bg-brand-accent-hover active:bg-brand-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-focus focus-visible:outline-offset-2 select-none whitespace-nowrap',
                busy ? 'cursor-not-allowed opacity-60' : '',
              ].join(' ')}
            >
              {t('quickReview.finalize')}
            </Link>
          ) : null}
          {canOpenOutput ? (
            <Link
              href={`/app/output/${assessment.id}`}
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white"
            >
              {t('quickReview.openOutput')}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="toolbar" aria-label={t('quickReview.filterAria')}>
        {(
          [
            ['all', t('quickReview.filterAll')],
            ['unreviewed', t('quickReview.filterUnreviewed')],
            ['warnings', t('quickReview.filterWarnings')],
            ['accepted', t('quickReview.filterAccepted')],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => changeFilter(key)}
            className={`inline-flex min-h-[var(--control-md)] items-center rounded-md border px-3 text-body-sm ${
              filter === key
                ? 'border-brand-accent bg-brand-accent-soft text-brand-accent'
                : 'border-brand-line text-brand-ink hover:bg-brand-paper'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {statusNote ? (
        <p className="text-body-sm text-brand-ink-muted" role="status" aria-live="polite">
          {statusNote}
        </p>
      ) : null}
      {conflictMessage ? (
        <div
          data-testid="state-conflict-alert"
          role="alert"
          className="flex flex-wrap items-center gap-2 rounded-md border border-brand-warning/30 bg-brand-warning-soft px-3 py-2"
        >
          <span className="text-body-sm text-brand-ink">{conflictMessage}</span>
          <Button size="sm" variant="secondary" onClick={() => void load()}>
            {t('quickReview.reload')}
          </Button>
        </div>
      ) : null}

      {mode === 'quick' ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 text-body-sm text-brand-ink">
              <input
                type="checkbox"
                aria-label={t('quickReview.selectAllViewAria')}
                checked={allVisibleSelected}
                disabled={
                  visibleActionableQuestions.length === 0 ||
                  busy ||
                  assessment.lifecycle === 'final'
                }
                onChange={toggleSelectVisible}
                className="h-4 w-4"
              />
              {t('quickReview.selectAllView')}
            </label>
            <Button
              variant="secondary"
              disabled={
                !assessment.questions.some(canAccept) || busy || assessment.lifecycle === 'final'
              }
              onClick={selectAllUnreviewed}
            >
              {t('quickReview.selectAllUnreviewed')}
            </Button>
            <p className="text-body-sm text-brand-ink-muted">{t('quickReview.finalizeNote')}</p>
          </div>

          <ul className="flex flex-col gap-2" role="list">
            {questions.map((question) => (
              <li key={question.id}>
                <Panel
                  title={t('quickReview.question', { number: question.number })}
                  description={`${reviewStateLabel(question.reviewState, t)} · ${question.topic} · ${question.difficulty} · ${question.sourceLabel}`}
                  actions={
                    canAccept(question) ? (
                      <input
                        type="checkbox"
                        aria-label={t('quickReview.selectQuestion', { number: question.number })}
                        checked={selected.has(question.id)}
                        disabled={busy || assessment.lifecycle === 'final'}
                        onChange={() => toggleSelect(question.id)}
                        className="h-4 w-4"
                      />
                    ) : (
                      <span className="text-label-semibold text-brand-ink-muted">
                        {reviewStateLabel(question.reviewState, t)}
                      </span>
                    )
                  }
                >
                  <div className="flex flex-col gap-2">
                    <p className="text-body-sm text-brand-ink">{question.stem}</p>
                    <QuestionImageDisplay
                      image={question.image}
                      fallbackAlt={t('quickReview.supportingImage', { number: question.number })}
                      className="my-2"
                    />
                    {question.questionType === 'short_answer' ? (
                      <p className="text-body-sm text-brand-ink-muted">
                        {t('quickReview.shortAnswer')}
                      </p>
                    ) : question.questionType === 'essay' ? (
                      <p className="text-body-sm text-brand-ink-muted">
                        {question.rubric && question.rubric.length > 0
                          ? t('quickReview.essayWithRubric', { count: question.rubric.length })
                          : t('quickReview.essay')}
                      </p>
                    ) : (
                      <>
                        <ul className="grid gap-1 sm:grid-cols-2">
                          {question.options.map((option) => (
                            <li
                              key={option.id}
                              className={`rounded-md border px-3 py-2 text-body-sm ${
                                option.id === question.answerKey
                                  ? 'border-brand-accent bg-brand-accent-soft'
                                  : 'border-brand-line'
                              }`}
                            >
                              <span className="font-semibold">{option.label}.</span> {option.text}
                            </li>
                          ))}
                        </ul>
                        <p className="text-body-sm text-brand-ink-muted">
                          {t('quickReview.answerKey', {
                            key: question.answerKey.toUpperCase(),
                            source: question.sourceLabel,
                          })}
                        </p>
                      </>
                    )}
                    {question.warnings.length > 0 ? (
                      <div className="rounded-md border border-brand-warning/30 bg-brand-warning-soft px-3 py-2">
                        {question.warnings.map((warning) => (
                          <p key={warning.code} className="text-body-sm text-brand-ink">
                            {t(`warnings.${warning.code}`)}
                          </p>
                        ))}
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      {canAccept(question) && assessment.lifecycle !== 'final' ? (
                        <Button
                          size="sm"
                          disabled={busy}
                          onClick={() => void setState(question.id, 'accepted')}
                        >
                          {t('quickReview.accept')}
                        </Button>
                      ) : null}
                      {canAccept(question) && assessment.lifecycle !== 'final' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busy}
                          onClick={() => void setState(question.id, 'needs_attention')}
                        >
                          {t('quickReview.markAttention')}
                        </Button>
                      ) : null}
                      {['accepted', 'edited'].includes(question.reviewState) &&
                      assessment.lifecycle !== 'final' ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busy}
                          onClick={() => void setState(question.id, 'needs_attention')}
                        >
                          {t('quickReview.changeDecision')}
                        </Button>
                      ) : null}
                      <Link
                        href={`/app/review/${assessment.id}?mode=detail&q=${question.number}`}
                        className="inline-flex min-h-[var(--control-sm)] items-center rounded-md border border-brand-line px-3 text-body-sm"
                      >
                        {t('quickReview.openDetail')}
                      </Link>
                    </div>
                  </div>
                </Panel>
              </li>
            ))}
          </ul>

          {selected.size > 0 ? (
            <section
              aria-label={t('quickReview.selectedAria')}
              className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded-t-md border border-brand-line bg-brand-surface px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-lg"
            >
              <span className="flex-1 text-body-sm font-medium text-brand-ink">
                {t('quickReview.selectedCount', { count: selected.size })}
              </span>
              <Button
                disabled={busy || assessment.lifecycle === 'final'}
                onClick={() => void onBulkAccept()}
              >
                {t('quickReview.acceptCount', { count: selected.size })}
              </Button>
              <Button variant="secondary" onClick={() => setSelected(new Set())}>
                {t('quickReview.cancel')}
              </Button>
            </section>
          ) : null}
        </>
      ) : (
        <Panel
          title={
            current
              ? t('quickReview.questionOf', {
                  current: current.number,
                  total: questions.length || assessment.questionCount,
                })
              : t('quickReview.noQuestions')
          }
          description={
            current
              ? `${reviewStateLabel(current.reviewState, t)} · ${current.topic}`
              : t('quickReview.changeFilterHint')
          }
        >
          {current ? (
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-label-semibold">{t('quickReview.stem')}</span>
                <textarea
                  className="min-h-24 rounded-md border border-brand-line px-3 py-2"
                  value={editStem}
                  disabled={assessment.lifecycle === 'final' || busy}
                  onChange={(e) => setEditStem(e.target.value)}
                />
              </label>
              <QuestionImageDisplay
                image={current.image}
                fallbackAlt={t('quickReview.supportingImage', { number: current.number })}
              />
              {current.questionType === 'short_answer' ||
              current.questionType === 'essay' ? null : (
                <fieldset
                  role="group"
                  aria-label={t('quickReview.optionsList')}
                  className="flex flex-col gap-2 rounded-md border border-brand-line p-3"
                >
                  <legend className="text-label-semibold">{t('quickReview.optionsList')}</legend>
                  <ul className="flex flex-col gap-2" role="list">
                    {visibleEditOptions.map((option, index) => (
                      <li
                        key={option.id}
                        data-option-id={option.id}
                        className="flex flex-col gap-2 rounded-md border border-brand-line px-3 py-2 sm:flex-row sm:items-center"
                      >
                        <label className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="text-label-semibold">{option.label}.</span>
                          <input
                            type="text"
                            className="min-w-0 flex-1 rounded-md border border-brand-line px-3 py-2"
                            value={option.text}
                            disabled={assessment.lifecycle === 'final' || busy}
                            onChange={(e) =>
                              setEditOptions((opts) =>
                                (opts.length > 0 ? opts : visibleEditOptions).map((item) =>
                                  item.id === option.id ? { ...item, text: e.target.value } : item,
                                ),
                              )
                            }
                          />
                        </label>
                        <label className="inline-flex items-center gap-2 text-body-sm">
                          <input
                            type="radio"
                            name={`answer-${current.id}`}
                            aria-label={t('quickReview.answerKeyLabel', { label: option.label })}
                            checked={(editOptionsAnswerKey || current.answerKey) === option.id}
                            disabled={assessment.lifecycle === 'final' || busy}
                            onChange={() => setEditOptionsAnswerKey(option.id)}
                          />
                          {t('quickReview.key')}
                        </label>
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            aria-label={t('quickReview.moveUp')}
                            disabled={index === 0 || assessment.lifecycle === 'final' || busy}
                            onClick={() =>
                              setEditOptions((opts) => {
                                const next = [...(opts.length > 0 ? opts : visibleEditOptions)];
                                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                                return next;
                              })
                            }
                            className="rounded-md border border-brand-line px-2 py-1 text-body-sm disabled:opacity-60"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            aria-label={t('quickReview.moveDown')}
                            disabled={
                              index === visibleEditOptions.length - 1 ||
                              assessment.lifecycle === 'final' ||
                              busy
                            }
                            onClick={() =>
                              setEditOptions((opts) => {
                                const next = [...(opts.length > 0 ? opts : visibleEditOptions)];
                                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                                return next;
                              })
                            }
                            className="rounded-md border border-brand-line px-2 py-1 text-body-sm disabled:opacity-60"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            aria-label={t('quickReview.deleteOption')}
                            disabled={
                              visibleEditOptions.length <= 2 ||
                              assessment.lifecycle === 'final' ||
                              busy
                            }
                            onClick={() =>
                              setEditOptions((opts) => {
                                const base = opts.length > 0 ? opts : visibleEditOptions;
                                const next = base.filter((item) => item.id !== option.id);
                                if ((editOptionsAnswerKey || current.answerKey) === option.id) {
                                  setEditOptionsAnswerKey(next[0]?.id ?? '');
                                }
                                return next;
                              })
                            }
                            className="rounded-md border border-brand-line px-2 py-1 text-body-sm disabled:opacity-60"
                          >
                            {t('quickReview.delete')}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    aria-label={t('quickReview.addOption')}
                    disabled={
                      visibleEditOptions.length >= 6 || assessment.lifecycle === 'final' || busy
                    }
                    onClick={() => {
                      const label = String.fromCharCode(65 + visibleEditOptions.length);
                      optionCounterRef.current += 1;
                      setEditOptions((opts) => [
                        ...(opts.length > 0 ? opts : visibleEditOptions),
                        { id: `${current.id}-option-${optionCounterRef.current}`, label, text: '' },
                      ]);
                    }}
                    className="self-start rounded-md border border-brand-line px-3 py-2 text-body-sm disabled:opacity-60"
                  >
                    {t('quickReview.addOption')}
                  </button>
                </fieldset>
              )}
              <label className="flex flex-col gap-1">
                <span className="text-label-semibold">{t('quickReview.explanation')}</span>
                <textarea
                  className="min-h-20 rounded-md border border-brand-line px-3 py-2"
                  value={editExplanation}
                  disabled={assessment.lifecycle === 'final' || busy}
                  onChange={(e) => setEditExplanation(e.target.value)}
                />
              </label>
              {(current.questionType === 'short_answer' || current.questionType === 'essay') &&
              assessment.lifecycle !== 'final' ? (
                <label className="flex flex-col gap-1">
                  <span className="text-label-semibold">{t('quickReview.answerGuide')}</span>
                  <textarea
                    className="min-h-20 rounded-md border border-brand-line px-3 py-2"
                    value={editAnswerKey}
                    disabled={busy}
                    onChange={(e) => setEditAnswerKey(e.target.value)}
                  />
                </label>
              ) : null}
              {current.questionType === 'essay' && assessment.lifecycle !== 'final' ? (
                <fieldset
                  role="group"
                  aria-label={t('quickReview.rubricAria')}
                  className="flex flex-col gap-2 rounded-md border border-brand-line p-3"
                >
                  <legend className="text-label-semibold">{t('quickReview.rubric')}</legend>
                  <ul className="flex flex-col gap-2" role="list">
                    {editRubric.map((criterion, index) => (
                      <li
                        key={criterion.id}
                        className="flex flex-wrap items-center gap-2 rounded-md border border-brand-line px-3 py-2"
                      >
                        <label className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="sr-only">
                            {t('quickReview.criterionDesc', { index: index + 1 })}
                          </span>
                          <input
                            type="text"
                            aria-label={t('quickReview.criterionDesc', { index: index + 1 })}
                            className="min-w-0 flex-1 rounded-md border border-brand-line px-3 py-2"
                            value={criterion.description}
                            disabled={busy}
                            onChange={(e) =>
                              setEditRubric((rows) =>
                                rows.map((r) =>
                                  r.id === criterion.id ? { ...r, description: e.target.value } : r,
                                ),
                              )
                            }
                          />
                        </label>
                        <label className="flex items-center gap-1">
                          <span className="sr-only">
                            {t('quickReview.criterionMaxScore', { index: index + 1 })}
                          </span>
                          <input
                            type="number"
                            aria-label={t('quickReview.criterionMaxScore', { index: index + 1 })}
                            className="w-20 rounded-md border border-brand-line px-3 py-2"
                            value={criterion.maxScore}
                            min={0}
                            disabled={busy}
                            onChange={(e) =>
                              setEditRubric((rows) =>
                                rows.map((r) =>
                                  r.id === criterion.id
                                    ? { ...r, maxScore: Number(e.target.value) }
                                    : r,
                                ),
                              )
                            }
                          />
                        </label>
                        <button
                          type="button"
                          aria-label={t('quickReview.deleteCriterion')}
                          disabled={busy}
                          className="rounded-md border border-brand-line px-2 py-1 text-body-sm"
                          onClick={() =>
                            setEditRubric((rows) => rows.filter((r) => r.id !== criterion.id))
                          }
                        >
                          {t('quickReview.delete')}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    aria-label={t('quickReview.addCriterion')}
                    disabled={busy}
                    className="self-start rounded-md border border-brand-line px-3 py-1 text-body-sm"
                    onClick={() => {
                      rubricCounterRef.current += 1;
                      setEditRubric((rows) => [
                        ...rows,
                        {
                          id: `rubric-new-${rubricCounterRef.current}`,
                          description: '',
                          maxScore: 0,
                        },
                      ]);
                    }}
                  >
                    {t('quickReview.addCriterion')}
                  </button>
                </fieldset>
              ) : null}
              <p className="text-body-sm text-brand-ink-muted">
                {t('quickReview.detailMeta', {
                  key: current.answerKey.toUpperCase(),
                  source: current.sourceLabel,
                  difficulty: current.difficulty,
                })}
              </p>
              {current.warnings.length > 0 ? (
                <div className="rounded-md border border-brand-warning/30 bg-brand-warning-soft px-3 py-2">
                  {current.warnings.map((warning) => (
                    <p key={warning.code} className="text-body-sm">
                      {t(`warnings.${warning.code}`)}
                    </p>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy || assessment.lifecycle === 'final'}
                  onClick={() => void onSaveEdit(current.id)}
                >
                  {t('quickReview.saveEdit')}
                </Button>
                <Button
                  variant="secondary"
                  disabled={busy || assessment.lifecycle === 'final'}
                  onClick={() => void setState(current.id, 'accepted')}
                >
                  {t('quickReview.accept')}
                </Button>
                <Button
                  variant="secondary"
                  disabled={detailIndex <= 0}
                  onClick={() => setDetailIndex((i) => Math.max(0, i - 1))}
                >
                  {t('quickReview.previous')}
                </Button>
                <Button
                  variant="secondary"
                  disabled={detailIndex >= questions.length - 1}
                  onClick={() => setDetailIndex((i) => Math.min(questions.length - 1, i + 1))}
                >
                  {t('quickReview.next')}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-body-default text-brand-ink-muted">
              {t('quickReview.noQuestionsFilter')}
            </p>
          )}
        </Panel>
      )}
    </div>
  );
}
