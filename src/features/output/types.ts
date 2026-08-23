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

export type LetterheadTemplate = 'official' | 'compact' | 'simple';

export type PrintMetadata = {
  schoolName: string;
  teacherName: string;
  subject: string;
  class: string;
  date: string;
  duration: string;
  instructions: string;
  maxScore?: number;
  headerTemplate?: LetterheadTemplate;
  authorityName?: string;
  departmentName?: string;
  schoolAddress?: string;
  schoolContact?: string;
  leftLogoDataUrl?: string;
  rightLogoDataUrl?: string;
};

export type PrintDTO = {
  assessmentId: string;
  title: string;
  subject: string;
  gradeLabel: string;
  assessmentType?: string;
  academicYear?: string;
  questionCount: number;
  questions: PrintQuestion[];
  metadata?: PrintMetadata;
};

export function formatExamHeading(dto: Pick<PrintDTO, 'assessmentType' | 'title'>): string {
  switch (dto.assessmentType) {
    case 'practice':
      return 'LATIHAN SOAL';
    case 'daily':
      return 'ULANGAN HARIAN';
    case 'midterm':
      return 'UJIAN TENGAH SEMESTER';
    case 'final':
      return 'UJIAN AKHIR SEMESTER';
    case 'promotion':
      return 'UJIAN KENAIKAN KELAS';
    case 'tka':
      return 'TES KEMAMPUAN AKADEMIK';
    default:
      return `UJIAN ${dto.title}`.toUpperCase();
  }
}

export function formatExamContext(dto: Pick<PrintDTO, 'subject' | 'gradeLabel'>): string {
  return [dto.subject, dto.gradeLabel].filter(Boolean).join(' · ');
}

// ---------- mapper ----------

type BEQuestion = {
  stem?: unknown;
  questionType?: unknown;
  options?: Array<{ key?: unknown; text?: unknown }>;
  answer?: unknown;
  explanation?: unknown;
  rubric?: Array<{ label?: unknown; description?: unknown; points?: unknown }>;
};

type BEPrintDocument = {
  meta?: {
    assessmentId?: unknown;
    title?: unknown;
    assessmentType?: unknown;
    academicYear?: unknown;
    subjectLabel?: unknown;
    gradeLabel?: unknown;
  };
  questions?: BEQuestion[];
};

type BEPrintPayload = {
  data?: BEPrintDocument;
  assessment?: { id?: unknown; title?: unknown };
  version?: {
    configSnapshot?: {
      subjectLabel?: unknown;
      gradeLabel?: unknown;
      assessmentType?: unknown;
      academicYear?: unknown;
    };
  };
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
    ...(metadata.headerTemplate === 'official' ||
    metadata.headerTemplate === 'compact' ||
    metadata.headerTemplate === 'simple'
      ? { headerTemplate: metadata.headerTemplate }
      : {}),
    ...(typeof metadata.authorityName === 'string'
      ? { authorityName: metadata.authorityName }
      : {}),
    ...(typeof metadata.departmentName === 'string'
      ? { departmentName: metadata.departmentName }
      : {}),
    ...(typeof metadata.schoolAddress === 'string'
      ? { schoolAddress: metadata.schoolAddress }
      : {}),
    ...(typeof metadata.schoolContact === 'string'
      ? { schoolContact: metadata.schoolContact }
      : {}),
    ...(typeof metadata.leftLogoDataUrl === 'string'
      ? { leftLogoDataUrl: metadata.leftLogoDataUrl }
      : {}),
    ...(typeof metadata.rightLogoDataUrl === 'string'
      ? { rightLogoDataUrl: metadata.rightLogoDataUrl }
      : {}),
    ...(Number.isFinite(maxScore) ? { maxScore } : {}),
  };
}

export function mapToPrintDTO(assessmentId: string, be: BEPrintPayload): PrintDTO {
  const document = be.data;
  const meta = document?.meta;
  const config = be.version?.configSnapshot ?? {};
  const questions: PrintQuestion[] = (document?.questions ?? be.questions ?? []).map((q, i) => {
    const out: PrintQuestion = {
      number: i + 1,
      stem: String(q.stem ?? ''),
      questionType: String(q.questionType ?? 'multiple_choice'),
    };
    if (q.options?.length)
      out.options = q.options.map((o) => ({
        key: String(o.key ?? ''),
        text: String(o.text ?? ''),
      }));
    if (q.answer != null) out.answerKey = String(q.answer);
    if (q.explanation != null) out.explanation = String(q.explanation);
    if (q.rubric?.length)
      out.rubric = q.rubric.map((r) => ({
        label: String(r.label ?? ''),
        description: String(r.description ?? ''),
        points: Number(r.points ?? 0),
      }));
    return out;
  });

  const assessmentType = meta?.assessmentType ?? config.assessmentType;
  const academicYear = meta?.academicYear ?? config.academicYear;

  return {
    assessmentId: String(meta?.assessmentId ?? be.assessment?.id ?? assessmentId),
    title: String(meta?.title ?? be.assessment?.title ?? ''),
    subject: String(meta?.subjectLabel ?? config.subjectLabel ?? ''),
    gradeLabel: String(meta?.gradeLabel ?? config.gradeLabel ?? ''),
    ...(typeof assessmentType === 'string' ? { assessmentType } : {}),
    ...(typeof academicYear === 'string' ? { academicYear } : {}),
    questionCount: questions.length,
    questions,
    ...(be.metadata ? { metadata: mapPrintMetadata(be.metadata) } : {}),
  };
}
