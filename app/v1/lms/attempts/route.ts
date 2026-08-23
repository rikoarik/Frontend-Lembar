import { NextResponse } from 'next/server';
import { backendFetch, backendBaseUrl, isMockApiMode } from '@/src/lib/api/session';
import { mockFail, mockOk } from '@/src/lib/mock-api/preview';
import { getAssessment } from '@/src/features/review/mockStore';

// ── Mock store for guest attempts (mock mode only) ────────────────────────────
type GuestAttempt = {
  id: string;
  assessmentId: string;
  guestName: string;
  guestClass: string;
  startedAt: string;
  answers: Array<{ number: number; value: string }>;
  submittedAt?: string;
};
const mockAttempts = new Map<string, GuestAttempt>();

// ── GET  ?assessmentId=  → returns PrintDTO questions for the runner ──────────
export async function GET(request: Request) {
  const url = new URL(request.url);
  const assessmentId = url.searchParams.get('assessmentId');
  if (!assessmentId) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: 'assessmentId diperlukan.' } },
      { status: 400 },
    );
  }

  if (isMockApiMode()) {
    const item = getAssessment(assessmentId);
    if (!item) return mockFail('RESOURCE_NOT_FOUND', 'Lembar tidak ditemukan.', 404);
    // Build a minimal PrintDTO from the mock assessment
    const questions =
      ((item as Record<string, unknown>).questions as Array<Record<string, unknown>> | undefined) ??
      [];
    return mockOk({
      assessmentId,
      title: String((item as Record<string, unknown>).title ?? 'Ujian'),
      subject: String((item as Record<string, unknown>).subject ?? ''),
      gradeLabel: String((item as Record<string, unknown>).gradeLabel ?? ''),
      questionCount: questions.length,
      questions: questions.map((q, i) => ({
        number: i + 1,
        stem: String(q.stem ?? ''),
        questionType: String(q.questionType ?? 'multiple_choice'),
        options: Array.isArray(q.options) ? q.options : undefined,
      })),
    });
  }

  // Live: fetch PrintDTO from BE — no auth required for guest view
  const upstream = await backendFetch(`/v1/assessments/${assessmentId}/print`);
  const payload = await upstream.json().catch(() => null);
  return NextResponse.json(payload, { status: upstream.status });
}

// ── POST  { assessmentId, guestName, guestClass } → start attempt ─────────────
export async function POST(request: Request) {
  let body: { assessmentId?: string; guestName?: string; guestClass?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: 'Periksa kembali isian formulir.' } },
      { status: 400 },
    );
  }

  if (!body.assessmentId || !body.guestName) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: 'assessmentId dan guestName wajib.' } },
      { status: 400 },
    );
  }

  if (isMockApiMode()) {
    const id = `attempt_${Date.now()}`;
    const attempt: GuestAttempt = {
      id,
      assessmentId: body.assessmentId,
      guestName: body.guestName,
      guestClass: body.guestClass ?? '',
      startedAt: new Date().toISOString(),
      answers: [],
    };
    mockAttempts.set(id, attempt);
    return mockOk(attempt, { status: 201 });
  }

  // Live: no-auth BE endpoint
  const upstream = await backendFetch(`/v1/assessments/${body.assessmentId}/attempts`, {
    method: 'POST',
    body: JSON.stringify({ guestName: body.guestName, guestClass: body.guestClass }),
  });
  const payload = await upstream.json().catch(() => null);
  return NextResponse.json(payload, { status: upstream.status });
}

// ── PUT  { attemptId, answers } → submit attempt ──────────────────────────────
export async function PUT(request: Request) {
  let body: { attemptId?: string; answers?: Array<{ number: number; value: string }> } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: 'Periksa kembali isian formulir.' } },
      { status: 400 },
    );
  }

  if (!body.attemptId) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: 'attemptId wajib.' } },
      { status: 400 },
    );
  }

  if (isMockApiMode()) {
    const attempt = mockAttempts.get(body.attemptId);
    if (!attempt) return mockFail('RESOURCE_NOT_FOUND', 'Sesi tidak ditemukan.', 404);
    attempt.answers = body.answers ?? [];
    attempt.submittedAt = new Date().toISOString();
    mockAttempts.set(body.attemptId, attempt);
    return mockOk({ id: attempt.id, submittedAt: attempt.submittedAt });
  }

  // Live: no-auth submit
  const upstream = await backendFetch(`/v1/attempts/${body.attemptId}/submit`, {
    method: 'PUT',
    body: JSON.stringify({ answers: body.answers }),
  });
  const payload = await upstream.json().catch(() => null);
  return NextResponse.json(payload, { status: upstream.status });
}
