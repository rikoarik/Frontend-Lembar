import { isMockApiMode, mockNotFound, mockOk } from '@/src/lib/mock-api/preview';

export async function POST(request: Request) {
  if (!isMockApiMode()) return mockNotFound();
  let body: { assessmentId?: string; questionId?: string; reason?: string; note?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }
  return mockOk({
    reportId: `rep_${Math.random().toString(36).slice(2, 8)}`,
    receivedAt: new Date().toISOString(),
    assessmentId: body.assessmentId ?? null,
    questionId: body.questionId ?? null,
  }, { status: 201 });
}
