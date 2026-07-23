import { patchQuestionHandler } from '@/src/lib/mock-api/assessmentHandlers';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ assessmentId: string; questionId: string }> },
) {
  const { assessmentId, questionId } = await context.params;
  return patchQuestionHandler(request, assessmentId, questionId);
}
