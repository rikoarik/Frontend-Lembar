import { loadLiveActivity } from '@/lib/ops/liveStatus';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return Response.json(
    { lines: await loadLiveActivity() },
    { headers: { 'cache-control': 'no-store, no-cache, must-revalidate' } },
  );
}
