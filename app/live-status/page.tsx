/**
 * Live project status page (realtime version).
 *
 * Reads a JSON snapshot written by the agent at
 *   /home/hermes/Workspace/Deliverables/lembar-live-status.json
 * on every request and renders a calm, dark, editorial-flavored dashboard.
 *
 * Realtime: the client poll re-fetches every 4 seconds, so updates written
 * to the JSON file appear without a manual refresh.
 */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { StatusBoard } from '@/app/live-status/StatusBoard';

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

type LogLine = { line: string };

const STATUS_PATH = path.join(
  process.env.HOME || '/home/hermes',
  'Workspace',
  'Deliverables',
  'lembar-live-status.json',
);

async function loadStatus(): Promise<StatusDoc | null> {
  try {
    const raw = await fs.readFile(STATUS_PATH, 'utf8');
    return JSON.parse(raw) as StatusDoc;
  } catch {
    return null;
  }
}

async function loadLogs(): Promise<string[]> {
  try {
    const logPath = path.join(
      process.env.HOME || '/home/hermes',
      'Workspace',
      'Deliverables',
      'lembar-activity.log',
    );
    const raw = await fs.readFile(logPath, 'utf8');
    return raw
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .slice(-200);
  } catch {
    return [];
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveStatusPage() {
  const doc = await loadStatus();
  const initialLogs = await loadLogs();

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-zinc-950 text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 0%, rgb(244 244 245 / 0.6), transparent 38%), radial-gradient(circle at 80% 100%, rgb(244 244 245 / 0.4), transparent 44%)',
        }}
      />
      <StatusBoard doc={doc} initialLogs={initialLogs} />
    </main>
  );
}
