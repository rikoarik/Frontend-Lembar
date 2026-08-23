import { cookies } from 'next/headers';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';
import { analyzeQuestionQuality } from '@/src/features/review/questionQuality';
import { mapReviewStateFromBackend } from '@/src/features/review/types';
import { toQuestionImage } from '@/src/types/questionImage';

export type LiveClaims = { userId: string; workspaceId: string };

export async function liveClaims(): Promise<{ token: string; claims: LiveClaims } | null> {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'),
    ) as {
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
  const questionsResponse = await backendFetch(
    `${base}/versions/${encodeURIComponent(versionId)}/questions`,
    {
      method: 'GET',
      token,
    },
  );
  const questionsPayload = (await questionsResponse.json().catch(() => null)) as {
    data?: { questions?: Array<Record<string, unknown>> };
    error?: unknown;
  } | null;
  if (!questionsResponse.ok) return { status: questionsResponse.status, payload: questionsPayload };

  const questions = (questionsPayload?.data?.questions ?? []).map((question, index) => {
    const options = Array.isArray(question.options)
      ? question.options.map((option: any, optionIndex: number) => ({
          id: String(option.key ?? optionIndex),
          label: String(option.key ?? String.fromCharCode(65 + optionIndex)),
          text: String(option.text ?? ''),
        }))
      : [];
    const questionType = question.questionType as
      | 'multiple_choice'
      | 'true_false'
      | 'short_answer'
      | 'essay'
      | undefined;
    const answerKey = String(question.answer ?? '');
    return {
      id: String(question.id),
      number: index + 1,
      stem: String(question.stem ?? ''),
      image: toQuestionImage(question.image),
      options,
      answerKey,
      explanation: String(question.explanation ?? ''),
      topic: '',
      difficulty: question.difficulty ?? 'medium',
      sourceLabel:
        Array.isArray(question.sourceIds) && question.sourceIds.length
          ? 'Sumber terlampir'
          : 'Tanpa sumber',
      reviewState: mapReviewStateFromBackend(String(question.status ?? '')),
      questionType,
      warnings: analyzeQuestionQuality({ questionType, options, answerKey }),
      updatedAt: String(question.updatedAt ?? assessment.updatedAt ?? new Date().toISOString()),
    };
  });
  const reviewedCount = questions.filter(
    (question) => question.reviewState !== 'unreviewed',
  ).length;
  const hasCriticalWarnings = questions.some((question) =>
    question.warnings.some((warning) => warning.severity === 'critical'),
  );
  const allAccepted =
    questions.length > 0 && questions.every((question) => question.reviewState === 'accepted');
  const finalized =
    questions.length > 0 &&
    (questionsPayload?.data?.questions ?? []).every((question) => question.isFinalized === true);
  const config = (version.configSnapshot ?? {}) as Record<string, unknown>;

  return {
    status: 200,
    payload: {
      data: {
        id: String(assessment.id),
        title: String(assessment.title ?? 'Lembar soal'),
        subject: String(
          (config as Record<string, unknown>).subjectLabel ?? config.subjectId ?? 'Mata pelajaran',
        ),
        gradeLabel: String(
          (config as Record<string, unknown>).gradeLabel ?? config.gradeId ?? 'Kelas',
        ),
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
        warningCount: questions.reduce((count, question) => count + question.warnings.length, 0),
        reviewMode: 'quick',
        ...(typeof config.assessmentType === 'string'
          ? { assessmentType: config.assessmentType }
          : {}),
        ...(typeof config.academicYear === 'string' ? { academicYear: config.academicYear } : {}),
        updatedAt: String(assessment.updatedAt ?? assessment.createdAt),
        createdAt: String(assessment.createdAt),
        canReview: questions.length > 0 && !finalized,
        canFinalize: allAccepted && !hasCriticalWarnings && !finalized,
        canOpenOutput: finalized,
        questions,
        finalizeBlockers: [
          ...(allAccepted ? [] : ['Semua soal harus diterima sebelum finalisasi.']),
          ...(hasCriticalWarnings ? ['Selesaikan peringatan kritis pada pilihan jawaban.'] : []),
        ],
        teacherResponsibilityNote:
          'Guru bertanggung jawab meninjau kebenaran setiap soal sebelum finalisasi.',
        versionId,
      },
    },
  };
}
