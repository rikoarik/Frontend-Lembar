import { JobProgressView } from '@/src/features/jobs/JobProgressView';

export default async function JobProgressPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <JobProgressView jobId={jobId} />;
}
