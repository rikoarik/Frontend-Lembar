import { QuickReviewView } from '@/src/features/review/QuickReviewView';

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ assessmentId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { assessmentId } = await params;
  const { mode } = await searchParams;
  return (
    <QuickReviewView
      assessmentId={assessmentId}
      mode={mode === 'detail' ? 'detail' : 'quick'}
    />
  );
}
