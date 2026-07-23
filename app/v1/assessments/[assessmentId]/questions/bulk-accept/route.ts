import { bulkAcceptHandler } from '@/src/lib/mock-api/assessmentHandlers';

export async function POST(
  request: Request,
  context: { params: Promise<{ assessmentId: string }> },
) {
  const { assessmentId } = await context.params;
  return bulkAcceptHandler(request, assessmentId);
}
