import { listAssessmentsHandler } from '@/src/lib/mock-api/assessmentHandlers';

export async function GET(request: Request) {
  return listAssessmentsHandler(request);
}
