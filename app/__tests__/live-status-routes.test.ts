import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const baseTasks = [
  {
    id: 't_79f6e720',
    title:
      'LEM-OPS-LIVE-001 Hubungkan live-status ke state durable Hermes dan evidence engineering',
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

// The base board has 2 SP done out of the 8 SP still in flight (5 running + 3 todo),
// so inside the `running` band (10 → 24, next gate 25) the story-point fill reads
// 10 + 15 * 2/8 = 13.75 → 14. It can never reach 25: that gate has to be earned.
const BASE_PERCENT = 14;

// A board with nothing completed yet: the band fill is 0 and the number is exactly
// the ordinal gate value. Regression tests use it so their expectations stay crisp.
const liveQaTask = [
  {
    id: 't_1d228272',
    title: '[QA] Live E2E on app.lembar.web.id',
    body: 'Story points: 3',
    assignee: 'lembar-qa',
    status: 'running',
    priority: 1,
    created_at: 1785244016,
    started_at: 1785244018,
    completed_at: null,
    last_heartbeat_at: null,
    result: null,
  },
];

const baseEvents = [
  { task_id: 't_79f6e720', kind: 'created', payload: null, created_at: 1785244462 },
  { task_id: 't_79f6e720', kind: 'heartbeat', payload: null, created_at: 1785244750 },
  { task_id: 't_79f6e720', kind: 'heartbeat', payload: null, created_at: 1785244810 },
  { task_id: 't_79f6e720', kind: 'heartbeat', payload: null, created_at: 1785244870 },
];

const pm2Online = {
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

const pm2Noisy = {
  services: {
    lembarApi: 'online',
    lembarFrontend: 'online',
    lembarWorker: 'online',
  },
  evidence: [
    'PM2 lembar-api: online · uptime 30s · restart 17',
    'PM2 lembar-frontend: online · uptime 25s · restart 21',
    'PM2 lembar-worker: online · uptime 180s · restart 0',
  ],
};

const pm2Fixtures = {
  online: pm2Online,
  noisy: pm2Noisy,
};

function stubBaseEnv(
  tasks = baseTasks,
  events = baseEvents,
  pm2Key: keyof typeof pm2Fixtures = 'online',
) {
  vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(tasks));
  vi.stubEnv('LEMBAR_LIVE_STATUS_EVENTS_JSON', JSON.stringify(events));
  vi.stubEnv(
    'LEMBAR_LIVE_STATUS_FE_COMMITS_JSON',
    JSON.stringify(['fe12345 feat(fe): durable live status']),
  );
  vi.stubEnv(
    'LEMBAR_LIVE_STATUS_BE_COMMITS_JSON',
    JSON.stringify(['be12345 feat(be): durable queue']),
  );
  vi.stubEnv('LEMBAR_LIVE_STATUS_PM2_JSON', JSON.stringify(pm2Fixtures[pm2Key]));
  vi.stubEnv('LEMBAR_LIVE_STATUS_COMMENTS_JSON', JSON.stringify([]));
}

describe('live-status routes', () => {
  beforeEach(() => {
    vi.resetModules();
    stubBaseEnv();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('serves durable status derived from Hermes board with evidence-gated progress', async () => {
    const route = await import('../live-status/status.json/route');
    const response = await route.GET();
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.board).toMatchObject({ name: 'lembar', taskId: 't_79f6e720', status: 'running' });
    // running=10 is the band floor; the 2 completed SP of 8 in flight fill it to 14.
    // The number is derived, never hardcoded (AC 10).
    expect(json.overallPercent).toBe(BASE_PERCENT);
    expect(json.evidenceGates).toMatchObject({
      created: true,
      running: true,
      firstFileChanged: false,
      commit: false,
      tests: false,
      review: false,
      qa: false,
      deploy: false,
      publicVerification: false,
    });
    expect(json.currentTask).toContain('t_79f6e720');
    expect(json.latestFrontendCommits[0]).toContain('fe12345');
    expect(json.latestBackendCommits[0]).toContain('be12345');
    expect(json.evidence.some((line: string) => line.includes('PM2 lembar-frontend'))).toBe(true);
  });

  it('progress does not climb from heartbeats alone', async () => {
    const onlyHeartbeats = baseEvents.filter((event) => event.kind === 'heartbeat');
    vi.stubEnv('LEMBAR_LIVE_STATUS_EVENTS_JSON', JSON.stringify(onlyHeartbeats));
    const route = await import('../live-status/status.json/route');
    const json = await (await route.GET()).json();
    // Even with 50 heartbeats, evidence gates still gate progress at the highest gate that fired.
    expect(json.overallPercent).toBe(BASE_PERCENT);
  });

  it('climbs the story-point band without ever faking the next gate (AC 9)', async () => {
    // 8 SP in flight, 2 SP done → 14% inside the running band. The `running` gate is
    // worth 10 and the next gate (file_changed) is worth 25; the fill must stay
    // strictly below 25 so story points can never pretend a gate fired.
    const route = await import('../live-status/status.json/route');
    const json = await (await route.GET()).json();
    expect(json.overallPercent).toBeGreaterThan(10);
    expect(json.overallPercent).toBeLessThan(25);
    expect(json.items.find((item: { id: string }) => item.id === 't_bc88d5dc').storyPoints).toBe(2);
  });

  it('progress climbs through evidence gates in owner-defined order', async () => {
    const comments = [
      {
        author: 'orchestrator',
        body: 'file_changed: first durable UI/source-of-truth edit detected.',
      },
      { author: 'lembar-reviewer', body: 'Review verdict: PASS — gates are outcome-based.' },
      { author: 'lembar-qa', body: 'QA signed off.' },
      { author: 'orchestrator', body: 'Deploy dev: done, pm2 restarted.' },
      { author: 'orchestrator', body: 'public verification: PASS — /live-status 200 live.' },
    ];
    vi.stubEnv('LEMBAR_LIVE_STATUS_COMMENTS_JSON', JSON.stringify(comments));
    const route = await import('../live-status/status.json/route');
    const json = await (await route.GET()).json();
    expect(json.evidenceGates.firstFileChanged).toBe(true);
    expect(json.evidenceGates.commit).toBe(true); // commit is auto-detected from git log (origin/dev has commits since started_at)
    expect(json.evidenceGates.review).toBe(true);
    expect(json.evidenceGates.qa).toBe(true);
    expect(json.evidenceGates.deploy).toBe(true);
    expect(json.evidenceGates.publicVerification).toBe(true);
    expect(json.overallPercent).toBe(100);
  });

  it('an approving verdict followed by a FAIL verdict leaves the gate OFF', async () => {
    vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(liveQaTask));
    vi.stubEnv(
      'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
      JSON.stringify([
        { task_id: 't_1d228272', author: 'lembar-reviewer', body: 'Review verdict: PASS' },
        { task_id: 't_1d228272', author: 'lembar-qa', body: 'QA signed off.' },
        {
          task_id: 't_1d228272',
          author: 'lembar-reviewer',
          body: 'Review verdict: FAIL — gates still prose.',
        },
        {
          task_id: 't_1d228272',
          author: 'lembar-qa',
          body: 'QA verdict: FAIL — regression found.',
        },
      ]),
    );
    const route = await import('../live-status/status.json/route');
    const json = await (await route.GET()).json();
    expect(json.evidenceGates.qa).toBe(false);
    expect(json.evidenceGates.review).toBe(false);
    expect(json.overallPercent).toBe(10);
  });

  it('a board with nothing in flight stays at the ordinal gate, no runaway fill', async () => {
    // Live regression: with more SP done than remained in flight the story-point
    // ratio ran past the next gate. A finished board has no band left to fill.
    vi.stubEnv(
      'LEMBAR_LIVE_STATUS_TASKS_JSON',
      JSON.stringify([
        {
          id: 't_done1',
          title: 'finished epic',
          body: 'Story points: 21',
          assignee: 'default',
          status: 'done',
          priority: 1,
          created_at: 1785244013,
          started_at: 1785244043,
          completed_at: 1785244127,
          last_heartbeat_at: null,
          result: null,
        },
      ]),
    );
    const route = await import('../live-status/status.json/route');
    const json = await (await route.GET()).json();
    expect(json.evidenceGates.running).toBe(false);
    expect(json.overallPercent).toBe(0);
  });

  it('emits PM2 warning when any service restart count is high', async () => {
    stubBaseEnv(baseTasks, baseEvents, 'noisy');
    const route = await import('../live-status/status.json/route');
    const json = await (await route.GET()).json();
    expect(json.warnings.some((line: string) => /restart/i.test(line))).toBe(true);
    expect(json.warnings.some((line: string) => line.includes('lembar-frontend'))).toBe(true);
  });

  it('activity feed collapses heartbeats and exposes a counter', async () => {
    const route = await import('../live-status/activity.json/route');
    const json = await (await route.GET()).json();
    // Only one 'created' line should remain; heartbeats must NOT flood the feed.
    expect(json.lines).toHaveLength(1);
    expect(json.lines[0]).toContain('created t_79f6e720');
    expect(json.heartbeatCount).toBe(3);
  });

  it('ignores reviewer/QA/deploy comments that belong to a DIFFERENT card', async () => {
    // Regression: loadComments used to be board-wide, so another card's review/QA
    // comments fired this card's gates and pushed an unfinished task to 100%.
    vi.stubEnv(
      'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
      JSON.stringify([
        { task_id: 't_OTHER', author: 'lembar-reviewer', body: 'Verdict: PASS' },
        { task_id: 't_OTHER', author: 'lembar-qa', body: 'QA signed off.' },
        { task_id: 't_OTHER', author: 'orchestrator', body: 'Deploy dev: pm2 restart all' },
        {
          task_id: 't_OTHER',
          author: 'orchestrator',
          body: 'Live E2E on app.lembar.web.id using deployed artifact only.',
        },
      ]),
    );
    const route = await import('../live-status/status.json/route');
    const json = await (await route.GET()).json();
    expect(json.evidenceGates.review).toBe(false);
    expect(json.evidenceGates.qa).toBe(false);
    expect(json.evidenceGates.deploy).toBe(false);
    expect(json.evidenceGates.publicVerification).toBe(false);
    expect(json.overallPercent).toBe(BASE_PERCENT);
  });

  it('counts only this card own file_changed evidence', async () => {
    vi.stubEnv(
      'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
      JSON.stringify([
        { task_id: 't_OTHER', author: 'orchestrator', body: 'file_changed: other card' },
      ]),
    );
    const route = await import('../live-status/status.json/route');
    const json = await (await route.GET()).json();
    expect(json.evidenceGates.firstFileChanged).toBe(false);
    expect(json.overallPercent).toBe(BASE_PERCENT);
  });

  it('does not self-fire gates from a comment that merely NAMES them', async () => {
    // Regression: the owner's progress spec lists "deploy=95, public verification=100,
    // PM2 restart" as prose. A mid-sentence match used to fire deploy + publicVerification
    // and report 100% for work that had not happened.
    vi.stubEnv(
      'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
      JSON.stringify([
        {
          task_id: 't_79f6e720',
          author: 'orchestrator',
          body: 'Progress wajib pakai evidence gates: created=0, running=10, first file changed=25, commit=50, tests=65, review=75, QA=85, deploy=95, public verification=100. Heartbeat tidak boleh menaikkan progress. High PM2 restart count wajib jadi warning.',
        },
      ]),
    );
    const route = await import('../live-status/status.json/route');
    const json = await (await route.GET()).json();
    expect(json.evidenceGates.deploy).toBe(false);
    expect(json.evidenceGates.publicVerification).toBe(false);
    expect(json.evidenceGates.tests).toBe(false);
    expect(json.evidenceGates.qa).toBe(false);
    expect(json.overallPercent).toBe(BASE_PERCENT);
  });

  // --- Live false positive on card t_1d228272 (failed twice by QA) ---------------
  // The reviewer reproduced 100% for a card whose only two comments were a task
  // instruction and a FAIL verdict. Both fixtures below are that card verbatim.

  it('a task instruction naming the public origin does NOT fire publicVerification', async () => {
    vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(liveQaTask));
    vi.stubEnv(
      'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
      JSON.stringify([
        {
          task_id: 't_1d228272',
          author: 'orchestrator',
          body: 'Live E2E on app.lembar.web.id using deployed T5 artifact only. Drive login, generate, status, review, output. No redeploy.',
        },
      ]),
    );
    const route = await import('../live-status/status.json/route');
    const json = await (await route.GET()).json();
    expect(json.evidenceGates.publicVerification).toBe(false);
    expect(json.evidenceGates.deploy).toBe(false);
    expect(json.overallPercent).toBe(10);
  });

  it('a "QA verdict: FAIL" comment leaves qa false and the card at the running floor', async () => {
    vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(liveQaTask));
    vi.stubEnv(
      'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
      JSON.stringify([
        {
          task_id: 't_1d228272',
          author: 'orchestrator',
          body: 'Live E2E on app.lembar.web.id using deployed T5 artifact only. Drive login, generate, status, review, output. No redeploy.',
        },
        {
          task_id: 't_1d228272',
          author: 'lembar-qa',
          body: 'QA verdict: FAIL for full E2E generate \u2192 status/history \u2192 review \u2192 output.',
        },
      ]),
    );
    const route = await import('../live-status/status.json/route');
    const json = await (await route.GET()).json();
    expect(json.evidenceGates.qa).toBe(false);
    expect(json.evidenceGates.publicVerification).toBe(false);
    expect(json.overallPercent).toBe(10);
  });

  it('author alone is never evidence: a reviewer/QA author without a verdict fires nothing', async () => {
    vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(liveQaTask));
    vi.stubEnv(
      'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
      JSON.stringify([
        {
          task_id: 't_1d228272',
          author: 'lembar-reviewer',
          body: 'Review handoff: please take a look.',
        },
        { task_id: 't_1d228272', author: 'lembar-qa', body: 'Mulai cek sebentar lagi.' },
      ]),
    );
    const route = await import('../live-status/status.json/route');
    const json = await (await route.GET()).json();
    expect(json.evidenceGates.review).toBe(false);
    expect(json.evidenceGates.qa).toBe(false);
    expect(json.overallPercent).toBe(10);
  });

  it('approving verdicts still fire their gates', async () => {
    vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(liveQaTask));
    vi.stubEnv(
      'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
      JSON.stringify([
        { task_id: 't_1d228272', author: 'lembar-reviewer', body: 'Review verdict: PASS' },
        { task_id: 't_1d228272', author: 'lembar-qa', body: 'QA signed off.' },
        { task_id: 't_1d228272', author: 'orchestrator', body: 'Deploy dev: completed.' },
        {
          task_id: 't_1d228272',
          author: 'orchestrator',
          body: 'public verification: PASS — /live-status 200, gates match live card.',
        },
      ]),
    );
    const route = await import('../live-status/status.json/route');
    const json = await (await route.GET()).json();
    expect(json.evidenceGates.review).toBe(true);
    expect(json.evidenceGates.qa).toBe(true);
    expect(json.evidenceGates.deploy).toBe(true);
    expect(json.evidenceGates.publicVerification).toBe(true);
    expect(json.overallPercent).toBe(100);
  });

  // --- Defect class, not just the named strings ---------------------------------
  // Round 1 of the review showed the first fix patched the three fixtures but left
  // the class open: the gates still fired on an instruction carrying one incidental
  // approve-word (`done`, `sign off`). Each case below is one INSTRUCTION comment on
  // a running card and must leave its gate OFF.
  const instructionCases: { gate: string; body: string }[] = [
    { gate: 'deploy', body: 'Deploy dev: push origin/dev once CI is done.' },
    { gate: 'deploy', body: 'Deploy dev: push origin/dev.' },
    { gate: 'deploy', body: 'Deploy to VPS after the review passes.' },
    { gate: 'deploy', body: 'Deploy dev: not done yet.' },
    { gate: 'qa', body: 'QA: run the suite, then sign off.' },
    { gate: 'qa', body: 'QA will sign off after the fix.' },
    { gate: 'qa', body: 'QA: approve once CI is green.' },
    { gate: 'review', body: 'Review the diff and mark done.' },
    { gate: 'review', body: 'Code review will approve once tests pass.' },
    { gate: 'review', body: 'Review handoff: please take a look.' },
    {
      gate: 'publicVerification',
      body: 'Live E2E on app.lembar.web.id: run after deploy is done.',
    },
    { gate: 'publicVerification', body: 'Public verification will run later.' },
    { gate: 'publicVerification', body: 'We still need public verification.' },
    { gate: 'tests', body: 'tests will pass after the fix.' },
    { gate: 'tests', body: 'Run tests once the build is done.' },
  ];

  it.each(instructionCases)(
    'an instruction ("$body") does NOT fire the $gate gate',
    async ({ gate, body }) => {
      vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(liveQaTask));
      vi.stubEnv(
        'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
        JSON.stringify([{ task_id: 't_1d228272', author: 'orchestrator', body }]),
      );
      const route = await import('../live-status/status.json/route');
      const json = await (await route.GET()).json();
      expect(json.evidenceGates[gate]).toBe(false);
      // Nothing but the running gate fired, so the number stays at the floor.
      expect(json.overallPercent).toBe(10);
    },
  );

  // --- Round-3 class closure: instruction + incidental approve-word --------------
  // The narrow forms above (`"Deploy dev: push origin/dev."`, `"… once CI is done."`)
  // carry NO approve-word, so they were green while the class stayed open: every line
  // below is an INSTRUCTION whose trailing approve-word (`green`, `ok`, `verified`,
  // `done`, `success`, `succeeded`, `pass`, `restarted`) is what the instruction asks
  // to be CONFIRMED, not a reported outcome. 11/17 of these fired deploy (95%) or
  // tests (65%) before this fix. Each must leave its gate OFF at the running floor.
  const instructionWithApproveWord: { gate: string; body: string }[] = [
    { gate: 'deploy', body: 'Deploy dev: push origin/dev and confirm the board is green.' },
    { gate: 'deploy', body: 'Deploy dev: push origin/dev, verify the deploy is ok.' },
    { gate: 'deploy', body: 'Deploy dev: push origin/dev and make sure the release is verified.' },
    { gate: 'deploy', body: 'Deploy dev: push origin/dev, then mark the card done.' },
    { gate: 'deploy', body: 'Deploy dev: push origin/dev, confirm pm2 restarted.' },
    { gate: 'deploy', body: 'Deploy dev: trigger the workflow and watch for success.' },
    { gate: 'deploy', body: 'Deploy dev: push origin/dev and check that everything is green.' },
    { gate: 'deploy', body: 'Deploy dev: push origin/dev and confirm the release succeeded.' },
    { gate: 'tests', body: 'tests: run them and make sure they pass.' },
    { gate: 'tests', body: 'tests: run the suite and confirm it is green.' },
    { gate: 'tests', body: 'test suite: execute it and verify the result is ok.' },
  ];

  it.each(instructionWithApproveWord)(
    'an instruction carrying an incidental approve-word ("$body") does NOT fire the $gate gate',
    async ({ gate, body }) => {
      vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(liveQaTask));
      vi.stubEnv(
        'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
        JSON.stringify([{ task_id: 't_1d228272', author: 'orchestrator', body }]),
      );
      const route = await import('../live-status/status.json/route');
      const json = await (await route.GET()).json();
      expect(json.evidenceGates[gate]).toBe(false);
      // Only `running` fired, so the number stays at the running floor (10).
      expect(json.overallPercent).toBe(10);
    },
  );

  // The mirror: the same subjects still fire when they report a genuine outcome, so
  // the strict rule above did not simply mute deploy/tests.
  const outcomeNotInstruction: { gate: string; body: string }[] = [
    { gate: 'deploy', body: 'Deploy dev: completed, pm2 restarted.' },
    { gate: 'deploy', body: 'Deployed to VPS, pm2 restarted.' },
    { gate: 'tests', body: 'Tests passed.' },
  ];

  it.each(outcomeNotInstruction)(
    'an outcome ("$body") still fires the $gate gate',
    async ({ gate, body }) => {
      vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(liveQaTask));
      vi.stubEnv(
        'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
        JSON.stringify([{ task_id: 't_1d228272', author: 'orchestrator', body }]),
      );
      const route = await import('../live-status/status.json/route');
      const json = await (await route.GET()).json();
      expect(json.evidenceGates[gate]).toBe(true);
    },
  );

  // --- Round-4 closure: `pm2 restart` is a TOPIC, not a deploy subject -------------
  // Found on the LIVE comment corpus: the reviewer's own `## Verdict: REQUEST CHANGES`
  // comment on t_0695a61c carries the bullet "- PM2 restart ≥ 10 → warning (verified,
  // and it is firing on the live board)." Because `pm2\s+restart` was an alternative
  // of DEPLOY_SUBJECT, that prose line alone advanced deploy to 95%. Every line below
  // merely NAMES the restart-count feature and must leave deploy false.
  const pm2RestartMentions: { gate: string; body: string }[] = [
    {
      gate: 'deploy',
      body: '- PM2 restart ≥ 10 → warning (verified, and it is firing on the live board).',
    },
    { gate: 'deploy', body: 'PM2 restart count 16732 — verified high.' },
    { gate: 'deploy', body: 'pm2 restart lembar-frontend succeeded.' },
    { gate: 'deploy', body: 'PM2 restart lembar-api: restart 68x, service ok.' },
  ];

  it.each(pm2RestartMentions)(
    'a line that merely mentions pm2 restart ("$body") does NOT fire the $gate gate',
    async ({ gate, body }) => {
      vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(liveQaTask));
      vi.stubEnv(
        'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
        JSON.stringify([{ task_id: 't_1d228272', author: 'lembar-reviewer', body }]),
      );
      const route = await import('../live-status/status.json/route');
      const json = await (await route.GET()).json();
      expect(json.evidenceGates[gate]).toBe(false);
      expect(json.overallPercent).toBe(10);
    },
  );

  // The mirror: dropping the `pm2 restart` alternative must not mute a genuine pm2
  // deploy report. Both shapes below are real outcomes and still fire deploy.
  const pm2Outcomes: { gate: string; body: string }[] = [
    { gate: 'deploy', body: 'Deployed to VPS, pm2 restarted.' },
    { gate: 'deploy', body: 'Deploy dev: completed, pm2 restarted.' },
    { gate: 'deploy', body: 'Deploy dev: done, pm2 restarted.' },
  ];

  it.each(pm2Outcomes)(
    'a genuine pm2 outcome ("$body") still fires the $gate gate',
    async ({ gate, body }) => {
      vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(liveQaTask));
      vi.stubEnv(
        'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
        JSON.stringify([{ task_id: 't_1d228272', author: 'orchestrator', body }]),
      );
      const route = await import('../live-status/status.json/route');
      const json = await (await route.GET()).json();
      expect(json.evidenceGates[gate]).toBe(true);
    },
  );

  // --- Round-5 closure: the intent veto must be LINE-WIDE -------------------------
  // R1 requires deploy/tests to use the SAME strict rule as qa/review/publicVerification:
  // any imperative/modal/future token ON THE LINE means the gate never fires. The
  // previous `outcomeOk`-only path scoped the veto to the substring BEFORE the outcome
  // word, so an instruction whose approve-word lands FIRST was never vetoed by the
  // imperative token that followed it. Every line below is an INSTRUCTION (the action
  // is still to be performed) and fired its gate before this fix.
  const approveBeforeImperative: { gate: string; body: string }[] = [
    { gate: 'deploy', body: 'Deploy dev: CI done, push origin/dev.' },
    { gate: 'deploy', body: 'Deploy dev: ok to push origin/dev now.' },
    { gate: 'deploy', body: 'Deploy dev: green light, push origin/dev.' },
    { gate: 'deploy', body: 'Deploy dev: done on my branch, please push origin/dev.' },
    { gate: 'tests', body: 'tests: all green, now push.' },
    { gate: 'tests', body: 'tests: passed locally, please re-run on CI.' },
    { gate: 'tests', body: 'tests: pass required before we ship.' },
  ];

  it.each(approveBeforeImperative)(
    'an instruction with the approve-word BEFORE the imperative ("$body") does NOT fire the $gate gate',
    async ({ gate, body }) => {
      vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(liveQaTask));
      vi.stubEnv(
        'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
        JSON.stringify([{ task_id: 't_1d228272', author: 'orchestrator', body }]),
      );
      const route = await import('../live-status/status.json/route');
      const json = await (await route.GET()).json();
      expect(json.evidenceGates[gate]).toBe(false);
      expect(json.overallPercent).toBe(10);
    },
  );

  // The mirror: the line-wide veto must not mute a genuine outcome. Each line below
  // reports a real result and carries no imperative / modal / future token.
  const lineWideOutcomes: { gate: string; body: string }[] = [
    { gate: 'deploy', body: 'Deploy dev: completed, pm2 restarted.' },
    { gate: 'deploy', body: 'Deployed to VPS, pm2 restarted.' },
    { gate: 'tests', body: 'Tests passed.' },
    { gate: 'tests', body: 'tests: green.' },
  ];

  it.each(lineWideOutcomes)(
    'a genuine outcome ("$body") still fires the $gate gate under the line-wide veto',
    async ({ gate, body }) => {
      vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(liveQaTask));
      vi.stubEnv(
        'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
        JSON.stringify([{ task_id: 't_1d228272', author: 'orchestrator', body }]),
      );
      const route = await import('../live-status/status.json/route');
      const json = await (await route.GET()).json();
      expect(json.evidenceGates[gate]).toBe(true);
    },
  );

  const completionCases: { gate: string; author: string; body: string }[] = [
    { gate: 'deploy', author: 'orchestrator', body: 'Deploy dev: done.' },
    { gate: 'deploy', author: 'orchestrator', body: 'Deployed to VPS, pm2 restarted.' },
    { gate: 'qa', author: 'lembar-qa', body: 'QA verdict: PASS' },
    { gate: 'qa', author: 'lembar-qa', body: 'QA: approved' },
    { gate: 'review', author: 'lembar-reviewer', body: 'Code review approved.' },
    { gate: 'review', author: 'lembar-reviewer', body: 'Review: approved' },
    {
      gate: 'publicVerification',
      author: 'orchestrator',
      body: 'public verification: PASS — 200.',
    },
    { gate: 'tests', author: 'orchestrator', body: 'Tests passed.' },
  ];

  it.each(completionCases)(
    'a completion ("$body") still fires the $gate gate',
    async ({ gate, author, body }) => {
      vi.stubEnv('LEMBAR_LIVE_STATUS_TASKS_JSON', JSON.stringify(liveQaTask));
      vi.stubEnv(
        'LEMBAR_LIVE_STATUS_COMMENTS_JSON',
        JSON.stringify([{ task_id: 't_1d228272', author, body }]),
      );
      const route = await import('../live-status/status.json/route');
      const json = await (await route.GET()).json();
      expect(json.evidenceGates[gate]).toBe(true);
    },
  );
});
