export type SourceMode = 'katalog' | 'pdf' | 'katalog+pdf';
export type AssessmentType = 'practice' | 'daily' | 'midterm' | 'final' | 'tka';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type ReviewMode = 'quick' | 'detail';

export type CompositionState =
  | 'empty'
  | 'composing'
  | 'invalid'
  | 'permission'
  | 'success'
  | 'error';

export type CompositionValues = {
  sourceMode: SourceMode;
  curriculumVersionId: string;
  gradeId: string;
  subjectId: string;
  materialIds: string[];
  sourceId: string;
  assessmentType: AssessmentType;
  difficulty: Difficulty;
  questionCount: number;
  reviewMode: ReviewMode;
  teacherFocus: string;
  exampleQuestion: string;
};

export type CompositionFieldKey = keyof CompositionValues;

export const INITIAL_COMPOSITION_VALUES: CompositionValues = {
  sourceMode: 'katalog',
  curriculumVersionId: '',
  gradeId: '',
  subjectId: '',
  materialIds: [],
  sourceId: '',
  assessmentType: 'practice',
  difficulty: 'medium',
  questionCount: 20,
  reviewMode: 'quick',
  teacherFocus: '',
  exampleQuestion: '',
};

export type CompositionFailure = {
  field: CompositionFieldKey;
  message: string;
};

export type CompositionValidationResult =
  | { ok: true; failures: [] }
  | { ok: false; failures: CompositionFailure[] };

export type CompositionError = {
  code: string;
  safeMessage: string;
  retryable: boolean;
  hint?: string;
};
