import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

function claims(token: string): { userId?: string; workspaceId?: string } {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'));
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.', retryable: false } },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: 'Konfigurasi soal wajib diisi.', retryable: false } },
      { status: 400 },
    );
  }

  const jwt = claims(token);
  const workspaceId = jwt.workspaceId;
  const actorId = jwt.userId;
  if (!workspaceId || !actorId) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Workspace atau pengguna tidak ditemukan.', retryable: false } },
      { status: 401 },
    );
  }

  const idempotencyKey = request.headers.get('idempotency-key') || crypto.randomUUID();
  const count = Math.min(200, Math.max(1, Number(body.questionCount) || 1));
  const rawDifficulty = String(body.difficulty || 'medium');
  const difficulty = rawDifficulty === 'mixed' ? 'medium' : rawDifficulty;
  const blueprintItems = Array.from({ length: count }, (_, sequence) => ({
    sequence,
    questionType: 'multiple_choice',
    difficulty,
    cognitiveLevel: null,
    topicHint: String(body.teacherFocus || body.subjectId || ''),
    outcomeId: null,
    sourceUploadId: typeof body.sourceId === 'string' && body.sourceId ? body.sourceId : null,
  }));

  const assessmentResponse = await backendFetch(
    `/v1/workspaces/${encodeURIComponent(workspaceId)}/assessments`,
    {
      method: 'POST',
      token,
      headers: {
        'Idempotency-Key': `${idempotencyKey}:assessment`,
        'x-actor-user-id': actorId,
      },
      body: JSON.stringify({
        title: `${String(body.assessmentType || 'practice')} · ${String(body.subjectId || 'Lembar soal')}`,
        curriculumVersionId: String(body.curriculumVersionId || '11111111-1111-1111-1111-111111111111'),
        gradeId: String(body.gradeId || ''),
        subjectId: String(body.subjectId || ''),
        sourceUploadIds:
          typeof body.sourceId === 'string' && body.sourceId ? [body.sourceId] : [],
        blueprintItems,
      }),
    },
  );
  const assessmentPayload = (await assessmentResponse.json().catch(() => null)) as {
    assessment?: { id?: string };
    version?: { id?: string };
    blueprintItems?: unknown[];
    error?: unknown;
  } | null;
  if (!assessmentResponse.ok || !assessmentPayload?.assessment?.id || !assessmentPayload.version?.id) {
    return NextResponse.json(
      assessmentPayload ?? { error: { code: 'UPSTREAM_ERROR', message: 'Gagal membuat asesmen.' } },
      { status: assessmentResponse.status },
    );
  }

  const jobResponse = await backendFetch('/v1/jobs', {
    method: 'POST',
    token,
    body: JSON.stringify({
      workspaceId,
      actorId,
      operation: 'assessment_generation',
      idempotencyKey: `${idempotencyKey}:generation`,
      quotaUnits: 1,
      payload: {
        assessmentId: assessmentPayload.assessment.id,
        assessmentVersionId: assessmentPayload.version.id,
        reviewMode: body.reviewMode === 'detail' ? 'detail' : 'quick',
        blueprintSchemaVersion: '1.0',
        blueprintItems,
      },
    }),
  });
  const jobPayload = (await jobResponse.json().catch(() => null)) as {
    jobId?: string;
    status?: string;
    error?: unknown;
  } | null;
  if (!jobResponse.ok || !jobPayload?.jobId) {
    return NextResponse.json(
      jobPayload ?? { error: { code: 'UPSTREAM_ERROR', message: 'Gagal memulai proses pembuatan soal.' } },
      { status: jobResponse.status },
    );
  }

  return NextResponse.json(
    {
      data: {
        status: 'accepted',
        jobId: jobPayload.jobId,
        assessmentId: assessmentPayload.assessment.id,
        compositionId: assessmentPayload.version.id,
      },
    },
    { status: jobResponse.status === 200 ? 200 : 202 },
  );
}
