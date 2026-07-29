import type {
  AssessmentDetail,
  AssessmentLifecycle,
  AssessmentSummary,
  FinalizeResult,
  OutputPackage,
  QuestionContentPatch,
  QuestionReviewState,
  ReviewQuestion,
} from '@/src/features/review/types';
import { err, ok, type Result } from '@/src/types/result';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1';

export type AssessmentError = {
  code: string;
  safeMessage: string;
  retryable: boolean;
  blockers?: string[];
  cause?: unknown;
};

const STATE_CONFLICT_MESSAGE =
  'Versi soal berubah, muat ulang untuk melihat perubahan terbaru.';

async function parseError(response: Response): Promise<AssessmentError> {
  try {
    const body = (await response.json()) as {
      error?: { code?: string; message?: string; retryable?: boolean; blockers?: string[] };
    };
    const code = body.error?.code ?? 'UNKNOWN';
    const safeMessage =
      code === 'STATE_CONFLICT'
        ? STATE_CONFLICT_MESSAGE
        : body.error?.message ?? 'Tidak dapat menyelesaikan permintaan saat ini.';
    return {
      code,
      safeMessage,
      retryable: body.error?.retryable ?? response.status >= 500,
      blockers: body.error?.blockers,
      cause: body.error,
    };
  } catch (cause) {
    return {
      code: 'UNKNOWN',
      safeMessage: 'Tidak dapat menyelesaikan permintaan saat ini.',
      retryable: true,
      cause,
    };
  }
}

async function request<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' = 'GET',
  body?: unknown,
  headers?: Record<string, string>,
): Promise<Result<T, AssessmentError>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'id',
        ...(headers ?? {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.ok) {
      const json = (await response.json()) as { data: T };
      return ok(json.data);
    }
    return err(await parseError(response));
  } catch (cause) {
    return err({
      code: 'NETWORK',
      safeMessage: 'Tidak dapat terhubung. Periksa koneksi Anda.',
      retryable: true,
      cause,
    });
  }
}

export type QuestionEditOptions = {
  expectedEtag?: string;
};

export const assessmentService = {
  list(params?: { q?: string; lifecycle?: AssessmentLifecycle | 'all' }) {
    const search = new URLSearchParams();
    if (params?.q) search.set('q', params.q);
    if (params?.lifecycle && params.lifecycle !== 'all') search.set('lifecycle', params.lifecycle);
    const qs = search.toString();
    return request<AssessmentSummary[]>(`/assessments${qs ? `?${qs}` : ''}`);
  },
  get(assessmentId: string) {
    return request<AssessmentDetail>(`/assessments/${encodeURIComponent(assessmentId)}`);
  },
  updateQuestionState(
    assessmentId: string,
    questionId: string,
    reviewState: QuestionReviewState,
    options: QuestionEditOptions = {},
  ) {
    const headers = options.expectedEtag ? { 'If-Match': options.expectedEtag } : undefined;
    return request<AssessmentDetail>(
      `/assessments/${encodeURIComponent(assessmentId)}/questions/${encodeURIComponent(questionId)}`,
      'PATCH',
      { reviewState },
      headers,
    );
  },
  bulkAccept(assessmentId: string, questionIds: string[]) {
    return request<AssessmentDetail>(
      `/assessments/${encodeURIComponent(assessmentId)}/questions/bulk-accept`,
      'POST',
      { questionIds },
    );
  },
  updateQuestionContent(
    assessmentId: string,
    questionId: string,
    patch: QuestionContentPatch,
    options: QuestionEditOptions = {},
  ) {
    const headers = options.expectedEtag ? { 'If-Match': options.expectedEtag } : undefined;
    return request<AssessmentDetail>(
      `/assessments/${encodeURIComponent(assessmentId)}/questions/${encodeURIComponent(questionId)}`,
      'PATCH',
      patch,
      headers,
    );
  },
  finalize(assessmentId: string, acknowledged: boolean) {
    return request<FinalizeResult>(
      `/assessments/${encodeURIComponent(assessmentId)}/finalize`,
      'POST',
      {
        acknowledged,
      },
    );
  },
  getOutput(assessmentId: string) {
    return request<OutputPackage>(`/assessments/${encodeURIComponent(assessmentId)}/output`);
  },
};
