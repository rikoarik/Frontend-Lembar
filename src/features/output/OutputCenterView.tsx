'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button, Panel, StatusBadge } from '@/app/components/ui';
import { assessmentService } from '@/src/services/assessments/assessmentService';
import type { OutputPackage } from '@/src/features/review/types';
import A4PreviewFrame from '@/app/components/print/A4PreviewFrame';
import OutputPackagePreview from '@/app/components/print/OutputPackagePreview';
import { ShareManager } from '@/src/features/share/ShareManager';

export function OutputCenterView({ assessmentId }: { assessmentId: string }) {
  const [output, setOutput] = useState<OutputPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await assessmentService.getOutput(assessmentId);
    if (!result.ok) {
      setError(result.error.safeMessage);
      setOutput(null);
      setLoading(false);
      return;
    }
    setOutput(result.value);
    setError(null);
    setLoading(false);
  }, [assessmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onCopyShare = async () => {
    if (!output?.shareToken) return;
    const url = `${window.location.origin}/bagikan/${output.shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (loading) {
    return <div className="h-48 animate-pulse rounded-md bg-brand-line" aria-busy="true" />;
  }

  if (error || !output) {
    return (
      <Panel
        title="Output belum tersedia"
        description={error ?? 'Finalisasi lembar dulu untuk membuka output.'}
      >
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void load()}>Coba lagi</Button>
          <Link
            href={`/app/review/${assessmentId}/finalize`}
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
          >
            Ke finalisasi
          </Link>
        </div>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Pusat output</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Print, unduh, dan bagikan memakai artifact yang sama.
        </p>
      </div>

      <Panel
        title="Paket asesmen"
        description={`Versi ${output.versionId}`}
        actions={
          <StatusBadge
            label={
              output.status === 'ready' ? 'Final' : output.status === 'failed' ? 'Gagal' : 'Diproses'
            }
          />
        }
      >
        <div className="flex flex-col gap-3">
          <ul className="grid gap-2 sm:grid-cols-3">
            <li className="rounded-md border border-brand-line px-3 py-3 text-body-sm">
              {output.studentSheetLabel}
            </li>
            <li className="rounded-md border border-brand-line px-3 py-3 text-body-sm">
              {output.answerKeyLabel}
            </li>
            <li className="rounded-md border border-brand-line px-3 py-3 text-body-sm">
              {output.explanationLabel}
            </li>
          </ul>

          {output.failureMessage ? (
            <p className="text-body-sm text-brand-danger" role="alert">
              {output.failureMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Link
              href={output.printHref}
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-white"
            >
              Print preview A4
            </Link>
            <a
              href={output.downloadHref}
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
            >
              Unduh PDF (mock)
            </a>
            {output.shareToken ? (
              <Button variant="secondary" onClick={() => void onCopyShare()}>
                {copied ? 'Tautan disalin' : 'Salin tautan bagikan'}
              </Button>
            ) : null}
            <Link
              href={`/app/review/${assessmentId}`}
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
            >
              Kembali ke tinjauan
            </Link>
          </div>
        </div>
      </Panel>

      <ShareManager
        assessmentId={assessmentId}
        title={`Output ${assessmentId}`}
      />

      <Panel title="Pratinjau paket" description="Urutan paket: lembar siswa, kunci, pembahasan.">
        <div className="overflow-auto">
          <A4PreviewFrame>
            <OutputPackagePreview
              sections={['lembar-soal', 'kunci-jawaban', 'pembahasan']}
              content={{
                'lembar-soal': (
                  <p className="text-body-sm text-brand-ink">{output.studentSheetLabel}</p>
                ),
                'kunci-jawaban': (
                  <p className="text-body-sm text-brand-ink">{output.answerKeyLabel}</p>
                ),
                pembahasan: (
                  <p className="text-body-sm text-brand-ink">{output.explanationLabel}</p>
                ),
              }}
            />
          </A4PreviewFrame>
        </div>
      </Panel>
    </div>
  );
}
