import type { QuestionWarning, QuestionWarningCode, ReviewQuestion } from './types';

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('id-ID')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * Build a warning whose copy is resolved by the renderer from the `review`
 * namespace (`warnings.<code>`). Keeping the codes out of this module means the
 * deterministic checks stay locale-free and every message lives in the catalog.
 */
function warning(
  code: QuestionWarningCode,
  severity: QuestionWarning['severity'],
): QuestionWarning {
  return { code, severity };
}

/** Deterministic review checks that are safe to run for live and mock questions. */
export function analyzeQuestionQuality(
  question: Pick<ReviewQuestion, 'questionType' | 'options' | 'answerKey'>,
): QuestionWarning[] {
  if (question.questionType !== 'multiple_choice' && question.questionType !== 'true_false') {
    return [];
  }

  const warnings: QuestionWarning[] = [];
  const optionIds = question.options.map((option) => option.id.trim());
  const optionTexts = question.options.map((option) => normalize(option.text));

  if (question.options.length < 2 || optionTexts.some((text) => text.length === 0)) {
    warnings.push(warning('INVALID_OPTIONS', 'critical'));
  }

  if (
    new Set(optionIds).size !== optionIds.length ||
    new Set(optionTexts).size !== optionTexts.length
  ) {
    warnings.push(warning('DUPLICATE_OPTION', 'critical'));
  }

  if (!optionIds.includes(question.answerKey.trim())) {
    warnings.push(warning('INVALID_ANSWER_KEY', 'critical'));
  }

  const lengths = optionTexts.map((text) => text.length).filter(Boolean);
  if (lengths.length >= 3) {
    const shortest = Math.min(...lengths);
    const longest = Math.max(...lengths);
    if (shortest > 0 && longest >= shortest * 3) {
      warnings.push(warning('OPTION_LENGTH_CLUE', 'warning'));
    }
  }

  return warnings;
}
