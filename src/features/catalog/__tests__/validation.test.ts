import { describe, expect, it } from 'vitest';
import { validateGenerateForm, type GenerateFormValues } from '../GenerateForm';

const BASE_VALUES: GenerateFormValues = {
  sourceMode: 'katalog',
  curriculumVersionId: 'kurmer-1',
  gradeId: 'g-4',
  subjectId: 's-4',
  materialIds: ['m-10', 'm-11'],
  assessmentType: 'daily',
  difficulty: 'medium',
  questionCount: 20,
  reviewMode: 'quick',
  teacherFocus: '',
  exampleQuestion: '',
};

describe('validateGenerateForm', () => {
  it('passes valid form with catalog source', () => {
    const result = validateGenerateForm(BASE_VALUES);
    expect(result.ok).toBe(true);
  });

  it('passes valid form with pdf source (no catalog fields needed)', () => {
    const result = validateGenerateForm({
      ...BASE_VALUES,
      sourceMode: 'pdf',
      curriculumVersionId: '',
      gradeId: '',
      subjectId: '',
      materialIds: [],
    });
    expect(result.ok).toBe(true);
  });

  it('fails when curriculum is not selected for katalog source', () => {
    const result = validateGenerateForm({ ...BASE_VALUES, curriculumVersionId: '' });
    expect(result.ok).toBe(false);
    expect(result.failures.some((f) => f.field === 'curriculumVersionId')).toBe(true);
  });

  it('fails when grade is not selected for katalog source', () => {
    const result = validateGenerateForm({ ...BASE_VALUES, gradeId: '' });
    expect(result.ok).toBe(false);
    expect(result.failures.some((f) => f.field === 'gradeId')).toBe(true);
  });

  it('fails when subject is not selected for katalog source', () => {
    const result = validateGenerateForm({ ...BASE_VALUES, subjectId: '' });
    expect(result.ok).toBe(false);
    expect(result.failures.some((f) => f.field === 'subjectId')).toBe(true);
  });

  it('fails when no materials selected for katalog source', () => {
    const result = validateGenerateForm({ ...BASE_VALUES, materialIds: [] });
    expect(result.ok).toBe(false);
    expect(result.failures.some((f) => f.field === 'materialIds')).toBe(true);
  });

  it('fails when question count is 0', () => {
    const result = validateGenerateForm({ ...BASE_VALUES, questionCount: 0 });
    expect(result.ok).toBe(false);
    expect(result.failures.some((f) => f.field === 'questionCount')).toBe(true);
  });

  it('fails when question count exceeds 200', () => {
    const result = validateGenerateForm({ ...BASE_VALUES, questionCount: 201 });
    expect(result.ok).toBe(false);
    expect(result.failures.some((f) => f.field === 'questionCount')).toBe(true);
  });

  it('fails when teacherFocus exceeds 500 chars', () => {
    const result = validateGenerateForm({ ...BASE_VALUES, teacherFocus: 'x'.repeat(501) });
    expect(result.ok).toBe(false);
    expect(result.failures.some((f) => f.field === 'teacherFocus')).toBe(true);
  });

  it('fails when exampleQuestion exceeds 2000 chars', () => {
    const result = validateGenerateForm({ ...BASE_VALUES, exampleQuestion: 'x'.repeat(2001) });
    expect(result.ok).toBe(false);
    expect(result.failures.some((f) => f.field === 'exampleQuestion')).toBe(true);
  });

  it('collects multiple failures simultaneously', () => {
    const result = validateGenerateForm({
      ...BASE_VALUES,
      sourceMode: 'katalog',
      curriculumVersionId: '',
      gradeId: '',
      subjectId: '',
      materialIds: [],
      questionCount: 0,
    });
    expect(result.ok).toBe(false);
    expect(result.failures.length).toBeGreaterThanOrEqual(5);
  });
});
