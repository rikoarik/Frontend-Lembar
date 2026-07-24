import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'lembar_session';
export const JWT_COOKIE = 'lembar_token';

export function isMockApiMode(): boolean {
  return process.env.NEXT_PUBLIC_API_MODE !== 'live';
}

export function backendBaseUrl(): string {
  const raw =
    process.env.BACKEND_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ||
    'https://api.lembar.web.id';
  return raw.replace(/\/$/, '');
}

export function appOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export type BackendUser = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  workspaceId: string | null;
};

export type BackendAuthResponse = {
  token: string;
  user: BackendUser;
};

export function homePathForRoles(roles: string[] | undefined | null): string {
  const list = roles ?? [];
  if (list.includes('superadmin')) return '/ops';
  if (list.includes('school_admin')) return '/school';
  return '/app';
}

export function workspaceKindForRoles(roles: string[] | undefined | null): 'personal' | 'school' {
  const list = roles ?? [];
  if (list.includes('school_admin')) return 'school';
  return 'personal';
}

export function activeRoleForRoles(
  roles: string[] | undefined | null,
): 'teacher' | 'school_admin' | 'superadmin' {
  const list = roles ?? [];
  if (list.includes('superadmin')) return 'superadmin';
  if (list.includes('school_admin')) return 'school_admin';
  return 'teacher';
}

export function authSuccessFromBackend(auth: BackendAuthResponse) {
  const role = activeRoleForRoles(auth.user.roles);
  return {
    accountId: auth.user.id,
    workspaceId: auth.user.workspaceId ?? `ws_${auth.user.id.slice(0, 8)}`,
    workspaceKind: workspaceKindForRoles(auth.user.roles),
    activeRole: role,
    homePath: homePathForRoles(auth.user.roles),
  };
}

export function mePayloadFromBackendUser(user: BackendUser) {
  const role = activeRoleForRoles(user.roles);
  const workspaceId = user.workspaceId ?? `ws_${user.id.slice(0, 8)}`;
  const workspaceName =
    role === 'superadmin'
      ? 'Platform lembar'
      : role === 'school_admin'
        ? 'Workspace sekolah'
        : 'Ruang pribadi';
  const type = role === 'school_admin' ? 'school' : 'personal';
  const permissions =
    role === 'superadmin'
      ? ['platform.ops', 'school.manage', 'assessment.read']
      : role === 'school_admin'
        ? ['assessment.create', 'assessment.read', 'workspace.member.manage', 'school.manage']
        : ['assessment.create', 'assessment.read'];

  return {
    account: {
      id: user.id,
      displayName: user.name || user.email,
    },
    activeWorkspaceId: workspaceId,
    activeWorkspace: {
      id: workspaceId,
      name: workspaceName,
      type,
      role,
      permissions,
    },
    workspaces: [
      {
        id: workspaceId,
        name: workspaceName,
        type,
        role,
        permissions,
      },
    ],
  };
}

export function dashboardSummaryFromBackendUser(user: BackendUser) {
  const me = mePayloadFromBackendUser(user);
  return {
    workspace: {
      id: me.activeWorkspace.id,
      type: me.activeWorkspace.type,
      name: me.activeWorkspace.name,
      role: me.activeWorkspace.role,
      permissions: me.activeWorkspace.permissions,
    },
    metrics: {
      assessments: { total: 0, draft: 0, inReview: 0, final: 0 },
      sources: { total: 0, ready: 0, processing: 0, failed: 0 },
      jobs: { total: 0, active: 0, failed: 0 },
    },
    emptyState: {
      isEmpty: true,
      message: 'Belum ada data. Mulai buat lembar pertama Anda.',
    },
  };
}

export async function readJwtFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value || null;
}

export function jwtCookieOptions(token: string) {
  return {
    name: JWT_COOKIE,
    value: token,
    path: '/',
    sameSite: 'lax' as const,
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ?? false,
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function clearJwtCookieOptions() {
  return {
    name: JWT_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  };
}

export async function backendFetch(
  path: string,
  init: RequestInit & { token?: string | null } = {},
): Promise<Response> {
  const { token, headers, ...rest } = init;
  const nextHeaders = new Headers(headers);
  if (!nextHeaders.has('Content-Type') && rest.body) {
    nextHeaders.set('Content-Type', 'application/json');
  }
  nextHeaders.set('Accept', 'application/json');
  if (token) nextHeaders.set('Authorization', `Bearer ${token}`);

  return fetch(`${backendBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
    ...rest,
    headers: nextHeaders,
    cache: 'no-store',
  });
}
