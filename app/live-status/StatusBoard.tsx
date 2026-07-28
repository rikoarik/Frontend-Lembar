'use client';

import { useEffect, useState } from 'react';

type StatusItem = {
  label: string;
  status: 'done' | 'in_progress' | 'pending';
  percent: number;
};

type StatusDoc = {
  updatedAt: string;
  phase: string;
  headline: string;
  overallPercent: number;
  currentTask: string;
  items: StatusItem[];
  latestBackendCommits: string[];
  latestFrontendCommits: string[];
  services: { lembarApi: string; lembarFrontend: string; lembarWorker: string };
  notes: string[];
};

const STATUS_PATH = '/live-status/status.json';

async function fetchStatus(): Promise<StatusDoc | null> {
  try {
    const res = await fetch(STATUS_PATH, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as StatusDoc;
  } catch {
    return null;
  }
}

const statusTone: Record<StatusItem['status'], { dot: string; ring: string; label: string }> = {
  done: { dot: 'bg-emerald-400', ring: 'bg-emerald-400/10 ring-emerald-500/30 text-emerald-300', label: 'Selesai' },
  in_progress: { dot: 'bg-amber-400 animate-pulse', ring: 'bg-amber-400/10 ring-amber-500/30 text-amber-300', label: 'Lagi jalan' },
  pending: { dot: 'bg-zinc-500', ring: 'bg-zinc-700/40 ring-zinc-600/40 text-zinc-300', label: 'Antrian' },
};

const serviceTone: Record<string, string> = {
  online: 'text-emerald-300',
  offline: 'text-rose-300',
  degraded: 'text-amber-300',
};

function StatusDot({ status }: { status: StatusItem['status'] }) {
  return (
    <span className="relative inline-flex h-2 w-2 items-center justify-center" aria-hidden>
      <span className={`absolute inline-flex h-full w-full rounded-full ${statusTone[status].dot}`} />
      <span className="relative inline-flex h-2 w-2 rounded-full opacity-60 blur-sm" />
    </span>
  );
}

function ProgressBar({ value, status }: { value: number; status: StatusItem['status'] }) {
  const fill =
    status === 'done'
      ? 'bg-emerald-400'
      : status === 'in_progress'
        ? 'bg-amber-400'
        : 'bg-zinc-500';
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
      <div
        className={`h-full rounded-full ${fill} transition-[width] duration-700 ease-out`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        aria-label={`${value}%`}
      />
    </div>
  );
}

function ServiceBadge({ name, state }: { name: string; state: string }) {
  const tone = serviceTone[state] ?? 'text-zinc-300';
  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60 px-4 py-3">
      <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">{name}</span>
      <span className={`flex items-center gap-2 text-sm font-medium ${tone}`}>
        <span
          className={`inline-flex h-1.5 w-1.5 rounded-full ${
            state === 'online' ? 'bg-emerald-400' : state === 'offline' ? 'bg-rose-400' : 'bg-amber-400'
          } ${state === 'online' ? 'animate-pulse' : ''}`}
        />
        {state}
      </span>
    </li>
  );
}

function CommitList({ title, commits }: { title: string; commits: string[] }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">{title}</h2>
      <ol className="flex flex-col gap-3">
        {commits.map((commit, idx) => {
          const [hash, ...rest] = commit.split(' ');
          return (
            <li key={commit} className="flex items-start gap-3 text-sm leading-relaxed">
              <span className="mt-0.5 select-none rounded-md bg-zinc-800/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-300">
                {idx + 1}
              </span>
              <span className="font-mono text-[11px] text-zinc-500">{hash}</span>
              <span className="text-zinc-200">{rest.join(' ')}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ItemRow({ item }: { item: StatusItem }) {
  const tone = statusTone[item.status];
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 text-sm text-zinc-100">
          <StatusDot status={item.status} />
          <span>{item.label}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${tone.ring}`}>
          {tone.label}
        </span>
      </div>
      <ProgressBar value={item.percent} status={item.status} />
      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <span>{item.percent}% complete</span>
        <span className="font-mono">
          <span className="text-amber-300">{item.percent.toString().padStart(2, '0')}</span>
          <span className="px-1 text-zinc-600">/</span>
          <span>100</span>
        </span>
      </div>
    </li>
  );
}

export function StatusBoard({ doc }: { doc: StatusDoc | null }) {
  const [latest, setLatest] = useState<StatusDoc | null>(doc);
  const [pulse, setPulse] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      const fresh = await fetchStatus();
      if (!cancelled && fresh) {
        setLatest((prev) => {
          if (!prev) return fresh;
          if (prev.updatedAt !== fresh.updatedAt) {
            setPulse((p) => p + 1);
          }
          return fresh;
        });
      }
    }

    const id = setInterval(tick, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!latest) {
    return (
      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <p className="text-sm uppercase tracking-[0.22em] text-zinc-500">Lembar Live Status</p>
        <p className="mt-3 max-w-md text-zinc-300">
          Belum ada snapshot. Begitu saya commit perubahan pertama ke{' '}
          <code className="font-mono text-amber-300">lembar-live-status.json</code>, halaman ini akan
          otomatis muncul.
        </p>
      </div>
    );
  }

  const connected =
    latest.services.lembarApi === 'online' &&
    latest.services.lembarFrontend === 'online' &&
    latest.services.lembarWorker === 'online';

  return (
    <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex h-1.5 w-1.5 rounded-full ${
              connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400">
            Lembar Live Status
          </p>
        </div>
        <h1 className="max-w-2xl text-3xl font-semibold leading-[1.1] tracking-tight text-zinc-50 md:text-[40px]">
          {latest.phase}.
        </h1>
        <p className="max-w-2xl text-zinc-300">{latest.headline}</p>
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
          <span>Snapshot</span>
          <code className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 font-mono text-[10px] text-zinc-300">
            {latest.updatedAt}
          </code>
          <span className="text-zinc-700">/</span>
          <span>poll #{pulse.toString().padStart(3, '0')}</span>
        </div>
      </header>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              Overall progress
            </p>
            <p className="mt-2 text-zinc-300">Fokus sekarang: {latest.currentTask}</p>
          </div>
          <span className="font-mono text-5xl font-semibold tabular-nums text-emerald-400 md:text-6xl">
            {latest.overallPercent.toString().padStart(2, '0')}
            <span className="text-base text-zinc-600">%</span>
          </span>
        </div>
        <div className="mt-6 h-3 w-full overflow-hidden rounded-full bg-zinc-800/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-200 transition-[width] duration-700 ease-out"
            style={{ width: `${latest.overallPercent}%` }}
            aria-label={`Overall ${latest.overallPercent}%`}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          <span>0</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] md:p-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            Item kerja
          </h2>
          <span className="font-mono text-xs text-zinc-500">
            {latest.items.filter((i) => i.status === 'done').length} / {latest.items.length} done
          </span>
        </div>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {latest.items.map((item) => (
            <ItemRow key={item.label} item={item} />
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <CommitList title="Backend origin/dev" commits={latest.latestBackendCommits} />
        <CommitList title="Frontend origin/dev" commits={latest.latestFrontendCommits} />
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          PM2 services
        </h2>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <ServiceBadge name="lembar-api" state={latest.services.lembarApi} />
          <ServiceBadge name="lembar-frontend" state={latest.services.lembarFrontend} />
          <ServiceBadge name="lembar-worker" state={latest.services.lembarWorker} />
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
        <h2 className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">Catatan</h2>
        <ul className="space-y-2 text-sm text-zinc-300">
          {latest.notes.map((note, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-zinc-500" />
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        <span>Lembar Project · Internal</span>
        <span>Polling every 4s · No manual refresh</span>
      </footer>
    </div>
  );
}
