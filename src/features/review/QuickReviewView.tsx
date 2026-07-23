'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Panel, StatusBadge } from '@/app/components/ui';
import type { StatusLabel } from '@/app/components/ui';
import { assessmentService } from '@/src/services/assessments/assessmentService';
import type { AssessmentDetail, QuestionReviewState, ReviewQuestion } from '@/src/features/review/types';
import { reviewStateLabel } from '@/src/features/review/types';

type FilterKey = 'all' | 'unreviewed' | 'warnings' | 'accepted';

function badgeForLifecycle(lifecycle: AssessmentDetail['lifecycle']): StatusLabel {
  switch (lifecycle) {
    case 'final':
      return 'Final';
    case 'generating':
      return 'Diproses';
    case 'review':
      return 'Perlu ditinjau';
    case 'archived':
      return 'Kedaluwarsa';
    default:
      return 'Draft';
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

export function QuickReviewView({
  assessmentId,
  mode = 'quick',
}: {
  assessmentId: string;
  mode?: 'quick' | 'detail';
}) {
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [detailIndex, setDetailIndex] = useState(0);
  const [editStem, setEditStem] = useState('');
  const [editExplanation, setEditExplanation] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await assessmentService.get(assessmentId);
    if (!result.ok) {
      setError(result.error.safeMessage);
      setAssessment(null);
      setLoading(false);
      return;
    }
    setAssessment(result.value);
    setLoading(false);
  }, [assessmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const questions = useMemo(() => {
    if (!assessment) return [];
    return assessment.questions.filter((q) => matchesFilter(q, filter));
  }, [assessment, filter]);

  useEffect(() => {
    if (mode !== 'detail') return;
    if (detailIndex >= questions.length) setDetailIndex(0);
    const current = questions[detailIndex];
    if (current) {
      setEditStem(current.stem);
      setEditExplanation(current.explanation);
    }
  }, [mode, questions, detailIndex]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setState = async (questionId: string, reviewState: QuestionReviewState) => {
    setBusy(true);
    const result = await assessmentService.updateQuestionState(assessmentId, questionId, reviewState);
    setBusy(false);
    if (!result.ok) {
      setStatusNote(result.error.safeMessage);
      return;
    }
    setAssessment(result.value);
    setStatusNote('Status soal diperbarui.');
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
    setStatusNote(`${selected.size} soal ditandai diterima.`);
  };

  const onSaveEdit = async (questionId: string) => {
    setBusy(true);
    const result = await assessmentService.updateQuestionContent(assessmentId, questionId, {
      stem: editStem,
      explanation: editExplanation,
    });
    setBusy(false);
    if (!result.ok) {
      setStatusNote(result.error.safeMessage);
      return;
    }
    setAssessment(result.value);
    setStatusNote('Perubahan soal disimpan.');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Memuat tinjauan">
        <div className="h-10 w-64 animate-pulse rounded bg-brand-line" />
        <div className="h-40 animate-pulse rounded bg-brand-line" />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <Panel title="Tinjauan belum bisa dimuat" description={error ?? 'Lembar tidak ditemukan.'}>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void load()}>Coba lagi</Button>
          <Link href="/app/riwayat" className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4">
            Buka riwayat
          </Link>
        </div>
      </Panel>
    );
  }

  const current = questions[detailIndex];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-h1 font-semibold text-brand-ink">{assessment.title}</h1>
            <StatusBadge label={badgeForLifecycle(assessment.lifecycle)} />
          </div>
          <p className="text-body-sm text-brand-ink-muted">
            {assessment.subject} · {assessment.gradeLabel} · {assessment.reviewedCount}/
            {assessment.questionCount} ditinjau · {assessment.warningCount} peringatan
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/app/review/${assessment.id}?mode=quick`}
            className={`inline-flex min-h-[var(--control-md)] items-center rounded-md border px-3 text-body-sm ${mode === 'quick' ? 'border-brand-accent bg-brand-accent-soft text-brand-accent' : 'border-brand-line text-brand-ink'}`}
          >
            Mode cepat
          </Link>
          <Link
            href={`/app/review/${assessment.id}?mode=detail`}
            className={`inline-flex min-h-[var(--control-md)] items-center rounded-md border px-3 text-body-sm ${mode === 'detail' ? 'border-brand-accent bg-brand-accent-soft text-brand-accent' : 'border-brand-line text-brand-ink'}`}
          >
            Mode detail
          </Link>
          <Link
            href={`/app/review/${assessment.id}/finalize`}
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white"
          >
            Finalisasi
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Filter soal">
        {(
          [
            ['all', 'Semua'],
            ['unreviewed', 'Belum ditinjau'],
            ['warnings', 'Ada peringatan'],
            ['accepted', 'Sudah ditinjau'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
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

      {mode === 'quick' ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              disabled={selected.size === 0 || busy || assessment.lifecycle === 'final'}
              onClick={() => void onBulkAccept()}
            >
              Terima terpilih ({selected.size})
            </Button>
            <p className="text-body-sm text-brand-ink-muted">
              Finalisasi tetap butuh konfirmasi terpisah.
            </p>
          </div>

          <ul className="flex flex-col gap-3" role="list">
            {questions.map((question) => (
              <li key={question.id}>
                <Panel
                  title={`Soal ${question.number}`}
                  description={`${reviewStateLabel(question.reviewState)} · ${question.topic}`}
                  actions={
                    <input
                      type="checkbox"
                      aria-label={`Pilih soal ${question.number}`}
                      checked={selected.has(question.id)}
                      disabled={assessment.lifecycle === 'final'}
                      onChange={() => toggleSelect(question.id)}
                      className="h-4 w-4"
                    />
                  }
                >
                  <div className="flex flex-col gap-3">
                    <p className="text-body-default text-brand-ink">{question.stem}</p>
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
                      Kunci: {question.answerKey.toUpperCase()} · Sumber: {question.sourceLabel}
                    </p>
                    {question.warnings.length > 0 ? (
                      <div className="rounded-md border border-brand-warning/30 bg-brand-warning-soft px-3 py-2">
                        {question.warnings.map((warning) => (
                          <p key={warning.code} className="text-body-sm text-brand-ink">
                            {warning.message}
                          </p>
                        ))}
                      </div>
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={busy || assessment.lifecycle === 'final'}
                        onClick={() => void setState(question.id, 'accepted')}
                      >
                        Terima
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy || assessment.lifecycle === 'final'}
                        onClick={() => void setState(question.id, 'needs_attention')}
                      >
                        Tandai perhatian
                      </Button>
                      <Link
                        href={`/app/review/${assessment.id}?mode=detail&q=${question.number}`}
                        className="inline-flex min-h-[var(--control-sm)] items-center rounded-md border border-brand-line px-3 text-body-sm"
                      >
                        Buka detail
                      </Link>
                    </div>
                  </div>
                </Panel>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <Panel
          title={current ? `Soal ${current.number} dari ${questions.length || assessment.questionCount}` : 'Tidak ada soal'}
          description={current ? `${reviewStateLabel(current.reviewState)} · ${current.topic}` : 'Ubah filter untuk melihat soal.'}
        >
          {current ? (
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-label-semibold">Stem soal</span>
                <textarea
                  className="min-h-24 rounded-md border border-brand-line px-3 py-2"
                  value={editStem}
                  disabled={assessment.lifecycle === 'final' || busy}
                  onChange={(e) => setEditStem(e.target.value)}
                />
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {current.options.map((option) => (
                  <div
                    key={option.id}
                    className={`rounded-md border px-3 py-2 text-body-sm ${
                      option.id === current.answerKey
                        ? 'border-brand-accent bg-brand-accent-soft'
                        : 'border-brand-line'
                    }`}
                  >
                    <span className="font-semibold">{option.label}.</span> {option.text}
                  </div>
                ))}
              </div>
              <label className="flex flex-col gap-1">
                <span className="text-label-semibold">Pembahasan</span>
                <textarea
                  className="min-h-20 rounded-md border border-brand-line px-3 py-2"
                  value={editExplanation}
                  disabled={assessment.lifecycle === 'final' || busy}
                  onChange={(e) => setEditExplanation(e.target.value)}
                />
              </label>
              <p className="text-body-sm text-brand-ink-muted">
                Kunci: {current.answerKey.toUpperCase()} · Sumber: {current.sourceLabel} · Kesulitan:{' '}
                {current.difficulty}
              </p>
              {current.warnings.length > 0 ? (
                <div className="rounded-md border border-brand-warning/30 bg-brand-warning-soft px-3 py-2">
                  {current.warnings.map((warning) => (
                    <p key={warning.code} className="text-body-sm">
                      {warning.message}
                    </p>
                  ))}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={busy || assessment.lifecycle === 'final'}
                  onClick={() => void onSaveEdit(current.id)}
                >
                  Simpan edit
                </Button>
                <Button
                  variant="secondary"
                  disabled={busy || assessment.lifecycle === 'final'}
                  onClick={() => void setState(current.id, 'accepted')}
                >
                  Terima
                </Button>
                <Button
                  variant="secondary"
                  disabled={detailIndex <= 0}
                  onClick={() => setDetailIndex((i) => Math.max(0, i - 1))}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="secondary"
                  disabled={detailIndex >= questions.length - 1}
                  onClick={() => setDetailIndex((i) => Math.min(questions.length - 1, i + 1))}
                >
                  Berikutnya
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-body-default text-brand-ink-muted">Tidak ada soal pada filter ini.</p>
          )}
        </Panel>
      )}
    </div>
  );
}
