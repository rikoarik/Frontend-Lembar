import { describe, expect, it, beforeEach } from 'vitest';
import {
  __resetAssessmentStore,
  bulkAccept,
  finalizeAssessment,
  getAssessment,
  getOutputPackage,
  listAssessments,
  updateQuestionState,
} from '@/src/features/review/mockStore';

describe('assessment mock core flow', () => {
  beforeEach(() => {
    __resetAssessmentStore();
  });

  it('lists history items and supports review bulk accept', () => {
    const list = listAssessments();
    expect(list.length).toBeGreaterThan(0);
    const reviewItem = list.find((item) => item.lifecycle === 'review');
    expect(reviewItem).toBeTruthy();
    const detail = getAssessment(reviewItem!.id);
    expect(detail).toBeTruthy();
    const ids = detail!.questions.map((q) => q.id);
    const next = bulkAccept(reviewItem!.id, ids);
    expect(next?.reviewedCount).toBe(detail!.questionCount);
  });

  it('blocks finalize until blockers cleared, then creates output', () => {
    const assessmentId = 'asm_pecahan_01';
    const blocked = finalizeAssessment(assessmentId, true);
    expect(blocked.ok).toBe(false);

    const detail = getAssessment(assessmentId)!;
    for (const question of detail.questions) {
      updateQuestionState(assessmentId, question.id, 'accepted');
    }
    const finalized = finalizeAssessment(assessmentId, true);
    expect(finalized.ok).toBe(true);
    if (!finalized.ok) return;
    expect(finalized.value.lifecycle).toBe('final');
    expect(getOutputPackage(assessmentId)?.status).toBe('ready');
  });

  it('filters history by lifecycle', () => {
    const finals = listAssessments({ lifecycle: 'final' });
    expect(finals.every((item) => item.lifecycle === 'final')).toBe(true);
  });
});
