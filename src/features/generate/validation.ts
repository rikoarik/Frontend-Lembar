import type { Translate } from '@/src/i18n/types';
import type { CompositionValues, CompositionValidationResult, CompositionFailure } from './types';
import { sumQuestionTypeCounts } from './types';

export function validateComposition(
  values: CompositionValues,
  t: Translate,
): CompositionValidationResult {
  const failures: CompositionFailure[] = [];

  if (values.sourceMode === 'katalog' || values.sourceMode === 'katalog+pdf') {
    if (!values.curriculumVersionId) {
      failures.push({ field: 'curriculumVersionId', message: t('validation.curriculumVersionId') });
    }
    if (!values.gradeId) {
      failures.push({ field: 'gradeId', message: t('validation.gradeId') });
    }
    if (!values.subjectId) {
      failures.push({ field: 'subjectId', message: t('validation.subjectId') });
    }
    if (values.materialIds.length === 0) {
      failures.push({ field: 'materialIds', message: t('validation.materialIds') });
    }
  }

  if (values.sourceMode === 'pdf' || values.sourceMode === 'katalog+pdf') {
    if (!values.sourceId) {
      failures.push({ field: 'sourceId', message: t('validation.sourceId') });
    }
  }

  if (!values.assessmentType) {
    failures.push({ field: 'assessmentType', message: t('validation.assessmentType') });
  }
  if (!values.difficulty) {
    failures.push({ field: 'difficulty', message: t('validation.difficulty') });
  }
  if (values.questionCount < 1 || values.questionCount > 200) {
    failures.push({ field: 'questionCount', message: t('validation.questionCount') });
  }
  if (sumQuestionTypeCounts(values.questionTypeCounts) !== values.questionCount) {
    failures.push({
      field: 'questionTypeCounts',
      message: t('validation.questionTypeCounts'),
    });
  }
  if (!values.reviewMode) {
    failures.push({ field: 'reviewMode', message: t('validation.reviewMode') });
  }
  if (values.teacherFocus && values.teacherFocus.length > 500) {
    failures.push({ field: 'teacherFocus', message: t('validation.teacherFocus') });
  }
  if (values.exampleQuestion && values.exampleQuestion.length > 2000) {
    failures.push({ field: 'exampleQuestion', message: t('validation.exampleQuestion') });
  }

  return failures.length > 0 ? { ok: false, failures } : { ok: true, failures: [] };
}

export function isCompositionComplete(values: CompositionValues, t: Translate): boolean {
  return validateComposition(values, t).ok;
}

export function getMissingSourceHint(values: CompositionValues, t: Translate): string | null {
  if (values.sourceMode === 'pdf' || values.sourceMode === 'katalog+pdf') {
    if (!values.sourceId) {
      return t('hints.missingSource');
    }
  }
  return null;
}

export function getMissingOutcomesHint(values: CompositionValues, t: Translate): string | null {
  if (values.sourceMode === 'katalog' || values.sourceMode === 'katalog+pdf') {
    if (values.materialIds.length === 0) {
      return t('hints.missingOutcomes');
    }
  }
  return null;
}
