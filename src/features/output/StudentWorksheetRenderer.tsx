import type { PrintDTO, PrintMetadata, PrintQuestion } from '@/src/features/output/types';

export function StudentWorksheetRenderer({ dto }: { dto: PrintDTO }) {
  return (
    <article className="worksheet-print print:bg-white print:text-black">
      {dto.metadata ? <StudentPrintMetadata metadata={dto.metadata} /> : null}
      <header className="worksheet-print__header mb-8 border-b border-brand-line pb-4 print:border-black">
        <h1 className="text-h1 font-semibold text-brand-ink print:text-black">{dto.title}</h1>
        <p className="mt-2 text-body-sm text-brand-ink-muted print:text-black">
          {dto.subject} · {dto.gradeLabel}
        </p>
      </header>

      <ol className="worksheet-print__questions flex flex-col gap-6">
        {dto.questions.map((question) => (
          <li key={question.number} className="worksheet-print__question break-inside-avoid print:break-inside-avoid">
            <div className="flex gap-3">
              <span className="font-semibold text-brand-ink print:text-black">{question.number}.</span>
              <div className="flex-1">
                <p className="text-body text-brand-ink print:text-black">{question.stem}</p>
                <AnswerArea question={question} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

function StudentPrintMetadata({ metadata }: { metadata: PrintMetadata }) {
  return (
    <section
      data-testid="student-print-metadata"
      className="student-print-metadata mb-6 border border-brand-line p-4 text-body-sm text-brand-ink print:border-black print:text-black"
      aria-label="Informasi lembar kerja"
    >
      <p className="text-center font-semibold text-body print:text-black">{metadata.schoolName}</p>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
        <p>Guru: {metadata.teacherName}</p>
        <p>Tanggal: {metadata.date}</p>
        <p>Durasi: {metadata.duration}</p>
        {metadata.maxScore !== undefined ? (
          <p>Nilai Maksimal: {metadata.maxScore}</p>
        ) : null}
      </div>
      <p className="mt-2">Instruksi: {metadata.instructions}</p>
      <div className="mt-3 grid grid-cols-2 gap-x-4 border-t border-brand-line pt-3 print:border-black">
        <p>Nama: <span className="inline-block min-w-[120px] border-b border-brand-ink print:border-black" aria-label="kolom nama siswa" /></p>
        <p>Kelas: <span className="inline-block min-w-[80px] border-b border-brand-ink print:border-black" aria-label="kolom kelas siswa" /></p>
      </div>
    </section>
  );
}

function AnswerArea({ question }: { question: PrintQuestion }) {
  if (question.questionType === 'multiple_choice' || question.questionType === 'true_false') {
    return (
      <ul className="mt-3 grid gap-2 print:gap-1">
        {(question.options ?? []).map((option) => (
          <li key={option.key} className="worksheet-print__option text-body-sm text-brand-ink print:text-black">
            <span className="font-medium">{option.key}.</span> {option.text}
          </li>
        ))}
      </ul>
    );
  }

  if (question.questionType === 'essay') {
    return <div className="answer-box-lined mt-4 h-32 rounded-sm border border-brand-line print:border-black" />;
  }

  return <div className="answer-line mt-6 border-b border-brand-line print:border-black" aria-hidden="true" />;
}
