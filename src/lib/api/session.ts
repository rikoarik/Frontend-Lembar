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
  roles?: string[] | string;
  role?: string;
  workspaceId: string | null;
};

export type BackendAuthResponse = {
  token: string;
  user: BackendUser;
  /** Some backends wrap under `data` */
  data?: { user?: BackendUser; token?: string };
};

/**
 * Normalize roles from various backend shapes:
 * - `roles: ["superadmin"]` (array)
 * - `roles: "superadmin"` (single string)
 * - `roles: "superadmin,school_admin"` (comma-separated)
 * - `role: "superadmin"` (singular field)
 */
function normalizeRoles(user: BackendUser): string[] {
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    return user.roles;
  }
  if (typeof user.roles === 'string' && user.roles.trim()) {
    return user.roles.split(',').map((r) => r.trim()).filter(Boolean);
  }
  if (typeof user.role === 'string' && user.role.trim()) {
    return user.role.split(',').map((r) => r.trim()).filter(Boolean);
  }
  return [];
}

export function homePathForRoles(roles: string[] | string | undefined | null): string {
  const list = Array.isArray(roles) ? roles : typeof roles === 'string' ? roles.split(',').map((r) => r.trim()) : [];
  if (list.includes('superadmin')) return '/ops';
  if (list.includes('school_admin')) return '/school';
  return '/app';
}

export function workspaceKindForRoles(roles: string[] | string | undefined | null): 'personal' | 'school' {
  const list = Array.isArray(roles) ? roles : typeof roles === 'string' ? roles.split(',').map((r) => r.trim()) : [];
  if (list.includes('school_admin')) return 'school';
  return 'personal';
}

export function activeRoleForRoles(
  roles: string[] | string | undefined | null,
): 'teacher' | 'school_admin' | 'superadmin' {
  const list = Array.isArray(roles) ? roles : typeof roles === 'string' ? roles.split(',').map((r) => r.trim()) : [];
  if (list.includes('superadmin')) return 'superadmin';
  if (list.includes('school_admin')) return 'school_admin';
  return 'teacher';
}

export function authSuccessFromBackend(auth: BackendAuthResponse) {
  // Handle backends that nest user under data
  const user = auth.user ?? auth.data?.user;
  if (!user) {
    return {
      accountId: '',
      workspaceId: '',
      workspaceKind: 'personal' as const,
      activeRole: 'teacher' as const,
      homePath: '/app',
    };
  }
  const roles = normalizeRoles(user);
  const role = activeRoleForRoles(roles);
  return {
    accountId: user.id,
    workspaceId: user.workspaceId ?? `ws_${user.id.slice(0, 8)}`,
    workspaceKind: workspaceKindForRoles(roles),
    activeRole: role,
    homePath: homePathForRoles(roles),
  };
}

export function mePayloadFromBackendUser(user: BackendUser) {
  const roles = normalizeRoles(user);
  const role = activeRoleForRoles(roles);
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
