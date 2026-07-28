/**
 * Internal JSON endpoint for the live-status board.
 *
 * Reads /home/hermes/Workspace/Deliverables/lembar-live-status.json
 * on the server and returns its content as JSON. Kept intentionally
 * unauthenticated since the data is non-sensitive operational status.
 */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STATUS_PATH = path.join(
  process.env.HOME || '/home/hermes',
  'Workspace',
  'Deliverables',
  'lembar-live-status.json',
);

export async function GET() {
  try {
    const raw = await fs.readFile(STATUS_PATH, 'utf8');
    const json = JSON.parse(raw);
    return Response.json(json, {
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch {
    return Response.json(null, {
      status: 200,
      headers: { 'cache-control': 'no-store' },
    });
  }
}
