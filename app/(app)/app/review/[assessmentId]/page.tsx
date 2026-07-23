import { notFound } from 'next/navigation';
import { Panel } from '@/app/components/ui';
import Link from 'next/link';

/**
 * Minimal review landing for mock-first F3-04 success path.
 * Full F4 review UX remains a later task; this route only prevents dead-end after job success.
 */
export default async function ReviewPlaceholderPage({
  params,
  searchParams,
}: {
  params: Promise<{ assessmentId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { assessmentId } = await params;
  const { mode } = await searchParams;
  if (!assessmentId) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 font-semibold text-brand-ink">Tinjauan draft</h1>
        <p className="text-body-sm text-brand-ink-muted">
          Draft siap ditinjau. Editor review penuh menyusul pada task F4.
        </p>
      </div>
      <Panel
        title="Draft tersedia"
        description={`Mode ${mode === 'detail' ? 'detail' : 'cepat'} · ID ${assessmentId}`}
      >
        <div className="flex flex-col gap-3">
          <p className="text-body-default text-brand-ink-muted">
            AI menghasilkan draft. Guru tetap menentukan hasil final sebelum membagikan atau
            mencetak.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/app/riwayat"
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white"
            >
              Buka riwayat
            </Link>
            <Link
              href="/app/generate"
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-default text-brand-ink"
            >
              Generate lagi
            </Link>
          </div>
        </div>
      </Panel>
    </div>
  );
}
