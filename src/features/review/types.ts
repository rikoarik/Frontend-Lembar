import type { Translate } from '@/src/i18n/types';
import type { QuestionImage } from '@/src/types/questionImage';

export type QuestionReviewState =
  | 'unreviewed'
  | 'accepted'
  | 'edited'
  | 'rejected'
  | 'needs_attention';

export type BackendReviewState = 'pending' | 'accepted' | 'rejected' | 'edited' | 'needs_attention';

const BACKEND_TO_FRONTEND: Record<BackendReviewState, QuestionReviewState> = {
  pending: 'unreviewed',
  accepted: 'accepted',
  rejected: 'rejected',
  edited: 'edited',
  needs_attention: 'needs_attention',
};

const FRONTEND_TO_BACKEND: Record<QuestionReviewState, BackendReviewState> = {
  unreviewed: 'pending',
  accepted: 'accepted',
  rejected: 'rejected',
  edited: 'edited',
  needs_attention: 'needs_attention',
};

export function mapReviewStateFromBackend(value: string): QuestionReviewState {
  return BACKEND_TO_FRONTEND[value as BackendReviewState] ?? 'unreviewed';
}

export function mapReviewStateToBackend(value: QuestionReviewState): BackendReviewState {
  return FRONTEND_TO_BACKEND[value];
}

export type AssessmentLifecycle =
  | 'draft'
  | 'generating'
  | 'review'
  | 'final'
  | 'archived'
  | 'failed';

/**
 * Warning kinds produced by the deterministic review checks plus the mock
 * fixtures. Kept as a closed union so the renderer's `warnings.<code>` lookup
 * stays exhaustive at compile time (same guarantee `LABELS` gives the
 * composition form).
 */
export type QuestionWarningCode =
  | 'INVALID_OPTIONS'
  | 'DUPLICATE_OPTION'
  | 'INVALID_ANSWER_KEY'
  | 'OPTION_LENGTH_CLUE'
  | 'AMBIGUOUS_STEM'
  | 'LOW_DIVERSITY';

export type QuestionWarning = {
  code: QuestionWarningCode;
  severity: 'info' | 'warning' | 'critical';
};

export type QuestionOption = {
  id: string;
  label: string;
  text: string;
};

export type QuestionRubricCriterion = {
  id: string;
  description: string;
  maxScore: number;
};

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

export type ReviewQuestion = {
  id: string;
  number: number;
  stem: string;
  image?: QuestionImage | null;
  options: QuestionOption[];
  answerKey: string;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sourceLabel: string;
  reviewState: QuestionReviewState;
  warnings: QuestionWarning[];
  updatedAt: string;
  questionType?: QuestionType;
  rubric?: QuestionRubricCriterion[];
};

export type QuestionContentPatch = Partial<
  Pick<ReviewQuestion, 'stem' | 'explanation' | 'answerKey' | 'options' | 'rubric'>
>;

export type AssessmentSummary = {
  id: string;
  title: string;
  subject: string;
  gradeLabel: string;
  lifecycle: AssessmentLifecycle;
  questionCount: number;
  reviewedCount: number;
  warningCount: number;
  reviewMode: 'quick' | 'detail';
  assessmentType?: string;
  academicYear?: string;
  updatedAt: string;
  createdAt: string;
  canReview: boolean;
  canFinalize: boolean;
  canOpenOutput: boolean;
};

export type AssessmentDetail = AssessmentSummary & {
  questions: ReviewQuestion[];
  finalizeBlockers: string[];
  teacherResponsibilityNote: string;
  etag?: string;
};

export type HistoryFilters = {
  q?: string;
  lifecycle?: AssessmentLifecycle | 'all';
};

export type FinalizeResult = {
  assessmentId: string;
  versionId: string;
  lifecycle: 'final';
  finalizedAt: string;
};

export type OutputPackage = {
  assessmentId: string;
  versionId: string;
  status: 'ready' | 'rendering' | 'failed';
  studentSheetLabel: string;
  answerKeyLabel: string;
  explanationLabel: string;
  printHref: string;
  downloadHref: string;
  shareToken?: string;
  updatedAt: string;
  failureMessage?: string;
};

export function reviewStateLabel(state: QuestionReviewState, t: Translate): string {
  switch (state) {
    case 'unreviewed':
      return t('reviewState.unreviewed');
    case 'accepted':
      return t('reviewState.accepted');
    case 'edited':
      return t('reviewState.edited');
    case 'rejected':
      return t('reviewState.rejected');
    case 'needs_attention':
      return t('reviewState.needs_attention');
    default:
      return state;
  }
}

export function lifecycleLabel(lifecycle: AssessmentLifecycle, t: Translate): string {
  switch (lifecycle) {
    case 'draft':
      return t('lifecycle.draft');
    case 'generating':
      return t('lifecycle.generating');
    case 'review':
      return t('lifecycle.review');
    case 'final':
      return t('lifecycle.final');
    case 'archived':
      return t('lifecycle.archived');
    default:
      return lifecycle;
  }
}
