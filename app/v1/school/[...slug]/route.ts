import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

function redactInvitationSecrets(path: string, payload: unknown): unknown {
  if (!path.startsWith('/v1/school/members/invite')) return payload;
  const envelope = payload as { data?: Record<string, unknown> } | null;
  if (!envelope?.data) return payload;
  const safeData = { ...envelope.data };
  delete safeData.token;
  delete safeData.tokenHash;
  delete safeData.welcomeUrl;
  return { ...envelope, data: safeData };
}

function extractToken(
  request: NextRequest,
  jar: Awaited<ReturnType<typeof cookies>>,
): string | null {
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

async function handleProxy(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const fullPath = `/v1/school/${slug.join('/')}${request.nextUrl.search}`;

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

  let body: unknown = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      body = await request.json();
    } catch {
      body = undefined;
    }
  }

  const upstream = await backendFetch(fullPath, {
    method: request.method,
    token,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(
      payload ?? {
        error: { code: 'UPSTREAM_ERROR', message: 'Gagal mengambil data dari server.' },
      },
      { status: upstream.status },
    );
  }

  return NextResponse.json(redactInvitationSecrets(fullPath, payload ?? { data: null }), {
    status: 200,
  });
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
export const PUT = handleProxy;
