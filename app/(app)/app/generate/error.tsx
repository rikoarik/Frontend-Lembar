'use client';

import Link from 'next/link';
import { Button, Panel } from '@/app/components/ui';

export default function GenerateError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Panel
      title="Form generate belum bisa dimuat"
      description="Terjadi gangguan saat membuka pengaturan lembar. Konfigurasi belum dikirim."
      className="max-w-reading-max"
    >
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => retry()}>Coba lagi</Button>
        <Link
          href="/app"
          className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-default text-brand-ink"
        >
          Kembali ke dashboard
        </Link>
      </div>
    </Panel>
  );
}
