import { finalizeHandler } from '@/src/lib/mock-api/assessmentHandlers';

export async function POST(
  request: Request,
  context: { params: Promise<{ assessmentId: string }> },
) {
  const { assessmentId } = await context.params;
  return finalizeHandler(request, assessmentId);
}
