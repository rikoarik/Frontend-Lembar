'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button, Panel, StatusBadge } from '@/app/components/ui';
import type { StatusLabel } from '@/app/components/ui';
import type { Translate } from '@/src/i18n/types';
import { assessmentService } from '@/src/services/assessments/assessmentService';
import type { AssessmentLifecycle, AssessmentSummary } from '@/src/features/review/types';

const DEFAULT_REFRESH_MS = 10_000;

function titleCase(value: string): string {
  return value.replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());
}

export function humanizeAssessmentLabel(value: string, t: Translate): string {
  return value
    .split(/\s*·\s*/)
    .map((part) => {
      const normalized = part.trim().toLowerCase();
      if (normalized === 'practice') return t('history.humanize.practice');
      const grade = normalized.match(/^official-grade-(sd-mi|smp-mts|sma-ma|smk|slb)-(\d+)$/);
      if (grade)
        return t('history.humanize.gradePattern', {
          level: grade[2],
          band: grade[1].toUpperCase().replace('-', '/'),
        });
      const legacyGrade = normalized.match(/^official-grade-(\d+)-(sd-mi|smp-mts|sma-ma|smk|slb)$/);
      if (legacyGrade)
        return t('history.humanize.gradePattern', {
          level: legacyGrade[1],
          band: legacyGrade[2].toUpperCase().replace('-', '/'),
        });
      const subject = normalized.match(
        /^official-subject-(?:sd-mi|smp-mts|sma-ma|smk|slb|paud)-(?:[a-f]|fondasi)-(.*)$/,
      );
      if (subject?.[1]) return titleCase(subject[1].replaceAll('-', ' '));
      if (normalized.startsWith('official-subject-')) return t('history.humanize.subject');
      if (normalized.startsWith('official-grade-')) return t('history.humanize.grade');
      return part;
    })
    .join(' · ');
}

function badge(lifecycle: AssessmentLifecycle, t: Translate): StatusLabel {
  switch (lifecycle) {
    case 'final':
      return t('history.badge.final') as StatusLabel;
    case 'generating':
      return t('history.badge.generating') as StatusLabel;
    case 'review':
      return t('history.badge.review') as StatusLabel;
    case 'failed':
      return t('history.badge.failed') as StatusLabel;
    case 'archived':
      return t('history.badge.archived') as StatusLabel;
    case 'draft':
    default:
      return t('history.badge.draft') as StatusLabel;
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(
        date,
      );
}

function lifecycleCopy(item: AssessmentSummary, t: Translate): string {
  switch (item.lifecycle) {
    case 'review':
      return item.questionCount > 0
        ? t('history.lifecycleCopy.reviewCounted', {
            reviewed: item.reviewedCount,
            total: item.questionCount,
          })
        : t('history.lifecycleCopy.reviewReady');
    case 'final':
      return t('history.lifecycleCopy.final');
    case 'archived':
      return t('history.lifecycleCopy.archived');
    case 'generating':
      return t('history.lifecycleCopy.generating');
    case 'failed':
      return t('history.lifecycleCopy.failed');
    case 'draft':
    default:
      return item.questionCount > 0
        ? t('history.lifecycleCopy.draftCount', { count: item.questionCount })
        : t('history.lifecycleCopy.draft');
  }
}

export function HistoryView({
  refreshIntervalMs = DEFAULT_REFRESH_MS,
}: {
  refreshIntervalMs?: number;
}) {
  const t = useTranslations('review');
  const [items, setItems] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [lifecycle, setLifecycle] = useState<AssessmentLifecycle | 'all'>('all');
  const loaded = useRef(false);
  const requestSeq = useRef(0);

  const load = useCallback(async () => {
    if (!loaded.current) setLoading(true);
    const seq = ++requestSeq.current;
    const result = await assessmentService.list({ q, lifecycle });
    if (seq !== requestSeq.current) return;
    loaded.current = true;
    setLoading(false);
    if (!result.ok) {
      setError(result.error.safeMessage);
      return;
    }
    setItems(result.value);
    setError(null);
  }, [q, lifecycle]);

  useEffect(() => {
    loaded.current = false;
    void Promise.resolve().then(load);
  }, [load]);

  useEffect(() => {
    if (!items.some((item) => item.lifecycle === 'generating')) return;
    const id = window.setInterval(() => void load(), refreshIntervalMs);
    return () => window.clearInterval(id);
  }, [items, load, refreshIntervalMs]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">{t('history.title')}</h1>
        <p className="text-body-sm text-brand-ink-muted">{t('history.subtitle')}</p>
      </div>

      <Panel title={t('history.filterPanel')} description={t('history.filterDesc')}>
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-label-semibold">{t('history.search')}</span>
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder={t('history.searchPlaceholder')}
              className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3"
            />
          </label>
          <label className="flex w-full flex-col gap-1 md:w-56">
            <span className="text-label-semibold">{t('history.statusLabel')}</span>
            <select
              value={lifecycle}
              onChange={(event) => setLifecycle(event.target.value as AssessmentLifecycle | 'all')}
              className="min-h-[var(--control-md)] rounded-md border border-brand-line px-3"
            >
              <option value="all">{t('history.all')}</option>
              <option value="draft">{t('lifecycle.draft')}</option>
              <option value="review">{t('lifecycle.review')}</option>
              <option value="final">{t('lifecycle.final')}</option>
              <option value="generating">{t('lifecycle.generating')}</option>
            </select>
          </label>
        </div>
      </Panel>

      {loading ? (
        <div className="h-40 animate-pulse rounded-md bg-brand-line" aria-busy="true" />
      ) : error && items.length === 0 ? (
        <Panel title={t('history.loadFailed')} description={error}>
          <Button onClick={() => void load()}>{t('history.retry')}</Button>
        </Panel>
      ) : items.length === 0 ? (
        <Panel title={t('history.emptyTitle')} description={t('history.emptyDesc')}>
          <Link
            href="/app/generate"
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-white"
          >
            {t('history.generateWorksheet')}
          </Link>
        </Panel>
      ) : (
        <ul className="flex flex-col gap-3" role="list">
          {items.map((item) => (
            <li key={item.id}>
              <Panel
                title={humanizeAssessmentLabel(item.title, t)}
                description={`${humanizeAssessmentLabel(item.subject, t)} · ${humanizeAssessmentLabel(item.gradeLabel, t)} · ${t('history.updated', { date: formatDate(item.updatedAt) })}`}
                actions={<StatusBadge label={badge(item.lifecycle, t)} />}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-body-sm text-brand-ink-muted">
                    {item.lifecycle === 'generating' ? (
                      <>
                        <span className="font-medium text-brand-ink">
                          {t('history.generating')}
                        </span>
                        {` · ${t('history.generatingNote')}`}
                      </>
                    ) : (
                      lifecycleCopy(item, t)
                    )}
                    {item.warningCount > 0
                      ? ` · ${t('history.warningCount', { count: item.warningCount })}`
                      : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.lifecycle === 'review' && item.canReview ? (
                      <Link
                        href={`/app/review/${item.id}`}
                        className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-sm font-medium text-white"
                      >
                        {t('history.reviewQuestions')}
                      </Link>
                    ) : null}
                    {item.lifecycle === 'generating' ? (
                      <p className="text-body-sm text-brand-ink-muted animate-pulse">
                        {t('history.generatingLeave')}
                      </p>
                    ) : null}
                    {item.lifecycle === 'final' && item.canOpenOutput ? (
                      <Link
                        href={`/app/output/${item.id}`}
                        className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-sm font-medium text-white"
                      >
                        {t('history.openResults')}
                      </Link>
                    ) : null}
                    {item.lifecycle === 'draft' ? (
                      <Link
                        href={`/app/review/${item.id}`}
                        className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-sm"
                      >
                        {t('history.continueDraft')}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
