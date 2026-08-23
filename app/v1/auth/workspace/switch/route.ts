import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ACTIVE_ROLE_COOKIE,
  ACTIVE_WORKSPACE_COOKIE,
  activeRoleForRoles,
  authCookieOptions,
  backendFetch,
  homePathForRoles,
  JWT_COOKIE,
  jwtCookieOptions,
  normalizeRoles,
  ROLES_COOKIE,
  SESSION_COOKIE,
  type BackendUser,
} from '@/src/lib/api/session';
import { findMockAccountBySession, mePayloadFor } from '@/src/lib/mock-api/accounts';
import { isMockApiMode, mockFail } from '@/src/lib/mock-api/preview';

export async function POST(request: Request) {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) return mockFail('AUTH_REQUIRED', 'Silakan masuk terlebih dahulu.', 401);

  const body = (await request.json().catch(() => null)) as { workspaceId?: unknown } | null;
  const workspaceId = typeof body?.workspaceId === 'string' ? body.workspaceId.trim() : '';
  if (!workspaceId || workspaceId.length > 128) {
    return mockFail('VALIDATION_FAILED', 'Workspace tidak valid.', 400);
  }

  if (isMockApiMode()) {
    const account = findMockAccountBySession(token);
    if (!account) return mockFail('AUTH_REQUIRED', 'Sesi tidak valid.', 401);
    const me = mePayloadFor(account, workspaceId);
    const selected = me.workspaces.find((workspace) => workspace.id === workspaceId);
    if (!selected) {
      return mockFail('WORKSPACE_ACCESS_DENIED', 'Workspace tidak tersedia untuk akun ini.', 403);
    }

    const response = NextResponse.json({
      data: {
        workspaceId: selected.id,
        activeRole: selected.role,
        homePath: homePathForRoles([selected.role]),
      },
    });
    response.cookies.set(authCookieOptions(ACTIVE_WORKSPACE_COOKIE, selected.id));
    response.cookies.set(authCookieOptions(ACTIVE_ROLE_COOKIE, selected.role));
    return response;
  }

  const upstream = await backendFetch('/v1/auth/workspace/switch', {
    method: 'POST',
    token,
    body: JSON.stringify({ workspaceId }),
  });
  const payload = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(
      payload ?? { error: { code: 'UPSTREAM_ERROR', message: 'Gagal beralih workspace.' } },
      { status: upstream.status },
    );
  }

  const nextToken = payload?.token ?? payload?.data?.token;
  if (typeof nextToken !== 'string' || !nextToken) {
    return mockFail('UPSTREAM_ERROR', 'Backend tidak mengembalikan sesi workspace baru.', 502);
  }

  const user = (payload?.user ?? payload?.data?.user ?? payload?.data) as BackendUser | null;
  const roles = normalizeRoles(user);
  const workspaceRole = payload?.workspace?.role ?? payload?.data?.workspace?.role;
  const activeRole =
    typeof workspaceRole === 'string'
      ? activeRoleForRoles([workspaceRole])
      : activeRoleForRoles(roles);
  const response = NextResponse.json({
    data: {
      workspaceId,
      activeRole,
      homePath: homePathForRoles([activeRole]),
    },
  });
  response.cookies.set(jwtCookieOptions(nextToken));
  response.cookies.set({ name: SESSION_COOKIE, value: '', path: '/', maxAge: 0 });
  response.cookies.set(authCookieOptions(ACTIVE_WORKSPACE_COOKIE, workspaceId));
  response.cookies.set(authCookieOptions(ACTIVE_ROLE_COOKIE, activeRole));
  if (roles.length > 0) {
    response.cookies.set(authCookieOptions(ROLES_COOKIE, roles.join(',')));
  }
  return response;
}
