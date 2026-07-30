export type PrintOption = {
  key: string;
  text: string;
};

export type PrintRubricCriterion = {
  label: string;
  description: string;
  points: number;
};

export type PrintQuestion = {
  number: number;
  stem: string;
  questionType: string;
  options?: PrintOption[];
  answerKey?: string;
  explanation?: string;
  rubric?: PrintRubricCriterion[];
};

export type PrintMetadata = {
  schoolName: string;
  teacherName: string;
  subject: string;
  class: string;
  date: string;
  duration: string;
  instructions: string;
  maxScore?: number;
};

export type PrintDTO = {
  assessmentId: string;
  title: string;
  subject: string;
  gradeLabel: string;
  questionCount: number;
  questions: PrintQuestion[];
  metadata?: PrintMetadata;
};

// ---------- mapper ----------

type BEQuestion = {
  stem?: unknown;
  questionType?: unknown;
  options?: Array<{ key?: unknown; text?: unknown }>;
  answer?: unknown;
  explanation?: unknown;
  rubric?: Array<{ label?: unknown; description?: unknown; points?: unknown }>;
};

type BEPrintPayload = {
  assessment?: { id?: unknown; title?: unknown };
  version?: { configSnapshot?: { subjectLabel?: unknown; gradeLabel?: unknown } };
  questions?: BEQuestion[];
  metadata?: Record<string, unknown>;
};

function mapPrintMetadata(metadata?: Record<string, unknown>): PrintMetadata | undefined {
  if (!metadata) return undefined;
  if (!('schoolName' in metadata) && !('teacherName' in metadata)) return metadata as PrintMetadata;
  const maxScore = Number(metadata.maxScore);
  return {
    ...metadata,
    schoolName: String(metadata.schoolName ?? ''),
    teacherName: String(metadata.teacherName ?? ''),
    subject: String(metadata.subject ?? ''),
    class: String(metadata.class ?? ''),
    date: String(metadata.date ?? ''),
    duration: String(metadata.duration ?? ''),
    instructions: String(metadata.instructions ?? ''),
    ...(Number.isFinite(maxScore) ? { maxScore } : {}),
  };
}

export function mapToPrintDTO(assessmentId: string, be: BEPrintPayload): PrintDTO {
  const config = be.version?.configSnapshot ?? {};
  const questions: PrintQuestion[] = (be.questions ?? []).map((q, i) => {
    const out: PrintQuestion = {
      number: i + 1,
      stem: String(q.stem ?? ''),
      questionType: String(q.questionType ?? 'multiple_choice'),
    };
    if (q.options?.length) out.options = q.options.map((o) => ({ key: String(o.key ?? ''), text: String(o.text ?? '') }));
    if (q.answer != null) out.answerKey = String(q.answer);
    if (q.explanation != null) out.explanation = String(q.explanation);
    if (q.rubric?.length) out.rubric = q.rubric.map((r) => ({ label: String(r.label ?? ''), description: String(r.description ?? ''), points: Number(r.points ?? 0) }));
    return out;
  });

  return {
    assessmentId,
    title: String(be.assessment?.title ?? ''),
    subject: String(config.subjectLabel ?? ''),
    gradeLabel: String(config.gradeLabel ?? ''),
    questionCount: questions.length,
    questions,
    ...(be.metadata ? { metadata: mapPrintMetadata(be.metadata) } : {}),
  };
}
