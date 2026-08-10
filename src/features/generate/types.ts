export type SourceMode = 'katalog' | 'pdf' | 'katalog+pdf';
export type AssessmentType = 'practice' | 'daily' | 'midterm' | 'final' | 'tka';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type ReviewMode = 'quick' | 'detail';
export type QuestionType = 'multiple_choice' | 'short_answer' | 'essay' | 'true_false';
export type QuestionTypeCounts = Record<QuestionType, number>;

export const QUESTION_TYPES: QuestionType[] = [
  'multiple_choice',
  'short_answer',
  'essay',
  'true_false',
];

const EMPTY_QUESTION_TYPE_COUNTS: QuestionTypeCounts = {
  multiple_choice: 0,
  short_answer: 0,
  essay: 0,
  true_false: 0,
};

export function buildEvenQuestionTypeCounts(total: number): QuestionTypeCounts {
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const base = Math.floor(safeTotal / QUESTION_TYPES.length);
  let remainder = safeTotal % QUESTION_TYPES.length;

  return QUESTION_TYPES.reduce<QuestionTypeCounts>((acc, type) => {
    const bonus = remainder > 0 ? 1 : 0;
    if (remainder > 0) remainder -= 1;
    acc[type] = base + bonus;
    return acc;
  }, { ...EMPTY_QUESTION_TYPE_COUNTS });
}

export function sumQuestionTypeCounts(counts: QuestionTypeCounts): number {
  return QUESTION_TYPES.reduce((acc, type) => acc + counts[type], 0);
}

export function rebalanceQuestionTypeCounts(
  total: number,
  counts: QuestionTypeCounts,
  editedType?: QuestionType,
): QuestionTypeCounts {
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;

  if (!editedType) return buildEvenQuestionTypeCounts(safeTotal);

  if (safeTotal <= 1) {
    return QUESTION_TYPES.reduce<QuestionTypeCounts>((acc, type) => {
      acc[type] = type === editedType ? safeTotal : 0;
      return acc;
    }, { ...EMPTY_QUESTION_TYPE_COUNTS });
  }

  const next = QUESTION_TYPES.reduce<QuestionTypeCounts>((acc, type) => {
    const raw = counts[type];
    acc[type] = Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
    return acc;
  }, { ...EMPTY_QUESTION_TYPE_COUNTS });

  next[editedType] = Math.min(safeTotal, next[editedType]);

  let sum = sumQuestionTypeCounts(next);
  const adjustable = [...QUESTION_TYPES].reverse().filter((type) => type !== editedType);

  while (sum > safeTotal) {
    let changed = false;
    for (const type of adjustable) {
      if (sum <= safeTotal) break;
      if (next[type] > 0) {
        next[type] -= 1;
        sum -= 1;
        changed = true;
      }
    }
    if (!changed) break;
  }

  while (sum < safeTotal) {
    let changed = false;
    for (const type of adjustable) {
      if (sum >= safeTotal) break;
      next[type] += 1;
      sum += 1;
      changed = true;
    }
    if (!changed) {
      next[editedType] += safeTotal - sum;
      sum = safeTotal;
    }
  }

  return next;
}

export function normalizeQuestionTypeCounts(
  total: number,
  counts: QuestionTypeCounts,
): QuestionTypeCounts {
  const safeTotal = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const sanitized = QUESTION_TYPES.reduce<QuestionTypeCounts>((acc, type) => {
    const raw = counts[type];
    acc[type] = Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
    return acc;
  }, { ...EMPTY_QUESTION_TYPE_COUNTS });

  if (safeTotal <= 1) {
    const preferredType =
      QUESTION_TYPES.find((type) => sanitized[type] > 0) ?? QUESTION_TYPES[0];
    return QUESTION_TYPES.reduce<QuestionTypeCounts>((acc, type) => {
      acc[type] = type === preferredType ? safeTotal : 0;
      return acc;
    }, { ...EMPTY_QUESTION_TYPE_COUNTS });
  }

  return sumQuestionTypeCounts(sanitized) === safeTotal
    ? sanitized
    : buildEvenQuestionTypeCounts(safeTotal);
}

export function getQuestionTypeLabel(type: QuestionType): string {
  switch (type) {
    case 'multiple_choice':
      return 'Pilihan Ganda';
    case 'short_answer':
      return 'Jawaban Singkat';
    case 'essay':
      return 'Esai';
    case 'true_false':
      return 'Benar / Salah';
  }
}

export function parseQuestionCountInput(value: string): number {
  if (value.trim() === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function clampQuestionCount(raw: number): number {
  return Math.min(200, Math.max(1, raw || 1));
}

export function parseQuestionTypeCountInput(value: string): number {
  if (value.trim() === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
}

export type CompositionValues = {
  sourceMode: SourceMode;
  curriculumVersionId: string;
  gradeId: string;
  subjectId: string;
  /** Human-readable grade label, e.g. "Kelas 8 SMP/MTs". Populated before submit. */
  gradeLabel?: string;
  /** Human-readable subject label, e.g. "Informatika". Populated before submit. */
  subjectLabel?: string;
  materialIds: string[];
  sourceId: string;
  assessmentType: AssessmentType;
  difficulty: Difficulty;
  questionCount: number;
  questionTypeCounts: QuestionTypeCounts;
  reviewMode: ReviewMode;
  teacherFocus: string;
  exampleQuestion: string;
  /** Duration in minutes shown to students on the attempt page. 0 = no limit. */
  durationMinutes: number;
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
  questionTypeCounts: buildEvenQuestionTypeCounts(20),
  reviewMode: 'quick',
  teacherFocus: '',
  exampleQuestion: '',
  durationMinutes: 60,
};

export type CompositionState =
  | 'empty'
  | 'composing'
  | 'invalid'
  | 'permission'
  | 'success'
  | 'error';

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

export function ensureCompositionValues(values: Partial<CompositionValues>): CompositionValues {
  const questionCount = clampQuestionCount(
    Number(values.questionCount ?? INITIAL_COMPOSITION_VALUES.questionCount),
  );

  return {
    ...INITIAL_COMPOSITION_VALUES,
    ...values,
    questionCount,
    questionTypeCounts: normalizeQuestionTypeCounts(
      questionCount,
      values.questionTypeCounts ?? INITIAL_COMPOSITION_VALUES.questionTypeCounts,
    ),
  };
}
