import { FinalizeView } from '@/src/features/review/FinalizeView';

export default async function FinalizePage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  return <FinalizeView assessmentId={assessmentId} />;
}
