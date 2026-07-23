import { OutputCenterView } from '@/src/features/output/OutputCenterView';

export default async function OutputPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  return <OutputCenterView assessmentId={assessmentId} />;
}
