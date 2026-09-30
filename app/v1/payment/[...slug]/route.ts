import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { authenticatedRoles } from '@/src/lib/api/authorization';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

/**
 * Paths under /v1/payment that belong to the platform ops surface.
 * Everything else (e.g. `pakasir/create-order` used by the teacher
 * subscription page) stays available to any authenticated session.
 */
const OPS_ONLY_PAYMENT_PATHS = ['orders'];

function isOpsOnlyPath(slug: string[]): boolean {
  return OPS_ONLY_PAYMENT_PATHS.includes(slug[0] ?? '');
}

/**
 * FE-VER-02 F-7: `/v1/payment/orders` had no role guard, so a teacher session
 * got `200 {"data":[]}`. Gate the ops-only paths here so the admin surface is
 * not reachable from a non-admin role even while the upstream guard is missing.
 */
async function opsGuard(slug: string[]): Promise<NextResponse | null> {
  if (!isOpsOnlyPath(slug)) return null;
  const roles = await authenticatedRoles();
  if (!roles.includes('superadmin')) {
    return NextResponse.json(
      {
        error: {
          code: 'ROLE_FORBIDDEN',
          message: 'Akses superadmin diperlukan.',
          retryable: false,
        },
      },
      { status: 403 },
    );
  }
  return null;
}

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
  const forbidden = await opsGuard(slug);
  if (forbidden) return forbidden;
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
  const forbidden = await opsGuard(slug);
  if (forbidden) return forbidden;
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
