'use client';

import { Component, type ReactNode } from 'react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button, Panel, StatusBadge } from '@/app/components/ui';
import { assessmentService } from '@/src/services/assessments/assessmentService';
import { ShareManager } from '@/src/features/share/ShareManager';
import type { OutputPackage, AssessmentDetail } from '@/src/features/review/types';

// ponytail: no reset button — add reset prop + this.setState when retry UX is needed
class ErrorBoundary extends Component<{ children: ReactNode }, { caught: boolean }> {
  state = { caught: false };
  static getDerivedStateFromError() { return { caught: true }; }
  render() {
    if (this.state.caught) {
      return (
        <div role="alert" className="rounded-lg border border-brand-danger/30 bg-brand-danger/5 px-4 py-3 text-body-sm text-brand-danger">
          Terjadi kesalahan tak terduga. Muat ulang halaman untuk mencoba lagi.
        </div>
      );
    }
    return this.props.children;
  }
}

export function OutputCenterView({ assessmentId }: { assessmentId: string }) {
  const [output, setOutput] = useState<OutputPackage | null>(null);
  const [detail, setDetail] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [outResult, detailResult] = await Promise.all([
      assessmentService.getOutput(assessmentId),
      assessmentService.get(assessmentId),
    ]);
    if (!outResult.ok) {
      setError(outResult.error.safeMessage);
      setErrorStatus(outResult.error.httpStatus ?? null);
      setOutput(null);
      setLoading(false);
      return;
    }
    setOutput(outResult.value);
    if (detailResult.ok) setDetail(detailResult.value);
    setError(null);
    setErrorStatus(null);
    setLoading(false);
  }, [assessmentId]);

  useEffect(() => { void load(); }, [load]);

  if (loading) {
    return <div className="h-48 animate-pulse rounded-md bg-brand-line" aria-busy="true" />;
  }

  if (error || !output) {
    return (
      <Panel
        title="Hasil belum tersedia"
        description={error ?? 'Finalisasi lembar dulu untuk membuka hasil.'}
      >
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void load()}>Coba lagi</Button>
          {errorStatus !== 401 && errorStatus !== 403 ? (
            <Link
              href={`/app/review/${assessmentId}/finalize`}
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
            >
              Ke finalisasi
            </Link>
          ) : null}
        </div>
      </Panel>
    );
  }

  return (
    <ErrorBoundary>
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Lihat hasil</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Tinjau, unduh, dan bagikan lembar yang sudah selesai.
        </p>
      </div>

      {/* Actions */}
      <Panel title="Aksi" description="Unduh atau cetak lembar ini.">
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/app/output/${assessmentId}/print`}
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-sm font-medium text-white"
          >
            Unduh PDF
          </Link>
          <Link
            href={`/app/review/${assessmentId}`}
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-sm"
          >
            Edit soal
          </Link>
          <Link
            href={`/app/output/${assessmentId}/results`}
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-sm"
          >
            Lihat hasil siswa
          </Link>
          <StatusBadge
            label={
              output.status === 'ready'
                ? 'Final'
                : output.status === 'failed'
                  ? 'Gagal'
                  : 'Sedang dibuat'
            }
          />
        </div>
      </Panel>

      {/* Daftar soal */}
      {detail && detail.questions.length > 0 ? (
        <Panel title="Daftar soal" description={`${detail.questions.length} soal`}>
          <ol className="flex flex-col gap-4">
            {detail.questions.map((q) => (
              <li key={q.id} className="flex gap-3 border-b border-brand-line pb-4 last:border-0 last:pb-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-accent-soft text-label-sm font-semibold text-brand-accent" aria-label={`Soal ${q.number}`}>
                  {q.number}
                </span>
                <div className="min-w-0 flex-1">
                <p className="text-body-default font-medium text-brand-ink">{q.stem}</p>
                {q.options.length > 0 && (
                  <ol className="ml-4 flex flex-col gap-1" type="A">
                    {q.options.map((opt) => (
                      <li
                        key={opt.id}
                        className={`text-body-sm ${opt.label === q.answerKey ? 'font-semibold text-brand-accent' : 'text-brand-ink-muted'}`}
                      >
                        {opt.label}. {opt.text}
                        {opt.label === q.answerKey ? ' ✓' : null}
                      </li>
                    ))}
                  </ol>
                )}
                {q.options.length === 0 && q.answerKey ? (
                  <p className="ml-4 text-body-sm text-brand-ink-muted">
                    Jawaban: {q.answerKey}
                  </p>
                ) : null}
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      ) : (
        <Panel title="Daftar soal" description="Memuat soal…">
          <p className="text-body-sm text-brand-ink-muted">
            {loading ? 'Sedang memuat…' : 'Soal belum tersedia.'}
          </p>
        </Panel>
      )}

      {/* Share */}
      <ShareManager assessmentId={assessmentId} title={output.studentSheetLabel} />
    </div>
  </ErrorBoundary>
  );
}
