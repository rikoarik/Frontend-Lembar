'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import GenerateForm from '@/src/features/catalog/GenerateForm';

function GeneratePageFallback() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Memuat formulir">
      <div className="flex items-center gap-4">
        <Link
          href="/app"
          className="text-body-sm text-brand-accent hover:text-brand-accent-hover"
        >
          ← Kembali ke Dashboard
        </Link>
      </div>
      <div className="animate-pulse rounded-md bg-brand-line h-8 w-64" />
      <div className="animate-pulse rounded-md bg-brand-line h-[600px] w-full" />
    </div>
  );
}

export default function GeneratePage() {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/app"
        className="text-body-sm text-brand-accent hover:text-brand-accent-hover w-fit"
      >
        ← Kembali ke Dashboard
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-h1 text-brand-ink font-semibold">Generate Lembar (AI)</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Atur materi, pengaturan soal, dan konteks untuk membuat draft lembar baru.
        </p>
      </div>

      <Suspense fallback={<GeneratePageFallback />}>
        <GenerateForm />
      </Suspense>
    </div>
  );
}
