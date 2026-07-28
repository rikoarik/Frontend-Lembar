'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { LiveStatusDoc } from '@/lib/ops/liveStatus';

type ActivityItem = LiveStatusDoc['activity'][number];

const STATUS_URL = '/live-status/status.json';
const POLL_MS = 4000;
const WIB = 'Asia/Jakarta';
const SIDEBAR_KEY = 'lembar.live-status.section';

type SectionId = 'overview' | 'kanban' | 'workers' | 'quality' | 'deployments' | 'activity';

const SECTION_NAV: Array<{ id: SectionId; label: string; helper: string }> = [
  { id: 'overview', label: 'Overview', helper: 'Status RC + KPI utama' },
  { id: 'kanban', label: 'Kanban', helper: 'Backlog · Running · Review · QA · Done' },
  { id: 'workers', label: 'Workers', helper: 'Heartbeat + session' },
  { id: 'quality', label: 'Tests & QA', helper: 'Quality gates + smoke' },
  { id: 'deployments', label: 'Deployments', helper: 'PM2 + restart' },
  { id: 'activity', label: 'Activity', helper: 'Event real-time' },
];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function formatWib(value: string | null | undefined, includeSeconds = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: WIB,
    dateStyle: 'medium',
    timeStyle: includeSeconds ? 'medium' : 'short',
  }).format(date);
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return 'baru mulai';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}j ${minutes}m`;
  return `${minutes} menit`;
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

function Sidebar({ active, onChange, collapsed, onToggle }: {
  active: SectionId;
  onChange: (section: SectionId) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside
      className={cx(
        'flex h-full flex-col border-r border-zinc-200 bg-zinc-50 text-zinc-700 transition-all duration-200',
        collapsed ? 'w-16' : 'w-64',
        'lg:sticky lg:top-0 lg:h-screen',
      )}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <div className={cx('flex items-center gap-2', collapsed && 'justify-center')}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-zinc-50 text-sm font-semibold">LR</span>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-zinc-900">Lembar RC</div>
              <div className="text-xs text-zinc-500">Admin dashboard</div>
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={onToggle}
          className="hidden rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 lg:inline-flex"
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {SECTION_NAV.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            className={cx(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors',
              active === section.id
                ? 'bg-zinc-900 text-zinc-50 shadow-sm'
                : 'text-zinc-700 hover:bg-zinc-200/70',
              collapsed && 'justify-center px-2',
            )}
          >
            <span className={cx('inline-flex h-2 w-2 rounded-full', active === section.id ? 'bg-emerald-400' : 'bg-zinc-400')} />
            {!collapsed && (
              <span className="flex flex-col">
                <span className="font-medium">{section.label}</span>
                <span className="text-xs text-zinc-500">{section.helper}</span>
              </span>
            )}
          </button>
        ))}
      </nav>
      {!collapsed && (
        <div className="px-4 py-4 text-xs text-zinc-500">
          <div>Last update: {formatWib(new Date().toISOString())}</div>
          <div>Timezone: Asia/Jakarta (WIB)</div>
        </div>
      )}
    </aside>
  );
}

function MobileNav({ active, onChange }: { active: SectionId; onChange: (section: SectionId) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-2 lg:hidden">
      {SECTION_NAV.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => onChange(section.id)}
          className={cx(
            'rounded-full border px-3 py-1.5 text-xs',
            active === section.id
              ? 'border-zinc-900 bg-zinc-900 text-zinc-50'
              : 'border-zinc-200 bg-white text-zinc-700',
          )}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}

function Topbar({ doc, pollCount, connected, onRefresh, section }: {
  doc: LiveStatusDoc | null;
  pollCount: number;
  connected: boolean;
  onRefresh: () => void;
  section: SectionId;
}) {
  const title = SECTION_NAV.find((item) => item.id === section)?.label ?? 'Overview';
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Lembar Release Candidate</p>
        <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className={cx(
          'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
          connected
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-rose-200 bg-rose-50 text-rose-700',
        )}>
          <span className={cx('h-2 w-2 rounded-full', connected ? 'bg-emerald-500' : 'bg-rose-500')} />
          {connected ? `Terhubung · poll #${pollCount}` : 'Tidak terhubung'}
        </span>
        <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700">
          {formatWib(doc?.generatedAt)} WIB
        </span>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-full border border-zinc-900 bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-50 hover:bg-zinc-700"
        >
          Refresh
        </button>
      </div>
    </header>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-zinc-900">{value}</div>
      {sub && <div className="mt-2 text-sm text-zinc-600">{sub}</div>}
    </div>
  );
}

function Stepper({ steps }: { steps: LiveStatusDoc['current']['steps'] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step.label} className="flex items-start gap-3">
          <span className={cx(
            'mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
            step.state === 'completed' && 'bg-emerald-100 text-emerald-700',
            step.state === 'running' && 'bg-amber-100 text-amber-700',
            step.state === 'pending' && 'bg-zinc-100 text-zinc-500',
          )}>
            {step.state === 'completed' ? '✓' : step.state === 'running' ? '•' : index + 1}
          </span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-900">{step.label}</span>
              <span className={cx(
                'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]',
                step.state === 'completed' && 'bg-emerald-100 text-emerald-700',
                step.state === 'running' && 'bg-amber-100 text-amber-700',
                step.state === 'pending' && 'bg-zinc-100 text-zinc-500',
              )}>{step.state}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-zinc-100">
              <div className={cx(
                'h-1.5 rounded-full',
                step.state === 'completed' && 'bg-emerald-500',
                step.state === 'running' && 'bg-amber-500',
                step.state === 'pending' && 'bg-zinc-200',
              )} style={{ width: step.state === 'completed' ? '100%' : step.state === 'running' ? '50%' : '0%' }} />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function KpiOverview({ doc }: { doc: LiveStatusDoc }) {
  const qualityPassed = doc.qualityGates.filter((gate) => gate.passed).length;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="RC Progress" value={`${doc.progress.percent}%`} sub={`${doc.progress.completedPoints}/${doc.progress.totalPoints} story points`} />
      <KpiCard label="Task Aktif" value={`${doc.items.filter((item) => item.status === 'in_progress').length}`} sub={`${doc.progress.doneTasks}/${doc.progress.totalTasks} done`} />
      <KpiCard label="Worker Aktif" value={`${doc.workers.filter((worker) => worker.state === 'ACTIVE').length}`} sub={`${doc.workers.length} session`} />
      <KpiCard label="Quality Gates" value={`${qualityPassed}/${doc.qualityGates.length}`} sub="Evidence terkumpul" />
    </div>
  );
}

function ActiveTaskPanel({ doc }: { doc: LiveStatusDoc }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Task aktif</p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-900">{doc.current.externalId}</h2>
          <p className="text-sm text-zinc-600">{doc.current.title}</p>
        </div>
        <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-50">
          {doc.current.progress}%
        </span>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-zinc-50 px-3 py-3">
          <dt className="text-xs uppercase tracking-[0.16em] text-zinc-500">Phase</dt>
          <dd className="mt-1 text-sm text-zinc-900">{doc.current.phase}</dd>
        </div>
        <div className="rounded-xl bg-zinc-50 px-3 py-3">
          <dt className="text-xs uppercase tracking-[0.16em] text-zinc-500">Worker</dt>
          <dd className="mt-1 text-sm text-zinc-900">{doc.current.worker}</dd>
        </div>
        <div className="rounded-xl bg-zinc-50 px-3 py-3">
          <dt className="text-xs uppercase tracking-[0.16em] text-zinc-500">Bekerja sejak</dt>
          <dd className="mt-1 text-sm text-zinc-900">{formatDuration(doc.current.workingForSeconds)}</dd>
        </div>
        <div className="rounded-xl bg-zinc-50 px-3 py-3">
          <dt className="text-xs uppercase tracking-[0.16em] text-zinc-500">Current action</dt>
          <dd className="mt-1 text-sm text-zinc-900">{doc.current.currentAction}</dd>
        </div>
      </dl>
      <div className="mt-4 rounded-xl border border-zinc-200 bg-white px-4 py-3">
        <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Evidence terbaru</div>
        <div className="mt-1 text-sm text-zinc-800">{doc.current.latestEvidence}</div>
        <div className="mt-1 text-xs text-zinc-500">Next gate: {doc.current.nextRequiredGate}</div>
      </div>
      <div className="mt-5">
        <div className="mb-3 text-xs uppercase tracking-[0.16em] text-zinc-500">Step RC</div>
        <Stepper steps={doc.current.steps} />
      </div>
    </section>
  );
}

function KanbanCard({ task }: { task: LiveStatusDoc['items'][number] }) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <header className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">{task.externalId}</span>
        <span className="text-xs text-zinc-500">{task.percent}%</span>
      </header>
      <h3 className="mt-2 text-sm font-semibold text-zinc-900">{task.label}</h3>
      <dl className="mt-3 grid gap-2 text-xs text-zinc-600">
        <div className="flex justify-between"><dt>Assignee</dt><dd className="text-zinc-900">{task.assignee}</dd></div>
        <div className="flex justify-between"><dt>Phase</dt><dd className="text-zinc-900">{task.phase}</dd></div>
        <div className="flex justify-between"><dt>Update</dt><dd className="text-zinc-900">{formatWib(task.lastUpdate, true)} WIB</dd></div>
      </dl>
      <div className="mt-3 rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
        <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Evidence</div>
        <div className="mt-1">{task.latestEvidence}</div>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-zinc-100">
        <div className="h-1.5 rounded-full bg-zinc-900" style={{ width: `${Math.min(100, task.percent)}%` }} />
      </div>
    </article>
  );
}

function KanbanBoard({ groups }: { groups: LiveStatusDoc['taskGroups'] }) {
  const columns = [
    { id: 'Running', label: 'Running' },
    { id: 'Ready', label: 'Backlog' },
    { id: 'Review', label: 'Review' },
    { id: 'QA', label: 'QA' },
    { id: 'Done', label: 'Done' },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {columns.map((column) => {
        const items = groups[column.id] ?? [];
        return (
          <section key={column.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <header className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">{column.label}</h2>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-zinc-600">{items.length}</span>
            </header>
            <div className="mt-3 space-y-3">
              {items.length === 0 && <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-3 py-4 text-xs text-zinc-500">Tidak ada task.</div>}
              {items.map((task) => (
                <KanbanCard key={task.id} task={task} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function WorkerCard({ worker }: { worker: LiveStatusDoc['workers'][number] }) {
  const stateClass = {
    ACTIVE: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    STALE: 'border-amber-200 bg-amber-50 text-amber-700',
    LOST: 'border-rose-200 bg-rose-50 text-rose-700',
    IDLE: 'border-zinc-200 bg-zinc-100 text-zinc-600',
  } as const;
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">{worker.profile}</h3>
          <p className="text-xs text-zinc-600">{worker.currentTask}</p>
        </div>
        <span className={cx('rounded-full px-3 py-1 text-xs font-medium', stateClass[worker.state])}>{worker.state}</span>
      </header>
      <dl className="mt-3 grid gap-2 text-xs text-zinc-600 sm:grid-cols-2">
        <div className="rounded-xl bg-zinc-50 px-3 py-2"><dt className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Session</dt><dd className="font-mono text-xs text-zinc-900">{worker.sessionId}</dd></div>
        <div className="rounded-xl bg-zinc-50 px-3 py-2"><dt className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Heartbeat</dt><dd className="text-zinc-900">{formatWib(worker.lastHeartbeat, true)} WIB</dd></div>
        <div className="rounded-xl bg-zinc-50 px-3 py-2"><dt className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Elapsed</dt><dd className="text-zinc-900">{formatDuration(worker.elapsedSeconds)}</dd></div>
        <div className="rounded-xl bg-zinc-50 px-3 py-2"><dt className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Action</dt><dd className="text-zinc-900">{worker.currentAction}</dd></div>
      </dl>
    </article>
  );
}

function QualityPanel({ doc }: { doc: LiveStatusDoc }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Quality gates</h2>
          <span className="text-xs text-zinc-500">{doc.qualityGates.filter((gate) => gate.passed).length}/{doc.qualityGates.length} passed</span>
        </header>
        <ul className="mt-4 space-y-2">
          {doc.qualityGates.map((gate) => (
            <li key={gate.label} className="flex items-start gap-3 rounded-xl bg-zinc-50 px-3 py-3">
              <span className={cx('mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold',
                gate.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-600')}>
                {gate.passed ? '✓' : '–'}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900">{gate.label}</span>
                  <span className="text-xs text-zinc-500">{formatWib(gate.timestamp, true)} WIB</span>
                </div>
                <div className="mt-1 text-xs text-zinc-600">{gate.evidence}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Critical flow</h2>
          <span className="text-xs text-zinc-500">Pipeline RC</span>
        </header>
        <ul className="mt-4 space-y-3">
          {doc.criticalFlow.map((node) => (
            <li key={node.label} className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-3">
              <span className={cx('inline-flex h-2.5 w-2.5 rounded-full',
                node.status === 'Passed' && 'bg-emerald-500',
                node.status === 'In Progress' && 'bg-amber-500',
                node.status === 'Blocked' && 'bg-rose-500',
                node.status === 'Failed' && 'bg-rose-500',
                node.status === 'Not Tested' && 'bg-zinc-300',
              )} />
              <span className="text-sm font-medium text-zinc-900">{node.label}</span>
              <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs text-zinc-700">{node.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DeploymentsPanel({ doc }: { doc: LiveStatusDoc }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {doc.deployments.map((deployment) => (
        <article key={deployment.service} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900">{deployment.service}</h3>
          <dl className="mt-3 grid gap-2 text-xs text-zinc-600">
            <div className="flex justify-between"><dt>Status</dt><dd className={cx('font-medium', deployment.status === 'online' ? 'text-emerald-700' : 'text-rose-700')}>{deployment.status}</dd></div>
            <div className="flex justify-between"><dt>Uptime</dt><dd className="text-zinc-900">{formatDuration(deployment.uptimeSeconds)}</dd></div>
            <div className="flex justify-between"><dt>Restart</dt><dd className={cx('font-medium', deployment.restartCount >= 50 ? 'text-rose-700' : 'text-zinc-900')}>{deployment.restartCount}</dd></div>
          </dl>
        </article>
      ))}
    </div>
  );
}

function ActivityPanel({ items }: { items: ActivityItem[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastTopId = useRef<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (items[0]?.id && items[0].id !== lastTopId.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      lastTopId.current = items[0].id;
    }
  }, [items]);

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Activity terbaru</h2>
          <p className="text-xs text-zinc-500">Heartbeat duplikat disembunyikan. Auto-scroll ke atas saat event masuk.</p>
        </div>
        <span className="text-xs text-zinc-500">{items.length} event</span>
      </header>
      <div ref={containerRef} className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-1">
        {items.length === 0 && <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">Belum ada event.</div>}
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <header className="flex items-center justify-between text-xs text-zinc-500">
              <span className="font-medium uppercase tracking-[0.14em]">{item.type}</span>
              <span>{formatWib(item.timestamp, true)} WIB</span>
            </header>
            <p className="mt-2 text-sm text-zinc-900">{item.summary}</p>
            <p className="mt-1 text-xs text-zinc-500">{item.actor} · {item.taskId}</p>
            {item.details && (
              <details className="mt-2 text-xs text-zinc-700">
                <summary className="cursor-pointer text-[11px] uppercase tracking-[0.16em] text-zinc-500">Detail teknis</summary>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-2 text-[11px] text-zinc-700 ring-1 ring-zinc-200">{item.details}</pre>
              </details>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function OverviewSection({ doc }: { doc: LiveStatusDoc }) {
  return (
    <div className="space-y-5">
      <KpiOverview doc={doc} />
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2"><ActiveTaskPanel doc={doc} /></div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Worker snapshot</h2>
          <ul className="mt-3 space-y-2">
            {doc.workers.length === 0 && <li className="rounded-xl bg-zinc-50 px-3 py-3 text-sm text-zinc-500">Belum ada worker aktif.</li>}
            {doc.workers.map((worker) => (
              <li key={`${worker.profile}-${worker.sessionId}`} className="rounded-xl bg-zinc-50 px-3 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900">{worker.profile}</span>
                  <span className="text-xs text-zinc-500">{worker.state}</span>
                </div>
                <div className="mt-1 text-xs text-zinc-600">{worker.currentTask}</div>
                <div className="mt-1 text-xs text-zinc-500">Heartbeat: {formatWib(worker.lastHeartbeat, true)} WIB</div>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl bg-zinc-900 px-4 py-3 text-zinc-50">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-300">Warnings</div>
            {doc.warnings.length === 0 ? (
              <p className="mt-1 text-sm">Tidak ada warning aktif.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {doc.warnings.map((warning) => <li key={warning}>• {warning}</li>)}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LiveStatusBoard({ initialDoc, initialActivity }: { initialDoc: LiveStatusDoc | null; initialActivity: ActivityItem[] }) {
  const [doc, setDoc] = useState<LiveStatusDoc | null>(initialDoc);
  const [pollCount, setPollCount] = useState(0);
  const [connected, setConnected] = useState(Boolean(initialDoc));
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity);
  const [section, setSection] = useState<SectionId>(() => {
    if (typeof window === 'undefined') return 'overview';
    const stored = window.localStorage.getItem(SIDEBAR_KEY) as SectionId | null;
    return stored ?? 'overview';
  });
  const [collapsed, setCollapsed] = useState(false);

  const refresh = useRef(async () => {
    const next = await fetchStatus();
    setPollCount((value) => value + 1);
    setConnected(Boolean(next));
    if (next) {
      setDoc(next);
      setActivity(next.activity);
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SIDEBAR_KEY, section);
    }
  }, [section]);

  useEffect(() => {
    const id = window.setInterval(() => {
      refresh.current();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  const safeDoc = useMemo(() => doc, [doc]);

  if (!safeDoc) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 text-zinc-900">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">/live-status belum punya data</h1>
          <p className="mt-2 text-sm text-zinc-600">Endpoint durable belum mengembalikan dokumen status.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-100 text-zinc-900">
      <Sidebar
        active={section}
        onChange={setSection}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          doc={safeDoc}
          pollCount={pollCount}
          connected={connected}
          onRefresh={() => refresh.current()}
          section={section}
        />
        <MobileNav active={section} onChange={setSection} />
        <main className="flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {section !== 'overview' && <ActiveTaskPanel doc={safeDoc} />}
          {section === 'overview' && <OverviewSection doc={safeDoc} />}
          {section === 'kanban' && <KanbanBoard groups={safeDoc.taskGroups} />}
          {section === 'workers' && (
            <div className="grid gap-4 md:grid-cols-2">
              {safeDoc.workers.length === 0 && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500">Belum ada worker aktif.</div>
              )}
              {safeDoc.workers.map((worker) => (
                <WorkerCard key={`${worker.profile}-${worker.sessionId}`} worker={worker} />
              ))}
            </div>
          )}
          {section === 'quality' && <QualityPanel doc={safeDoc} />}
          {section === 'deployments' && <DeploymentsPanel doc={safeDoc} />}
          {section === 'activity' && <ActivityPanel items={activity} />}
        </main>
      </div>
    </div>
  );
}