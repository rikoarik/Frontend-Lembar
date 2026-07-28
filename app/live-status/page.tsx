import { LiveStatusBoard } from '@/app/live-status/LiveStatusBoard';
import { buildLiveStatus, loadLiveActivity } from '@/lib/ops/liveStatus';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveStatusPage() {
  const [doc, activity] = await Promise.all([
    buildLiveStatus().catch(() => null),
    loadLiveActivity().catch(() => []),
  ]);

  return <LiveStatusBoard initialDoc={doc} initialActivity={doc?.activity ?? activity} />;
}
