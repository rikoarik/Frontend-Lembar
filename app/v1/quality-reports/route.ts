import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';
import { isMockApiMode, mockNotFound, mockOk } from '@/src/lib/mock-api/preview';

function extractToken(request: NextRequest, jar: Awaited<ReturnType<typeof cookies>>): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match?.[1]) return match[1].trim();
  }

  const cookieToken =
    jar.get(JWT_COOKIE)?.value ||
    jar.get(SESSION_COOKIE)?.value ||
    jar.get('token')?.value ||
    jar.get('jwt')?.value;

  return cookieToken?.trim() || null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (isMockApiMode()) {
    let body: { assessmentId?: string; questionId?: string; reason?: string; note?: string } = {};
    try {
      body = (await request.json()) as typeof body;
    } catch {
      body = {};
    }
    return mockOk(
      {
        reportId: `rep_${Math.random().toString(36).slice(2, 8)}`,
        receivedAt: new Date().toISOString(),
        assessmentId: body.assessmentId ?? null,
        questionId: body.questionId ?? null,
      },
      { status: 201 },
    );
  }

  const jar = await cookies();
  const token = extractToken(request, jar);
  if (!token) {
    return NextResponse.json(
      {
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Token autentikasi tidak ditemukan. Silakan masuk terlebih dahulu.',
          retryable: false,
        },
      },
      { status: 401 },
    );
  }

  const payload = decodeJwtPayload(token);
  const workspaceId = (payload?.['workspaceId'] as string) || '';

  let body: { assessmentId?: string; questionId?: string; reason?: string; note?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const upstream = await backendFetch('/v1/admin/quality-reports', {
    method: 'POST',
    token,
    headers: {
      ...(workspaceId ? { 'x-workspace-id': workspaceId, 'x-tenant-id': workspaceId } : {}),
    },
    body: JSON.stringify({
      assessmentId: body.assessmentId,
      questionId: body.questionId,
      reason: body.reason,
      notes: body.note,
    }),
  });

  const payloadJson = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(
      payloadJson ?? { error: { code: 'UPSTREAM_ERROR', message: 'Laporan gagal dikirim.' } },
      { status: upstream.status },
    );
  }

  return NextResponse.json(
    {
      data: {
        reportId: payloadJson?.data?.id ?? null,
        receivedAt: payloadJson?.data?.createdAt ?? new Date().toISOString(),
        assessmentId: body.assessmentId ?? null,
        questionId: body.questionId ?? null,
      },
    },
    { status: 201 },
  );
}

export async function GET() {
  return mockNotFound();
}
