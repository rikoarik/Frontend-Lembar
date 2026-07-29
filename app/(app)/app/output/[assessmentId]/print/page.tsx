'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import A4PreviewFrame from '@/app/components/print/A4PreviewFrame';
import OutputPackagePreview from '@/app/components/print/OutputPackagePreview';
import { assessmentService } from '@/src/services/assessments/assessmentService';
import type { AssessmentDetail } from '@/src/features/review/types';

export default function OutputPrintPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = use(params);
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void assessmentService.get(assessmentId).then((result) => {
      if (result.ok) setAssessment(result.value);
      else setError(result.error.safeMessage);
    });
  }, [assessmentId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-h1 font-semibold text-brand-ink">Print preview A4</h1>
          <p className="text-body-sm text-brand-ink-muted">
            {assessment ? `${assessment.title} · ${assessment.questionCount} soal` : error || 'Memuat dokumen final…'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!assessment}
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-white disabled:opacity-50"
          >
            Print
          </button>
          <Link
            href={`/app/output/${assessmentId}`}
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4"
          >
            Kembali
          </Link>
        </div>
      </div>
      <A4PreviewFrame>
        <OutputPackagePreview
          sections={['lembar-soal', 'kunci-jawaban', 'pembahasan']}
          content={{
            'lembar-soal': (
              <div className="space-y-5 text-body-sm">
                <h2 className="text-lg font-semibold">{assessment?.title ?? 'Memuat…'}</h2>
                {assessment?.questions.map((question) => (
                  <section key={question.id}>
                    <p className="font-medium">{question.number}. {question.stem}</p>
                    <ol className="mt-2 space-y-1 pl-5">
                      {question.options.map((option) => <li key={option.id}>{option.label}. {option.text}</li>)}
                    </ol>
                  </section>
                ))}
              </div>
            ),
            'kunci-jawaban': (
              <ol className="space-y-2 text-body-sm">
                {assessment?.questions.map((question) => <li key={question.id}>{question.number}. {question.answerKey}</li>)}
              </ol>
            ),
            pembahasan: (
              <div className="space-y-4 text-body-sm">
                {assessment?.questions.map((question) => (
                  <section key={question.id}><strong>{question.number}.</strong> {question.explanation}</section>
                ))}
              </div>
            ),
          }}
        />
      </A4PreviewFrame>
    </div>
  );
}
