import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

function jwtWorkspaceId(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString()) as {
      workspaceId?: unknown;
    };
    return typeof payload.workspaceId === 'string' ? payload.workspaceId : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      {
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Silakan masuk terlebih dahulu.',
          retryable: false,
        },
      },
      { status: 401 },
    );
  }

  const { slug } = await context.params;
  const workspaceId = request.nextUrl.searchParams.get('workspaceId') || jwtWorkspaceId(token);
  if (!workspaceId) {
    return NextResponse.json(
      {
        error: { code: 'VALIDATION_FAILED', message: 'workspaceId wajib diisi.', retryable: false },
      },
      { status: 400 },
    );
  }

  const upstream = await backendFetch(`/v1/payment/${slug.join('/')}`, {
    method: 'GET',
    token,
    headers: { 'x-tenant-id': workspaceId, 'x-workspace-id': workspaceId },
  });
  const payload = await upstream.json().catch(() => null);
  return NextResponse.json(
    payload ?? { error: { code: 'UPSTREAM_ERROR', message: 'Respons backend tidak valid.' } },
    { status: upstream.status },
  );
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      {
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Silakan masuk terlebih dahulu.',
          retryable: false,
        },
      },
      { status: 401 },
    );
  }

  const { slug } = await context.params;
  const workspaceId = request.nextUrl.searchParams.get('workspaceId') || jwtWorkspaceId(token);
  if (!workspaceId) {
    return NextResponse.json(
      {
        error: { code: 'VALIDATION_FAILED', message: 'workspaceId wajib diisi.', retryable: false },
      },
      { status: 400 },
    );
  }

  let rawBody: string | undefined;
  try {
    rawBody = await request.text();
  } catch {
    rawBody = undefined;
  }

  const upstream = await backendFetch(`/v1/payment/${slug.join('/')}`, {
    method: 'POST',
    token,
    headers: {
      'x-tenant-id': workspaceId,
      'x-workspace-id': workspaceId,
      ...(request.headers.get('x-idempotency-key')
        ? { 'x-idempotency-key': request.headers.get('x-idempotency-key') as string }
        : {}),
    },
    body: rawBody,
  });
  const payload = await upstream.json().catch(() => null);
  return NextResponse.json(
    payload ?? { error: { code: 'UPSTREAM_ERROR', message: 'Respons backend tidak valid.' } },
    { status: upstream.status },
  );
}
