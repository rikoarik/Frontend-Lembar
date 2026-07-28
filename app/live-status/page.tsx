import { StatusBoard } from '@/app/live-status/StatusBoard';
import { buildLiveStatus, loadLiveActivity } from '@/lib/ops/liveStatus';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LiveStatusPage() {
  const [doc, initialLogs] = await Promise.all([buildLiveStatus(), loadLiveActivity()]);

  return (
    <div
      className="bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
      style={{ colorScheme: 'light dark' }}
    >
      <StatusBoard doc={doc} initialLogs={initialLogs} />
    </div>
  );
}
