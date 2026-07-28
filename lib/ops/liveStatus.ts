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

function parseFixture<T>(value: string | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

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

function taskProgress(status: string): number {
  if (status === 'done' || status === 'archived') return 100;
  if (status === 'running') return 50;
  return 0;
}

function displayStatus(status: string): LiveStatusItem['status'] {
  if (status === 'done' || status === 'archived') return 'done';
  if (status === 'running') return 'in_progress';
  return 'pending';
}

async function boardQuery<T>(sql: string): Promise<T[]> {
  const taskFixture = parseFixture<T[]>(process.env.LEMBAR_LIVE_STATUS_TASKS_JSON);
  const eventFixture = parseFixture<T[]>(process.env.LEMBAR_LIVE_STATUS_EVENTS_JSON);
  if (sql.includes('FROM tasks') && taskFixture) return taskFixture;
  if (sql.includes('FROM task_events') && eventFixture) return eventFixture;
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

function loadEvents(limit = 80): Promise<EventRow[]> {
  return boardQuery<EventRow>(
    `SELECT task_id, kind, payload, created_at
       FROM task_events
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit}`,
  );
}

async function gitLog(repo: string): Promise<string[]> {
  const fixture =
    repo === BACKEND_REPO
      ? parseFixture<string[]>(process.env.LEMBAR_LIVE_STATUS_BE_COMMITS_JSON)
      : parseFixture<string[]>(process.env.LEMBAR_LIVE_STATUS_FE_COMMITS_JSON);
  if (fixture) return fixture;
  try {
    const { stdout } = await execFileAsync('git', ['-C', repo, 'log', '--oneline', '-5', 'origin/dev'], {
      timeout: 3000,
    });
    return stdout.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

async function pm2State(): Promise<{
  services: LiveStatusDoc['services'];
  evidence: string[];
}> {
  const fixture = parseFixture<{ services: LiveStatusDoc['services']; evidence: string[] }>(
    process.env.LEMBAR_LIVE_STATUS_PM2_JSON,
  );
  if (fixture) return fixture;
  const services: LiveStatusDoc['services'] = {
    lembarApi: 'unknown',
    lembarFrontend: 'unknown',
    lembarWorker: 'unknown',
  };
  try {
    const { stdout } = await execFileAsync('pm2', ['jlist'], { timeout: 3000, maxBuffer: 8_000_000 });
    const processes = JSON.parse(stdout) as Pm2Process[];
    const byName = new Map(processes.map((process) => [process.name, process.pm2_env]));
    const assign = (key: keyof typeof services, name: string) => {
      const status = byName.get(name)?.status;
      services[key] = status === 'online' || status === 'offline' ? status : 'unknown';
    };
    assign('lembarApi', 'lembar-api');
    assign('lembarFrontend', 'lembar-frontend');
    assign('lembarWorker', 'lembar-worker');
    const evidence = ['lembar-api', 'lembar-frontend', 'lembar-worker'].map((name) => {
      const process = byName.get(name);
      const uptime = process?.pm_uptime
        ? Math.max(0, Math.floor((Date.now() - process.pm_uptime) / 1000))
        : 0;
      return `PM2 ${name}: ${process?.status ?? 'offline'} · uptime ${uptime}s · restart ${process?.restart_time ?? 0}`;
    });
    return { services, evidence };
  } catch {
    return { services, evidence: ['PM2 evidence unavailable'] };
  }
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
  const items = tasks.map((task) => ({
    id: task.id,
    label: task.title,
    status: displayStatus(task.status),
    percent: taskProgress(task.status),
    storyPoints: storyPoints(task.body),
    assignee: task.assignee ?? 'unassigned',
  }));
  const totalPoints = items.reduce((sum, item) => sum + item.storyPoints, 0);
  const earnedPoints = items.reduce(
    (sum, item) => sum + (item.storyPoints * item.percent) / 100,
    0,
  );
  const overallPercent = totalPoints ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const now = Date.now();
  const heartbeatAt = iso(active.last_heartbeat_at);
  const heartbeatAgeSeconds = active.last_heartbeat_at
    ? Math.max(0, Math.floor(now / 1000 - active.last_heartbeat_at))
    : null;
  const [latestFrontendCommits, latestBackendCommits, pm2] = await Promise.all([
    gitLog(FRONTEND_REPO),
    gitLog(BACKEND_REPO),
    pm2State(),
  ]);
  const blockers = tasks
    .filter((task) => task.status === 'blocked')
    .map((task) => `${task.id}: ${task.title}`);
  const next = tasks.find((task) => task.status === 'ready' || task.status === 'todo');
  const generatedAt = new Date(now).toISOString();
  const updatedAt = iso(
    Math.max(...tasks.map((task) => task.last_heartbeat_at ?? task.completed_at ?? task.started_at ?? task.created_at)),
  ) ?? generatedAt;
  const testTasks = tasks.filter((task) => /\b(test|qa|e2e)\b/i.test(task.title));

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
    items,
    latestBackendCommits,
    latestFrontendCommits,
    services: pm2.services,
    notes: [
      `Progress dihitung dari story points: ${earnedPoints.toFixed(1)} / ${totalPoints}.`,
      'State task dan heartbeat dibaca read-only dari database kanban Hermes.',
      'Commit dibaca dari origin/dev; service/deploy evidence dibaca dari PM2.',
    ],
    board: { name: BOARD_NAME, taskId: active.id, status: active.status },
    worker: { assignee: active.assignee ?? 'unassigned', lastHeartbeatAt: heartbeatAt, heartbeatAgeSeconds },
  };
}

function eventMessage(event: EventRow, taskTitle: string | undefined): string {
  const title = taskTitle ? ` · ${taskTitle}` : '';
  if (event.kind === 'heartbeat') return `heartbeat ${event.task_id}${title}`;
  if (event.kind === 'completed') return `task completed ${event.task_id}${title}`;
  if (event.kind === 'blocked') return `task blocked ${event.task_id}${title}`;
  return `${event.kind} ${event.task_id}${title}`;
}

export async function loadLiveActivity(): Promise<string[]> {
  try {
    const tasks = await loadTasks();
    const titles = new Map(tasks.map((task) => [task.id, task.title]));
    return (await loadEvents(120))
      .reverse()
      .map((event) => `${iso(event.created_at)} [GLOBAL] ${eventMessage(event, titles.get(event.task_id))}`)
      .slice(-200);
  } catch {
    try {
      const raw = await fs.readFile(ACTIVITY_LOG, 'utf8');
      return raw.split('\n').filter(Boolean).slice(-200);
    } catch {
      return [];
    }
  }
}
