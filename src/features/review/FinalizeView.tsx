'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Panel, StatusBadge } from '@/app/components/ui';
import { assessmentService } from '@/src/services/assessments/assessmentService';
import type { AssessmentDetail } from '@/src/features/review/types';

export function FinalizeView({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const result = await assessmentService.get(assessmentId);
    if (!result.ok) {
      setError(result.error.safeMessage);
      setAssessment(null);
      setLoading(false);
      return;
    }
    setAssessment(result.value);
    setError(null);
    setLoading(false);
  }, [assessmentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onFinalize = async () => {
    setBusy(true);
    setMessage('');
    const result = await assessmentService.finalize(assessmentId, ack);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error.safeMessage);
      if (result.error.blockers?.length) {
        setMessage(`${result.error.safeMessage} ${result.error.blockers.join(' ')}`);
      }
      await load();
      return;
    }
    router.push(`/app/output/${assessmentId}`);
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-md bg-brand-line" aria-busy="true" />;
  }

  if (error || !assessment) {
    return (
      <Panel title="Finalisasi belum bisa dibuka" description={error ?? 'Lembar tidak ditemukan.'}>
        <Button onClick={() => void load()}>Coba lagi</Button>
      </Panel>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Finalisasi lembar</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Versi final bersifat tetap. Setelah difinalkan, edit soal membuat versi draft baru.
        </p>
      </div>

      <Panel
        title={assessment.title}
        description={`${assessment.subject} · ${assessment.gradeLabel}`}
        actions={<StatusBadge label={assessment.lifecycle === 'final' ? 'Final' : 'Perlu ditinjau'} />}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
            <div className="text-caption text-brand-ink-muted">Ditinjau</div>
            <div className="text-h3 font-semibold">
              {assessment.reviewedCount}/{assessment.questionCount}
            </div>
          </div>
          <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
            <div className="text-caption text-brand-ink-muted">Peringatan</div>
            <div className="text-h3 font-semibold">{assessment.warningCount}</div>
          </div>
          <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
            <div className="text-caption text-brand-ink-muted">Status</div>
            <div className="text-h3 font-semibold">{assessment.lifecycle}</div>
          </div>
        </div>
      </Panel>

      {assessment.finalizeBlockers.length > 0 ? (
        <Panel title="Masih ada penghalang" description="Selesaikan item berikut sebelum finalisasi.">
          <ul className="list-disc space-y-1 pl-5 text-body-default text-brand-ink">
            {assessment.finalizeBlockers.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-3">
            <Link
              href={`/app/review/${assessmentId}`}
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
            >
              Kembali ke tinjauan
            </Link>
          </div>
        </Panel>
      ) : (
        <Panel title="Konfirmasi tanggung jawab" description="AI hanya membuat draft. Guru menentukan hasil final.">
          <label className="flex items-start gap-3 text-body-default">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={ack}
              disabled={assessment.lifecycle === 'final' || busy}
              onChange={(e) => setAck(e.target.checked)}
            />
            <span>{assessment.teacherResponsibilityNote}</span>
          </label>
          {message ? (
            <p className="mt-3 text-body-sm text-brand-danger" role="alert">
              {message}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              disabled={!ack || busy || assessment.lifecycle === 'final'}
              loading={busy}
              loadingLabel="Memfinalkan…"
              onClick={() => void onFinalize()}
            >
              Finalkan lembar
            </Button>
            <Link
              href={`/app/review/${assessmentId}`}
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
            >
              Kembali
            </Link>
            {assessment.lifecycle === 'final' ? (
              <Link
                href={`/app/output/${assessmentId}`}
                className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-white"
              >
                Buka output
              </Link>
            ) : null}
          </div>
        </Panel>
      )}
    </div>
  );
}
