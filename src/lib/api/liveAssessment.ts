import { cookies } from 'next/headers';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';
import { mapReviewStateFromBackend } from '@/src/features/review/types';

export type LiveClaims = { userId: string; workspaceId: string };

export async function liveClaims(): Promise<{ token: string; claims: LiveClaims } | null> {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')) as {
      userId?: unknown;
      workspaceId?: unknown;
    };
    if (typeof payload.userId !== 'string' || typeof payload.workspaceId !== 'string') return null;
    return { token, claims: { userId: payload.userId, workspaceId: payload.workspaceId } };
  } catch {
    return null;
  }
}

export async function loadLiveAssessment(token: string, workspaceId: string, assessmentId: string) {
  const base = `/v1/workspaces/${encodeURIComponent(workspaceId)}/assessments/${encodeURIComponent(assessmentId)}`;
  const assessmentResponse = await backendFetch(base, { method: 'GET', token });
  const assessmentPayload = (await assessmentResponse.json().catch(() => null)) as {
    assessment?: Record<string, unknown>;
    version?: Record<string, unknown>;
    error?: unknown;
  } | null;
  if (!assessmentResponse.ok || !assessmentPayload?.assessment || !assessmentPayload.version) {
    return { status: assessmentResponse.status, payload: assessmentPayload };
  }

  const assessment = assessmentPayload.assessment;
  const version = assessmentPayload.version;
  const versionId = String(version.id);
  const questionsResponse = await backendFetch(`${base}/versions/${encodeURIComponent(versionId)}/questions`, {
    method: 'GET',
    token,
  });
  const questionsPayload = (await questionsResponse.json().catch(() => null)) as {
    data?: { questions?: Array<Record<string, unknown>> };
    error?: unknown;
  } | null;
  if (!questionsResponse.ok) return { status: questionsResponse.status, payload: questionsPayload };

  const questions = (questionsPayload?.data?.questions ?? []).map((question, index) => ({
    id: String(question.id),
    number: index + 1,
    stem: String(question.stem ?? ''),
    options: Array.isArray(question.options)
      ? question.options.map((option: any, optionIndex: number) => ({
          id: String(option.key ?? optionIndex),
          label: String(option.key ?? String.fromCharCode(65 + optionIndex)),
          text: String(option.text ?? ''),
        }))
      : [],
    answerKey: String(question.answer ?? ''),
    explanation: String(question.explanation ?? ''),
    topic: '',
    difficulty: question.difficulty ?? 'medium',
    sourceLabel: Array.isArray(question.sourceIds) && question.sourceIds.length ? 'Sumber terlampir' : 'Tanpa sumber',
    reviewState: mapReviewStateFromBackend(String(question.status ?? '')),
    warnings: [],
    updatedAt: String(question.updatedAt ?? assessment.updatedAt ?? new Date().toISOString()),
  }));
  const reviewedCount = questions.filter((question) => question.reviewState !== 'unreviewed').length;
  const allAccepted = questions.length > 0 && questions.every((question) => question.reviewState === 'accepted');
  const finalized = questions.length > 0 && (questionsPayload?.data?.questions ?? []).every((question) => question.isFinalized === true);
  const config = (version.configSnapshot ?? {}) as Record<string, unknown>;

  return {
    status: 200,
    payload: {
      data: {
        id: String(assessment.id),
        title: String(assessment.title ?? 'Lembar soal'),
        subject: String((config as Record<string, unknown>).subjectLabel ?? config.subjectId ?? 'Mata pelajaran'),
        gradeLabel: String((config as Record<string, unknown>).gradeLabel ?? config.gradeId ?? 'Kelas'),
        lifecycle: finalized
          ? 'final'
          : (() => {
              const s = String(assessment.status ?? 'draft');
              if (s === 'generating') return 'generating';
              if (s === 'failed') return 'failed';
              if (s === 'archived') return 'archived';
              return questions.length > 0 ? 'review' : 'draft';
            })(),
        questionCount: questions.length,
        reviewedCount,
        warningCount: 0,
        reviewMode: 'quick',
        updatedAt: String(assessment.updatedAt ?? assessment.createdAt),
        createdAt: String(assessment.createdAt),
        canReview: questions.length > 0 && !finalized,
        canFinalize: allAccepted && !finalized,
        canOpenOutput: finalized,
        questions,
        finalizeBlockers: allAccepted ? [] : ['Semua soal harus diterima sebelum finalisasi.'],
        teacherResponsibilityNote: 'Guru bertanggung jawab meninjau kebenaran setiap soal sebelum finalisasi.',
        versionId,
      },
    },
  };
}
