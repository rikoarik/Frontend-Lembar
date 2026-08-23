'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import OutputPackagePreview from '@/app/components/print/OutputPackagePreview';
import { MetadataForm } from '@/src/features/output/MetadataForm';
import { StudentWorksheetRenderer } from '@/src/features/output/StudentWorksheetRenderer';
import { TeacherKeyRenderer } from '@/src/features/output/TeacherKeyRenderer';
import type { PrintDTO, PrintMetadata } from '@/src/features/output/types';
import { assessmentService } from '@/src/services/assessments/assessmentService';
import type { AssessmentDetail } from '@/src/features/review/types';
import { humanizeAssessmentLabel } from '@/src/features/history/HistoryView';

const EMPTY_METADATA: PrintMetadata = {
  schoolName: '',
  teacherName: '',
  subject: '',
  class: '',
  date: '',
  duration: '',
  instructions: '',
};

export default function OutputPrintPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = use(params);
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [error, setError] = useState('');
  const [metadata, setMetadata] = useState<PrintMetadata>(EMPTY_METADATA);
  const [showForm, setShowForm] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const [sharing, setSharing] = useState(false);
  const [printing, setPrinting] = useState<'student' | 'teacher' | null>(null);
  const [printCopy, setPrintCopy] = useState<'student' | 'teacher'>('student');

  useEffect(() => {
    void assessmentService.get(assessmentId).then((result) => {
      if (result.ok) setAssessment(result.value);
      else setError(result.error.safeMessage);
    });
  }, [assessmentId]);

  const handleShare = async () => {
    if (!assessment) return;
    setSharing(true);
    try {
      const res = await fetch('/v1/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, title: assessment.title }),
      });
      if (res.ok) {
        const data = (await res.json()) as { data?: { token?: string }; token?: string };
        const token = data.data?.token ?? data.token ?? '';
        if (token) setShareUrl(`${window.location.origin}/attempt/${token}`);
        else setShareUrl('Token tidak tersedia.');
      } else {
        setShareUrl('Gagal membuat link berbagi.');
      }
    } catch {
      setShareUrl('Gagal membuat link berbagi.');
    } finally {
      setSharing(false);
    }
  };

  // Build a minimal PrintDTO so StudentWorksheetRenderer can consume metadata
  const dto: PrintDTO | null = assessment
    ? {
        assessmentId,
        title: assessment.title,
        subject: assessment.subject ?? '',
        gradeLabel: assessment.gradeLabel ?? '',
        ...(assessment.assessmentType ? { assessmentType: assessment.assessmentType } : {}),
        ...(assessment.academicYear ? { academicYear: assessment.academicYear } : {}),
        questionCount: assessment.questionCount,
        questions: assessment.questions.map((q, i) => ({
          number: q.number ?? i + 1,
          stem: q.stem,
          questionType: q.questionType ?? 'multiple_choice',
          options: q.options?.map((o) => ({ key: o.label ?? o.id, text: o.text })),
          answerKey: q.answerKey,
          explanation: q.explanation,
        })),
        metadata,
      }
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-h1 font-semibold text-brand-ink">Print preview A4</h1>
          <p className="text-body-sm text-brand-ink-muted">
            {assessment
              ? `${humanizeAssessmentLabel(assessment.title)} · ${humanizeAssessmentLabel(assessment.subject ?? '')}${assessment.gradeLabel ? ` · ${humanizeAssessmentLabel(assessment.gradeLabel)}` : ''} · ${assessment.questionCount} soal`
              : error || 'Memuat dokumen final…'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
          >
            {showForm ? 'Sembunyikan metadata' : 'Isi metadata'}
          </button>
          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={!assessment || sharing}
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 disabled:opacity-50"
          >
            {sharing ? 'Membuat link…' : 'Bagikan via link'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPrintCopy('student');
              setPrinting('student');
              setTimeout(() => {
                window.print();
                setPrinting(null);
              }, 300);
            }}
            disabled={!assessment || printing !== null}
            className="inline-flex min-h-[var(--control-md)] items-center gap-2 rounded-md bg-brand-accent px-4 text-white disabled:opacity-50"
          >
            {printing === 'student' ? 'Menyiapkan…' : 'Cetak lembar siswa'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPrintCopy('teacher');
              setPrinting('teacher');
              setTimeout(() => {
                window.print();
                setPrinting(null);
              }, 300);
            }}
            disabled={!assessment || printing !== null}
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 disabled:opacity-50"
          >
            {printing === 'teacher' ? 'Menyiapkan…' : 'Cetak kunci guru'}
          </button>
          <Link
            href={`/app/output/${assessmentId}`}
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
          >
            Kembali
          </Link>
        </div>
      </div>

      {/* Share URL output */}
      {shareUrl ? (
        <div className="flex items-center gap-2 rounded-md border border-brand-line bg-brand-paper px-4 py-3 text-body-sm print:hidden">
          <span className="text-brand-ink-muted">Link berbagi:</span>
          <a
            href={shareUrl}
            className="break-all text-brand-accent underline"
            target="_blank"
            rel="noreferrer"
          >
            {shareUrl}
          </a>
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(shareUrl)}
            className="ml-auto shrink-0 text-brand-ink-muted hover:text-brand-ink"
            aria-label="Salin link"
          >
            Salin
          </button>
        </div>
      ) : null}

      {/* Metadata form */}
      {showForm ? (
        <div className="print:hidden">
          <MetadataForm
            value={metadata}
            onChange={setMetadata}
            onSave={(v) => {
              setMetadata(v);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : null}

      {/* Preview */}
      <OutputPackagePreview
        sections={printCopy === 'student' ? ['lembar-soal'] : ['kunci-jawaban']}
        content={{
          'lembar-soal': dto ? (
            <StudentWorksheetRenderer dto={dto} />
          ) : (
            <div className="space-y-5 text-body-sm">
              <p className="text-brand-ink-muted italic">Memuat…</p>
            </div>
          ),
          'kunci-jawaban': dto ? (
            <TeacherKeyRenderer dto={dto} />
          ) : (
            <div className="space-y-5 text-body-sm">
              <p className="text-brand-ink-muted italic">Memuat…</p>
            </div>
          ),
        }}
      />
    </div>
  );
}
