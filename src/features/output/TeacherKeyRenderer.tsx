import {
  formatExamContext,
  formatExamHeading,
  type PrintDTO,
  type PrintQuestion,
  type PrintRubricCriterion,
} from '@/src/features/output/types';

export function TeacherKeyRenderer({ dto }: { dto: PrintDTO }) {
  return (
    <article className="teacher-key-print print:bg-white print:text-black">
      <header className="mb-8 border-b border-brand-line pb-4 text-center print:border-black">
        <h1 className="text-body-lg font-bold text-brand-ink print:text-black">
          {formatExamHeading(dto)}
        </h1>
        {formatExamContext(dto) ? (
          <p className="mt-1 text-body-sm text-brand-ink print:text-black">
            {formatExamContext(dto)}
          </p>
        ) : null}
        {dto.academicYear ? (
          <p className="mt-1 text-body-sm font-semibold text-brand-ink print:text-black">
            TAHUN PELAJARAN {dto.academicYear}
          </p>
        ) : null}
        <p className="mt-1 text-label-sm text-brand-ink-muted print:text-black">
          KUNCI JAWABAN GURU
        </p>
      </header>

      <ol className="flex flex-col gap-6" aria-label="Teacher answer key questions">
        {dto.questions.map((question) => (
          <li key={question.number} className="break-inside-avoid print:break-inside-avoid">
            <div className="flex gap-3">
              <span className="font-semibold text-brand-ink print:text-black">
                {question.number}.
              </span>
              <div className="flex-1">
                <p className="text-body text-brand-ink print:text-black">{question.stem}</p>
                <AnswerSection question={question} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

function AnswerSection({ question }: { question: PrintQuestion }) {
  const { questionType, options, answerKey, explanation, rubric } = question;

  if (questionType === 'multiple_choice' || questionType === 'true_false') {
    return (
      <>
        <ul className="mt-3 grid gap-2 print:gap-1">
          {(options ?? []).map((option) => {
            const isCorrect = option.key === answerKey;
            return (
              <li
                key={option.key}
                className={
                  isCorrect
                    ? 'text-body-sm font-semibold text-green-700 print:text-black print:underline'
                    : 'text-body-sm text-brand-ink print:text-black'
                }
                aria-label={isCorrect ? `Correct answer: ${option.key}. ${option.text}` : undefined}
              >
                {isCorrect && <span aria-hidden="true">✓ </span>}
                <span className="font-medium">{option.key}.</span> {option.text}
              </li>
            );
          })}
        </ul>
        <Explanation text={explanation} />
      </>
    );
  }

  if (questionType === 'short_answer') {
    return (
      <>
        <div className="mt-3 rounded-sm border border-brand-line p-3 print:border-black">
          <p className="text-label-sm font-semibold text-brand-ink-muted print:text-black">
            Answer key
          </p>
          <p className="mt-1 text-body-sm text-brand-ink print:text-black">{answerKey}</p>
        </div>
        <Explanation text={explanation} />
      </>
    );
  }

  if (questionType === 'essay') {
    const maxScore = rubric?.reduce((sum, c) => sum + c.points, 0);
    return (
      <>
        <div className="mt-3 rounded-sm border border-brand-line p-3 print:border-black">
          <p className="text-label-sm font-semibold text-brand-ink-muted print:text-black">
            Model answer
          </p>
          <p className="mt-1 text-body-sm text-brand-ink print:text-black">{answerKey}</p>
        </div>
        {rubric && rubric.length > 0 && (
          <div className="mt-3">
            <div className="flex items-baseline gap-3">
              <p className="text-label-sm font-semibold text-brand-ink-muted print:text-black">
                Rubric
              </p>
              {maxScore != null && (
                <p className="text-body-sm text-brand-ink-muted print:text-black">
                  Max score: {maxScore}
                </p>
              )}
            </div>
            <RubricList criteria={rubric} />
          </div>
        )}
        <Explanation text={explanation} />
      </>
    );
  }

  return null;
}

function RubricList({ criteria }: { criteria: PrintRubricCriterion[] }) {
  return (
    <ul className="mt-2 flex flex-col gap-1" aria-label="Rubric criteria">
      {criteria.map((c) => (
        <li
          key={c.label}
          className="flex items-start gap-2 text-body-sm text-brand-ink print:text-black"
        >
          <span className="min-w-[6rem] font-semibold">{c.label}</span>
          <span className="flex-1">{c.description}</span>
          <span className="shrink-0 text-brand-ink-muted print:text-black">{c.points} pts</span>
        </li>
      ))}
    </ul>
  );
}

function Explanation({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="mt-2 text-body-sm italic text-brand-ink-muted print:text-black">{text}</p>;
}
