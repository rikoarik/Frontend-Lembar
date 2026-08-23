'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/app/components/ui';

export default function OutputRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Output route failed', error);
  }, [error]);

  return (
    <main className="grid min-h-[24rem] place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-brand-line bg-white p-6 text-center shadow-sm">
        <span className="material-symbols-outlined text-3xl text-brand-danger" aria-hidden="true">
          error
        </span>
        <h1 className="mt-3 text-h3 font-semibold text-brand-ink">Output tidak dapat dimuat</h1>
        <p className="mt-2 text-body-sm leading-relaxed text-brand-ink-muted">
          Sesi atau data output mungkin berubah. Coba muat ulang data, atau kembali ke riwayat asesmen.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button onClick={reset}>Coba lagi</Button>
          <Link
            href="/app/riwayat"
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md border border-brand-line px-4 text-body-sm font-medium text-brand-ink"
          >
            Ke riwayat
          </Link>
        </div>
      </section>
    </main>
  );
}
