import { outputHandler } from '@/src/lib/mock-api/assessmentHandlers';

export async function GET(
  _request: Request,
  context: { params: Promise<{ assessmentId: string }> },
) {
  const { assessmentId } = await context.params;
  return outputHandler(assessmentId);
}
