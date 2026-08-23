import { describe, expect, it } from 'vitest';

import { analyzeQuestionQuality } from '../questionQuality';

describe('analyzeQuestionQuality', () => {
  it('flags an answer key that does not match an available choice', () => {
    expect(
      analyzeQuestionQuality({
        questionType: 'multiple_choice',
        options: [
          { id: 'a', label: 'A', text: '2' },
          { id: 'b', label: 'B', text: '4' },
        ],
        answerKey: 'c',
      }),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'INVALID_ANSWER_KEY', severity: 'critical' }),
      ]),
    );
  });

  it('flags duplicate and empty distractors', () => {
    const warnings = analyzeQuestionQuality({
      questionType: 'multiple_choice',
      options: [
        { id: 'a', label: 'A', text: 'Pecahan senilai' },
        { id: 'b', label: 'B', text: 'pecahan-senilai' },
        { id: 'c', label: 'C', text: '' },
      ],
      answerKey: 'a',
    });

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'INVALID_OPTIONS', severity: 'critical' }),
        expect.objectContaining({ code: 'DUPLICATE_OPTION', severity: 'critical' }),
      ]),
    );
  });

  it('does not apply multiple-choice checks to essay questions', () => {
    expect(
      analyzeQuestionQuality({ questionType: 'essay', options: [], answerKey: 'Jawaban uraian' }),
    ).toEqual([]);
  });
});
