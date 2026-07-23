import type {
  AssessmentDetail,
  AssessmentLifecycle,
  AssessmentSummary,
  FinalizeResult,
  OutputPackage,
  QuestionReviewState,
  ReviewQuestion,
} from '@/src/features/review/types';

function iso(daysAgo = 0, hour = 10): string {
  const d = new Date('2026-07-23T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

function q(
  partial: Omit<ReviewQuestion, 'updatedAt'> & { updatedAt?: string },
): ReviewQuestion {
  return {
    ...partial,
    updatedAt: partial.updatedAt ?? iso(0, 12),
  };
}

const seedQuestions = (assessmentId: string): ReviewQuestion[] => [
  q({
    id: `${assessmentId}-q1`,
    number: 1,
    stem: 'Hasil dari 3/4 + 1/8 adalah …',
    options: [
      { id: 'a', label: 'A', text: '4/8' },
      { id: 'b', label: 'B', text: '7/8' },
      { id: 'c', label: 'C', text: '5/8' },
      { id: 'd', label: 'D', text: '1' },
    ],
    answerKey: 'b',
    explanation: 'Samakan penyebut menjadi 8: 6/8 + 1/8 = 7/8.',
    topic: 'Penjumlahan pecahan',
    difficulty: 'easy',
    sourceLabel: 'Katalog · Bilangan',
    reviewState: 'unreviewed',
    warnings: [],
  }),
  q({
    id: `${assessmentId}-q2`,
    number: 2,
    stem: 'Manakah bilangan yang lebih besar dari 0,75?',
    options: [
      { id: 'a', label: 'A', text: '3/5' },
      { id: 'b', label: 'B', text: '2/3' },
      { id: 'c', label: 'C', text: '4/5' },
      { id: 'd', label: 'D', text: '1/2' },
    ],
    answerKey: 'c',
    explanation: '4/5 = 0,8 > 0,75.',
    topic: 'Perbandingan pecahan desimal',
    difficulty: 'medium',
    sourceLabel: 'Katalog · Bilangan',
    reviewState: 'needs_attention',
    warnings: [
      {
        code: 'AMBIGUOUS_STEM',
        message: 'Redaksi bisa disalahartikan sebagai perbandingan pecahan murni.',
        severity: 'warning',
      },
    ],
  }),
  q({
    id: `${assessmentId}-q3`,
    number: 3,
    stem: 'Sebuah pita panjangnya 2,4 m dipotong menjadi 6 bagian sama panjang. Panjang tiap potongan adalah …',
    options: [
      { id: 'a', label: 'A', text: '0,3 m' },
      { id: 'b', label: 'B', text: '0,4 m' },
      { id: 'c', label: 'C', text: '0,5 m' },
      { id: 'd', label: 'D', text: '0,6 m' },
    ],
    answerKey: 'b',
    explanation: '2,4 ÷ 6 = 0,4 m.',
    topic: 'Pembagian desimal',
    difficulty: 'medium',
    sourceLabel: 'PDF · Latihan kelas 5',
    reviewState: 'accepted',
    warnings: [],
  }),
  q({
    id: `${assessmentId}-q4`,
    number: 4,
    stem: 'Jika 5/6 dari sebuah pizza dimakan, sisa pizza adalah …',
    options: [
      { id: 'a', label: 'A', text: '1/6' },
      { id: 'b', label: 'B', text: '1/5' },
      { id: 'c', label: 'C', text: '1/3' },
      { id: 'd', label: 'D', text: '1/2' },
    ],
    answerKey: 'a',
    explanation: 'Sisa = 1 − 5/6 = 1/6.',
    topic: 'Pengurangan pecahan dari 1',
    difficulty: 'easy',
    sourceLabel: 'Katalog · Bilangan',
    reviewState: 'unreviewed',
    warnings: [
      {
        code: 'LOW_DIVERSITY',
        message: 'Pola soal mirip dengan item lain pada topik yang sama.',
        severity: 'info',
      },
    ],
  }),
  q({
    id: `${assessmentId}-q5`,
    number: 5,
    stem: 'Nilai tempat angka 7 pada bilangan 3.745 adalah …',
    options: [
      { id: 'a', label: 'A', text: 'Satuan' },
      { id: 'b', label: 'B', text: 'Puluhan' },
      { id: 'c', label: 'C', text: 'Ratusan' },
      { id: 'd', label: 'D', text: 'Ribuan' },
    ],
    answerKey: 'c',
    explanation: 'Angka 7 berada pada posisi ratusan.',
    topic: 'Nilai tempat',
    difficulty: 'easy',
    sourceLabel: 'Katalog · Bilangan',
    reviewState: 'edited',
    warnings: [],
  }),
];

function summarize(detail: AssessmentDetail): AssessmentSummary {
  const reviewedCount = detail.questions.filter((item) =>
    ['accepted', 'edited', 'rejected'].includes(item.reviewState),
  ).length;
  const warningCount = detail.questions.reduce((acc, item) => acc + item.warnings.length, 0);
  const blockers: string[] = [];
  const unresolved = detail.questions.filter((item) =>
    ['unreviewed', 'needs_attention'].includes(item.reviewState),
  ).length;
  if (unresolved > 0) {
    blockers.push(`${unresolved} soal masih belum selesai ditinjau.`);
  }
  const critical = detail.questions.filter((item) =>
    item.warnings.some((w) => w.severity === 'critical'),
  ).length;
  if (critical > 0) {
    blockers.push(`${critical} soal masih punya peringatan kritis.`);
  }

  return {
    id: detail.id,
    title: detail.title,
    subject: detail.subject,
    gradeLabel: detail.gradeLabel,
    lifecycle: detail.lifecycle,
    questionCount: detail.questions.length,
    reviewedCount,
    warningCount,
    reviewMode: detail.reviewMode,
    updatedAt: detail.updatedAt,
    createdAt: detail.createdAt,
    canReview: detail.lifecycle === 'review' || detail.lifecycle === 'draft',
    canFinalize: detail.lifecycle === 'review' && blockers.length === 0,
    canOpenOutput: detail.lifecycle === 'final',
  };
}

function withDerived(detail: AssessmentDetail): AssessmentDetail {
  const summary = summarize(detail);
  const blockers: string[] = [];
  const unresolved = detail.questions.filter((item) =>
    ['unreviewed', 'needs_attention'].includes(item.reviewState),
  ).length;
  if (unresolved > 0) blockers.push(`${unresolved} soal masih belum selesai ditinjau.`);
  if (detail.lifecycle === 'final') blockers.length = 0;

  return {
    ...detail,
    ...summary,
    finalizeBlockers: blockers,
    canFinalize: detail.lifecycle === 'review' && blockers.length === 0,
    canOpenOutput: detail.lifecycle === 'final',
    canReview: detail.lifecycle === 'review' || detail.lifecycle === 'draft',
  };
}

const store = new Map<string, AssessmentDetail>();
const outputs = new Map<string, OutputPackage>();

function seed() {
  if (store.size > 0) return;

  const a1: AssessmentDetail = withDerived({
    id: 'asm_pecahan_01',
    title: 'Latihan pecahan kelas 5',
    subject: 'Matematika',
    gradeLabel: 'Kelas 5',
    lifecycle: 'review',
    questionCount: 5,
    reviewedCount: 0,
    warningCount: 0,
    reviewMode: 'quick',
    updatedAt: iso(0, 14),
    createdAt: iso(1, 9),
    canReview: true,
    canFinalize: false,
    canOpenOutput: false,
    questions: seedQuestions('asm_pecahan_01'),
    finalizeBlockers: [],
    teacherResponsibilityNote:
      'Saya telah meninjau draft ini dan bertanggung jawab atas kualitas soal yang difinalkan.',
  });

  const a2Questions = seedQuestions('asm_ipas_02').map((item, index) => ({
    ...item,
    reviewState: (index < 4 ? 'accepted' : 'accepted') as QuestionReviewState,
    warnings: [],
  }));
  const a2: AssessmentDetail = withDerived({
    id: 'asm_ipas_02',
    title: 'Kuis perubahan wujud benda',
    subject: 'IPAS',
    gradeLabel: 'Kelas 5',
    lifecycle: 'final',
    questionCount: 5,
    reviewedCount: 5,
    warningCount: 0,
    reviewMode: 'detail',
    updatedAt: iso(2, 16),
    createdAt: iso(3, 8),
    canReview: false,
    canFinalize: false,
    canOpenOutput: true,
    questions: a2Questions,
    finalizeBlockers: [],
    teacherResponsibilityNote:
      'Saya telah meninjau draft ini dan bertanggung jawab atas kualitas soal yang difinalkan.',
  });

  const a3: AssessmentDetail = withDerived({
    id: 'asm_draft_03',
    title: 'Ulangan harian bilangan bulat',
    subject: 'Matematika',
    gradeLabel: 'Kelas 6',
    lifecycle: 'draft',
    questionCount: 5,
    reviewedCount: 0,
    warningCount: 0,
    reviewMode: 'quick',
    updatedAt: iso(0, 8),
    createdAt: iso(0, 8),
    canReview: true,
    canFinalize: false,
    canOpenOutput: false,
    questions: seedQuestions('asm_draft_03').map((item) => ({
      ...item,
      reviewState: 'unreviewed' as const,
      warnings: [],
    })),
    finalizeBlockers: [],
    teacherResponsibilityNote:
      'Saya telah meninjau draft ini dan bertanggung jawab atas kualitas soal yang difinalkan.',
  });

  for (const item of [a1, a2, a3]) {
    store.set(item.id, withDerived(item));
  }

  outputs.set(a2.id, {
    assessmentId: a2.id,
    versionId: 'ver_asm_ipas_02_1',
    status: 'ready',
    studentSheetLabel: 'Lembar siswa (A4)',
    answerKeyLabel: 'Kunci jawaban',
    explanationLabel: 'Pembahasan',
    printHref: `/app/output/${a2.id}/print`,
    downloadHref: `#download-${a2.id}`,
    shareToken: 'bagikan-demo-ipas',
    updatedAt: iso(2, 16),
  });
}

seed();

export function listAssessments(filters: {
  q?: string;
  lifecycle?: AssessmentLifecycle | 'all';
} = {}): AssessmentSummary[] {
  seed();
  const q = (filters.q ?? '').trim().toLowerCase();
  const lifecycle = filters.lifecycle ?? 'all';
  return Array.from(store.values())
    .map((item) => withDerived(item))
    .filter((item) => (lifecycle === 'all' ? true : item.lifecycle === lifecycle))
    .filter((item) => {
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.gradeLabel.toLowerCase().includes(q)
      );
    })
    .map((item) => summarize(item))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function getAssessment(id: string): AssessmentDetail | null {
  seed();
  const item = store.get(id);
  return item ? withDerived(item) : null;
}

export function ensureAssessmentFromJob(assessmentId: string, reviewMode: 'quick' | 'detail' = 'quick') {
  seed();
  if (store.has(assessmentId)) return getAssessment(assessmentId)!;
  const created: AssessmentDetail = withDerived({
    id: assessmentId,
    title: 'Draft generate baru',
    subject: 'Matematika',
    gradeLabel: 'Kelas 5',
    lifecycle: 'review',
    questionCount: 5,
    reviewedCount: 0,
    warningCount: 0,
    reviewMode,
    updatedAt: iso(0, 15),
    createdAt: iso(0, 15),
    canReview: true,
    canFinalize: false,
    canOpenOutput: false,
    questions: seedQuestions(assessmentId),
    finalizeBlockers: [],
    teacherResponsibilityNote:
      'Saya telah meninjau draft ini dan bertanggung jawab atas kualitas soal yang difinalkan.',
  });
  store.set(assessmentId, created);
  return created;
}

export function updateQuestionState(
  assessmentId: string,
  questionId: string,
  reviewState: QuestionReviewState,
): AssessmentDetail | null {
  const item = getAssessment(assessmentId);
  if (!item || item.lifecycle === 'final') return null;
  const questions = item.questions.map((question) =>
    question.id === questionId
      ? { ...question, reviewState, updatedAt: new Date().toISOString() }
      : question,
  );
  const next = withDerived({
    ...item,
    questions,
    updatedAt: new Date().toISOString(),
    lifecycle: 'review',
  });
  store.set(assessmentId, next);
  return next;
}

export function bulkAccept(assessmentId: string, questionIds: string[]): AssessmentDetail | null {
  const item = getAssessment(assessmentId);
  if (!item || item.lifecycle === 'final') return null;
  const selected = new Set(questionIds);
  const questions = item.questions.map((question) =>
    selected.has(question.id)
      ? { ...question, reviewState: 'accepted' as const, updatedAt: new Date().toISOString() }
      : question,
  );
  const next = withDerived({
    ...item,
    questions,
    updatedAt: new Date().toISOString(),
    lifecycle: 'review',
  });
  store.set(assessmentId, next);
  return next;
}

export function updateQuestionContent(
  assessmentId: string,
  questionId: string,
  patch: Partial<Pick<ReviewQuestion, 'stem' | 'explanation' | 'answerKey'>>,
): AssessmentDetail | null {
  const item = getAssessment(assessmentId);
  if (!item || item.lifecycle === 'final') return null;
  const questions = item.questions.map((question) =>
    question.id === questionId
      ? {
          ...question,
          ...patch,
          reviewState: 'edited' as const,
          updatedAt: new Date().toISOString(),
        }
      : question,
  );
  const next = withDerived({
    ...item,
    questions,
    updatedAt: new Date().toISOString(),
    lifecycle: 'review',
  });
  store.set(assessmentId, next);
  return next;
}

export function finalizeAssessment(assessmentId: string, acknowledged: boolean): {
  ok: true;
  value: FinalizeResult;
} | {
  ok: false;
  error: { code: string; message: string; blockers?: string[] };
} {
  const item = getAssessment(assessmentId);
  if (!item) {
    return { ok: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Lembar tidak ditemukan.' } };
  }
  if (item.lifecycle === 'final') {
    return {
      ok: true,
      value: {
        assessmentId,
        versionId: `ver_${assessmentId}_1`,
        lifecycle: 'final',
        finalizedAt: item.updatedAt,
      },
    };
  }
  const current = withDerived(item);
  if (current.finalizeBlockers.length > 0) {
    return {
      ok: false,
      error: {
        code: 'STATE_CONFLICT',
        message: 'Masih ada soal yang harus diselesaikan sebelum finalisasi.',
        blockers: current.finalizeBlockers,
      },
    };
  }
  if (!acknowledged) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Centang konfirmasi tanggung jawab review sebelum finalisasi.',
      },
    };
  }

  const finalizedAt = new Date().toISOString();
  const next = withDerived({
    ...current,
    lifecycle: 'final',
    updatedAt: finalizedAt,
    finalizeBlockers: [],
  });
  store.set(assessmentId, next);
  outputs.set(assessmentId, {
    assessmentId,
    versionId: `ver_${assessmentId}_1`,
    status: 'ready',
    studentSheetLabel: 'Lembar siswa (A4)',
    answerKeyLabel: 'Kunci jawaban',
    explanationLabel: 'Pembahasan',
    printHref: `/app/output/${assessmentId}/print`,
    downloadHref: `#download-${assessmentId}`,
    shareToken: `bagikan-${assessmentId}`,
    updatedAt: finalizedAt,
  });
  return {
    ok: true,
    value: {
      assessmentId,
      versionId: `ver_${assessmentId}_1`,
      lifecycle: 'final',
      finalizedAt,
    },
  };
}

export function getOutputPackage(assessmentId: string): OutputPackage | null {
  seed();
  return outputs.get(assessmentId) ?? null;
}

export function __resetAssessmentStore() {
  store.clear();
  outputs.clear();
  seed();
}
