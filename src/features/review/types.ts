export type QuestionReviewState =
  | 'unreviewed'
  | 'accepted'
  | 'edited'
  | 'rejected'
  | 'needs_attention';

export type AssessmentLifecycle =
  | 'draft'
  | 'generating'
  | 'review'
  | 'final'
  | 'archived';

export type QuestionWarning = {
  code: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
};

export type QuestionOption = {
  id: string;
  label: string;
  text: string;
};

export type ReviewQuestion = {
  id: string;
  number: number;
  stem: string;
  options: QuestionOption[];
  answerKey: string;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  sourceLabel: string;
  reviewState: QuestionReviewState;
  warnings: QuestionWarning[];
  updatedAt: string;
};

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

export function reviewStateLabel(state: QuestionReviewState): string {
  switch (state) {
    case 'unreviewed':
      return 'Belum ditinjau';
    case 'accepted':
      return 'Diterima';
    case 'edited':
      return 'Diedit';
    case 'rejected':
      return 'Ditolak';
    case 'needs_attention':
      return 'Perlu perhatian';
    default:
      return state;
  }
}

export function lifecycleLabel(lifecycle: AssessmentLifecycle): string {
  switch (lifecycle) {
    case 'draft':
      return 'Draft';
    case 'generating':
      return 'Diproses';
    case 'review':
      return 'Perlu ditinjau';
    case 'final':
      return 'Final';
    case 'archived':
      return 'Kedaluwarsa';
    default:
      return lifecycle;
  }
}
