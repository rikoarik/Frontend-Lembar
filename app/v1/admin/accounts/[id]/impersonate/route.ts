import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import {
  backendFetch,
  homePathForRoles,
  JWT_COOKIE,
  SESSION_COOKIE,
} from '@/src/lib/api/session';
import { findMockAccountById } from '@/src/lib/mock-api/accounts';
import { isMockApiMode, mockFail } from '@/src/lib/mock-api/preview';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const jar = await cookies();

  const currentToken =
    jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value || null;

  if (!currentToken && !isMockApiMode()) {
    return mockFail('AUTH_REQUIRED', 'Sesi superadmin tidak ditemukan.', 401);
  }

  // 1. Live Mode
  if (!isMockApiMode() && currentToken) {
    const upstream = await backendFetch(`/v1/admin/accounts/${id}/impersonate`, {
      method: 'POST',
      token: currentToken,
    });

    // Read body once
    const payload = await upstream.json().catch(() => null) as {
      data?: {
        token?: string;
        targetId?: string;
        targetEmail?: string;
        targetName?: string;
        expiresIn?: number;
        homePath?: string;
      };
      error?: { code: string; message: string; retryable?: boolean };
    } | null;

    if (!upstream.ok) {
      return NextResponse.json(
        payload ?? { error: { code: 'UPSTREAM_ERROR', message: 'Gagal menghubungi server.' } },
        { status: upstream.status },
      );
    }

    const token = payload?.data?.token;
    const targetName = payload?.data?.targetName;
    const targetEmail = payload?.data?.targetEmail;

    if (!token) {
      return NextResponse.json(
        { error: { code: 'UPSTREAM_ERROR', message: 'Gagal mendapatkan token impersonasi.' } },
        { status: 502 },
      );
    }

    // Decode JWT payload to get roles
    let roles: string[] = [];
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const claims = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        roles = Array.isArray(claims.roles) ? claims.roles : [];
      }
    } catch (e) {
      console.error('Failed to decode impersonation JWT claims:', e);
    }

    if (roles.length === 0) {
      roles = ['teacher'];
    }

    const homePath = payload?.data?.homePath || homePathForRoles(roles);
    const displayName = targetName || targetEmail || 'Pengguna Impersonasi';

    const response = NextResponse.json({
      data: { token, homePath, displayName },
    });

    response.cookies.set({ name: 'lembar_impersonator', value: currentToken, path: '/', sameSite: 'lax', httpOnly: true });
    response.cookies.set({ name: JWT_COOKIE, value: token, path: '/', sameSite: 'lax', httpOnly: true, maxAge: 60 * 60 });
    response.cookies.set({ name: SESSION_COOKIE, value: token, path: '/', sameSite: 'lax', httpOnly: true, maxAge: 60 * 60 });
    response.cookies.set({ name: 'lembar_roles', value: roles.join(','), path: '/', sameSite: 'lax', httpOnly: true });
    response.cookies.set({ name: 'lembar_is_impersonating', value: '1', path: '/', sameSite: 'lax', httpOnly: false, maxAge: 60 * 60 });
    response.cookies.set({ name: 'lembar_impersonated_name', value: displayName, path: '/', sameSite: 'lax', httpOnly: false, maxAge: 60 * 60 });

    return response;
  }

  // 2. Mock Mode
  const mockAccount = findMockAccountById(id);
  if (!mockAccount) {
    return mockFail('NOT_FOUND', `Akun dengan ID "${id}" tidak ditemukan.`, 404);
  }

  const homePath = homePathForRoles(mockAccount.roles);
  const displayName = mockAccount.displayName;

  const response = NextResponse.json({
    data: { token: mockAccount.session, homePath, displayName },
  });

  response.cookies.set({ name: 'lembar_impersonator', value: currentToken || 'ops', path: '/', sameSite: 'lax', httpOnly: true });
  response.cookies.set({ name: SESSION_COOKIE, value: mockAccount.session, path: '/', sameSite: 'lax', httpOnly: true, maxAge: 60 * 60 * 24 });
  response.cookies.set({ name: 'lembar_roles', value: mockAccount.roles.join(','), path: '/', sameSite: 'lax', httpOnly: true });
  response.cookies.set({ name: 'lembar_is_impersonating', value: '1', path: '/', sameSite: 'lax', httpOnly: false, maxAge: 60 * 60 * 24 });
  response.cookies.set({ name: 'lembar_impersonated_name', value: displayName, path: '/', sameSite: 'lax', httpOnly: false, maxAge: 60 * 60 * 24 });

  return response;
}
