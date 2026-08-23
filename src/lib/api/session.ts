import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'lembar_session';
export const JWT_COOKIE = 'lembar_token';
export const ROLES_COOKIE = 'lembar_roles';
export const ACTIVE_ROLE_COOKIE = 'lembar_active_role';
export const ACTIVE_WORKSPACE_COOKIE = 'lembar_active_workspace';
export const TRIAL_DEVICE_COOKIE = '__Host-lembar_trial_device';

export function isMockApiMode(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
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
  id?: string;
  email?: string;
  name?: string;
  roles?: string[] | string | Array<{ name?: string; role?: string; id?: string }>;
  role?: string;
  workspaceId?: string | null;
  workspace?: {
    id?: string;
    name?: string;
    type?: string;
    role?: string;
    permissions?: string[];
  } | null;
  activeWorkspace?: {
    id?: string;
    name?: string;
    type?: string;
    role?: string;
    permissions?: string[];
  } | null;
  workspaces?: Array<{
    id?: string;
    name?: string;
    type?: string;
    role?: string;
    permissions?: string[];
    isActive?: boolean;
  }>;
};

export type BackendAuthResponse = {
  token?: string;
  user?: BackendUser;
  workspace?: { id?: string; type?: string; role?: string };
  data?: {
    token?: string;
    user?: BackendUser;
    workspace?: { id?: string; type?: string; role?: string };
  };
};

/**
 * Normalize roles from various backend shapes:
 * - `roles: ["superadmin"]` (array)
 * - `roles: "superadmin"` (single string)
 * - `roles: "superadmin,school_admin"` (comma-separated)
 * - `role: "superadmin"` (singular field)
 * - `workspace: { role: "school_admin" }` or `activeWorkspace: { role: "school_admin" }`
 * - `workspaces: [{ role: "school_admin" }]`
 */
export function normalizeRoles(user: any): string[] {
  if (!user) return [];
  const found = new Set<string>();

  const check = (val: unknown) => {
    if (typeof val === 'string' && val.trim()) {
      val.split(',').forEach((r) => found.add(r.trim()));
    }
  };

  // 1. Check user.roles (array/string/objects)
  if (Array.isArray(user.roles)) {
    for (const r of user.roles) {
      if (typeof r === 'string') check(r);
      else if (r && typeof r === 'object') {
        if ('role' in r && typeof r.role === 'string') check(r.role);
        if ('name' in r && typeof r.name === 'string') check(r.name);
      }
    }
  } else {
    check(user.roles);
  }

  // 2. Check user.role (singular)
  check(user.role);

  // 3. Check workspace object (user.workspace / user.activeWorkspace / root workspace)
  const wsRole = user.workspace?.role ?? user.activeWorkspace?.role;
  check(wsRole);

  // 4. Check workspaces array
  if (Array.isArray(user.workspaces)) {
    for (const ws of user.workspaces) {
      if (ws && typeof ws === 'object') {
        if (typeof ws.role === 'string') check(ws.role);
      }
    }
  }

  return Array.from(found).filter(Boolean);
}

export function homePathForRoles(roles: string[] | string | undefined | null): string {
  const list = Array.isArray(roles)
    ? roles
    : typeof roles === 'string'
      ? roles.split(',').map((r) => r.trim())
      : [];
  if (list.includes('superadmin')) return '/ops';
  if (list.includes('school_admin')) return '/school';
  return '/app';
}

export function workspaceKindForRoles(
  roles: string[] | string | undefined | null,
): 'personal' | 'school' {
  const list = Array.isArray(roles)
    ? roles
    : typeof roles === 'string'
      ? roles.split(',').map((r) => r.trim())
      : [];
  if (list.includes('school_admin')) return 'school';
  return 'personal';
}

export function activeRoleForRoles(
  roles: string[] | string | undefined | null,
): 'teacher' | 'school_admin' | 'superadmin' {
  const list = Array.isArray(roles)
    ? roles
    : typeof roles === 'string'
      ? roles.split(',').map((r) => r.trim())
      : [];
  if (list.includes('superadmin')) return 'superadmin';
  if (list.includes('school_admin')) return 'school_admin';
  return 'teacher';
}

export function authSuccessFromBackend(auth: any) {
  if (!auth) {
    return {
      accountId: '',
      workspaceId: '',
      workspaceKind: 'personal' as const,
      activeRole: 'teacher' as const,
      homePath: '/app',
    };
  }

  // Support both { user, workspace } and { data: { user, workspace } } and direct payload
  const user = auth.user ?? auth.data?.user ?? auth.data ?? auth;
  const workspace =
    auth.workspace ?? auth.data?.workspace ?? user?.workspace ?? user?.activeWorkspace;

  const mergedUser = {
    ...user,
    workspace: workspace ?? user?.workspace,
  };

  const roles = normalizeRoles(mergedUser);
  const role = activeRoleForRoles(roles);
  const accountId = user?.id ?? user?.accountId ?? user?.user?.id ?? '';
  const workspaceId =
    workspace?.id ?? user?.workspaceId ?? (accountId ? `ws_${accountId.slice(0, 8)}` : 'ws_demo');

  return {
    accountId,
    workspaceId,
    workspaceKind: workspaceKindForRoles(roles),
    activeRole: role,
    homePath: homePathForRoles(roles),
  };
}

function defaultPermissions(role: string): string[] {
  if (role === 'superadmin') {
    return ['platform.ops', 'school.manage', 'assessment.read'];
  }
  if (role === 'school_admin') {
    return ['assessment.create', 'assessment.read', 'workspace.member.manage', 'school.manage'];
  }
  return ['assessment.create', 'assessment.read'];
}

function defaultWorkspaceName(role: string): string {
  if (role === 'superadmin') return 'Platform lembar';
  if (role === 'school_admin') return 'Workspace sekolah';
  return 'Ruang pribadi';
}

export function mePayloadFromBackendUser(
  user: BackendUser,
  activeRole?: string,
  preferredWorkspaceId?: string,
) {
  const accountRoles = normalizeRoles(user);
  const userId = user.id ?? 'demo';
  const candidates = [
    ...(user.workspaces ?? []),
    ...(user.activeWorkspace ? [user.activeWorkspace] : []),
    ...(user.workspace ? [user.workspace] : []),
  ].filter((workspace, index, all) => {
    if (!workspace.id) return false;
    return all.findIndex((candidate) => candidate.id === workspace.id) === index;
  });

  const fallbackRole = activeRoleForRoles(accountRoles);
  const fallbackWorkspaceId = user.workspaceId ?? `ws_${userId.slice(0, 8)}`;
  const workspaces = candidates.length
    ? candidates.map((workspace) => {
        const role = workspace.role ?? fallbackRole;
        return {
          id: workspace.id!,
          name: workspace.name ?? defaultWorkspaceName(role),
          type:
            workspace.type === 'school' || role === 'school_admin'
              ? ('school' as const)
              : ('personal' as const),
          role: activeRoleForRoles([role]),
          permissions: workspace.permissions ?? defaultPermissions(role),
          isActive: 'isActive' in workspace ? workspace.isActive : undefined,
        };
      })
    : [
        {
          id: fallbackWorkspaceId,
          name: defaultWorkspaceName(fallbackRole),
          type: fallbackRole === 'school_admin' ? ('school' as const) : ('personal' as const),
          role: fallbackRole,
          permissions: defaultPermissions(fallbackRole),
          isActive: true,
        },
      ];

  const selected =
    workspaces.find((workspace) => workspace.id === preferredWorkspaceId) ??
    workspaces.find((workspace) => workspace.isActive) ??
    workspaces.find((workspace) => workspace.id === user.activeWorkspace?.id) ??
    workspaces.find((workspace) => workspace.id === user.workspaceId) ??
    workspaces[0]!;
  const role =
    activeRole && accountRoles.includes(activeRole)
      ? activeRoleForRoles([activeRole])
      : selected.role;
  const activeWorkspace = {
    ...selected,
    role,
    type: role === 'school_admin' ? ('school' as const) : selected.type,
    permissions: role === selected.role ? selected.permissions : defaultPermissions(role),
    isActive: true,
  };

  return {
    account: {
      id: user.id,
      displayName: user.name || user.email,
      email: user.email,
    },
    activeWorkspaceId: activeWorkspace.id,
    activeWorkspace,
    context: {
      workspaceIds: workspaces.map((workspace) => workspace.id),
      permissionSet: activeWorkspace.permissions,
    },
    workspaces: workspaces.map((workspace) => ({
      ...workspace,
      isActive: workspace.id === activeWorkspace.id,
    })),
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

export function authCookieOptions(name: string, value: string, maxAge = 60 * 60 * 24 * 7) {
  return {
    name,
    value,
    path: '/',
    sameSite: 'lax' as const,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  };
}

export function jwtCookieOptions(token: string) {
  return authCookieOptions(JWT_COOKIE, token);
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
