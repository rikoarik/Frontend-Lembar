import { getAssessmentHandler } from '@/src/lib/mock-api/assessmentHandlers';

export async function GET(
  request: Request,
  context: { params: Promise<{ assessmentId: string }> },
) {
  const { assessmentId } = await context.params;
  const url = new URL(request.url);
  const mode = url.searchParams.get('mode');
  return getAssessmentHandler(
    request,
    assessmentId,
    mode === 'detail' ? 'detail' : mode === 'quick' ? 'quick' : undefined,
  );
}
