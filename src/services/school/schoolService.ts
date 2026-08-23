'use client';

/**
 * School admin service — calls /v1/school/* endpoints.
 *
 * Same pattern as adminService: fetch with credentials:include,
 * returns Result<T, SchoolError>.
 *
 * Token is sent automatically via httpOnly cookie (credentials: 'include').
 * Most endpoints require school_admin JWT.
 */

import { err, ok, type Result } from '@/src/types/result';

function resolveApiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1').replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (base.endsWith('/v1') && cleanPath.startsWith('/v1')) {
    return `${base}${cleanPath.slice(3)}`;
  }
  return `${base}${cleanPath}`;
}

export type SchoolError = {
  code: string;
  safeMessage: string;
  retryable: boolean;
};

async function parseError(response: Response): Promise<SchoolError> {
  try {
    const body = (await response.json()) as {
      error?: { code?: string; message?: string; retryable?: boolean };
    };
    return {
      code: body.error?.code ?? 'UNKNOWN',
      safeMessage: body.error?.message ?? 'Tidak dapat menyelesaikan permintaan.',
      retryable: body.error?.retryable ?? response.status >= 500,
    };
  } catch {
    return {
      code: 'UNKNOWN',
      safeMessage: 'Tidak dapat menyelesaikan permintaan.',
      retryable: true,
    };
  }
}

async function request<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown,
): Promise<Result<T, SchoolError>> {
  try {
    const response = await fetch(resolveApiUrl(path), {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'id',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.ok) {
      if (response.status === 204) {
        return ok(undefined as unknown as T);
      }
      const json = (await response.json()) as {
        data: T;
        meta?: Record<string, unknown>;
      };
      if (json && typeof json === 'object' && 'meta' in json && json.meta !== undefined) {
        // Normalize totalPages → pages so callers always see meta.pages.
        const meta = { ...json.meta };
        if ('totalPages' in meta && !('pages' in meta)) {
          meta.pages = meta.totalPages;
          delete meta.totalPages;
        }
        return ok({ data: json.data, meta } as unknown as T);
      }
      return ok(json.data);
    }

    return err(await parseError(response));
  } catch {
    return err({
      code: 'NETWORK',
      safeMessage: 'Tidak dapat terhubung. Periksa koneksi Anda.',
      retryable: true,
    });
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

export type SchoolSettings = {
  id: string;
  name: string;
  slug: string;
  level: string;
  plan: string;
  seats: number;
  renewsAt: string | null;
  createdAt: string;
};

export type SchoolMember = {
  id: string;
  email: string;
  name?: string;
  role: 'teacher' | 'school_admin';
  state: 'active' | 'suspended' | 'revoked';
  joinedAt: string;
  lastActiveAt?: string | null;
};

export type SchoolMemberDetail = Omit<SchoolMember, 'state'> & {
  state?: SchoolMember['state'];
  status?: string;
  stats: {
    assessmentCount: number;
    quotaUsed: number;
  };
};

export type SchoolMembersResult = {
  data: SchoolMember[];
  meta: { total: number; page: number; limit: number; pages: number };
};

export type SchoolInvitationResult = {
  email: string;
  role?: string;
  expiresAt: string;
};

export type SchoolInvitation = {
  id: string;
  email: string;
  role: string | null;
  invitedBy: string | null;
  createdAt: string;
  expiresAt: string | null;
};

export type SchoolUsageBreakdownItem = {
  userId: string;
  name?: string;
  email: string;
  used: number;
};

export type SchoolUsageTrendItem = {
  month: string;
  used: number;
};

export type SchoolUsage = {
  quotaUsed: number;
  quotaLimit: number;
  breakdown: SchoolUsageBreakdownItem[];
  trend: SchoolUsageTrendItem[];
};

export type SchoolBilling = {
  workspaceId: string;
  plan: string;
  seatCount: number;
  generationsUsedThisMonth: number;
  monthlyLimit: number | null;
  billingCycleStartedAt: string;
};

export type SchoolLibraryItem = {
  id: string;
  title: string;
  subject: string | null;
  grade: string | null;
  questionCount: number;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  finalizedAt?: string;
  updatedAt?: string;
};

export type SchoolLibraryResult = {
  data: SchoolLibraryItem[];
  meta: { total: number; page: number; limit: number; pages: number };
};

export type SchoolLibraryDetail = SchoolLibraryItem & {
  blueprint: Record<string, unknown> | null;
  questions: Array<{ id: string; questionNo: number; type: string; status: string }>;
};

export type SchoolAuditRow = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target?: string;
  metadata: Record<string, unknown> | null;
};

export type SchoolAuditResult = {
  data: SchoolAuditRow[];
  meta: { total: number; page: number; limit: number; pages: number };
};

export type SchoolStatsData = {
  workspaceName: string;
  totalMembers: number;
  activeMembers: number;
  teacherCount: number;
  adminCount: number;
  plan: string;
  generationsUsedThisMonth: number;
  monthlyLimit: number | null;
};

export type SchoolNotification = {
  id: string;
  type: string;
  status: string;
  attemptCount: number;
  lastError: string | null;
  visibleAt: string | null;
  createdAt: string | null;
};

export type SchoolNotificationsResult = {
  data: SchoolNotification[];
  meta: { total: number; page: number; limit: number; pages: number };
};

export type SchoolDashboard = {
  workspace: {
    id: string;
    name: string;
    level: string;
    tenantId: string;
  };
  members: SchoolMember[];
  memberCount: number;
  usage: {
    generationsUsedThisMonth: number;
    monthlyLimit: number | null;
    plan: 'free' | 'pro' | 'plus';
  };
};

// ── Service ──────────────────────────────────────────────────────────────────

export const schoolService = {
  // Dashboard
  dashboard(): Promise<Result<SchoolDashboard, SchoolError>> {
    return request<SchoolDashboard>('/v1/school/dashboard');
  },

  // Stats (KPI cards)
  stats(): Promise<Result<SchoolStatsData, SchoolError>> {
    return request<SchoolStatsData>('/v1/school/stats');
  },

  // Members — server-side search + filter + pagination
  members(params?: {
    q?: string;
    role?: string;
    page?: number;
    limit?: number;
  }): Promise<Result<SchoolMembersResult, SchoolError>> {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.role && params.role !== 'all') qs.set('role', params.role);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return request<SchoolMembersResult>(`/v1/school/members${q ? `?${q}` : ''}`);
  },

  memberDetail(id: string): Promise<Result<SchoolMemberDetail, SchoolError>> {
    return request<SchoolMemberDetail>(`/v1/school/members/${id}`);
  },

  memberSuspend(id: string): Promise<Result<{ id: string; state: string }, SchoolError>> {
    return request<{ id: string; state: string }>(`/v1/school/members/${id}/suspend`, 'POST');
  },

  memberUnsuspend(id: string): Promise<Result<{ id: string; state: string }, SchoolError>> {
    return request<{ id: string; state: string }>(`/v1/school/members/${id}/unsuspend`, 'POST');
  },

  inviteMember(payload: {
    email: string;
    role: string;
  }): Promise<Result<SchoolInvitationResult, SchoolError>> {
    return request<SchoolInvitationResult>('/v1/school/members/invite', 'POST', payload);
  },

  updateMemberRole(id: string, role: string): Promise<Result<SchoolMember, SchoolError>> {
    return request<SchoolMember>(`/v1/school/members/${id}/role`, 'PATCH', { role });
  },

  removeMember(id: string): Promise<Result<void, SchoolError>> {
    return request<void>(`/v1/school/members/${id}`, 'DELETE');
  },

  // Settings
  settings(): Promise<Result<SchoolSettings, SchoolError>> {
    return request<SchoolSettings>('/v1/school/settings');
  },

  updateSettings(payload: {
    name: string;
  }): Promise<Result<{ id: string; name: string; updatedAt: string }, SchoolError>> {
    return request<{ id: string; name: string; updatedAt: string }>(
      '/v1/school/settings',
      'PATCH',
      payload,
    );
  },

  // Usage
  usage(): Promise<Result<SchoolUsage, SchoolError>> {
    return request<SchoolUsage>('/v1/school/usage');
  },

  billing(): Promise<Result<SchoolBilling, SchoolError>> {
    return request<SchoolBilling>('/v1/school/billing');
  },

  // Library — server-side search + pagination
  library(params?: {
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<Result<SchoolLibraryResult, SchoolError>> {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return request<SchoolLibraryResult>(`/v1/school/library${q ? `?${q}` : ''}`);
  },

  libraryDetail(id: string): Promise<Result<SchoolLibraryDetail, SchoolError>> {
    return request<SchoolLibraryDetail>(`/v1/school/library/${id}`);
  },

  // Audit log — server-side search + filter + pagination
  audit(params?: {
    q?: string;
    action?: string;
    page?: number;
    limit?: number;
  }): Promise<Result<SchoolAuditResult, SchoolError>> {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.action) qs.set('action', params.action);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return request<SchoolAuditResult>(`/v1/school/audit${q ? `?${q}` : ''}`);
  },

  // Invitations
  invitations(): Promise<Result<SchoolInvitation[], SchoolError>> {
    return request<SchoolInvitation[]>('/v1/school/invitations');
  },

  cancelInvitation(id: string): Promise<Result<void, SchoolError>> {
    return request<void>(`/v1/school/invitations/${id}`, 'DELETE');
  },

  // Notifications
  notifications(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<Result<SchoolNotificationsResult, SchoolError>> {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.status) qs.set('status', params.status);
    const q = qs.toString();
    return request<SchoolNotificationsResult>(`/v1/school/notifications${q ? `?${q}` : ''}`);
  },
};
