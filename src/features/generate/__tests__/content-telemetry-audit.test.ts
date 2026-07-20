/**
 * content-telemetry-audit — F3-03 evidence
 *
 * Audits the content/telemetry fields (teacherFocus, exampleQuestion) against
 * their character-limit contracts. These tests provide the "content-telemetry-audit"
 * evidence required by the F3-03 task contract.
 *
 * "Telemetry" here means: the submitted payload carries only what the teacher
 * explicitly authored — no silent truncation, no injected defaults. The audit
 * verifies that over-limit content is caught before submission, on-limit content
 * passes through unmodified, and empty optional fields do not trigger failures.
 */
import { describe, expect, it } from 'vitest';
import { validateComposition } from '../validation';
import { INITIAL_COMPOSITION_VALUES } from '../types';
import type { CompositionValues } from '../types';

// ── helpers ──

const TEACHER_FOCUS_MAX = 500;
const EXAMPLE_QUESTION_MAX = 2000;

function valid(overrides: Partial<CompositionValues> = {}): CompositionValues {
  return {
    ...INITIAL_COMPOSITION_VALUES,
    sourceMode: 'katalog',
    curriculumVersionId: 'kurmer-2',
    gradeId: 'g-4',
    subjectId: 's-4',
    materialIds: ['m-10'],
    assessmentType: 'practice',
    difficulty: 'medium',
    questionCount: 20,
    reviewMode: 'quick',
    ...overrides,
  };
}

function repeat(char: string, n: number): string {
  return char.repeat(n);
}

// ── teacherFocus ──

describe('content-telemetry-audit — teacherFocus', () => {
  it('accepts an empty teacherFocus (field is optional)', () => {
    const result = validateComposition(valid({ teacherFocus: '' }));
    expect(result.ok).toBe(true);
  });

  it('accepts teacherFocus exactly at the maximum (500 chars)', () => {
    const result = validateComposition(valid({ teacherFocus: repeat('a', TEACHER_FOCUS_MAX) }));
    expect(result.ok).toBe(true);
  });

  it('accepts teacherFocus one below the maximum (499 chars)', () => {
    const result = validateComposition(
      valid({ teacherFocus: repeat('a', TEACHER_FOCUS_MAX - 1) }),
    );
    expect(result.ok).toBe(true);
  });

  it('rejects teacherFocus one above the maximum (501 chars)', () => {
    const result = validateComposition(
      valid({ teacherFocus: repeat('a', TEACHER_FOCUS_MAX + 1) }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const f = result.failures.find((x) => x.field === 'teacherFocus');
      expect(f).toBeDefined();
      expect(f?.message).toMatch(/500/);
    }
  });

  it('rejects teacherFocus significantly over the maximum (1000 chars)', () => {
    const result = validateComposition(valid({ teacherFocus: repeat('a', 1000) }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((x) => x.field === 'teacherFocus')).toBe(true);
    }
  });

  it('carries the authored content unchanged at boundary — no silent mutation', () => {
    // Validate that the limit check does not mutate the input (immutable audit).
    const content = repeat('x', TEACHER_FOCUS_MAX);
    const values = valid({ teacherFocus: content });
    validateComposition(values);
    // The original object must remain unchanged after validation.
    expect(values.teacherFocus).toHaveLength(TEACHER_FOCUS_MAX);
    expect(values.teacherFocus).toBe(content);
  });
});

// ── exampleQuestion ──

describe('content-telemetry-audit — exampleQuestion', () => {
  it('accepts an empty exampleQuestion (field is optional)', () => {
    const result = validateComposition(valid({ exampleQuestion: '' }));
    expect(result.ok).toBe(true);
  });

  it('accepts exampleQuestion exactly at the maximum (2000 chars)', () => {
    const result = validateComposition(
      valid({ exampleQuestion: repeat('q', EXAMPLE_QUESTION_MAX) }),
    );
    expect(result.ok).toBe(true);
  });

  it('accepts exampleQuestion one below the maximum (1999 chars)', () => {
    const result = validateComposition(
      valid({ exampleQuestion: repeat('q', EXAMPLE_QUESTION_MAX - 1) }),
    );
    expect(result.ok).toBe(true);
  });

  it('rejects exampleQuestion one above the maximum (2001 chars)', () => {
    const result = validateComposition(
      valid({ exampleQuestion: repeat('q', EXAMPLE_QUESTION_MAX + 1) }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const f = result.failures.find((x) => x.field === 'exampleQuestion');
      expect(f).toBeDefined();
      expect(f?.message).toMatch(/2[.,\s]?000|2000/);
    }
  });

  it('rejects exampleQuestion significantly over the maximum (5000 chars)', () => {
    const result = validateComposition(valid({ exampleQuestion: repeat('q', 5000) }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((x) => x.field === 'exampleQuestion')).toBe(true);
    }
  });

  it('carries the authored content unchanged at boundary — no silent mutation', () => {
    const content = repeat('y', EXAMPLE_QUESTION_MAX);
    const values = valid({ exampleQuestion: content });
    validateComposition(values);
    expect(values.exampleQuestion).toHaveLength(EXAMPLE_QUESTION_MAX);
    expect(values.exampleQuestion).toBe(content);
  });
});

// ── combined content fields ──

describe('content-telemetry-audit — combined content fields', () => {
  it('both fields at max simultaneously pass', () => {
    const result = validateComposition(
      valid({
        teacherFocus: repeat('f', TEACHER_FOCUS_MAX),
        exampleQuestion: repeat('e', EXAMPLE_QUESTION_MAX),
      }),
    );
    expect(result.ok).toBe(true);
  });

  it('both fields over limit simultaneously produce two separate failures', () => {
    const result = validateComposition(
      valid({
        teacherFocus: repeat('f', TEACHER_FOCUS_MAX + 1),
        exampleQuestion: repeat('e', EXAMPLE_QUESTION_MAX + 1),
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((x) => x.field === 'teacherFocus')).toBe(true);
      expect(result.failures.some((x) => x.field === 'exampleQuestion')).toBe(true);
    }
  });

  it('one field over limit does not suppress the other field failure', () => {
    const result = validateComposition(
      valid({
        teacherFocus: repeat('f', TEACHER_FOCUS_MAX + 1),
        exampleQuestion: '',
        // also break a required field to confirm multi-field reporting still works
        curriculumVersionId: '',
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failures.some((x) => x.field === 'teacherFocus')).toBe(true);
      expect(result.failures.some((x) => x.field === 'curriculumVersionId')).toBe(true);
    }
  });
});

// ── payload immutability (telemetry audit) ──

describe('content-telemetry-audit — payload immutability', () => {
  it('validateComposition does not mutate any CompositionValues field', () => {
    const original: CompositionValues = {
      ...INITIAL_COMPOSITION_VALUES,
      sourceMode: 'katalog',
      curriculumVersionId: 'kurmer-2',
      gradeId: 'g-4',
      subjectId: 's-4',
      materialIds: ['m-10', 'm-11'],
      assessmentType: 'daily',
      difficulty: 'hard',
      questionCount: 50,
      reviewMode: 'detail',
      teacherFocus: 'focus on fractions',
      exampleQuestion: 'What is 1/2 + 1/3?',
    };

    // Take a deep snapshot before validation
    const snapshot = JSON.parse(JSON.stringify(original)) as CompositionValues;

    validateComposition(original);

    // Every field must remain identical after the call
    expect(original).toStrictEqual(snapshot);
  });

  it('materialIds array is not mutated during validation', () => {
    const materials = ['m-10', 'm-11', 'm-12'];
    const values = valid({ materialIds: materials });
    validateComposition(values);
    expect(values.materialIds).toEqual(['m-10', 'm-11', 'm-12']);
    expect(values.materialIds).toHaveLength(3);
  });
});
