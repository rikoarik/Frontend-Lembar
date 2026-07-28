import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const tasks = [
  {
    id: 't_79f6e720',
    title: 'LEM-OPS-LIVE-001 Hubungkan live-status ke state durable Hermes dan evidence engineering',
    body: 'Story points: 5',
    assignee: 'lembar-frontend',
    status: 'running',
    priority: 1,
    created_at: 1785244462,
    started_at: 1785244465,
    completed_at: null,
    last_heartbeat_at: 1785244750,
    result: null,
  },
  {
    id: 't_1d228272',
    title: '[QA] Live E2E on app.lembar.web.id',
    body: 'Story points: 3',
    assignee: 'lembar-qa',
    status: 'todo',
    priority: 1,
    created_at: 1785244016,
    started_at: null,
    completed_at: null,
    last_heartbeat_at: null,
    result: null,
  },
  {
    id: 't_bc88d5dc',
    title: 'Lembar RC engineering epic (origin/dev)',
    body: 'Story points: 2',
    assignee: 'default',
    status: 'done',
    priority: 1,
    created_at: 1785244013,
    started_at: 1785244043,
    completed_at: 1785244127,
    last_heartbeat_at: null,
    result: null,
  },
];

const events = [
  { task_id: 't_79f6e720', kind: 'created', payload: null, created_at: 1785244462 },
  { task_id: 't_79f6e720', kind: 'heartbeat', payload: null, created_at: 1785244750 },
];

const pm2 = {
  services: {
    lembarApi: 'online',
    lembarFrontend: 'online',
    lembarWorker: 'online',
  },
  evidence: [
    'PM2 lembar-api: online · uptime 120s · restart 1',
    'PM2 lembar-frontend: online · uptime 30s · restart 2',
    'PM2 lembar-worker: online · uptime 180s · restart 0',
  ],
};

describe('live-status routes', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(tasks));
    vi.stubEnv('LEMBAR_LIVE_STATUS_EVENTS_JSON', JSON.stringify(events));
    vi.stubEnv('LEMBAR_LIVE_STATUS_FE_COMMITS_JSON', JSON.stringify(['fe12345 feat(fe): durable live status']));
    vi.stubEnv('LEMBAR_LIVE_STATUS_BE_COMMITS_JSON', JSON.stringify(['be12345 feat(be): durable queue']));
    vi.stubEnv('LEMBAR_LIVE_STATUS_PM2_JSON', JSON.stringify(pm2));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('serves durable status derived from Hermes board', async () => {
    const route = await import('../live-status/status.json/route');
    const response = await route.GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.board).toMatchObject({ name: 'lembar', taskId: 't_79f6e720', status: 'running' });
    expect(json.overallPercent).toBe(45);
    expect(json.currentTask).toContain('t_79f6e720');
    expect(json.latestFrontendCommits[0]).toContain('fe12345');
    expect(json.latestBackendCommits[0]).toContain('be12345');
    expect(json.evidence.some((line: string) => line.includes('PM2 lembar-frontend'))).toBe(true);
  });

  it('serves activity lines from task events', async () => {
    const route = await import('../live-status/activity.json/route');
    const response = await route.GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.lines).toHaveLength(2);
    expect(json.lines.some((line: string) => line.includes('heartbeat t_79f6e720'))).toBe(true);
  });
});
