import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const HOME = process.env.HOME || '/home/hermes';
const BOARD_NAME = process.env.HERMES_KANBAN_BOARD || 'lembar';
const BOARD_DB =
  process.env.HERMES_KANBAN_DB ||
  path.join(HOME, '.hermes', 'kanban', 'boards', BOARD_NAME, 'kanban.db');
const FRONTEND_REPO = process.env.LEMBAR_FRONTEND_REPO || process.cwd();
const BACKEND_REPO =
  process.env.LEMBAR_BACKEND_REPO || path.join(HOME, 'Projects', 'Backend-Lembar');
const ACTIVITY_LOG = path.join(HOME, 'Workspace', 'Deliverables', 'lembar-activity.log');

type ItemStatus = 'done' | 'in_progress' | 'pending';
type WorkerState = 'ACTIVE' | 'STALE' | 'LOST' | 'IDLE';
type FlowState = 'Passed' | 'In Progress' | 'Blocked' | 'Not Tested' | 'Failed';
type GateState = 'completed' | 'running' | 'pending';

type TaskRow = {
  id: string;
  title: string;
  body: string | null;
  assignee: string | null;
  status: string;
  priority: number;
  created_at: number;
  started_at: number | null;
  completed_at: number | null;
  last_heartbeat_at: number | null;
  result: string | null;
  workspace_path: string | null;
  branch_name: string | null;
  worker_pid: number | null;
  last_failure_error: string | null;
};

type EventRow = {
  task_id: string;
  kind: string;
  payload: string | null;
  created_at: number;
};

type Pm2Process = {
  name?: string;
  pm2_env?: {
    status?: string;
    pm_uptime?: number;
    restart_time?: number;
  };
  pid?: number;
};

export type LiveStatusItem = {
  id: string;
  externalId: string;
  label: string;
  status: ItemStatus;
  percent: number;
  storyPoints: number;
  assignee: string;
  phase: string;
  latestEvidence: string;
  dependency: string;
  lastUpdate: string | null;
};

export type LiveStatusDoc = {
  generatedAt: string;
  updatedAt: string;
  workMode: string;
  phase: string;
  headline: string;
  overallPercent: number;
  currentTask: string;
  nextAction: string;
  blockers: string[];
  evidence: string[];
  items: LiveStatusItem[];
  latestBackendCommits: string[];
  latestFrontendCommits: string[];
  services: {
    lembarApi: 'online' | 'offline' | 'degraded' | 'unknown';
    lembarFrontend: 'online' | 'offline' | 'degraded' | 'unknown';
    lembarWorker: 'online' | 'offline' | 'degraded' | 'unknown';
  };
  notes: string[];
  board: { id: string; name: string; status: 'In Progress' | 'Blocked' | 'Verifying' | 'Ready' };
  progress: {
    percent: number;
    completedPoints: number;
    totalPoints: number;
    doneTasks: number;
    totalTasks: number;
    formula: string;
  };
  current: {
    id: string;
    externalId: string;
    title: string;
    phase: string;
    progress: number;
    worker: string;
    workingForSeconds: number;
    currentAction: string;
    latestEvidence: string;
    nextRequiredGate: string;
    steps: Array<{ label: string; state: GateState }>;
  };
  readiness: Array<{ label: string; percent: number }>;
  criticalFlow: Array<{ label: string; status: FlowState }>;
  workers: Array<{
    profile: string;
    currentTask: string;
    currentAction: string;
    sessionId: string;
    lastHeartbeat: string | null;
    elapsedSeconds: number;
    state: WorkerState;
  }>;
  qualityGates: Array<{ label: string; passed: boolean; timestamp: string | null; evidence: string }>;
  warnings: string[];
  taskGroups: Record<string, LiveStatusItem[]>;
  activity: Array<{ id: string; timestamp: string; actor: string; taskId: string; type: string; summary: string; details: string }>;
  deployments: Array<{ service: string; status: string; restartCount: number; uptimeSeconds: number }>;
};

function parseFixture<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function iso(epochSeconds: number | null): string | null {
  return epochSeconds ? new Date(epochSeconds * 1000).toISOString() : null;
}

function storyPoints(body: string | null): number {
  const value = Number(/Story points:\s*(\d+)/i.exec(body ?? '')?.[1] ?? 1);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function externalId(task: Pick<TaskRow, 'id' | 'title' | 'body'>): string {
  const raw = `${task.title}\n${task.body ?? ''}`;
  return /\b[A-Z]{3,}(?:-[A-Z]+)?-\d+\b/.exec(raw)?.[0] ?? task.id;
}

function itemStatus(status: string): ItemStatus {
  if (status === 'done' || status === 'archived') return 'done';
  if (status === 'running') return 'in_progress';
  return 'pending';
}

function taskPhase(percent: number, status: string): string {
  if (status === 'blocked') return 'Terhambat';
  if (percent >= 100) return 'Verifikasi publik';
  if (percent >= 95) return 'Siap rilis';
  if (percent >= 85) return 'Menunggu deploy';
  if (percent >= 75) return 'Menunggu QA';
  if (percent >= 65) return 'Menunggu review';
  if (percent >= 50) return 'Commit tersedia';
  if (percent >= 25) return 'Sedang dikerjakan';
  if (percent >= 10) return 'Assigned';
  return 'Belum mulai';
}

async function boardQuery<T>(sql: string): Promise<T[]> {
  const taskFixture = parseFixture<T[]>(process.env.LEMBAR_LIVE_STATUS_TASKS_JSON);
  const eventFixture = parseFixture<T[]>(process.env.LEMBAR_LIVE_STATUS_EVENTS_JSON);
  if (sql.includes('FROM tasks') && taskFixture) return taskFixture;
  if (sql.includes('FROM task_events') && eventFixture) return eventFixture;
  const { stdout } = await execFileAsync('sqlite3', ['-readonly', '-json', BOARD_DB, sql], {
    timeout: 3000,
    maxBuffer: 8_000_000,
  });
  return stdout.trim() ? (JSON.parse(stdout) as T[]) : [];
}

function loadTasks(): Promise<TaskRow[]> {
  return boardQuery<TaskRow>(
    `SELECT id, title, body, assignee, status, priority, created_at, started_at,
            completed_at, last_heartbeat_at, result, workspace_path, branch_name,
            worker_pid, last_failure_error
       FROM tasks
      WHERE tenant = 'lembar-rc' AND status != 'archived'
      ORDER BY CASE status WHEN 'running' THEN 0 WHEN 'ready' THEN 1 WHEN 'review' THEN 2 WHEN 'blocked' THEN 3 WHEN 'todo' THEN 4 WHEN 'done' THEN 5 ELSE 6 END,
               priority DESC, created_at DESC
      LIMIT 40`,
  );
}

function loadEvents(limit = 200): Promise<EventRow[]> {
  return boardQuery<EventRow>(
    `SELECT task_id, kind, payload, created_at
       FROM task_events
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit}`,
  );
}

async function gitLines(repo: string, args: string[]): Promise<string[]> {
  try {
    const { stdout } = await execFileAsync('git', ['-C', repo, ...args], { timeout: 3000, maxBuffer: 8_000_000 });
    return stdout.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

async function gitHasChanges(workspacePath: string | null): Promise<boolean> {
  if (!workspacePath) return false;
  const lines = await gitLines(workspacePath, ['status', '--short']);
  return lines.length > 0;
}

async function branchHasCommit(repo: string, branchName: string | null): Promise<boolean> {
  if (!branchName) return false;
  const lines = await gitLines(repo, ['rev-list', '--count', `origin/dev..${branchName}`]);
  const count = Number(lines[0] ?? '0');
  if (Number.isFinite(count) && count > 0) return true;
  const branchExists = await gitLines(repo, ['show-ref', '--verify', `refs/heads/${branchName}`]);
  return branchExists.length > 0;
}

function repoForTask(task: TaskRow): string {
  const p = task.workspace_path ?? '';
  if (p.includes('Frontend-Lembar')) return FRONTEND_REPO;
  if (p.includes('Backend-Lembar')) return BACKEND_REPO;
  if (/\b\[FE\]|LEM-OPS-LIVE-001/i.test(task.title)) return FRONTEND_REPO;
  return BACKEND_REPO;
}

async function computeTaskPercent(task: TaskRow, events: EventRow[]): Promise<number> {
  if (task.status === 'done' || task.status === 'archived') return 100;
  let percent = task.status === 'running' ? 10 : 0;
  const title = task.title.toLowerCase();
  const dirty = await gitHasChanges(task.workspace_path);
  const hasFileChangeComment = events.some(
    (event) => event.task_id === task.id && event.kind === 'commented',
  );
  if (dirty || hasFileChangeComment) percent = Math.max(percent, 25);

  const hasCommit = await branchHasCommit(repoForTask(task), task.branch_name);
  if (hasCommit) percent = Math.max(percent, 50);

  if (/\btest|qa|e2e\b/.test(title) && task.status === 'done') percent = Math.max(percent, 65);
  if (/\breview\b/.test(title) && task.status === 'done') percent = Math.max(percent, 75);
  if (/\bqa\b/.test(title) && task.status === 'done') percent = Math.max(percent, 85);
  if (/\bdevops\b|deploy/.test(title) && task.status === 'done') percent = Math.max(percent, 95);
  return percent;
}

async function latestCommits(repo: string): Promise<string[]> {
  const fixture =
    repo === BACKEND_REPO
      ? parseFixture<string[]>(process.env.LEMBAR_LIVE_STATUS_BE_COMMITS_JSON)
      : parseFixture<string[]>(process.env.LEMBAR_LIVE_STATUS_FE_COMMITS_JSON);
  if (fixture) return fixture;
  return gitLines(repo, ['log', '--oneline', '-5', 'origin/dev']);
}

async function pm2Snapshot(): Promise<{
  services: LiveStatusDoc['services'];
  deployments: LiveStatusDoc['deployments'];
  warnings: string[];
  evidence: string[];
}> {
  const fixture = parseFixture<{ services: LiveStatusDoc['services']; evidence: string[] }>(
    process.env.LEMBAR_LIVE_STATUS_PM2_JSON,
  );
  if (fixture) {
    return {
      services: fixture.services,
      evidence: fixture.evidence,
      warnings: [],
      deployments: [
        { service: 'lembar-api', status: fixture.services.lembarApi, restartCount: 0, uptimeSeconds: 0 },
        { service: 'lembar-frontend', status: fixture.services.lembarFrontend, restartCount: 0, uptimeSeconds: 0 },
        { service: 'lembar-worker', status: fixture.services.lembarWorker, restartCount: 0, uptimeSeconds: 0 },
      ],
    };
  }

  const services: LiveStatusDoc['services'] = {
    lembarApi: 'unknown',
    lembarFrontend: 'unknown',
    lembarWorker: 'unknown',
  };
  const deployments: LiveStatusDoc['deployments'] = [];
  const warnings: string[] = [];
  const evidence: string[] = [];

  try {
    const { stdout } = await execFileAsync('pm2', ['jlist'], { timeout: 4000, maxBuffer: 8_000_000 });
    const processes = JSON.parse(stdout) as Pm2Process[];
    for (const name of ['lembar-api', 'lembar-frontend', 'lembar-worker']) {
      const process = processes.find((item) => item.name === name);
      const status = (process?.pm2_env?.status as 'online' | 'offline' | undefined) ?? 'unknown';
      const restartCount = process?.pm2_env?.restart_time ?? 0;
      const uptimeSeconds = process?.pm2_env?.pm_uptime
        ? Math.max(0, Math.floor((Date.now() - process.pm2_env.pm_uptime) / 1000))
        : 0;
      const key = name === 'lembar-api' ? 'lembarApi' : name === 'lembar-frontend' ? 'lembarFrontend' : 'lembarWorker';
      services[key] = status === 'online' || status === 'offline' ? status : 'unknown';
      deployments.push({ service: name, status, restartCount, uptimeSeconds });
      evidence.push(`PM2 ${name}: ${status} · uptime ${uptimeSeconds}s · restart ${restartCount}`);
      if (restartCount >= 50) warnings.push(`High restart count: ${name} restart ${restartCount} kali.`);
    }
  } catch {
    evidence.push('PM2 evidence unavailable');
  }

  return { services, deployments, warnings, evidence };
}

function importantEvent(kind: string): boolean {
  return [
    'created',
    'claimed',
    'spawned',
    'commented',
    'completed',
    'blocked',
    'unblocked',
    'timed_out',
    'crashed',
    'promoted',
  ].includes(kind);
}

function eventSummary(event: EventRow, taskTitle: string): string {
  switch (event.kind) {
    case 'created':
      return `Task dibuat: ${taskTitle}`;
    case 'claimed':
      return `Worker mulai mengerjakan ${taskTitle}`;
    case 'spawned':
      return `Session worker dibuat untuk ${taskTitle}`;
    case 'commented':
      return `Evidence baru pada ${taskTitle}`;
    case 'completed':
      return `Task selesai: ${taskTitle}`;
    case 'blocked':
      return `Task terhambat: ${taskTitle}`;
    case 'timed_out':
      return `Task timeout: ${taskTitle}`;
    case 'crashed':
      return `Worker crash: ${taskTitle}`;
    case 'promoted':
      return `Task siap dikerjakan: ${taskTitle}`;
    default:
      return `${event.kind}: ${taskTitle}`;
  }
}

function gateSteps(percent: number, isRunning: boolean): Array<{ label: string; state: GateState }> {
  const steps = [
    { label: 'Coding', threshold: 25 },
    { label: 'Commit', threshold: 50 },
    { label: 'Test', threshold: 65 },
    { label: 'Review', threshold: 75 },
    { label: 'QA', threshold: 85 },
    { label: 'Deploy', threshold: 95 },
    { label: 'Verify', threshold: 100 },
  ];
  return steps.map((step, index) => {
    if (percent >= step.threshold) return { label: step.label, state: 'completed' };
    const prev = index === 0 ? 10 : steps[index - 1]!.threshold;
    if (isRunning && percent >= prev) return { label: step.label, state: 'running' };
    return { label: step.label, state: 'pending' };
  });
}

function workerState(lastHeartbeatAt: number | null, running: boolean): WorkerState {
  if (!running) return 'IDLE';
  if (!lastHeartbeatAt) return 'LOST';
  const age = Math.max(0, Math.floor(Date.now() / 1000 - lastHeartbeatAt));
  if (age < 90) return 'ACTIVE';
  return 'STALE';
}

function currentAction(events: EventRow[], taskId: string): string {
  const latest = events.find((event) => event.task_id === taskId);
  if (!latest) return 'Menunggu evidence baru';
  switch (latest.kind) {
    case 'commented':
      return 'Menyimpan evidence terbaru';
    case 'spawned':
      return 'Menjalankan worker task';
    case 'claimed':
      return 'Mengambil task dari Kanban';
    case 'blocked':
      return 'Terhambat';
    case 'completed':
      return 'Menutup task';
    default:
      return latest.kind.split('_').join(' ');
  }
}

function flowStatus(label: string, tasks: LiveStatusItem[], services: LiveStatusDoc['services']): FlowState {
  const combined = tasks.map((task) => `${task.externalId} ${task.label} ${task.phase}`.toLowerCase()).join(' | ');
  if (label === 'Worker' && services.lembarWorker === 'online') return 'In Progress';
  if (label === 'PostgreSQL' && /postgres|generated questions|persist/.test(combined)) {
    return tasks.some((task) => /postgres|generated questions|persist/.test(`${task.externalId} ${task.label}`.toLowerCase()) && task.percent >= 50)
      ? 'In Progress'
      : 'Not Tested';
  }
  if (label === 'Status' && /live-status|status/.test(combined)) return 'In Progress';
  if (label === 'Review' && /review/.test(combined)) return 'In Progress';
  if (label === 'Output' && /output/.test(combined)) return 'In Progress';
  if (label === 'Generate Assessment' && /generate|assessment/.test(combined)) return 'In Progress';
  return 'Not Tested';
}

export async function buildLiveStatus(): Promise<LiveStatusDoc | null> {
  const tasks = await loadTasks().catch(() => []);
  if (!tasks.length) return null;
  const events = await loadEvents().catch(() => []);
  const [feCommits, beCommits, pm2] = await Promise.all([
    latestCommits(FRONTEND_REPO),
    latestCommits(BACKEND_REPO),
    pm2Snapshot(),
  ]);

  const items: LiveStatusItem[] = [];
  for (const task of tasks) {
    const percent = await computeTaskPercent(task, events);
    items.push({
      id: task.id,
      externalId: externalId(task),
      label: task.title,
      status: itemStatus(task.status),
      percent,
      storyPoints: storyPoints(task.body),
      assignee: task.assignee ?? 'unassigned',
      phase: taskPhase(percent, task.status),
      latestEvidence: task.last_failure_error ?? task.result ?? currentAction(events, task.id),
      dependency: task.status === 'blocked' ? 'Terhambat' : '—',
      lastUpdate: iso(task.last_heartbeat_at ?? task.completed_at ?? task.started_at ?? task.created_at),
    });
  }

  const totalPoints = items.reduce((sum, item) => sum + item.storyPoints, 0);
  const completedPoints = items.reduce((sum, item) => sum + (item.storyPoints * item.percent) / 100, 0);
  const overallPercent = totalPoints ? Math.round((completedPoints / totalPoints) * 100) : 0;
  const activeTask =
    tasks.find((task) => task.status === 'running') ??
    tasks.find((task) => task.status === 'blocked') ??
    tasks.find((task) => task.status !== 'done') ??
    tasks[0]!;
  const activeItem = items.find((item) => item.id === activeTask.id) ?? items[0]!;

  const boardStatus: LiveStatusDoc['board']['status'] =
    tasks.some((task) => task.status === 'blocked') ? 'Blocked' :
    tasks.some((task) => task.status === 'running') ? 'In Progress' :
    tasks.some((task) => task.status === 'review' || task.status === 'todo' || task.status === 'ready') ? 'Verifying' : 'Ready';

  const workers = tasks
    .filter((task) => task.status === 'running' || task.last_heartbeat_at)
    .map((task) => {
      const elapsedSeconds = task.started_at ? Math.max(0, Math.floor(Date.now() / 1000 - task.started_at)) : 0;
      return {
        profile: task.assignee ?? 'unassigned',
        currentTask: `${externalId(task)} · ${task.title}`,
        currentAction: currentAction(events, task.id),
        sessionId: task.worker_pid ? `pid:${task.worker_pid}` : 'session unavailable',
        lastHeartbeat: iso(task.last_heartbeat_at),
        elapsedSeconds,
        state: workerState(task.last_heartbeat_at, task.status === 'running'),
      };
    });

  const qualityGates: LiveStatusDoc['qualityGates'] = [
    { label: 'Code committed', passed: activeItem.percent >= 50, timestamp: activeItem.lastUpdate, evidence: feCommits[0] ?? 'commit belum ada' },
    { label: 'Typecheck passed', passed: false, timestamp: null, evidence: 'artifact belum terdeteksi' },
    { label: 'Lint passed', passed: false, timestamp: null, evidence: 'artifact belum terdeteksi' },
    { label: 'Unit tests passed', passed: false, timestamp: null, evidence: 'artifact belum terdeteksi' },
    { label: 'Integration tests passed', passed: false, timestamp: null, evidence: 'artifact belum terdeteksi' },
    { label: 'Reviewer approved', passed: false, timestamp: null, evidence: 'menunggu reviewer independen' },
    { label: 'QA approved', passed: false, timestamp: null, evidence: 'menunggu QA independen' },
    { label: 'Branch merged', passed: false, timestamp: null, evidence: 'menunggu merge ke origin/dev' },
    { label: 'Build passed', passed: false, timestamp: null, evidence: 'artifact build belum dicatat' },
    { label: 'PM2 healthy', passed: pm2.services.lembarFrontend === 'online', timestamp: new Date().toISOString(), evidence: pm2.evidence.find((line) => line.includes('lembar-frontend')) ?? 'pm2 unavailable' },
    { label: 'Public verification passed', passed: false, timestamp: null, evidence: 'menunggu verifikasi publik' },
  ];

  const blockers = tasks.filter((task) => task.status === 'blocked').map((task) => `${externalId(task)} · ${task.title}`);
  const warnings = [...pm2.warnings];
  if (workers.some((worker) => worker.state === 'STALE' || worker.state === 'LOST')) {
    warnings.push('Ada worker heartbeat stale/lost.');
  }
  if (activeItem.percent < 50 && activeTask.started_at && Date.now() / 1000 - activeTask.started_at > 600) {
    warnings.push(`Worker aktif tetapi belum mencapai commit gate lebih dari 10 menit: ${activeItem.externalId}.`);
  }
  if (!qualityGates.some((gate) => gate.label === 'Code committed' && gate.passed)) {
    warnings.push('Task running tanpa commit yang tervalidasi.');
  }
  if (!qualityGates.some((gate) => gate.label === 'Integration tests passed' && gate.passed)) {
    warnings.push('Test artifact belum tersedia.');
  }

  const activity = events
    .filter((event) => importantEvent(event.kind) && event.kind !== 'heartbeat')
    .slice(0, 80)
    .map((event, index) => {
      const taskTitle = tasks.find((task) => task.id === event.task_id)?.title ?? event.task_id;
      return {
        id: `${event.created_at}-${event.task_id}-${index}`,
        timestamp: iso(event.created_at) ?? new Date().toISOString(),
        actor: tasks.find((task) => task.id === event.task_id)?.assignee ?? 'system',
        taskId: event.task_id,
        type: event.kind,
        summary: eventSummary(event, taskTitle),
        details: event.payload ?? '',
      };
    });

  const taskGroups: LiveStatusDoc['taskGroups'] = {
    Running: items.filter((item) => item.status === 'in_progress'),
    Ready: items.filter((item) => tasks.find((task) => task.id === item.id)?.status === 'ready'),
    Blocked: items.filter((item) => tasks.find((task) => task.id === item.id)?.status === 'blocked'),
    Review: items.filter((item) => tasks.find((task) => task.id === item.id)?.status === 'review'),
    QA: items.filter((item) => /\bqa\b/i.test(item.label)),
    Done: items.filter((item) => item.status === 'done'),
  };

  const nowIso = new Date().toISOString();
  const activeHeartbeat = iso(activeTask.last_heartbeat_at);
  return {
    generatedAt: nowIso,
    updatedAt: activeHeartbeat ?? nowIso,
    workMode: 'Hermes Kanban + heartbeat + git + test artifact + PM2 + public verification',
    phase: 'Lembar Release Candidate',
    headline: `${boardStatus} · ${Math.round(completedPoints)}/${totalPoints} story points · ${items.filter((item) => item.status === 'done').length}/${items.length} task done`,
    overallPercent,
    currentTask: `${activeItem.externalId} · ${activeItem.label}`,
    nextAction: items.find((item) => item.status === 'pending')?.label ?? 'Menunggu gate berikutnya',
    blockers,
    evidence: [
      `FE commit: ${feCommits[0] ?? 'unavailable'}`,
      `BE commit: ${beCommits[0] ?? 'unavailable'}`,
      ...pm2.evidence,
    ],
    items,
    latestBackendCommits: beCommits,
    latestFrontendCommits: feCommits,
    services: pm2.services,
    notes: [
      'Progress hanya bergerak berdasarkan evidence gates, bukan heartbeat atau lama kerja.',
      'Waktu ditampilkan di UI sebagai Asia/Jakarta (WIB).',
      'Activity heartbeat disembunyikan dari feed utama agar tidak memenuhi layar.',
    ],
    board: { id: BOARD_NAME, name: BOARD_NAME, status: boardStatus },
    progress: {
      percent: overallPercent,
      completedPoints: Number(completedPoints.toFixed(1)),
      totalPoints,
      doneTasks: items.filter((item) => item.status === 'done').length,
      totalTasks: items.length,
      formula: 'completed weighted points / total weighted points × 100',
    },
    current: {
      id: activeTask.id,
      externalId: activeItem.externalId,
      title: activeItem.label,
      phase: activeItem.phase,
      progress: activeItem.percent,
      worker: activeItem.assignee,
      workingForSeconds: activeTask.started_at ? Math.max(0, Math.floor(Date.now() / 1000 - activeTask.started_at)) : 0,
      currentAction: currentAction(events, activeTask.id),
      latestEvidence: activeTask.last_failure_error ?? activeTask.result ?? currentAction(events, activeTask.id),
      nextRequiredGate: activeItem.percent < 25 ? 'First file change' : activeItem.percent < 50 ? 'Commit' : activeItem.percent < 65 ? 'Tests' : activeItem.percent < 75 ? 'Review' : activeItem.percent < 85 ? 'QA' : activeItem.percent < 95 ? 'Deploy' : 'Public verification',
      steps: gateSteps(activeItem.percent, activeTask.status === 'running'),
    },
    readiness: [
      { label: 'Product flow', percent: Math.round((flowStatus('Generate Assessment', items, pm2.services) === 'Passed' ? 100 : flowStatus('Generate Assessment', items, pm2.services) === 'In Progress' ? 60 : 0 + (flowStatus('Status', items, pm2.services) === 'In Progress' ? 60 : 0)) / 2) || 0 },
      { label: 'Engineering', percent: Math.max(...items.map((item) => item.percent)) },
      { label: 'Quality assurance', percent: qualityGates.filter((gate) => gate.passed && /(test|review|qa)/i.test(gate.label)).length * 20 },
      { label: 'Deployment', percent: (pm2.services.lembarFrontend === 'online' ? 50 : 0) + (qualityGates.find((gate) => gate.label === 'Public verification passed')?.passed ? 50 : 0) },
    ],
    criticalFlow: [
      { label: 'Generate Assessment', status: flowStatus('Generate Assessment', items, pm2.services) },
      { label: 'Worker', status: flowStatus('Worker', items, pm2.services) },
      { label: 'PostgreSQL', status: flowStatus('PostgreSQL', items, pm2.services) },
      { label: 'Status', status: flowStatus('Status', items, pm2.services) },
      { label: 'Review', status: flowStatus('Review', items, pm2.services) },
      { label: 'Output', status: flowStatus('Output', items, pm2.services) },
    ],
    workers,
    qualityGates,
    warnings,
    taskGroups,
    activity,
    deployments: pm2.deployments,
  };
}

export async function loadLiveActivity(): Promise<string[]> {
  try {
    const doc = await buildLiveStatus();
    if (!doc) return [];
    return doc.activity.map((event) => `${event.timestamp} [${event.actor}] ${event.summary}`);
  } catch {
    try {
      const raw = await fs.readFile(ACTIVITY_LOG, 'utf8');
      return raw.split('\n').filter(Boolean).slice(-200);
    } catch {
      return [];
    }
  }
}
