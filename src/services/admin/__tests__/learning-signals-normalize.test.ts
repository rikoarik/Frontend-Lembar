import { describe, expect, it } from 'vitest';
import { normalizeLearningSignals } from '@/src/services/admin/adminService';

describe('normalizeLearningSignals', () => {
  it('maps the backend camelCase payload onto the snake_case table contract', () => {
    const out = normalizeLearningSignals([
      {
        promptTemplateId: 'assessment_output',
        pattern: 'general_feedback',
        frequency: 15,
        avgRating: 3.67,
        suggestedAction: null,
      },
    ]);

    expect(out).toEqual([
      {
        prompt_template_id: 'assessment_output',
        pattern: 'general_feedback',
        frequency: 15,
        avg_rating: 3.67,
        suggested_action: null,
      },
    ]);
  });

  it('still accepts the legacy snake_case payload', () => {
    const out = normalizeLearningSignals([
      {
        prompt_template_id: 'quality.guard',
        pattern: 'quality_issues',
        frequency: 1,
        avg_rating: 4,
        suggested_action: 'review',
      },
    ]);

    expect(out[0]).toMatchObject({
      prompt_template_id: 'quality.guard',
      avg_rating: 4,
      suggested_action: 'review',
    });
  });

  it('unwraps a { data: [...] } envelope and tolerates junk rows', () => {
    const out = normalizeLearningSignals({ data: [null, { avgRating: 'not-a-number' }] });
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ avg_rating: null, frequency: 0, prompt_template_id: null });
  });

  it('returns an empty list for a non-array payload', () => {
    expect(normalizeLearningSignals(undefined)).toEqual([]);
    expect(normalizeLearningSignals({ error: { code: 'X' } })).toEqual([]);
  });
});
