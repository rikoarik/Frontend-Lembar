/**
 * sum-validation — F3-03 evidence
 *
 * Validates the questionCount bounds and difficulty composition rules defined
 * in validation.ts. These tests provide the "sum-validation" evidence required
 * by the F3-03 task contract.
 */
import { describe, expect, it } from 'vitest';
import { validateComposition } from '../validation';
import { INITIAL_COMPOSITION_VALUES, rebalanceQuestionTypeCounts } from '../types';
import type { CompositionValues } from '../types';
import { testTranslate } from '@/src/features/__tests__/i18n';

// i18n: validation messages now come from the `generate` catalog, so the pure
// helper takes a translator. Bind the id-locale translator once for the suite.
const t = testTranslate('generate');
const validate = (values: CompositionValues) => validateComposition(values, t);

// ── helpers ──

function valid(overrides: Partial<CompositionValues> = {}): CompositionValues {
  const values = {
    ...INITIAL_COMPOSITION_VALUES,
    // fully-specified katalog source so the base case always passes
    sourceMode: 'katalog' as const,
    curriculumVersionId: 'kurmer-2',
    gradeId: 'g-4',
    subjectId: 's-4',
    materialIds: ['m-10'],
    assessmentType: 'practice' as const,
    difficulty: 'medium' as const,
    questionCount: 20,
    reviewMode: 'quick' as const,
    ...overrides,
  };
  return {
    ...values,
    questionTypeCounts:
      overrides.questionTypeCounts ??
      rebalanceQuestionTypeCounts(
        values.questionCount,
        INITIAL_COMPOSITION_VALUES.questionTypeCounts,
      ),
  };
}

// ── questionCount sum-validation ──

describe('sum-validation — questionCount bounds', () => {
  it('accepts the minimum boundary value (1)', () => {
    const result = validate(valid({ questionCount: 1 }));
    expect(result.ok).toBe(true);
  });

  it('accepts the maximum boundary value (200)', () => {
    const result = validate(valid({ questionCount: 200 }));
    expect(result.ok).toBe(true);
  });

  it('accepts a mid-range value (20)', () => {
    const result = validate(valid({ questionCount: 20 }));
    expect(result.ok).toBe(true);
  });

  it('rejects questionCount below minimum (0)', () => {
    const result = validate(valid({ questionCount: 0 }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const field = result.failures.find((f) => f.field === 'questionCount');
      expect(field).toBeDefined();
      expect(field?.message).toMatch(/1.{1,10}200/);
    }
  });

  it('rejects questionCount below minimum (negative)', () => {
    const result = validate(valid({ questionCount: -1 }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((f) => f.field === 'questionCount')).toBe(true);
    }
  });

  it('rejects questionCount above maximum (201)', () => {
    const result = validate(valid({ questionCount: 201 }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((f) => f.field === 'questionCount')).toBe(true);
    }
  });

  it('rejects questionCount above maximum (9999)', () => {
    const result = validate(valid({ questionCount: 9999 }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((f) => f.field === 'questionCount')).toBe(true);
    }
  });
});

// ── difficulty composition ──

describe('sum-validation — difficulty composition', () => {
  it('accepts all valid difficulty levels', () => {
    const levels = ['easy', 'medium', 'hard', 'mixed'] as const;
    for (const difficulty of levels) {
      const result = validate(valid({ difficulty }));
      expect(result.ok).toBe(true);
    }
  });

  it('rejects an empty difficulty', () => {
    // Force an empty string to simulate an unset field (runtime guard)
    const values = valid({ difficulty: '' as never });
    const result = validate(values);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((f) => f.field === 'difficulty')).toBe(true);
    }
  });
});

// ── reviewMode composition ──

describe('sum-validation — reviewMode composition', () => {
  it('accepts quick review mode', () => {
    const result = validate(valid({ reviewMode: 'quick' }));
    expect(result.ok).toBe(true);
  });

  it('accepts detail review mode', () => {
    const result = validate(valid({ reviewMode: 'detail' }));
    expect(result.ok).toBe(true);
  });

  it('rejects an empty reviewMode', () => {
    const values = valid({ reviewMode: '' as never });
    const result = validate(values);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((f) => f.field === 'reviewMode')).toBe(true);
    }
  });
});

// ── source-mode sum: katalog ──

describe('sum-validation — katalog source mode', () => {
  it('requires curriculumVersionId when sourceMode is katalog', () => {
    const result = validate(valid({ curriculumVersionId: '' }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((f) => f.field === 'curriculumVersionId')).toBe(true);
    }
  });

  it('requires gradeId when sourceMode is katalog', () => {
    const result = validate(valid({ gradeId: '' }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((f) => f.field === 'gradeId')).toBe(true);
    }
  });

  it('requires subjectId when sourceMode is katalog', () => {
    const result = validate(valid({ subjectId: '' }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((f) => f.field === 'subjectId')).toBe(true);
    }
  });

  it('requires at least one materialId when sourceMode is katalog', () => {
    const result = validate(valid({ materialIds: [] }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((f) => f.field === 'materialIds')).toBe(true);
    }
  });

  it('does NOT require sourceId when sourceMode is katalog', () => {
    const result = validate(valid({ sourceMode: 'katalog', sourceId: '' }));
    expect(result.ok).toBe(true);
  });
});

// ── source-mode sum: pdf ──

describe('sum-validation — pdf source mode', () => {
  it('requires sourceId when sourceMode is pdf', () => {
    const result = validate(
      valid({
        sourceMode: 'pdf',
        // katalog fields not required for pdf-only mode
        curriculumVersionId: '',
        gradeId: '',
        subjectId: '',
        materialIds: [],
        sourceId: '',
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((f) => f.field === 'sourceId')).toBe(true);
    }
  });

  it('does NOT require katalog fields when sourceMode is pdf', () => {
    const result = validate(
      valid({
        sourceMode: 'pdf',
        curriculumVersionId: '',
        gradeId: '',
        subjectId: '',
        materialIds: [],
        sourceId: 'src-test-01',
      }),
    );
    expect(result.ok).toBe(true);
  });
});

// ── source-mode sum: katalog+pdf ──

describe('sum-validation — katalog+pdf source mode', () => {
  it('requires both katalog fields and sourceId when sourceMode is katalog+pdf', () => {
    const result = validate(
      valid({
        sourceMode: 'katalog+pdf',
        sourceId: '', // missing PDF
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((f) => f.field === 'sourceId')).toBe(true);
    }
  });

  it('passes when all katalog+pdf required fields are set', () => {
    const result = validate(
      valid({
        sourceMode: 'katalog+pdf',
        sourceId: 'src-test-01',
      }),
    );
    expect(result.ok).toBe(true);
  });
});

// ── multi-failure aggregation ──

describe('sum-validation — failure aggregation', () => {
  it('collects all failures at once rather than short-circuiting', () => {
    const result = validate(
      valid({
        curriculumVersionId: '',
        gradeId: '',
        subjectId: '',
        materialIds: [],
        questionCount: 0,
        difficulty: '' as never,
        reviewMode: '' as never,
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      // At least: curriculumVersionId, gradeId, subjectId, materialIds, questionCount, difficulty, reviewMode
      expect(result.failures.length).toBeGreaterThanOrEqual(7);
    }
  });
});
