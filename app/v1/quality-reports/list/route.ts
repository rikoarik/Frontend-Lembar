import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

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

export async function GET(request: NextRequest) {
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
  const roles = (payload?.['roles'] as string[]) ?? [];
  if (!roles.includes('superadmin')) {
    return NextResponse.json(
      {
        error: {
          code: 'PERMISSION_DENIED',
          message: 'Akses ditolak. Fitur ini khusus superadmin.',
          retryable: false,
        },
      },
      { status: 403 },
    );
  }

  const upstream = await backendFetch(`/v1/admin/quality-reports${request.nextUrl.search}`, {
    method: 'GET',
    token,
  });

  const json = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(
      json ?? { error: { code: 'UPSTREAM_ERROR', message: 'Gagal memuat daftar laporan.' } },
      { status: upstream.status },
    );
  }

  return NextResponse.json(json ?? { data: [], meta: { total: 0, page: 1, limit: 50, pages: 1 } });
}
