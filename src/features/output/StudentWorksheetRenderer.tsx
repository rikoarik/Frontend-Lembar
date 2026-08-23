import { type PrintDTO, type PrintQuestion } from '@/src/features/output/types';
import { DocumentLetterhead } from '@/src/features/output/DocumentLetterhead';
import { QuestionImageDisplay } from '@/src/features/questions/QuestionImageDisplay';

export function StudentWorksheetRenderer({ dto }: { dto: PrintDTO }) {
  return (
    <article className="worksheet-print print:bg-white print:text-black">
      <DocumentLetterhead dto={dto} copy="student" />

      <ol className="worksheet-print__questions flex flex-col gap-6">
        {dto.questions.map((question) => (
          <li
            key={question.number}
            className="worksheet-print__question break-inside-avoid print:break-inside-avoid"
          >
            <div className="flex gap-3">
              <span className="font-semibold text-brand-ink print:text-black">
                {question.number}.
              </span>
              <div className="flex-1">
                <p className="text-body text-brand-ink print:text-black">{question.stem}</p>
                <QuestionImageDisplay
                  image={question.image}
                  fallbackAlt={`Gambar pendukung soal ${question.number}`}
                  className="mt-3 max-h-80 print:max-h-64"
                />
                <AnswerArea question={question} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

function AnswerArea({ question }: { question: PrintQuestion }) {
  if (question.questionType === 'multiple_choice' || question.questionType === 'true_false') {
    return (
      <ul className="mt-3 grid gap-2 print:gap-1">
        {(question.options ?? []).map((option) => (
          <li
            key={option.key}
            className="worksheet-print__option text-body-sm text-brand-ink print:text-black"
          >
            <span className="font-medium">{option.key}.</span> {option.text}
          </li>
        ))}
      </ul>
    );
  }

  if (question.questionType === 'essay') {
    return (
      <div className="answer-box-lined mt-4 h-32 rounded-sm border border-brand-line print:border-black" />
    );
  }

  return (
    <div
      className="answer-line mt-6 border-b border-brand-line print:border-black"
      aria-hidden="true"
    />
  );
}
