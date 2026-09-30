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

// --- Gate vocabulary -------------------------------------------------------
// A gate fires on a COMPLETION statement, not on a topic or an author. Two failure
// modes this closes, both observed live on card t_1d228272 (failed twice by QA, yet
// the board reported 100%):
//   * topic-as-evidence: the instruction "Live E2E on app.lembar.web.id using
//     deployed T5 artifact only." fired `publicVerification` on a todo;
//   * author-as-evidence: `/lembar-qa/.test(author)` fired `qa` on a FAIL verdict.
// A third one followed the first fix: subject + *any* approve word on the line
// ("Deploy dev: push origin/dev once CI is done." → `done`; "QA: run the suite,
// then sign off." → `sign off`; "Review the diff and mark done." → `done`) still
// let an instruction move the number. So the statement must be VERDICT-SHAPED:
// the gate's subject at the start of the line, then a separator (`:` `=` `—` `-`)
// or whitespace, then the outcome word — nothing in between that reads as future
// intent. A rejecting statement on the same subject vetoes the gate outright.
const MARKER_PREFIX = String.raw`(?:[-*•]\s+)?(?:\*\*|__|#{1,6}\s*)?\s*(?:evidence|proof|result|status|verdict)?\s*:?\s*`;
const QA_SUBJECT = String.raw`(?:qa|q\.?a\.?\s*(?:verdict|review|sign[- ]?off)|quality\s+assurance)`;
const REVIEW_SUBJECT = String.raw`(?:code\s+review|re-?review|review)`;
const DEPLOY_SUBJECT = String.raw`(?:deploy(?:ed|ment)?|release(?:d)?|restart(?:ed)?\s+dev)`;
// `pm2 restart` is deliberately NOT a deploy subject. As a noun phrase it names the
// restart-count FEATURE, so any line that merely mentions it ("PM2 restart ≥ 10 →
// warning (verified, …)", "PM2 restart count 16732 — verified high.") fired deploy
// from prose alone. A genuine pm2 outcome is still caught by the `deploy(ed)` subject
// ("Deployed to VPS, pm2 restarted.") or the SHIP_WORDS past tense (`restarted`).
// `live e2e` / `live verification` are TOPICS, not results: naming the public
// origin must never fire the 100% gate. Only an explicit marker line counts.
const PUBLIC_SUBJECT = String.raw`(?:public\s+verification|public\s+probe)`;
const VERDICT_SUBJECT = String.raw`(?:verdict|status|result)`;
const TESTS_SUBJECT = String.raw`(?:tests?|test\s+suite)`;
const APPROVE_WORDS = String.raw`pass(?:ed|es)?|approv(?:e|ed|al)|signed\s+off|sign[- ]?off|green|succeed(?:ed)?|success|ok(?:ay)?|done|verified|complete(?:d)?`;
const REJECT_WORDS = String.raw`fail(?:ed|ure)?|reject(?:ed)?|request(?:ing)?\s+changes|changes\s+requested|block(?:ed|er)?|veto|not\s+(?:run|verified|passed|approved|done)|never\s+(?:run|verified)`;
// Future / intent markers. A line that carries one is an instruction, not a result.
const FUTURE_WORDS = String.raw`once|after|before|until|when|will|would|shall|should|must|todo|to-?do|belum|pending|nanti|akan|segera|later|planned`;
// Imperative / modal / sequencing tokens. An orchestrator INSTRUCTION is exactly a
// verb phrase ("push … and confirm the board is green", "run them and make sure they
// pass", "trigger the workflow and watch for success"). Its trailing approve-word
// (`green`, `ok`, `success`, `pass`, `done`) is what the instruction wants CONFIRMED,
// not a reported outcome — so any of these tokens on the line means the line is an
// instruction and no gate may fire from it. `push` is the ship verb in imperative
// form (`pushed` is not matched: the word boundary excludes the past tense).
const IMPERATIVE_WORDS = String.raw`and|then|confirm|verify|make\s+sure|check|watch|trigger|run|execute|push|please|ensure|try|look`;
const INTENT_WORDS = String.raw`\b(?:${FUTURE_WORDS}|${IMPERATIVE_WORDS})\b`;

const QA_AUTHOR = /qa/i;
const REVIEW_AUTHOR = /review/i;

function anyLine(comments: CommentRow[], pattern: RegExp, author?: RegExp): boolean {
  return comments.some(
    (comment) =>
      (!author || author.test(comment.author)) &&
      (comment.body ?? '').split('\n').some((line) => pattern.test(line)),
  );
}

// Verdict shape — "<subject> [noun] <separator> <outcome>": the outcome word must
// sit where an outcome belongs, right after the subject. "QA verdict: PASS" and
// "Code review approved." fire; "QA: run the suite, then sign off." and "Review the
// diff and mark done." cannot, because the outcome is buried in an instruction.
function subjectHead(subject: string): string {
  return String.raw`^\s*${MARKER_PREFIX}(?:${subject})\b(?:\s*(?:verdict|review|sign[- ]?off|status|result))?\s*[:=—–]?\s*`;
}

function approveLine(subject: string): RegExp {
  return new RegExp(String.raw`${subjectHead(subject)}(?:${APPROVE_WORDS})\b`, 'i');
}

// Completion shape — the subject opens the statement; `outcomeOk` then scans the
// REST of the line for the outcome, so the subject word itself is never the
// outcome and an intent/reject word before it vetoes the line.
function completionShape(subject: string): RegExp {
  return new RegExp(String.raw`^\s*${MARKER_PREFIX}(?:${subject})\b`, 'i');
}

function rejectLine(subject: string): RegExp {
  return new RegExp(
    String.raw`^\s*${MARKER_PREFIX}(?:${subject})\b[^\n]*\b(?:${REJECT_WORDS})\b`,
    'i',
  );
}

const INTENT_RE = new RegExp(INTENT_WORDS, 'i');
const REJECT_RE = new RegExp(String.raw`\b(?:${REJECT_WORDS})\b`, 'i');
const APPROVE_RE = new RegExp(String.raw`\b(?:${APPROVE_WORDS})\b`, 'i');
// Past-tense ship verbs are completions on their own ("Deployed to VPS, pm2
// restarted"). `push` is deliberately absent: "Deploy dev: push origin/dev." is
// a todo, not a deploy.
const SHIP_WORDS = String.raw`deployed|deploys|released|published|restarted|rolled\s+out|went\s+live|is\s+live`;
const SHIP_RE = new RegExp(String.raw`\b(?:${SHIP_WORDS})\b`, 'i');

// The outcome must not be preceded — within the same line — by an intent marker
// ("once CI is done") or a rejection ("not done yet"). This is what separates
// "Deploy dev: push origin/dev once CI is done." (an instruction ending in `done`)
// from "Deploy dev: done after CI." (a completion that merely mentions `after`).
function outcomeOk(text: string, shape: RegExp, outcomeRe: RegExp): boolean {
  const head = shape.exec(text);
  if (!head) return false;
  const rest = text.slice(head[0].length);
  const outcome = outcomeRe.exec(rest);
  if (!outcome) return false;
  const before = rest.slice(0, outcome.index);
  return !INTENT_RE.test(before) && !REJECT_RE.test(before);
}

function hasOutcome(
  comments: CommentRow[],
  shapes: RegExp[],
  outcomeRe: RegExp,
  author?: RegExp,
): boolean {
  return comments.some(
    (comment) =>
      (!author || author.test(comment.author)) &&
      (comment.body ?? '')
        .split('\n')
        .some((text) => shapes.some((shape) => outcomeOk(text, shape, outcomeRe))),
  );
}

// Approve verdict shapes for qa / review / public verification: the outcome word
// must land immediately after the subject head. `verdictHead` additionally accepts
// a bare "Verdict: PASS" line when it comes from the gate's own author.
function verdictShapes(subject: string): RegExp[] {
  return [approveLine(subject)];
}

function verdictHead(subject: string): RegExp[] {
  return [approveLine(subject), approveLine(VERDICT_SUBJECT)];
}

const DEPLOY_OUTCOME = new RegExp(String.raw`\b(?:${APPROVE_WORDS}|${SHIP_WORDS})\b`, 'i');

// Strict verdict: a verdict-shaped line fires ONLY if the line carries no future /
// intent marker at all. "QA: approve once tests pass." is an instruction; "QA:
// approved." is a verdict. Fail-closed on intent — a missed gate costs a re-run,
// a false gate is the defect this card exists to remove.
function hasVerdict(comments: CommentRow[], shapes: RegExp[], author?: RegExp): boolean {
  return comments.some(
    (comment) =>
      (!author || author.test(comment.author)) &&
      (comment.body ?? '')
        .split('\n')
        .some((text) => !INTENT_RE.test(text) && shapes.some((shape) => shape.test(text))),
  );
}

// Looser completion: the subject opens the statement and the outcome appears later
// on the same line, with no intent/reject word in between. Used for deploy / tests,
// where the natural phrasing varies ("Deployed to VPS, pm2 restarted").
function hasCompletion(
  comments: CommentRow[],
  subject: string,
  outcomeRe: RegExp,
  author?: RegExp,
): boolean {
  const shape = completionShape(subject);
  return comments.some(
    (comment) =>
      (!author || author.test(comment.author)) &&
      (comment.body ?? '').split('\n').some((text) => outcomeOk(text, shape, outcomeRe)),
  );
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
  const firstFileChanged = anyLine(comments, /^\s*file_changed:/i);
  // Commit gate: orchestrator marked the first durable edit AND this task's code is on origin/dev.
  const commit =
    firstFileChanged && (latestFrontendCommits.length > 0 || latestBackendCommits.length > 0);
  const tests =
    hasCompletion(comments, TESTS_SUBJECT, APPROVE_RE) &&
    !anyLine(comments, rejectLine(TESTS_SUBJECT));

  // The remaining gates must be EARNED BY AN OUTCOME. Neither an author name nor a
  // topic is evidence: "Live E2E on app.lembar.web.id using deployed T5 artifact
  // only." is a task instruction, "Deploy dev: push origin/dev." is a todo, and
  // "QA verdict: FAIL" is the opposite of a pass. All three used to fire their gate
  // (the first one twice over) and reported 100% for work that never happened.
  // Rule: a verdict-shaped completion statement fires the gate, a rejecting one
  // vetoes it, and an instruction ("run the suite, then sign off") fires nothing.
  const qaPass =
    hasVerdict(comments, verdictShapes(QA_SUBJECT)) ||
    hasVerdict(comments, verdictHead(QA_SUBJECT), QA_AUTHOR);
  const qaFail =
    anyLine(comments, rejectLine(QA_SUBJECT)) ||
    anyLine(comments, rejectLine(VERDICT_SUBJECT), QA_AUTHOR);
  const qa = qaPass && !qaFail;
  const reviewPass =
    hasVerdict(comments, verdictShapes(REVIEW_SUBJECT)) ||
    hasVerdict(comments, verdictHead(REVIEW_SUBJECT), REVIEW_AUTHOR);
  const reviewFail =
    anyLine(comments, rejectLine(REVIEW_SUBJECT)) ||
    anyLine(comments, rejectLine(VERDICT_SUBJECT), REVIEW_AUTHOR);
  const review = reviewPass && !reviewFail;
  const deploy =
    hasCompletion(comments, DEPLOY_SUBJECT, DEPLOY_OUTCOME) &&
    !anyLine(comments, rejectLine(DEPLOY_SUBJECT));
  // A public verification is only evidence when it states its own result on an
  // explicit marker line. Naming the origin — or the phrase "live e2e" — in prose
  // is a topic, not a verification, and never fires the 100% gate.
  const publicVerification =
    hasVerdict(comments, verdictShapes(PUBLIC_SUBJECT)) &&
    !anyLine(comments, rejectLine(PUBLIC_SUBJECT));

  if (qaFail) {
    warnings.push(
      'QA verdict terakhir untuk task aktif: FAIL — gate qa tidak menyala sampai ada verdict approve.',
    );
  }
  if (reviewFail) {
    warnings.push('Review verdict terakhir untuk task aktif: FAIL / request changes.');
  }

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

function progressFromGates(
  gates: EvidenceGates,
  storyPointsDone = 0,
  storyPointsTotal = 0,
): number {
  let percent = 0;
  for (const step of GATE_ORDER) {
    if (gates[step.key]) percent = Math.max(percent, step.percent);
  }
  if (percent >= 100) return 100;
  // A finished card is only evidence of the gate its lane already carries (tests/
  // review/qa/deploy), so when nothing is left in flight there is no band left to
  // fill. Without this the ratio below would run away: on the live board more SP
  // was done than remained, and the fill read past the next gate.
  if (storyPointsTotal <= 0) return percent;
  // AC 9 — progress from story points. The ordinal gates give the floor and the
  // ceiling of the CURRENT band; inside that band the number advances with the
  // story points of the board's completed work. The band is clamped to the next
  // unearned gate (percent - 1) so a story-point fraction can never fake a gate
  // that has not fired (AC 10: still never a hardcoded number).
  const next = GATE_ORDER.find((step) => step.percent > percent);
  if (!next || storyPointsTotal <= 0) return percent;
  const span = next.percent - percent;
  const fraction = Math.min(1, Math.max(0, storyPointsDone / storyPointsTotal));
  return Math.min(next.percent - 1, Math.round(percent + span * fraction));
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
  // AC 9 — story points. The denominator is the active work band (the running task
  // plus everything still queued); finished cards are already inside a fired gate.
  const storyPointsTotal = items.reduce(
    (sum, item) => (item.status === 'done' ? sum : sum + item.storyPoints),
    0,
  );
  const storyPointsDone = items.reduce(
    (sum, item) => (item.status === 'done' ? sum + item.storyPoints : sum),
    0,
  );
  const { gates, warnings } = evaluateEvidenceGates({
    active,
    comments,
    latestFrontendCommits,
    latestBackendCommits,
    pm2Restarts,
    pm2Services: pm2.services,
    allTasks: tasks,
  });
  const overallPercent = progressFromGates(gates, storyPointsDone, storyPointsTotal);

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
      `Progress = band gate ordinal aktif (created=0, running=10, file_changed=25, commit=50, tests=65, review=75, qa=85, deploy=95, public=100), diisi story point task in-flight (${Math.min(storyPointsDone, storyPointsTotal)}/${storyPointsTotal} SP selesai). Saat ini: ${overallPercent}%.`,
      'Gate review/qa/deploy/public hanya menyala oleh OUTCOME (verdict approve / deploy selesai / public verification berhasil) — bukan oleh nama author atau kalimat topik. Verdict FAIL mencegah gate menyala.',
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
