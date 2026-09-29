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
const PM2_RESTART_WARN_THRESHOLD = 10;

function parseFixture<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export type EvidenceGates = {
  created: boolean;
  running: boolean;
  firstFileChanged: boolean;
  commit: boolean;
  tests: boolean;
  review: boolean;
  qa: boolean;
  deploy: boolean;
  publicVerification: boolean;
};

// Owner-mandated ordinal gates. Heartbeats / time / command count MUST NOT move this.
const GATE_ORDER: { key: keyof EvidenceGates; percent: number }[] = [
  { key: 'created', percent: 0 },
  { key: 'running', percent: 10 },
  { key: 'firstFileChanged', percent: 25 },
  { key: 'commit', percent: 50 },
  { key: 'tests', percent: 65 },
  { key: 'review', percent: 75 },
  { key: 'qa', percent: 85 },
  { key: 'deploy', percent: 95 },
  { key: 'publicVerification', percent: 100 },
];

export type LiveStatusItem = {
  id: string;
  label: string;
  status: 'done' | 'in_progress' | 'pending';
  percent: number;
  storyPoints: number;
  assignee: string;
};

export type LiveStatusDoc = {
  generatedAt: string;
  updatedAt: string;
  startedAt?: string;
  workMode: string;
  phase: string;
  headline: string;
  overallPercent: number;
  currentTask: string;
  nextAction: string;
  blockers: string[];
  evidence: string[];
  evidenceGates: EvidenceGates;
  warnings: string[];
  items: LiveStatusItem[];
  latestBackendCommits: string[];
  latestFrontendCommits: string[];
  services: {
    lembarApi: 'online' | 'offline' | 'degraded' | 'unknown';
    lembarFrontend: 'online' | 'offline' | 'degraded' | 'unknown';
    lembarWorker: 'online' | 'offline' | 'degraded' | 'unknown';
  };
  notes: string[];
  board: { name: string; taskId: string; status: string };
  worker: { assignee: string; lastHeartbeatAt: string | null; heartbeatAgeSeconds: number | null };
};

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
};

type EventRow = { task_id: string; kind: string; payload: string | null; created_at: number };
type CommentRow = { author: string; body: string; created_at: number };

type Pm2Process = {
  name?: string;
  pm2_env?: { status?: string; pm_uptime?: number; restart_time?: number };
};

function iso(epochSeconds: number | null): string | null {
  return epochSeconds ? new Date(epochSeconds * 1000).toISOString() : null;
}

function storyPoints(body: string | null): number {
  const value = Number(/Story points:\s*(\d+)/i.exec(body ?? '')?.[1] ?? 1);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function displayStatus(status: string): LiveStatusItem['status'] {
  if (status === 'done' || status === 'archived') return 'done';
  if (status === 'running') return 'in_progress';
  return 'pending';
}

async function boardQuery<T>(sql: string): Promise<T[]> {
  const taskFixture = parseFixture<T[]>(process.env.LEMBAR_LIVE_STATUS_TASKS_JSON);
  const eventFixture = parseFixture<T[]>(process.env.LEMBAR_LIVE_STATUS_EVENTS_JSON);
  const commentFixture = parseFixture<CommentRow[]>(process.env.LEMBAR_LIVE_STATUS_COMMENTS_JSON);
  if (sql.includes('FROM tasks') && taskFixture) return taskFixture;
  if (sql.includes('FROM task_events') && eventFixture) return eventFixture;
  if (sql.includes('FROM task_comments') && commentFixture) return commentFixture as T[];
  const { stdout } = await execFileAsync('sqlite3', ['-readonly', '-json', BOARD_DB, sql], {
    timeout: 3000,
  });
  return stdout.trim() ? (JSON.parse(stdout) as T[]) : [];
}

function loadTasks(): Promise<TaskRow[]> {
  return boardQuery<TaskRow>(
    `SELECT id, title, body, assignee, status, priority, created_at, started_at,
            completed_at, last_heartbeat_at, result
       FROM tasks
      WHERE tenant = 'lembar-rc' AND status != 'archived'
      ORDER BY CASE status WHEN 'running' THEN 0 WHEN 'ready' THEN 1 WHEN 'todo' THEN 2 ELSE 3 END,
               priority DESC, created_at DESC
      LIMIT 24`,
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

function loadComments(taskId: string, limit = 200): Promise<CommentRow[]> {
  return boardQuery<CommentRow>(
    `SELECT author, body, created_at
       FROM task_comments
      WHERE task_id = '${taskId.replace(/'/g, "''")}'
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit}`,
  ).then((rows) =>
    // Fixtures may be a board-wide array; only the active task's own evidence counts.
    rows.filter(
      (row) =>
        (row as { task_id?: string }).task_id === undefined ||
        (row as { task_id?: string }).task_id === taskId,
    ),
  );
}

// Returns commits on origin/dev newer than `sinceEpochSeconds` (the active task's
// start). Without the cutoff, ANY pre-existing commit on dev would fire the commit
// gate for a task that has not committed anything yet.
async function gitLog(repo: string, sinceEpochSeconds?: number | null): Promise<string[]> {
  const fixture =
    repo === BACKEND_REPO
      ? parseFixture<string[]>(process.env.LEMBAR_LIVE_STATUS_BE_COMMITS_JSON)
      : parseFixture<string[]>(process.env.LEMBAR_LIVE_STATUS_FE_COMMITS_JSON);
  if (fixture) return fixture;
  try {
    const args = ['-C', repo, 'log', '--oneline', '-5'];
    if (sinceEpochSeconds) {
      args.push(`--since=${new Date(sinceEpochSeconds * 1000).toISOString()}`);
    }
    args.push('origin/dev');
    const { stdout } = await execFileAsync('git', args, { timeout: 3000 });
    return stdout.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

type Pm2Detail = {
  services: LiveStatusDoc['services'];
  evidence: string[];
  restarts: { name: string; restarts: number; uptimeSeconds: number }[];
};

async function pm2State(): Promise<Pm2Detail> {
  const rawFixture = parseFixture<{
    services?: LiveStatusDoc['services'];
    evidence?: string[];
    restarts?: Pm2Detail['restarts'];
  }>(process.env.LEMBAR_LIVE_STATUS_PM2_JSON);
  if (rawFixture) {
    const services = rawFixture.services ?? {
      lembarApi: 'unknown',
      lembarFrontend: 'unknown',
      lembarWorker: 'unknown',
    };
    const evidence = rawFixture.evidence ?? [];
    const restarts =
      rawFixture.restarts && rawFixture.restarts.length > 0
        ? rawFixture.restarts
        : pm2FromFixture(evidence);
    return { services, evidence, restarts };
  }
  const services: LiveStatusDoc['services'] = {
    lembarApi: 'unknown',
    lembarFrontend: 'unknown',
    lembarWorker: 'unknown',
  };
  try {
    const { stdout } = await execFileAsync('pm2', ['jlist'], {
      timeout: 3000,
      maxBuffer: 8_000_000,
    });
    const processes = JSON.parse(stdout) as Pm2Process[];
    const byName = new Map(processes.map((process) => [process.name, process.pm2_env]));
    const assign = (key: keyof typeof services, name: string) => {
      const status = byName.get(name)?.status;
      services[key] = status === 'online' || status === 'offline' ? status : 'unknown';
    };
    assign('lembarApi', 'lembar-api');
    assign('lembarFrontend', 'lembar-frontend');
    assign('lembarWorker', 'lembar-worker');
    const restarts: Pm2Detail['restarts'] = [];
    const evidence = ['lembar-api', 'lembar-frontend', 'lembar-worker'].map((name) => {
      const process = byName.get(name);
      const uptime = process?.pm_uptime
        ? Math.max(0, Math.floor((Date.now() - process.pm_uptime) / 1000))
        : 0;
      const restartCount = process?.restart_time ?? 0;
      restarts.push({ name, restarts: restartCount, uptimeSeconds: uptime });
      return `PM2 ${name}: ${process?.status ?? 'offline'} · uptime ${uptime}s · restart ${restartCount}`;
    });
    return { services, evidence, restarts };
  } catch {
    return { services, evidence: ['PM2 evidence unavailable'], restarts: [] };
  }
}

function pm2FromFixture(fixture: Pm2Detail['evidence']): Pm2Detail['restarts'] {
  return fixture
    .map((line) => {
      const match = /^PM2\s+([\w-]+):\s+\w+\s+·\s+uptime\s+(\d+)s\s+·\s+restart\s+(\d+)/.exec(line);
      if (!match) return null;
      return {
        name: match[1] ?? '',
        restarts: Number(match[3] ?? 0),
        uptimeSeconds: Number(match[2] ?? 0),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

function evaluateEvidenceGates(input: {
  active: TaskRow;
  comments: CommentRow[];
  latestFrontendCommits: string[];
  latestBackendCommits: string[];
  pm2Restarts: Pm2Detail['restarts'];
  pm2Services: LiveStatusDoc['services'];
  allTasks: TaskRow[];
}): { gates: EvidenceGates; warnings: string[] } {
  const {
    active,
    comments,
    latestFrontendCommits,
    latestBackendCommits,
    pm2Restarts,
    pm2Services,
    allTasks,
  } = input;
  const warnings: string[] = [];

  const created = Boolean(active.created_at);
  const running = active.status === 'running';
  // Every text gate is ANCHORED to the start of a line. Without the anchor a prose
  // comment that merely *mentions* the gate names (e.g. the owner's own progress
  // spec, which literally lists "deploy=95, public verification=100, PM2 restart")
  // self-fires the gates and reports 100% for work that never happened.
  const firstFileChanged = comments.some((comment) => /^\s*file_changed:/im.test(comment.body));
  // Commit gate: orchestrator marked the first durable edit AND this task's code is on origin/dev.
  const commit =
    firstFileChanged && (latestFrontendCommits.length > 0 || latestBackendCommits.length > 0);
  const tests = comments.some((comment) =>
    /^\s*tests?\b[^\n]*\b(pass|passed|green|ok|done)\b/im.test(comment.body),
  );
  const review = comments.some(
    (comment) =>
      /lembar-reviewer/.test(comment.author) || /^\s*review\s+handoff:/im.test(comment.body),
  );
  const qa =
    comments.some((comment) => /lembar-qa/.test(comment.author)) ||
    comments.some((comment) =>
      /^\s*qa\s+(signed\s+off|approved|passed|complete)\b/im.test(comment.body),
    );
  const deploy =
    comments.some((comment) => /^\s*(deploy|restart)\s+dev\b/im.test(comment.body)) ||
    comments.some((comment) => /^\s*pm2\s+restart/im.test(comment.body));
  const publicVerification = comments.some((comment) =>
    /^\s*(live\s+e2e\s+on\s+app\.lembar\.web\.id|public\s+verification)\b/im.test(comment.body),
  );

  for (const entry of pm2Restarts) {
    if (entry.restarts >= PM2_RESTART_WARN_THRESHOLD) {
      warnings.push(
        `PM2 ${entry.name} restart tinggi (${entry.restarts}x dalam ${entry.uptimeSeconds}s) — cek log apakah crash loop.`,
      );
    }
  }
  const offlineCount = Object.values(pm2Services).filter((state) => state === 'offline').length;
  if (offlineCount > 0) {
    warnings.push(`${offlineCount} service PM2 offline — status board belum hijau.`);
  }

  return {
    gates: {
      created,
      running,
      firstFileChanged,
      commit,
      tests,
      review,
      qa,
      deploy,
      publicVerification,
    },
    warnings,
  };
}

function progressFromGates(gates: EvidenceGates): number {
  let percent = 0;
  for (const step of GATE_ORDER) {
    if (gates[step.key]) percent = Math.max(percent, step.percent);
  }
  return percent;
}

export async function buildLiveStatus(): Promise<LiveStatusDoc | null> {
  let tasks: TaskRow[];
  try {
    tasks = await loadTasks();
  } catch {
    return null;
  }
  if (!tasks.length) return null;

  const active = tasks.find((task) => task.status === 'running') ?? tasks[0]!;
  // Evidence gates are scoped to the ACTIVE task: a reviewer/QA/deploy comment on
  // some other card must never inflate this card's progress.
  let comments: CommentRow[] = [];
  try {
    comments = await loadComments(active.id);
  } catch {
    comments = [];
  }

  const items = tasks.map((task) => ({
    id: task.id,
    label: task.title,
    status: displayStatus(task.status),
    percent:
      task.status === 'done' || task.status === 'archived'
        ? 100
        : task.status === 'running'
          ? 50
          : 0,
    storyPoints: storyPoints(task.body),
    assignee: task.assignee ?? 'unassigned',
  }));
  const now = Date.now();
  const heartbeatAt = iso(active.last_heartbeat_at);
  const heartbeatAgeSeconds = active.last_heartbeat_at
    ? Math.max(0, Math.floor(now / 1000 - active.last_heartbeat_at))
    : null;
  const [latestFrontendCommits, latestBackendCommits, pm2] = await Promise.all([
    gitLog(FRONTEND_REPO, active.started_at ?? active.created_at),
    gitLog(BACKEND_REPO, active.started_at ?? active.created_at),
    pm2State(),
  ]);
  const pm2Restarts = pm2.restarts.length ? pm2.restarts : pm2FromFixture(pm2.evidence);
  const blockers = tasks
    .filter((task) => task.status === 'blocked')
    .map((task) => `${task.id}: ${task.title}`);
  const next = tasks.find((task) => task.status === 'ready' || task.status === 'todo');
  const generatedAt = new Date(now).toISOString();
  const updatedAt =
    iso(
      Math.max(
        ...tasks.map(
          (task) =>
            task.last_heartbeat_at ?? task.completed_at ?? task.started_at ?? task.created_at,
        ),
      ),
    ) ?? generatedAt;
  const testTasks = tasks.filter((task) => /\b(test|qa|e2e)\b/i.test(task.title));
  const { gates, warnings } = evaluateEvidenceGates({
    active,
    comments,
    latestFrontendCommits,
    latestBackendCommits,
    pm2Restarts,
    pm2Services: pm2.services,
    allTasks: tasks,
  });
  const overallPercent = progressFromGates(gates);

  return {
    generatedAt,
    updatedAt,
    startedAt: iso(active.started_at) ?? undefined,
    workMode: 'Hermes kanban · durable SQLite · polling 4 detik',
    phase: 'Hermes engineering board',
    headline: `${tasks.filter((task) => task.status === 'running').length} worker aktif · ${tasks.filter((task) => task.status === 'done').length} task selesai · ${blockers.length} blocker`,
    overallPercent,
    currentTask: `${active.id} · ${active.title}`,
    nextAction: next ? `${next.id} · ${next.title}` : 'Tidak ada task pending.',
    blockers,
    evidence: [
      `Kanban ${BOARD_NAME}: ${tasks.length} task · generated ${generatedAt}`,
      `Worker ${active.assignee ?? 'unassigned'}: heartbeat ${heartbeatAt ?? 'belum ada'} (${heartbeatAgeSeconds ?? '—'}s lalu)`,
      `Commit FE: ${latestFrontendCommits[0] ?? 'unavailable'}`,
      `Commit BE: ${latestBackendCommits[0] ?? 'unavailable'}`,
      ...testTasks.slice(0, 2).map((task) => `Test/QA ${task.id}: ${task.status}`),
      ...pm2.evidence,
    ],
    evidenceGates: gates,
    warnings,
    items,
    latestBackendCommits,
    latestFrontendCommits,
    services: pm2.services,
    notes: [
      `Progress = max gate aktif (created=0, running=10, file_changed=25, commit=50, tests=65, review=75, qa=85, deploy=95, public=100). Saat ini: ${overallPercent}%.`,
      'Heartbeat, jam, dan command count TIDAK menaikkan progress — hanya evidence gates.',
      'State task dan heartbeat dibaca read-only dari database kanban Hermes.',
      'Commit dibaca dari origin/dev; service/deploy evidence dibaca dari PM2.',
    ],
    board: { name: BOARD_NAME, taskId: active.id, status: active.status },
    worker: {
      assignee: active.assignee ?? 'unassigned',
      lastHeartbeatAt: heartbeatAt,
      heartbeatAgeSeconds,
    },
  };
}

function eventMessage(event: EventRow, taskTitle: string | undefined): string {
  const title = taskTitle ? ` · ${taskTitle}` : '';
  if (event.kind === 'heartbeat') return `heartbeat ${event.task_id}${title}`;
  if (event.kind === 'completed') return `task completed ${event.task_id}${title}`;
  if (event.kind === 'blocked') return `task blocked ${event.task_id}${title}`;
  return `${event.kind} ${event.task_id}${title}`;
}

export type LiveActivityDoc = { lines: string[]; heartbeatCount: number };

export async function loadLiveActivity(): Promise<LiveActivityDoc> {
  try {
    const tasks = await loadTasks();
    const titles = new Map(tasks.map((task) => [task.id, task.title]));
    const events = await loadEvents(200);
    let heartbeatCount = 0;
    const lines: string[] = [];
    // Reverse so we walk chronologically ascending, but the source list is descending.
    for (const event of [...events].reverse()) {
      if (event.kind === 'heartbeat') {
        heartbeatCount += 1;
        continue;
      }
      lines.push(
        `${iso(event.created_at)} [GLOBAL] ${eventMessage(event, titles.get(event.task_id))}`,
      );
    }
    // Cap to last 200 non-heartbeat lines so the feed stays readable.
    return { lines: lines.slice(-200), heartbeatCount };
  } catch {
    try {
      const raw = await fs.readFile(ACTIVITY_LOG, 'utf8');
      const lines = raw.split('\n').filter(Boolean).slice(-200);
      return { lines, heartbeatCount: 0 };
    } catch {
      return { lines: [], heartbeatCount: 0 };
    }
  }
}
