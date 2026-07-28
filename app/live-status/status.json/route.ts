import { buildLiveStatus } from '@/lib/ops/liveStatus';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const status = await buildLiveStatus();
  return Response.json(status, {
    headers: { 'cache-control': 'no-store, no-cache, must-revalidate' },
  });
}
