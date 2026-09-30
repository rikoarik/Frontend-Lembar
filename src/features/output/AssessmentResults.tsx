'use client';
import Link from 'next/link';
import { Component, useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { Translate } from '@/src/i18n/types';
import { useLocaleFormat } from '@/src/i18n/useLocaleFormat';

// ponytail: no reset — add reset prop + this.setState when retry UX needed
class ErrorBoundary extends Component<
  { children: ReactNode; message: string },
  { caught: boolean }
> {
  state = { caught: false };
  static getDerivedStateFromError() {
    return { caught: true };
  }
  render() {
    if (this.state.caught) {
      return (
        <div
          role="alert"
          className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-4 py-3 text-body-sm text-brand-danger"
        >
          {this.props.message}
        </div>
      );
    }
    return this.props.children;
  }
}

type Row = {
  id: string;
  guestName: string;
  guestClass?: string;
  status: string;
  rawScore: number | null;
  maxScore: number;
  needsGrading: boolean;
  submittedAt?: string;
};

function statusLabel(s: string, t: Translate): string {
  if (s === 'submitted') return t('results.statusSubmitted');
  if (s === 'in_progress') return t('results.statusInProgress');
  return s;
}

export default function AssessmentResults({ assessmentId }: { assessmentId: string }) {
  const t = useTranslations('output');
  const { dateTime } = useLocaleFormat();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/v1/assessments/${encodeURIComponent(assessmentId)}/results`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error?.message ?? t('results.loadFailed'));
        setRows(j.data ?? []);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [assessmentId, t]);

  const submitted = rows.filter((r) => r.status === 'submitted').length;

  const columns = [
    t('results.colName'),
    t('results.colClass'),
    t('results.colStatus'),
    t('results.colScore'),
    t('results.colGrading'),
    t('results.colSubmitted'),
  ];

  return (
    <ErrorBoundary message={t('errorBoundary')}>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Link
              href={`/app/output/${encodeURIComponent(assessmentId)}`}
              className="flex w-fit items-center gap-1 text-label-sm text-brand-ink-muted hover:text-brand-ink"
            >
              {t('results.back')}
            </Link>
            <h1 className="text-h1 font-semibold text-brand-ink">{t('results.title')}</h1>
            <p className="text-body-sm text-brand-ink-muted">
              {loading
                ? t('loading')
                : t('results.submittedCount', { submitted, total: rows.length })}
            </p>
          </div>
          <a
            className="flex items-center gap-2 rounded-lg border border-brand-line bg-white px-4 py-2 text-body-sm text-brand-ink transition-colors hover:bg-brand-paper"
            href={`/v1/assessments/${encodeURIComponent(assessmentId)}/results.csv`}
            download
          >
            {t('results.downloadCsv')}
          </a>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-4 py-3 text-body-sm text-brand-danger"
          >
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !error && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-brand-line/40" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && rows.length === 0 && (
          <div className="rounded-xl border border-brand-line bg-white py-12 text-center text-body-sm text-brand-ink-muted">
            {t('results.empty')}
          </div>
        )}

        {/* Table */}
        {!loading && rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-brand-line bg-white">
            <table className="w-full text-left text-body-sm">
              <caption className="sr-only">{t('results.caption')}</caption>
              <thead className="border-b border-brand-line bg-brand-paper">
                <tr>
                  {columns.map((x) => (
                    <th key={x} scope="col" className="px-4 py-3 font-medium text-brand-ink-muted">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`border-t border-brand-line ${i % 2 === 1 ? 'bg-brand-paper/40' : ''}`}
                  >
                    <th scope="row" className="px-4 py-3 font-medium text-brand-ink">
                      {r.guestName}
                    </th>
                    <td className="px-4 py-3 text-brand-ink-muted">{r.guestClass || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-label-xs font-medium ${
                          r.status === 'submitted'
                            ? 'bg-brand-success/10 text-brand-success'
                            : 'bg-brand-warning/10 text-brand-warning'
                        }`}
                      >
                        {statusLabel(r.status, t)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {r.rawScore ?? '—'} / {r.maxScore}
                    </td>
                    <td className="px-4 py-3 text-brand-ink-muted">
                      {r.needsGrading ? t('results.needsGrading') : t('results.done')}
                    </td>
                    <td className="px-4 py-3 text-brand-ink-muted">
                      {r.submittedAt ? dateTime(r.submittedAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
