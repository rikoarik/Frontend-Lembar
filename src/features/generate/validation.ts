import type { CompositionValues, CompositionValidationResult, CompositionFailure } from './types';

export function validateComposition(values: CompositionValues): CompositionValidationResult {
  const failures: CompositionFailure[] = [];

  if (values.sourceMode === 'katalog' || values.sourceMode === 'katalog+pdf') {
    if (!values.curriculumVersionId) {
      failures.push({ field: 'curriculumVersionId', message: 'Pilih kurikulum.' });
    }
    if (!values.gradeId) {
      failures.push({ field: 'gradeId', message: 'Pilih kelas.' });
    }
    if (!values.subjectId) {
      failures.push({ field: 'subjectId', message: 'Pilih mata pelajaran.' });
    }
    if (values.materialIds.length === 0) {
      failures.push({ field: 'materialIds', message: 'Pilih minimal satu materi.' });
    }
  }

  if (values.sourceMode === 'pdf' || values.sourceMode === 'katalog+pdf') {
    if (!values.sourceId) {
      failures.push({ field: 'sourceId', message: 'Unggah dokumen PDF.' });
    }
  }

  if (!values.assessmentType) {
    failures.push({ field: 'assessmentType', message: 'Pilih jenis lembar.' });
  }
  if (!values.difficulty) {
    failures.push({ field: 'difficulty', message: 'Pilih tingkat kesulitan.' });
  }
  if (values.questionCount < 1 || values.questionCount > 200) {
    failures.push({ field: 'questionCount', message: 'Jumlah soal antara 1–200.' });
  }
  if (!values.reviewMode) {
    failures.push({ field: 'reviewMode', message: 'Pilih mode review.' });
  }
  if (values.teacherFocus && values.teacherFocus.length > 500) {
    failures.push({ field: 'teacherFocus', message: 'Maksimal 500 karakter.' });
  }
  if (values.exampleQuestion && values.exampleQuestion.length > 2000) {
    failures.push({ field: 'exampleQuestion', message: 'Maksimal 2.000 karakter.' });
  }

  return failures.length > 0 ? { ok: false, failures } : { ok: true, failures: [] };
}

export function isCompositionComplete(values: CompositionValues): boolean {
  return validateComposition(values).ok;
}

export function getMissingSourceHint(values: CompositionValues): string | null {
  if (values.sourceMode === 'pdf' || values.sourceMode === 'katalog+pdf') {
    if (!values.sourceId) {
      return 'Unggah dokumen PDF untuk melanjutkan.';
    }
  }
  return null;
}

export function getMissingOutcomesHint(values: CompositionValues): string | null {
  if (values.sourceMode === 'katalog' || values.sourceMode === 'katalog+pdf') {
    if (values.materialIds.length === 0) {
      return 'Pilih minimal satu materi untuk melanjutkan.';
    }
  }
  return null;
}
