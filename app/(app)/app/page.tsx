'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Button } from '@/app/components/ui';
import { apiClient } from '@/src/lib/api/client';
import type { components } from '@/src/lib/api/schema';
import { useWorkspace } from '@/src/features/workspace/workspaceContext';
import { readActiveJob } from '@/src/features/jobs/activeJobStorage';
import { jobService } from '@/src/services/jobs/jobService';

type DashboardData = components['schemas']['DashboardSummaryResponse']['data'];

type State =
  | { status: 'loading' }
  | { status: 'empty'; message: string; workspaceName: string }
  | { status: 'populated'; data: DashboardData }
  | { status: 'error'; message: string };

type ActiveJobState = {
  jobId: string;
  percent?: number;
  hidden?: boolean;
};

function subscribeToActiveJobStorage() {
  return () => undefined;
}

function getServerActiveJobId() {
  return null;
}

function ActiveJobBanner({ workspaceId }: { workspaceId: string }) {
  const storedJobId = useSyncExternalStore(
    subscribeToActiveJobStorage,
    () => readActiveJob(workspaceId)?.jobId ?? null,
    getServerActiveJobId,
  );
  const [polledJob, setPolledJob] = useState<ActiveJobState | null>(null);

  useEffect(() => {
    if (!storedJobId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      const result = await jobService.getJob(storedJobId);
      if (cancelled) return;
      if (!result.ok) {
        setPolledJob({ jobId: storedJobId, hidden: true });
        return;
      }

      const job = result.value;
      if (['succeeded', 'partially_succeeded', 'failed', 'cancelled'].includes(job.status)) {
        setPolledJob({ jobId: storedJobId, hidden: true });
        return;
      }

      const percent = typeof job.progressPercent === 'number' ? job.progressPercent : undefined;
      setPolledJob({ jobId: storedJobId, percent });
      timer = setTimeout(() => void poll(), 2000);
    };

    void poll();
    return () => {
      cancelled = true;
      if (timer !== null) clearTimeout(timer);
    };
  }, [storedJobId]);

  const activeJob =
    storedJobId && polledJob?.jobId === storedJobId && !polledJob.hidden
      ? polledJob
      : storedJobId && polledJob?.jobId !== storedJobId
        ? { jobId: storedJobId }
        : null;

  if (!activeJob) return null;

  return (
    <Link
      href={`/app/jobs/${activeJob.jobId}`}
      className="flex items-center gap-3 rounded-2xl border border-[#d4b8ba] bg-[#fdf0f0] px-4 py-3 hover:bg-[#fae8e8] transition-colors"
      aria-live="polite"
    >
      <span
        className="material-symbols-outlined text-[20px] text-[#a3202b] animate-spin"
        style={{ animationDuration: '2s' }}
      >
        progress_activity
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-semibold text-[#a3202b]">Generate sedang berjalan</span>
        {activeJob.percent !== undefined ? (
          <div className="mt-1 h-1.5 w-full rounded-full bg-[#f0d0d0]">
            <div
              className="h-full rounded-full bg-[#a3202b] transition-all duration-500"
              style={{ width: `${activeJob.percent}%` }}
            />
          </div>
        ) : (
          <div className="mt-1 h-1.5 w-full rounded-full bg-[#f0d0d0] overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-[#a3202b] animate-pulse" />
          </div>
        )}
      </div>
      <span className="text-[12px] text-[#a3202b] font-medium whitespace-nowrap">
        {activeJob.percent !== undefined ? `${activeJob.percent}%` : 'Memproses…'}
      </span>
    </Link>
  );
}

const QUICK_ACTIONS = [
  {
    href: '/app/generate',
    title: 'Buat lembar',
    description: 'Generate draft soal dari materi atau topik.',
    icon: 'auto_awesome',
    primary: true,
  },
  {
    href: '/app/riwayat',
    title: 'Lihat riwayat',
    description: 'Lanjutkan draft, tinjauan, atau final.',
    icon: 'history',
    primary: false,
  },
  {
    href: '/app/bank-soal',
    title: 'Bank soal',
    description: 'Ambil item yang sudah pernah dipakai.',
    icon: 'inventory_2',
    primary: false,
  },
  {
    href: '/app/template',
    title: 'Template',
    description: 'Mulai dari struktur yang sudah siap.',
    icon: 'description',
    primary: false,
  },
] as const;

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e6dfd4] bg-white p-4 shadow-[0_1px_0_rgba(23,23,23,0.03)]">
      <div className="text-[12px] font-medium text-[#6d665d]">{label}</div>
      <div className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#171717]">
        {value}
      </div>
      {hint ? <div className="mt-2 text-[12px] text-[#8a8379]">{hint}</div> : null}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Memuat dashboard">
      <div className="h-28 animate-pulse rounded-2xl bg-[#efe8dc]" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-[#efe8dc]" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl bg-[#efe8dc]" />
    </div>
  );
}

export default function AppDashboardPage() {
  const { displayName, activeWorkspace } = useWorkspace();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void apiClient.GET('/v1/dashboard/summary').then(({ data, error }) => {
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
    });

    return () => {
      cancelled = true;
    };
  }, [retryKey]);

  if (state.status === 'loading') return <Skeleton />;

  if (state.status === 'error') {
    return (
      <div
        className="mx-auto flex max-w-lg flex-col gap-4 rounded-2xl border border-[#e6dfd4] bg-white p-6"
        role="alert"
      >
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-[#171717]">
            Gagal memuat beranda
          </h2>
          <p className="mt-1 text-[13px] text-[#6d665d]">{state.message}</p>
        </div>
        <div>
          <Button
            size="sm"
            onClick={() => {
              setState({ status: 'loading' });
              setRetryKey((key) => key + 1);
            }}
          >
            Coba lagi
          </Button>
        </div>
      </div>
    );
  }

  const firstName = displayName.split(/\s+/)[0] || 'Guru';

  if (state.status === 'empty') {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <ActiveJobBanner key={activeWorkspace.id} workspaceId={activeWorkspace.id} />
        <section className="rounded-3xl border border-[#e6dfd4] bg-white p-6 shadow-[0_1px_0_rgba(23,23,23,0.03)] md:p-8">
          <div className="inline-flex rounded-full bg-[#f5e4e5] px-2.5 py-1 text-[11px] font-semibold text-[#851925]">
            Ruang pribadi
          </div>
          <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.04em] text-[#171717] md:text-[32px]">
            Halo, {firstName}. Siap buat lembar pertama?
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#6d665d]">
            {state.message ||
              `Mulai dari materi atau topik, lalu tinjau draft sebelum difinalkan di ${state.workspaceName}.`}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/app/generate"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#a3202b] px-4 text-[14px] font-semibold text-white hover:bg-[#851925]"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden>
                auto_awesome
              </span>
              Buat lembar pertama
            </Link>
            <Link
              href="/app/template"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e6dfd4] bg-white px-4 text-[14px] font-semibold text-[#171717] hover:bg-[#f7f3ec]"
            >
              Lihat template
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-2xl border border-[#e6dfd4] bg-white p-4 transition-colors hover:border-[#d8d0c5] hover:bg-[#fbf8f2]"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ebe3] text-[#514b44] group-hover:bg-[#efe4d8]">
                <span className="material-symbols-outlined text-[20px]" aria-hidden>
                  {action.icon}
                </span>
              </div>
              <div className="mt-3 text-[15px] font-semibold tracking-[-0.02em] text-[#171717]">
                {action.title}
              </div>
              <p className="mt-1 text-[13px] leading-5 text-[#6d665d]">{action.description}</p>
            </Link>
          ))}
        </section>
      </div>
    );
  }

  const { metrics, workspace } = state.data;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <ActiveJobBanner key={activeWorkspace.id} workspaceId={activeWorkspace.id} />
      <section className="flex flex-col gap-4 rounded-3xl border border-[#e6dfd4] bg-white p-5 shadow-[0_1px_0_rgba(23,23,23,0.03)] md:flex-row md:items-end md:justify-between md:p-6">
        <div className="min-w-0">
          <div className="text-[12px] font-medium text-[#8a8379]">{workspace.name}</div>
          <h2 className="mt-1 text-[26px] font-semibold tracking-[-0.04em] text-[#171717] md:text-[30px]">
            Halo, {firstName}
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-5 text-[#6d665d]">
            Lanjutkan draft, tinjau hasil generate, atau buat lembar baru dari materi.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/app/generate"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#a3202b] px-4 text-[13px] font-semibold text-white hover:bg-[#851925]"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden>
              auto_awesome
            </span>
            Buat lembar
          </Link>
          <Link
            href="/app/riwayat"
            className="inline-flex h-10 items-center rounded-xl border border-[#e6dfd4] bg-white px-4 text-[13px] font-semibold text-[#171717] hover:bg-[#f7f3ec]"
          >
            Buka riwayat
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total asesmen"
          value={<span data-testid="metric-assessments-total">{metrics.assessments.total}</span>}
          hint="Semua lembar workspace aktif"
        />
        <MetricCard
          label="Sumber siap"
          value={<span data-testid="metric-sources-ready">{metrics.sources.ready}</span>}
          hint={`${metrics.sources.total} sumber di workspace aktif`}
        />
        <MetricCard
          label="Perlu ditinjau"
          value={
            <span data-testid="metric-assessments-review">{metrics.assessments.inReview}</span>
          }
          hint="Siap dicek sebelum final"
        />
        <MetricCard
          label="Final"
          value={<span data-testid="metric-assessments-final">{metrics.assessments.final}</span>}
          hint="Siap dicetak atau diunduh"
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-[#e6dfd4] bg-white p-4 shadow-[0_1px_0_rgba(23,23,23,0.03)]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#171717]">
              Aksi cepat
            </h3>
            <span className="text-[12px] text-[#8a8379]">Subscriber workspace</span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={[
                  'rounded-xl border px-3 py-3 transition-colors',
                  action.primary
                    ? 'border-[#f0d5d7] bg-[#fdf7f7] hover:bg-[#f8ecee]'
                    : 'border-[#eee6da] bg-[#fbf8f2] hover:bg-[#f3eee6]',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-[18px] text-[#514b44]"
                    aria-hidden
                  >
                    {action.icon}
                  </span>
                  <span className="text-[13px] font-semibold text-[#171717]">{action.title}</span>
                </div>
                <p className="mt-1 text-[12px] leading-5 text-[#6d665d]">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#e6dfd4] bg-white p-4 shadow-[0_1px_0_rgba(23,23,23,0.03)]">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#171717]">
            Status workspace
          </h3>
          <dl className="mt-3 space-y-3 text-[13px]">
            <div className="flex items-center justify-between gap-3 border-b border-[#f0ebe3] pb-3">
              <dt className="text-[#6d665d]">Workspace</dt>
              <dd className="font-medium text-[#171717]">{workspace.name}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[#f0ebe3] pb-3">
              <dt className="text-[#6d665d]">Tipe</dt>
              <dd className="font-medium text-[#171717]">
                {workspace.type === 'school' ? 'Sekolah' : 'Pribadi'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[#f0ebe3] pb-3">
              <dt className="text-[#6d665d]">Role aktif</dt>
              <dd className="font-medium text-[#171717]">{workspace.role}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#6d665d]">Ruang aktif</dt>
              <dd className="font-medium text-[#171717]">{activeWorkspace.name}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
