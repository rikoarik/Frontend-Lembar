import { describe, expect, it } from 'vitest';
import { ensureCompositionValues } from '@/src/features/generate/types';

describe('image composition defaults', () => {
  it('adds image defaults when loading an older template config', () => {
    const values = ensureCompositionValues({
      questionCount: 4,
      questionTypeCounts: {
        multiple_choice: 1,
        short_answer: 1,
        essay: 1,
        true_false: 1,
      },
    });

    expect(values).toMatchObject({
      imageMode: 'none',
      imageMaxCount: 2,
      imageStyle: 'auto',
    });
  });

  it('sanitizes image fields restored from template config', () => {
    const values = ensureCompositionValues({
      imageMode: 'auto',
      imageMaxCount: 99,
      imageStyle: 'diagram',
    });

    expect(values).toMatchObject({
      imageMode: 'auto',
      imageMaxCount: 5,
      imageStyle: 'diagram',
    });
  });
});
