'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { LiveStatusDoc } from '@/lib/ops/liveStatus';

type ActivityItem = LiveStatusDoc['activity'][number] | string;

const STATUS_URL = '/live-status/status.json';
const ACTIVITY_URL = '/live-status/activity.json';
const POLL_MS = 4000;
const JAKARTA = 'Asia/Jakarta';

function formatWib(value: string | null | undefined) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: JAKARTA,
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date);
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return 'baru mulai';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}j ${minutes}m`;
  return `${minutes} menit`;
}

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

async function fetchStatus(): Promise<LiveStatusDoc | null> {
  try {
    const response = await fetch(STATUS_URL, { cache: 'no-store' });
    if (!response.ok) return null;
    return (await response.json()) as LiveStatusDoc;
  } catch {
    return null;
  }
}

async function fetchActivity() {
  try {
    const response = await fetch(ACTIVITY_URL, { cache: 'no-store' });
    if (!response.ok) return [];
    const json = (await response.json()) as { lines?: string[] };
    return json.lines ?? [];
  } catch {
    return [];
  }
}

function Header({ doc, pollCount, connected }: { doc: LiveStatusDoc; pollCount: number; connected: boolean }) {
  return (
    <section className="rounded-3xl bg-zinc-950 px-5 py-5 text-zinc-50 shadow-xl shadow-zinc-950/20 sm:px-6 lg:px-8 lg:py-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-400">Lembar Release Candidate</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{doc.board.status}</h1>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
              {doc.progress.completedPoints}/{doc.progress.totalPoints} story points
            </span>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-zinc-300">{doc.headline}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
          <HeaderMetric label="Overall progress" value={`${doc.progress.percent}%`} />
          <HeaderMetric label="Task done" value={`${doc.progress.doneTasks}/${doc.progress.totalTasks}`} />
          <HeaderMetric label="Generated" value={formatWib(doc.generatedAt)} compact />
          <HeaderMetric label="Poll" value={`#${pollCount.toString().padStart(3, '0')}`} tone={connected ? 'good' : 'warn'} />
        </div>
      </div>
    </section>
  );
}

function HeaderMetric({ label, value, compact = false, tone }: { label: string; value: string; compact?: boolean; tone?: 'good' | 'warn' }) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-white/10 bg-white/5 px-3 py-3',
        tone === 'good' && 'bg-emerald-500/10',
        tone === 'warn' && 'bg-amber-500/10',
      )}
    >
      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">{label}</div>
      <div className={cx('mt-1 font-semibold text-zinc-50', compact ? 'text-sm leading-5' : 'text-lg')}>{value}</div>
    </div>
  );
}

function Stepper({ steps }: { steps: LiveStatusDoc['current']['steps'] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
      {steps.map((step) => (
        <div
          key={step.label}
          className={cx(
            'rounded-2xl px-3 py-3 text-sm',
            step.state === 'completed' && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
            step.state === 'running' && 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
            step.state === 'pending' && 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200',
          )}
        >
          <div className="text-[10px] uppercase tracking-[0.18em]">{step.state}</div>
          <div className="mt-1 font-medium">{step.label}</div>
        </div>
      ))}
    </div>
  );
}

function CurrentTaskCard({ doc }: { doc: LiveStatusDoc }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 sm:p-6">
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Current task</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-900">{doc.current.externalId}</h2>
          <p className="mt-1 text-sm text-zinc-600">{doc.current.title}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <InfoCard label="Phase" value={doc.current.phase} />
          <InfoCard label="Progress" value={`${doc.current.progress}%`} />
          <InfoCard label="Worker" value={doc.current.worker} />
          <InfoCard label="Working for" value={formatDuration(doc.current.workingForSeconds)} />
          <InfoCard label="Current action" value={doc.current.currentAction} />
          <InfoCard label="Next required gate" value={doc.current.nextRequiredGate} />
        </div>

        <div className="rounded-2xl bg-zinc-50 px-4 py-3 ring-1 ring-zinc-200">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Latest evidence</div>
          <div className="mt-1 text-sm text-zinc-800">{doc.current.latestEvidence}</div>
        </div>

        <Stepper steps={doc.current.steps} />
      </div>
    </section>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 px-4 py-3 ring-1 ring-zinc-200">
      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-zinc-900">{value}</div>
    </div>
  );
}

function ReadinessCard({ doc }: { doc: LiveStatusDoc }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">RC readiness</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-900">Empat area utama</h2>
        </div>
        <span className="text-xs text-zinc-500">evidence only</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {doc.readiness.map((item) => (
          <div key={item.label} className="rounded-2xl bg-zinc-50 px-4 py-4 ring-1 ring-zinc-200">
            <div className="text-sm font-medium text-zinc-900">{item.label}</div>
            <div className="mt-3 h-2 rounded-full bg-zinc-200">
              <div className="h-2 rounded-full bg-zinc-900 transition-all" style={{ width: `${Math.min(100, Math.max(0, item.percent))}%` }} />
            </div>
            <div className="mt-2 text-sm text-zinc-600">{item.percent}%</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CriticalFlowCard({ doc }: { doc: LiveStatusDoc }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 sm:p-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Critical flow</p>
        <h2 className="mt-2 text-lg font-semibold text-zinc-900">Generate → Worker → PostgreSQL → Status → Review → Output</h2>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {doc.criticalFlow.map((node) => (
          <div key={node.label} className="rounded-2xl bg-zinc-50 px-4 py-4 ring-1 ring-zinc-200">
            <div className="text-sm font-medium text-zinc-900">{node.label}</div>
            <div className={cx(
              'mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
              node.status === 'Passed' && 'bg-emerald-100 text-emerald-700',
              node.status === 'In Progress' && 'bg-amber-100 text-amber-700',
              node.status === 'Blocked' && 'bg-rose-100 text-rose-700',
              node.status === 'Failed' && 'bg-rose-100 text-rose-700',
              node.status === 'Not Tested' && 'bg-zinc-200 text-zinc-600',
            )}>
              {node.status}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function WorkerCards({ workers }: { workers: LiveStatusDoc['workers'] }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 sm:p-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Active workers</p>
        <h2 className="mt-2 text-lg font-semibold text-zinc-900">Worker health terpisah dari progress</h2>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {workers.map((worker) => (
          <div key={`${worker.profile}-${worker.sessionId}`} className="rounded-2xl bg-zinc-50 px-4 py-4 ring-1 ring-zinc-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-zinc-900">{worker.profile}</div>
                <div className="mt-1 text-sm text-zinc-600">{worker.currentTask}</div>
              </div>
              <span className={cx(
                'rounded-full px-2.5 py-1 text-xs font-medium',
                worker.state === 'ACTIVE' && 'bg-emerald-100 text-emerald-700',
                worker.state === 'STALE' && 'bg-amber-100 text-amber-700',
                worker.state === 'LOST' && 'bg-rose-100 text-rose-700',
                worker.state === 'IDLE' && 'bg-zinc-200 text-zinc-600',
              )}>{worker.state}</span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm text-zinc-700">
              <div><dt className="text-zinc-500">Current action</dt><dd>{worker.currentAction}</dd></div>
              <div><dt className="text-zinc-500">Heartbeat</dt><dd>{formatWib(worker.lastHeartbeat)}</dd></div>
              <div><dt className="text-zinc-500">Elapsed</dt><dd>{formatDuration(worker.elapsedSeconds)}</dd></div>
              <div><dt className="text-zinc-500">Session</dt><dd className="font-mono text-xs">{worker.sessionId}</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}

function SimpleCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 sm:p-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">{title}</p>
        <h2 className="mt-2 text-lg font-semibold text-zinc-900">{subtitle}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function QualityGates({ gates }: { gates: LiveStatusDoc['qualityGates'] }) {
  return (
    <SimpleCard title="Quality gates" subtitle="Checklist evidence RC">
      <div className="grid gap-3 md:grid-cols-2">
        {gates.map((gate) => (
          <div key={gate.label} className="rounded-2xl bg-zinc-50 px-4 py-4 ring-1 ring-zinc-200">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm font-medium text-zinc-900">{gate.label}</div>
              <span className={cx(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                gate.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-600',
              )}>{gate.passed ? 'Passed' : 'Pending'}</span>
            </div>
            <div className="mt-2 text-xs text-zinc-500">{formatWib(gate.timestamp)}</div>
            <div className="mt-2 text-sm text-zinc-700">{gate.evidence}</div>
          </div>
        ))}
      </div>
    </SimpleCard>
  );
}

function DeployCards({ deployments }: { deployments: LiveStatusDoc['deployments'] }) {
  return (
    <SimpleCard title="Deploy" subtitle="PM2 + deployment state">
      <div className="grid gap-3 md:grid-cols-3">
        {deployments.map((deployment) => (
          <div key={deployment.service} className="rounded-2xl bg-zinc-50 px-4 py-4 ring-1 ring-zinc-200">
            <div className="text-sm font-medium text-zinc-900">{deployment.service}</div>
            <div className="mt-2 text-sm text-zinc-600">Status: {deployment.status}</div>
            <div className="text-sm text-zinc-600">Restart: {deployment.restartCount}</div>
            <div className="text-sm text-zinc-600">Uptime: {formatDuration(deployment.uptimeSeconds)}</div>
          </div>
        ))}
      </div>
    </SimpleCard>
  );
}

function WarningCard({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <SimpleCard title="Warnings" subtitle="Perlu perhatian">
      <div className="space-y-3">
        {warnings.map((warning) => (
          <div key={warning} className="rounded-2xl bg-rose-50 px-4 py-4 text-sm text-rose-800 ring-1 ring-rose-200">
            {warning}
          </div>
        ))}
      </div>
    </SimpleCard>
  );
}

function TaskBoard({ groups }: { groups: LiveStatusDoc['taskGroups'] }) {
  return (
    <SimpleCard title="Task board" subtitle="Status task ringkas">
      <div className="grid gap-4 xl:grid-cols-3">
        {Object.entries(groups).map(([group, tasks]) => (
          <div key={group} className="rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-900">{group}</div>
              <div className="text-xs text-zinc-500">{tasks.length}</div>
            </div>
            <div className="space-y-3">
              {tasks.length === 0 && <div className="text-sm text-zinc-500">Tidak ada task.</div>}
              {tasks.map((task) => (
                <div key={task.id} className="rounded-2xl bg-white px-3 py-3 ring-1 ring-zinc-200">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{task.externalId}</div>
                  <div className="mt-1 text-sm font-medium text-zinc-900">{task.label}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-600">
                    <div>Progress: {task.percent}%</div>
                    <div>Assignee: {task.assignee}</div>
                    <div>Phase: {task.phase}</div>
                    <div>Update: {formatWib(task.lastUpdate)}</div>
                  </div>
                  <div className="mt-2 text-xs text-zinc-600">Evidence: {task.latestEvidence}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SimpleCard>
  );
}

function ActivityFeed({ items }: { items: LiveStatusDoc['activity'] }) {
  const [collapsed, setCollapsed] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousTopId = useRef<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (items[0]?.id && items[0].id !== previousTopId.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      previousTopId.current = items[0].id;
    }
  }, [items]);

  return (
    <SimpleCard title="Activity" subtitle="Event penting terbaru">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm text-zinc-600">Heartbeat disembunyikan dari feed utama.</div>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200"
        >
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>
      {!collapsed && (
        <div ref={containerRef} className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <details key={item.id} className="rounded-2xl bg-zinc-50 px-4 py-4 ring-1 ring-zinc-200" open={false}>
              <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{item.type}</div>
                    <div className="mt-1 text-sm font-medium text-zinc-900">{item.summary}</div>
                  </div>
                  <div className="text-xs text-zinc-500">{formatWib(item.timestamp)}</div>
                </div>
              </summary>
              {item.details && <pre className="mt-3 overflow-x-auto rounded-xl bg-white p-3 text-xs text-zinc-700 ring-1 ring-zinc-200">{item.details}</pre>}
            </details>
          ))}
        </div>
      )}
    </SimpleCard>
  );
}

export function LiveStatusBoard({ initialDoc, initialActivity }: { initialDoc: LiveStatusDoc | null; initialActivity: ActivityItem[] }) {
  const [doc, setDoc] = useState<LiveStatusDoc | null>(initialDoc);
  const [pollCount, setPollCount] = useState(0);
  const [connected, setConnected] = useState(Boolean(initialDoc));
  const [activity, setActivity] = useState<LiveStatusDoc['activity']>(Array.isArray(initialActivity) && initialDoc ? initialDoc.activity : []);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const [nextDoc, nextActivity] = await Promise.all([fetchStatus(), fetchActivity()]);
      if (cancelled) return;
      setPollCount((value) => value + 1);
      setConnected(Boolean(nextDoc));
      if (nextDoc) setDoc(nextDoc);
      if (nextDoc?.activity?.length) {
        setActivity(nextDoc.activity);
      } else if (Array.isArray(nextActivity) && nextActivity.length > 0) {
        setActivity(
          nextActivity.map((line, index) => ({
            id: `line-${index}-${line}`,
            timestamp: new Date().toISOString(),
            actor: 'system',
            taskId: 'unknown',
            type: 'log',
            summary: line,
            details: '',
          })),
        );
      }
    };
    const id = window.setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const safeDoc = useMemo(() => doc, [doc]);

  if (!safeDoc) {
    return (
      <main className="min-h-screen bg-zinc-100 px-4 py-6 text-zinc-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white p-8 text-center ring-1 ring-zinc-200">
          <h1 className="text-2xl font-semibold">/live-status belum punya data</h1>
          <p className="mt-3 text-sm text-zinc-600">Endpoint durable belum mengembalikan dokumen status.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-6 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <Header doc={safeDoc} pollCount={pollCount} connected={connected} />
        <CurrentTaskCard doc={safeDoc} />
        <ReadinessCard doc={safeDoc} />
        <CriticalFlowCard doc={safeDoc} />
        <div className="grid gap-5 xl:grid-cols-2">
          <WorkerCards workers={safeDoc.workers} />
          <QualityGates gates={safeDoc.qualityGates} />
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <DeployCards deployments={safeDoc.deployments} />
          <WarningCard warnings={safeDoc.warnings} />
        </div>
        <TaskBoard groups={safeDoc.taskGroups} />
        <ActivityFeed items={activity} />
      </div>
    </main>
  );
}
