import { describe, expect, it } from 'vitest';

import { analyzeQuestionQuality } from '../questionQuality';
import type { QuestionWarningCode } from '../types';
import { loadMessages } from '@/src/i18n/messages';

const WARNING_CODES: QuestionWarningCode[] = [
  'INVALID_OPTIONS',
  'DUPLICATE_OPTION',
  'INVALID_ANSWER_KEY',
  'OPTION_LENGTH_CLUE',
  'AMBIGUOUS_STEM',
  'LOW_DIVERSITY',
];

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

  it('emits warnings without copy so the renderer resolves every code from the catalog', () => {
    const warnings = analyzeQuestionQuality({
      questionType: 'multiple_choice',
      options: [
        { id: 'a', label: 'A', text: '2' },
        { id: 'b', label: 'B', text: '4' },
      ],
      answerKey: 'c',
    });

    for (const warning of warnings) {
      expect(warning).not.toHaveProperty('message');
      expect(Object.keys(warning).sort()).toEqual(['code', 'severity']);
    }
  });

  it('has an id-locale message for every warning code', () => {
    const messages = loadMessages('id') as {
      review: { warnings: Record<string, string> };
    };
    for (const code of WARNING_CODES) {
      expect(messages.review.warnings[code], `review.warnings.${code}`).toBeTruthy();
    }
  });
});
