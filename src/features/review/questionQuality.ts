import type { QuestionWarning, ReviewQuestion } from './types';

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('id-ID')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** Deterministic review checks that are safe to run for live and mock questions. */
export function analyzeQuestionQuality(question: Pick<ReviewQuestion, 'questionType' | 'options' | 'answerKey'>): QuestionWarning[] {
  if (question.questionType !== 'multiple_choice' && question.questionType !== 'true_false') {
    return [];
  }

  const warnings: QuestionWarning[] = [];
  const optionIds = question.options.map((option) => option.id.trim());
  const optionTexts = question.options.map((option) => normalize(option.text));

  if (question.options.length < 2 || optionTexts.some((text) => text.length === 0)) {
    warnings.push({
      code: 'INVALID_OPTIONS',
      message: 'Pilihan jawaban belum lengkap. Isi minimal dua pilihan yang tidak kosong.',
      severity: 'critical',
    });
  }

  if (new Set(optionIds).size !== optionIds.length || new Set(optionTexts).size !== optionTexts.length) {
    warnings.push({
      code: 'DUPLICATE_OPTION',
      message: 'Ada pilihan jawaban yang sama atau terlalu identik. Bedakan agar tidak ambigu.',
      severity: 'critical',
    });
  }

  if (!optionIds.includes(question.answerKey.trim())) {
    warnings.push({
      code: 'INVALID_ANSWER_KEY',
      message: 'Kunci jawaban tidak menunjuk ke salah satu pilihan yang tersedia.',
      severity: 'critical',
    });
  }

  const lengths = optionTexts.map((text) => text.length).filter(Boolean);
  if (lengths.length >= 3) {
    const shortest = Math.min(...lengths);
    const longest = Math.max(...lengths);
    if (shortest > 0 && longest >= shortest * 3) {
      warnings.push({
        code: 'OPTION_LENGTH_CLUE',
        message: 'Panjang pilihan sangat tidak seimbang dan bisa memberi petunjuk jawaban.',
        severity: 'warning',
      });
    }
  }

  return warnings;
}
