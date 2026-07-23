'use client';

import A4PreviewFrame from '@/app/components/print/A4PreviewFrame';
import OutputPackagePreview from '@/app/components/print/OutputPackagePreview';
import Link from 'next/link';
import { use } from 'react';

export default function OutputPrintPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = use(params);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-h1 font-semibold text-brand-ink">Print preview A4</h1>
          <p className="text-body-sm text-brand-ink-muted">
            Pratinjau draft — bukan dokumen final backend.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-white"
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
            'lembar-soal': <p className="text-body-sm">Lembar siswa · {assessmentId}</p>,
            'kunci-jawaban': <p className="text-body-sm">Kunci jawaban · {assessmentId}</p>,
            pembahasan: <p className="text-body-sm">Pembahasan · {assessmentId}</p>,
          }}
        />
      </A4PreviewFrame>
    </div>
  );
}
