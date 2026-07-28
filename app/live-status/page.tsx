import { LiveStatusBoard } from '@/app/live-status/LiveStatusBoard';
import { buildLiveStatus } from '@/lib/ops/liveStatus';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveStatusPage() {
  const doc = await buildLiveStatus().catch(() => null);
  return <LiveStatusBoard initialDoc={doc} initialActivity={doc?.activity ?? []} />;
}
