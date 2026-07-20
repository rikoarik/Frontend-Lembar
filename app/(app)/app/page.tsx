'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Panel, Button } from '@/app/components/ui';
import { apiClient } from '@/src/lib/api/client';
import type { components } from '@/src/lib/api/schema';

type DashboardData = components['schemas']['DashboardSummaryResponse']['data'];

type State =
  | { status: 'loading' }
  | { status: 'empty'; message: string; workspaceName: string }
  | { status: 'populated'; data: DashboardData }
  | { status: 'error'; message: string };

export default function AppDashboardPage() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    const load = async () => {
      const { data, error } = await apiClient.GET('/v1/dashboard/summary');
      if (cancelled) return;
      if (error || !data) {
        setState({ status: 'error', message: 'Gagal memuat ringkasan. Coba lagi.' });
        return;
      }
      if (data.data.emptyState.isEmpty) {
        setState({
          status: 'empty',
          message: data.data.emptyState.message,
          workspaceName: data.data.workspace.name,
        });
        return;
      }
      setState({ status: 'populated', data: data.data });
    };
    load();
    return () => { cancelled = true; };
  }, [retryKey]);

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="Memuat dashboard">
        <div className="animate-pulse rounded-md bg-brand-line h-32 w-full" />
        <div className="animate-pulse rounded-md bg-brand-line h-48 w-full" />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col gap-3 max-w-md" role="alert">
        <p className="text-body-sm text-brand-ink">{state.message}</p>
        <Button variant="quiet" size="sm" onClick={() => setRetryKey(k => k + 1)}>
          Coba lagi
        </Button>
      </div>
    );
  }

  if (state.status === 'empty') {
    return (
      <div className="flex flex-col gap-4">
        <Panel
          title={`Selamat datang di ${state.workspaceName}`}
          description={state.message}
        >
          <Link
            href="/app/generate"
            className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white hover:bg-brand-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          >
            Buat lembar pertama
          </Link>
        </Panel>
      </div>
    );
  }

  // populated
  const { workspace, metrics } = state.data;
  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel
          title={workspace.name}
          description="Ringkasan workspace aktif Anda."
          actions={
            <Link
              href="/app/generate"
              className="inline-flex min-h-[var(--control-md)] items-center rounded-md bg-brand-accent px-4 text-body-default font-medium text-white hover:bg-brand-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              Generate lembar
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
              <div className="text-caption text-brand-ink-muted">Total lembar</div>
              <div className="mt-1 text-h3 font-semibold text-brand-ink" data-testid="metric-assessments-total">
                {metrics.assessments.total}
              </div>
            </div>
            <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
              <div className="text-caption text-brand-ink-muted">Final</div>
              <div className="mt-1 text-h3 font-semibold text-brand-ink" data-testid="metric-assessments-final">
                {metrics.assessments.final}
              </div>
            </div>
            <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
              <div className="text-caption text-brand-ink-muted">Perlu ditinjau</div>
              <div className="mt-1 text-h3 font-semibold text-brand-ink" data-testid="metric-assessments-review">
                {metrics.assessments.inReview}
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Aksi inti" description="Satu langkah ke alur kerja utama.">
          <div className="flex flex-col gap-2">
            <Link
              className="rounded-md border border-brand-line px-3 py-3 hover:bg-brand-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              href="/app/generate"
            >
              <div className="font-semibold text-brand-ink">Generate lembar</div>
              <div className="text-body-sm text-brand-ink-muted">
                Mulai draft baru dari materi dan konfigurasi aktif.
              </div>
            </Link>
            <Link
              className="rounded-md border border-brand-line px-3 py-3 hover:bg-brand-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              href="/app/riwayat"
            >
              <div className="font-semibold text-brand-ink">Riwayat</div>
              <div className="text-body-sm text-brand-ink-muted">
                Lihat semua draft dan lembar yang telah dibuat.
              </div>
            </Link>
          </div>
        </Panel>
      </section>

      {metrics.sources.total > 0 && (
        <Panel title="Sumber materi">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
              <div className="text-caption text-brand-ink-muted">Siap</div>
              <div className="mt-1 text-h3 font-semibold text-brand-ink" data-testid="metric-sources-ready">
                {metrics.sources.ready}
              </div>
            </div>
            <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
              <div className="text-caption text-brand-ink-muted">Diproses</div>
              <div className="mt-1 text-h3 font-semibold text-brand-ink">
                {metrics.sources.processing}
              </div>
            </div>
            <div className="rounded-md border border-brand-line bg-brand-paper px-3 py-3">
              <div className="text-caption text-brand-ink-muted">Gagal</div>
              <div className="mt-1 text-h3 font-semibold text-brand-ink">
                {metrics.sources.failed}
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}
