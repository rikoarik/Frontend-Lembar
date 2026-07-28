'use client';

import { useEffect, useState } from 'react';

type StatusItem = {
  label: string;
  status: 'done' | 'in_progress' | 'pending';
  percent: number;
};

type StatusDoc = {
  updatedAt: string;
  startedAt?: string;
  workMode?: string;
  phase: string;
  headline: string;
  overallPercent: number;
  currentTask: string;
  nextAction?: string;
  blockers?: string[];
  evidence?: string[];
  items: StatusItem[];
  latestBackendCommits: string[];
  latestFrontendCommits: string[];
  services: { lembarApi: string; lembarFrontend: string; lembarWorker: string };
  notes: string[];
};

const STATUS_PATH = '/live-status/status.json';
const LOG_PATH = '/live-status/activity.json';

async function fetchStatus(): Promise<StatusDoc | null> {
  try {
    const res = await fetch(STATUS_PATH, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as StatusDoc;
  } catch {
    return null;
  }
}

async function fetchLogs(): Promise<string[]> {
  try {
    const res = await fetch(LOG_PATH, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = (await res.json()) as { lines: string[] };
    return json.lines ?? [];
  } catch {
    return [];
  }
}

const statusTone: Record<StatusItem['status'], { dot: string; ring: string; label: string }> = {
  done: {
    dot: 'bg-emerald-500',
    ring: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
    label: 'Selesai',
  },
  in_progress: {
    dot: 'bg-amber-500 animate-pulse',
    ring: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30',
    label: 'Lagi jalan',
  },
  pending: {
    dot: 'bg-zinc-400 dark:bg-zinc-600',
    ring: 'bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-300 dark:ring-zinc-700',
    label: 'Antrian',
  },
};

const serviceTone: Record<string, string> = {
  online: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 ring-emerald-200 dark:ring-emerald-500/30',
  offline: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 ring-rose-200 dark:ring-rose-500/30',
  degraded: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 ring-amber-200 dark:ring-amber-500/30',
};

function StatusDot({ status }: { status: StatusItem['status'] }) {
  return (
    <span className="relative inline-flex h-2 w-2 items-center justify-center" aria-hidden>
      <span className={`absolute inline-flex h-full w-full rounded-full ${statusTone[status].dot}`} />
    </span>
  );
}

function ProgressBar({ value, status }: { value: number; status: StatusItem['status'] }) {
  const fill =
    status === 'done'
      ? 'bg-emerald-500'
      : status === 'in_progress'
        ? 'bg-amber-500'
        : 'bg-zinc-400 dark:bg-zinc-600';
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800/80">
      <div
        className={`h-full rounded-full ${fill} transition-[width] duration-700 ease-out`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        aria-label={`${value}%`}
      />
    </div>
  );
}

function ServiceBadge({ name, state }: { name: string; state: string }) {
  const tone = serviceTone[state] ?? 'text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 ring-zinc-200 dark:ring-zinc-700';
  return (
    <li className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ring-1 ${tone}`}>
      <span className="text-[11px] font-medium uppercase tracking-[0.16em] opacity-80">{name}</span>
      <span className="flex items-center gap-2 text-sm font-semibold">
        <span
          className={`inline-flex h-1.5 w-1.5 rounded-full ${
            state === 'online' ? 'bg-emerald-500' : state === 'offline' ? 'bg-rose-500' : 'bg-amber-500'
          } ${state === 'online' ? 'animate-pulse' : ''}`}
        />
        {state}
      </span>
    </li>
  );
}

function parseLogLine(line: string) {
  const match = /^(\d{4}-\d{2}-\d{2}T[\d:.+\-Z]+)\s+\[(FE|BE|GLOBAL)\]\s+(.*)$/.exec(line);
  if (!match) return null;
  return { ts: match[1] ?? '', lane: match[2] ?? 'GLOBAL', msg: match[3] ?? line };
}

function LogFeed({ initialLines }: { initialLines: string[] }) {
  const [lines, setLines] = useState<string[]>(initialLines);

  useEffect(() => {
    let cancelled = false;
    const seenTs = new Set(initialLines);

    async function tick() {
      const fresh = await fetchLogs();
      if (cancelled || !fresh.length) return;
      const sliced = fresh.slice(-200);
      const newLines = sliced.filter((l) => !seenTs.has(l));
      if (newLines.length > 0) {
        for (const l of newLines) seenTs.add(l);
        setLines(sliced);
      }
    }

    const id = setInterval(tick, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [initialLines]);

  if (lines.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400">
        Belum ada log. Tiap saya push commit / build / restart / live verify, satu baris akan masuk
        ke sini.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[inset_0_1px_0_rgba(0,0,0,0.02)] dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/60">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          Activity log
        </h2>
        <span className="font-mono text-[11px] text-zinc-500">
          {lines.length} baris · live
        </span>
      </div>
      <div className="h-[260px] overflow-y-auto px-4 py-3 font-mono text-[11.5px] leading-relaxed">
        {lines.map((raw, idx) => {
          const parsed = parseLogLine(raw);
          if (!parsed) {
            return (
              <div key={`raw-${idx}`} className="flex gap-3 text-zinc-500 dark:text-zinc-400">
                <span className="w-12 shrink-0 text-right text-zinc-400 dark:text-zinc-600">·</span>
                <span className="whitespace-pre-wrap break-words">{raw}</span>
              </div>
            );
          }
          const laneTone =
            parsed.lane === 'FE'
              ? 'text-amber-700 dark:text-amber-300'
              : parsed.lane === 'BE'
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-zinc-500';
          return (
            <div key={`${parsed.ts}-${idx}`} className="flex gap-2.5">
              <span className="w-[68px] shrink-0 truncate text-right text-zinc-400 dark:text-zinc-600">
                {parsed.ts.split('T')[1]?.slice(0, 8) ?? parsed.ts}
              </span>
              <span className={`w-10 shrink-0 ${laneTone}`}>[{parsed.lane}]</span>
              <span className="whitespace-pre-wrap break-words text-zinc-800 dark:text-zinc-200">
                {parsed.msg}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CommitPanel({ title, commits, accent }: { title: string; commits: string[]; accent: 'amber' | 'emerald' }) {
  const ring =
    accent === 'amber'
      ? 'border-amber-200/60 dark:border-amber-500/20 bg-amber-50/40 dark:bg-amber-500/5'
      : 'border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-500/5';
  return (
    <section className={`flex flex-col gap-2.5 rounded-xl border px-4 py-3 ${ring}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-700 dark:text-zinc-300">
          {title}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {commits.length} recent
        </span>
      </div>
      <ol className="flex flex-col gap-1.5">
        {commits.slice(0, 3).map((commit, idx) => {
          const [hash, ...rest] = commit.split(' ');
          const tag = accent === 'amber' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300';
          return (
            <li key={commit} className="flex items-start gap-2 text-[11.5px] leading-snug">
              <span className={`mt-0.5 select-none rounded px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ${tag}`}>
                {idx + 1}
              </span>
              <span className="font-mono text-zinc-500 dark:text-zinc-500">{hash}</span>
              <span className="text-zinc-700 dark:text-zinc-300">{rest.join(' ')}</span>
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
    <li className="flex flex-col gap-1.5 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[12.5px] text-zinc-800 dark:text-zinc-100">
          <StatusDot status={item.status} />
          <span className="leading-tight">{item.label}</span>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider ring-1 ${tone.ring}`}>
          {tone.label}
        </span>
      </div>
      <ProgressBar value={item.percent} status={item.status} />
      <div className="flex items-center justify-between font-mono text-[10.5px] text-zinc-500">
        <span>{item.percent}% complete</span>
        <span>
          <span className="text-amber-700 dark:text-amber-300">{item.percent.toString().padStart(2, '0')}</span>
          <span className="px-1 text-zinc-400 dark:text-zinc-600">/</span>
          <span>100</span>
        </span>
      </div>
    </li>
  );
}

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('lembar-theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
      return;
    }
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initial = prefersDark ? 'dark' : 'light';
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lembar-theme', next);
    }
  }

  return { theme, toggle };
}

function ThemeToggle({ theme, onToggle }: { theme: 'light' | 'dark'; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-md border border-zinc-300 bg-white px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}

export function StatusBoard({ doc, initialLogs }: { doc: StatusDoc | null; initialLogs: string[] }) {
  const [latest, setLatest] = useState<StatusDoc | null>(doc);
  const [pulse, setPulse] = useState<number>(0);
  const { theme, toggle } = useTheme();

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
      <div className="flex h-[100dvh] w-screen items-center justify-center bg-zinc-50 px-6 text-center dark:bg-zinc-950">
        <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
          Belum ada snapshot. Begitu saya commit perubahan pertama ke{' '}
          <code className="font-mono text-amber-700 dark:text-amber-300">lembar-live-status.json</code>,
          halaman ini akan otomatis muncul.
        </p>
      </div>
    );
  }

  const connected =
    latest.services.lembarApi === 'online' &&
    latest.services.lembarFrontend === 'online' &&
    latest.services.lembarWorker === 'online';

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* LEFT: status & progress */}
        <section className="flex h-full min-h-0 flex-col gap-4 overflow-hidden px-5 py-5 lg:border-r lg:border-zinc-200 lg:px-7 lg:py-6 dark:lg:border-zinc-800">
          <header className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-1.5 w-1.5 rounded-full ${
                    connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                  Progress kerja live
                </p>
              </div>
              <h1 className="text-2xl font-semibold leading-[1.05] tracking-tight text-zinc-900 lg:text-[32px] dark:text-zinc-50">
                {latest.phase}.
              </h1>
              <p className="max-w-xl text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                {latest.headline}
              </p>
            </div>
            <ThemeToggle theme={theme} onToggle={toggle} />
          </header>

          <div className="flex shrink-0 items-end justify-between rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex flex-col gap-1">
              <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                Overall progress
              </span>
              <span className="text-[12.5px] text-zinc-600 dark:text-zinc-400">
                Dikerjakan: <span className="text-zinc-900 dark:text-zinc-100">{latest.currentTask}</span>
              </span>
            </div>
            <span className="font-mono text-5xl font-semibold tabular-nums leading-none text-emerald-700 lg:text-6xl dark:text-emerald-300">
              {latest.overallPercent.toString().padStart(2, '0')}
              <span className="text-base text-zinc-400 dark:text-zinc-600">%</span>
            </span>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                Antrian kerja
              </h2>
              <span className="font-mono text-[10.5px] text-zinc-500">
                {latest.items.filter((i) => i.status === 'done').length} / {latest.items.length} done
              </span>
            </div>
            <ul className="grid flex-1 grid-cols-1 auto-rows-min gap-2 overflow-y-auto pr-1 md:grid-cols-2">
              {latest.items.map((item) => (
                <ItemRow key={item.label} item={item} />
              ))}
            </ul>
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                PM2 services
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                live
              </span>
            </div>
            <ul className="grid grid-cols-3 gap-2">
              <ServiceBadge name="lembar-api" state={latest.services.lembarApi} />
              <ServiceBadge name="lembar-frontend" state={latest.services.lembarFrontend} />
              <ServiceBadge name="lembar-worker" state={latest.services.lembarWorker} />
            </ul>
          </section>
        </section>

        {/* RIGHT: activity log + commits + notes */}
        <section className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto px-5 py-5 lg:px-7 lg:py-6">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                Terakhir diperbarui
              </p>
              <code className="mt-1 inline-block rounded-md border border-zinc-200 bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
                {latest.updatedAt}
              </code>
            </div>
            <span className="font-mono text-[10.5px] text-zinc-500">
              poll #{pulse.toString().padStart(3, '0')}
            </span>
          </header>

          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                Activity log (FE + BE)
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">live / tail</span>
            </div>
            <LogFeed initialLines={initialLogs} />
          </section>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <CommitPanel title="Backend origin/dev" commits={latest.latestBackendCommits} accent="emerald" />
            <CommitPanel title="Frontend origin/dev" commits={latest.latestFrontendCommits} accent="amber" />
          </section>

          <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
              <h2 className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.22em] text-zinc-500">Alur otomatis</h2>
              <dl className="space-y-2 text-[12.5px]">
                <div><dt className="text-zinc-500">Mode</dt><dd>{latest.workMode ?? 'Lanjut otomatis sampai blocker material'}</dd></div>
                <div><dt className="text-zinc-500">Mulai</dt><dd className="font-mono text-[11px]">{latest.startedAt ?? '—'}</dd></div>
                <div><dt className="text-zinc-500">Setelah ini</dt><dd>{latest.nextAction ?? 'Ambil item pending berikutnya'}</dd></div>
              </dl>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
              <h2 className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.22em] text-zinc-500">Blocker & bukti</h2>
              <p className="text-[12.5px] text-zinc-700 dark:text-zinc-300">
                {(latest.blockers?.length ?? 0) > 0 ? latest.blockers?.join(' · ') : 'Tidak ada blocker.'}
              </p>
              {(latest.evidence?.length ?? 0) > 0 && (
                <ul className="mt-2 space-y-1 font-mono text-[10.5px] text-zinc-500">
                  {latest.evidence?.slice(0, 4).map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
            <h2 className="mb-2 text-[10.5px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              Catatan
            </h2>
            <ul className="space-y-1.5 text-[12.5px] text-zinc-700 dark:text-zinc-300">
              {latest.notes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                  <span className="leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          </section>

          <footer className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
            <span>Lembar · Internal</span>
            <span>polling 4s</span>
          </footer>
        </section>
      </div>
    </div>
  );
}
