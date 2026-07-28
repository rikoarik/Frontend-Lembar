/**
 * Activity log endpoint.
 *
 * Reads /home/hermes/Workspace/Deliverables/lembar-activity.log
 * on the server and returns up to 200 most-recent lines as JSON.
 * Used by the /live-status page to render a rolling activity feed.
 */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const LOG_PATH = path.join(
  process.env.HOME || '/home/hermes',
  'Workspace',
  'Deliverables',
  'lembar-activity.log',
);

const MAX_LINES = 200;

export async function GET() {
  try {
    const raw = await fs.readFile(LOG_PATH, 'utf8');
    const allLines = raw.split('\n').filter((line) => line.trim().length > 0);
    const lines = allLines.slice(-MAX_LINES);
    return Response.json({ lines }, {
      headers: { 'cache-control': 'no-store' },
    });
  } catch {
    return Response.json({ lines: [] }, {
      headers: { 'cache-control': 'no-store' },
    });
  }
}
