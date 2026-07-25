import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

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

/** Decode JWT payload without verifying signature (server-side only). */
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

async function handleProxy(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const path = `/v1/school/${slug.join('/')}`;
  const search = request.nextUrl.search;
  let fullPath = `${path}${search}`;

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

  // Decode JWT to extract userId + workspaceId + roles for required headers
  const jwtPayload = decodeJwtPayload(token);
  const userId = (jwtPayload?.['userId'] as string) || (jwtPayload?.['sub'] as string) || '';
  const workspaceId = (jwtPayload?.['workspaceId'] as string) || '';
  const roles = (jwtPayload?.['roles'] as string[]) ?? [];
  const userRole = roles.includes('school_admin')
    ? 'school_admin'
    : roles.includes('superadmin')
      ? 'superadmin'
      : 'teacher';

  // dashboard endpoint needs workspaceId as query param
  if (path === '/v1/school/dashboard' && workspaceId && !request.nextUrl.searchParams.get('workspaceId')) {
    const sep = search ? '&' : '?';
    fullPath = `${path}${search}${sep}workspaceId=${encodeURIComponent(workspaceId)}`;
  }

  let body: unknown = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.json();
    } catch {
      body = undefined;
    }
  }

  // Build headers — backendFetch accepts standard RequestInit headers
  const extraHeaders: Record<string, string> = {
    'x-user-role': userRole,
  };
  if (userId) extraHeaders['x-tenant-id'] = userId;
  if (workspaceId) extraHeaders['x-workspace-id'] = workspaceId;

  const upstream = await backendFetch(fullPath, {
    method: request.method,
    token,
    headers: extraHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(
      payload ?? { error: { code: 'UPSTREAM_ERROR', message: 'Gagal mengambil data dari server.' } },
      { status: upstream.status },
    );
  }

  return NextResponse.json(payload ?? { data: null }, { status: 200 });
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const PUT = handleProxy;
