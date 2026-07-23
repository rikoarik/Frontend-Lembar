import { NextResponse } from 'next/server';
import {
  bulkAccept,
  ensureAssessmentFromJob,
  finalizeAssessment,
  getAssessment,
  getOutputPackage,
  listAssessments,
  updateQuestionContent,
  updateQuestionState,
} from '@/src/features/review/mockStore';
import type { AssessmentLifecycle, QuestionReviewState } from '@/src/features/review/types';
import { isMockApiMode, mockFail, mockNotFound, mockOk } from '@/src/lib/mock-api/preview';

function requireMock() {
  if (!isMockApiMode()) return mockNotFound();
  return null;
}

export async function listAssessmentsHandler(request: Request) {
  const denied = requireMock();
  if (denied) return denied;
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? undefined;
  const lifecycle = (url.searchParams.get('lifecycle') as AssessmentLifecycle | 'all' | null) ?? 'all';
  return mockOk(listAssessments({ q, lifecycle: lifecycle || 'all' }));
}

export async function getAssessmentHandler(
  _request: Request,
  assessmentId: string,
  reviewMode?: 'quick' | 'detail',
) {
  const denied = requireMock();
  if (denied) return denied;
  let item = getAssessment(assessmentId);
  if (!item && assessmentId.startsWith('asm_')) {
    item = ensureAssessmentFromJob(assessmentId, reviewMode ?? 'quick');
  }
  if (!item) return mockFail('RESOURCE_NOT_FOUND', 'Lembar tidak ditemukan.', 404);
  return mockOk(item);
}

export async function patchQuestionHandler(
  request: Request,
  assessmentId: string,
  questionId: string,
) {
  const denied = requireMock();
  if (denied) return denied;
  let body: {
    reviewState?: QuestionReviewState;
    stem?: string;
    explanation?: string;
    answerKey?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return mockFail('VALIDATION_FAILED', 'Periksa kembali isian formulir.', 400);
  }

  if (body.reviewState) {
    const next = updateQuestionState(assessmentId, questionId, body.reviewState);
    if (!next) return mockFail('STATE_CONFLICT', 'Soal tidak dapat diubah.', 409);
    return mockOk(next);
  }

  const next = updateQuestionContent(assessmentId, questionId, {
    stem: body.stem,
    explanation: body.explanation,
    answerKey: body.answerKey,
  });
  if (!next) return mockFail('STATE_CONFLICT', 'Soal tidak dapat diubah.', 409);
  return mockOk(next);
}

export async function bulkAcceptHandler(request: Request, assessmentId: string) {
  const denied = requireMock();
  if (denied) return denied;
  let body: { questionIds?: string[] } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return mockFail('VALIDATION_FAILED', 'Periksa kembali isian formulir.', 400);
  }
  const next = bulkAccept(assessmentId, body.questionIds ?? []);
  if (!next) return mockFail('STATE_CONFLICT', 'Bulk accept tidak tersedia.', 409);
  return mockOk(next);
}

export async function finalizeHandler(request: Request, assessmentId: string) {
  const denied = requireMock();
  if (denied) return denied;
  let body: { acknowledged?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return mockFail('VALIDATION_FAILED', 'Periksa kembali isian formulir.', 400);
  }
  const result = finalizeAssessment(assessmentId, body.acknowledged === true);
  if (!result.ok) {
    return NextResponse.json(
      {
        error: {
          code: result.error.code,
          message: result.error.message,
          blockers: result.error.blockers,
          retryable: false,
        },
      },
      { status: result.error.code === 'RESOURCE_NOT_FOUND' ? 404 : 409 },
    );
  }
  return mockOk(result.value);
}

export async function outputHandler(assessmentId: string) {
  const denied = requireMock();
  if (denied) return denied;
  const item = getOutputPackage(assessmentId);
  if (!item) {
    return mockFail(
      'STATE_CONFLICT',
      'Output hanya tersedia setelah lembar difinalkan.',
      409,
    );
  }
  return mockOk(item);
}
