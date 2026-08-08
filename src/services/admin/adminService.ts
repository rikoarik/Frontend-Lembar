'use client';

/**
 * Admin ops service — calls /v1/admin/* endpoints.
 * Uses same pattern as assessmentService: fetch with credentials:include,
 * returns Result<T, AdminError>.
 *
 * Token is sent automatically via httpOnly cookie (credentials: 'include').
 * All endpoints require superadmin JWT.
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

export type AdminError = {
  code: string;
  safeMessage: string;
  retryable: boolean;
};

async function parseError(response: Response): Promise<AdminError> {
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
  headers?: Record<string, string>,
): Promise<Result<T, AdminError>> {
  try {
    const response = await fetch(resolveApiUrl(path), {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'id',
        ...(headers ?? {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.ok) {
      const json = (await response.json()) as { data: T; meta?: unknown };
      if (json && typeof json === 'object' && 'meta' in json && json.meta !== undefined) {
        return ok({ data: json.data, meta: json.meta } as unknown as T);
      }
      return ok(json.data);
    }
    return err(await parseError(response));
  } catch (cause) {
    return err({
      code: 'NETWORK',
      safeMessage: 'Tidak dapat terhubung. Periksa koneksi Anda.',
      retryable: true,
    });
  }
}

// ── Types ──────────────────────────────────────────────────────────────────

export type AdminDashboard = {
  users: number;
  schools: number;
  jobsActive: number;
  jobsFailed: number;
  qualityOpen: number;
  flagsEnabled: number;
};

export type AdminJobRow = {
  id: string;
  type: string;
  tenant: string;
  status: 'queued' | 'running' | 'retry_wait' | 'failed' | 'dead_letter' | 'succeeded';
  attempt: number;
  workspaceId?: string;
  createdAt?: string;
  updatedAt: string;
};

export type AdminAccountRow = {
  id: string;
  displayName: string;
  email: string;
  role: 'teacher' | 'school_admin' | 'superadmin' | 'subscriber';
  status: 'aktif' | 'ditangguhkan' | 'baru';
  school: string;
};

export type AdminAccountAuditItem = {
  id: string;
  action: string;
  at: string;
  by: string;
};

export type AdminAccountDetail = {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  username?: string | null;
  phone?: string | null;
  roles?: string[];
  role: 'teacher' | 'school_admin' | 'superadmin' | 'subscriber';
  status: 'aktif' | 'ditangguhkan' | 'baru';
  school?: string;
  schoolSlug?: string;
  workspaceId?: string;
  billing?: {
    state: string;
    plan: string;
    seats: number;
    renewsAt?: string | null;
  };
  stats?: {
    jobsTotal: number;
    quotaUsed: number;
  };
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  auditLog?: AdminAccountAuditItem[];
};

/** PATCH /v1/admin/accounts/:id returns a narrower shape than GET */
export type AdminAccountPatchResult = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  updated_at: string;
};

export type AdminSchoolRow = {
  id: string;
  name: string;
  plan: 'pilot' | 'active' | 'grace' | 'blocked';
  teachers: number;
  seats: number;
  renewsAt: string;
  owner: string;
};

export type AdminQualityRow = {
  id: string;
  reason: string;
  status: 'open' | 'triaged' | 'closed';
  reporter: string;
  createdAt: string;
};

export type AdminBillingRow = {
  id: string;
  school: string;
  state: 'active' | 'grace' | 'blocked' | 'expired';
  seats: string;
  renewsAt: string;
};

export type PaymentOrder = {
  id: string;
  tenantId: string;
  workspaceId: string;
  idempotencyKey?: string;
  externalOrderId?: string;
  fromPlan?: string;
  toPlan?: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';
  gatewayPayload?: Record<string, unknown>;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminFlagRow = {
  id: string;
  key: string;
  description: string;
  enabled: boolean;
  scope: 'global' | 'pilot';
};

/** POST /v1/admin/flags returns a narrower shape — no id, no description */
export type CreateFlagResult = {
  key: string;
  enabled: boolean;
  scope: string;
};

export type AdminPromptRow = {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'draft' | 'archived';
};

export type AdminAuditRow = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
};

export type AdminContentRow = {
  id: string;
  slug: string;
  title: string;
  status: 'published' | 'draft';
  revision?: number;
  updatedAt: string;
};

export type AdminMeta = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type AdminAuditDetail = {
  id: string;
  actor: string;
  actorName: string;
  action: string;
  targetType: string;
  target: string;
  metadata: Record<string, unknown>;
  at: string;
};

/** Returned by plan upgrade, downgrade, and entitlement set */
export type PlanChangeResult = {
  workspaceId: string;
  previousPlan: string;
  newPlan: string;
  orderId?: string;
  transitionedAt?: string;
};

// ── Service ────────────────────────────────────────────────────────────────

export const adminService = {
  // Dashboard KPI
  dashboard(): Promise<Result<AdminDashboard, AdminError>> {
    return request<AdminDashboard>('/v1/admin/dashboard');
  },

  // Accounts
  accounts(params?: {
    q?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<
    Result<
      {
        data: AdminAccountRow[];
        meta: { total: number; page: number; limit: number; pages: number };
      },
      AdminError
    >
  > {
    const query = new URLSearchParams();
    if (params?.q) query.set('q', params.q);
    if (params?.role) query.set('role', params.role);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return request<{
      data: AdminAccountRow[];
      meta: { total: number; page: number; limit: number; pages: number };
    }>(`/v1/admin/accounts${qs ? `?${qs}` : ''}`);
  },

  invite(payload: {
    email: string;
    name?: string;
    role?: string;
  }): Promise<Result<{ invited: true; accountId: string; token?: string; welcomeUrl?: string; expiresAt?: string }, AdminError>> {
    return request<{ invited: true; accountId: string; token?: string; welcomeUrl?: string; expiresAt?: string }>('/v1/admin/accounts/invite', 'POST', payload);
  },

  inviteAccount(payload: {
    email: string;
    name?: string;
    role?: string;
  }): Promise<Result<{ invited: true; accountId: string; token?: string; welcomeUrl?: string; expiresAt?: string }, AdminError>> {
    return adminService.invite(payload);
  },

  suspendAccount(id: string): Promise<Result<{ id: string; suspended: boolean }, AdminError>> {
    return request<{ id: string; suspended: boolean }>(`/v1/admin/accounts/${id}/suspend`, 'POST');
  },

  unsuspendAccount(id: string): Promise<Result<{ id: string; suspended: boolean }, AdminError>> {
    return request<{ id: string; suspended: boolean }>(`/v1/admin/accounts/${id}/unsuspend`, 'POST');
  },

  accountDetail(id: string): Promise<Result<AdminAccountDetail, AdminError>> {
    return request<AdminAccountDetail>(`/v1/admin/accounts/${id}`);
  },

  updateAccount(
    id: string,
    payload: { name?: string; phone?: string },
  ): Promise<Result<AdminAccountPatchResult, AdminError>> {
    return request<AdminAccountPatchResult>(`/v1/admin/accounts/${id}`, 'PATCH', payload);
  },

  deleteAccount(id: string): Promise<Result<{ id: string; deleted: boolean; email: string }, AdminError>> {
    return request<{ id: string; deleted: boolean; email: string }>(`/v1/admin/accounts/${id}`, 'DELETE');
  },

  bulkSuspend(ids: string[]): Promise<Result<{ succeeded: number; failed: number }, AdminError>> {
    return request<{ succeeded: number; failed: number }>('/v1/admin/accounts/bulk/suspend', 'POST', { ids });
  },

  bulkUnsuspend(ids: string[]): Promise<Result<{ succeeded: number; failed: number }, AdminError>> {
    return request<{ succeeded: number; failed: number }>('/v1/admin/accounts/bulk/unsuspend', 'POST', { ids });
  },

  bulkDelete(ids: string[]): Promise<Result<{ succeeded: number; failed: number }, AdminError>> {
    return request<{ succeeded: number; failed: number }>('/v1/admin/accounts/bulk/delete', 'POST', { ids });
  },

  impersonateAccount(
    id: string,
  ): Promise<
    Result<
      {
        token: string;
        targetId: string;
        targetEmail: string;
        targetName: string;
        expiresIn: number;
        homePath: string;
      },
      AdminError
    >
  > {
    return request<{
      token: string;
      targetId: string;
      targetEmail: string;
      targetName: string;
      expiresIn: number;
      homePath: string;
    }>(`/v1/admin/accounts/${id}/impersonate`, 'POST');
  },

  resetPassword(id: string): Promise<Result<{ id: string; sent: true; token?: string; resetUrl?: string; expiresAt?: string }, AdminError>> {
    return request<{ id: string; sent: true; token?: string; resetUrl?: string; expiresAt?: string }>(`/v1/admin/accounts/${id}/reset-password`, 'POST');
  },

  updateRoles(id: string, roles: string[]): Promise<Result<{ id: string; roles: string[] }, AdminError>> {
    return request<{ id: string; roles: string[] }>(`/v1/admin/accounts/${id}/roles`, 'PATCH', { roles });
  },

  // Schools
  schools(params?: {
    q?: string;
    plan?: string;
    page?: number;
    limit?: number;
  }): Promise<Result<{ data: AdminSchoolRow[]; meta: AdminMeta }, AdminError>> {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.plan) qs.set('plan', params.plan);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return request<{ data: AdminSchoolRow[]; meta: AdminMeta }>(`/v1/admin/schools${q ? `?${q}` : ''}`);
  },

  // Jobs
  jobs(params?: {
    q?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<Result<{ data: AdminJobRow[]; meta: AdminMeta }, AdminError>> {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit ?? 20));
    const q = qs.toString();
    return request<{ data: AdminJobRow[]; meta: AdminMeta }>(`/v1/admin/jobs${q ? `?${q}` : ''}`);
  },

  retryJob(id: string): Promise<Result<{ id: string; retried: boolean }, AdminError>> {
    return request(`/v1/admin/jobs/${id}/retry`, 'POST');
  },

  // Quality reports
  qualityReports(params?: {
    status?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<Result<{ data: AdminQualityRow[]; meta: AdminMeta }, AdminError>> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.q) qs.set('q', params.q);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return request<{ data: AdminQualityRow[]; meta: AdminMeta }>(`/v1/admin/quality-reports${q ? `?${q}` : ''}`);
  },

  triageReport(id: string, status: string): Promise<Result<unknown, AdminError>> {
    return request(`/v1/admin/quality-reports/${id}`, 'PATCH', { status });
  },

  // Flags
  flags(): Promise<Result<AdminFlagRow[], AdminError>> {
    return request<AdminFlagRow[]>('/v1/admin/flags');
  },

  toggleFlag(key: string): Promise<Result<{ key: string; enabled: boolean }, AdminError>> {
    return request(`/v1/admin/flags/${key}/toggle`, 'PATCH');
  },

  deleteFlag(key: string): Promise<Result<{ key: string; deleted: boolean }, AdminError>> {
    return request(`/v1/admin/flags/${key}`, 'DELETE');
  },

  createFlag(data: { key: string; description?: string; scope?: string }): Promise<Result<CreateFlagResult, AdminError>> {
    return request<CreateFlagResult>('/v1/admin/flags', 'POST', data);
  },

  // Prompts
  prompts(params?: { status?: AdminPromptRow['status'] }): Promise<Result<AdminPromptRow[], AdminError>> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    const q = qs.toString();
    return request<AdminPromptRow[]>(`/v1/admin/prompts${q ? `?${q}` : ''}`);
  },

  activatePrompt(id: string): Promise<Result<{ id: string; status: string }, AdminError>> {
    return request(`/v1/admin/prompts/${id}/status`, 'PATCH', { status: 'active' });
  },

  deactivatePrompt(id: string): Promise<Result<{ id: string; status: string }, AdminError>> {
    return request(`/v1/admin/prompts/${id}/status`, 'PATCH', { status: 'draft' });
  },

  // Audit
  audit(params?: { action?: string; actor?: string; from?: string; to?: string; page?: number; limit?: number }): Promise<Result<{ data: AdminAuditRow[]; meta: AdminMeta }, AdminError>> {
    const qs = new URLSearchParams();
    if (params?.action) qs.set('action', params.action);
    if (params?.actor) qs.set('actor', params.actor);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return request<{ data: AdminAuditRow[]; meta: AdminMeta }>(`/v1/admin/audit${q ? `?${q}` : ''}`);
  },

  // Alias for audit() — BE uses /v1/admin/audit, FE prefers auditLogs naming
  auditLogs(params?: { action?: string; actor?: string; from?: string; to?: string; page?: number; limit?: number }): Promise<Result<{ data: AdminAuditRow[]; meta: AdminMeta }, AdminError>> {
    return this.audit(params);
  },

  auditDetail(id: string): Promise<Result<AdminAuditDetail, AdminError>> {
    return request<AdminAuditDetail>(`/v1/admin/audit/${id}`);
  },

  // Billing
  billing(params?: { state?: string; q?: string; page?: number; limit?: number }): Promise<Result<{ data: AdminBillingRow[]; meta: AdminMeta }, AdminError>> {
    const qs = new URLSearchParams();
    if (params?.state) qs.set('state', params.state);
    if (params?.q) qs.set('q', params.q);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return request<{ data: AdminBillingRow[]; meta: AdminMeta }>(`/v1/admin/billing${q ? `?${q}` : ''}`);
  },

  updateBilling(id: string, data: { state?: string; plan?: string; seats?: number; renewsAt?: string }): Promise<Result<{ id: string } & Partial<AdminBillingRow>, AdminError>> {
    return request(`/v1/admin/billing/${id}`, 'PATCH', data);
  },

  createBilling(data: { tenantId: string; schoolName: string; plan?: string; seats?: number; state?: string }): Promise<Result<{ id: string; tenantId: string; schoolName: string }, AdminError>> {
    return request('/v1/admin/billing', 'POST', data);
  },

  // Payment orders
  paymentOrders(params?: { workspaceId?: string; status?: string; page?: number; limit?: number }): Promise<Result<PaymentOrder[], AdminError>> {
    const qs = new URLSearchParams();
    if (params?.workspaceId) qs.set('workspaceId', params.workspaceId);
    if (params?.status) qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return request<PaymentOrder[]>(`/v1/payment/orders${q ? `?${q}` : ''}`);
  },
  upgradeWorkspace(workspaceId: string): Promise<Result<PlanChangeResult, AdminError>> {
    return request<PlanChangeResult>(`/v1/me/plan/upgrade`, 'POST', { workspaceId });
  },
  downgradeWorkspace(workspaceId: string): Promise<Result<PlanChangeResult, AdminError>> {
    return request<PlanChangeResult>(`/v1/me/plan/downgrade`, 'POST', { workspaceId });
  },

  // Dashboard trends
  dashboardTrends(): Promise<Result<{ jobs: { day: string; count: number }[]; quality: { day: string; count: number }[] }, AdminError>> {
    return request('/v1/admin/dashboard/trends');
  },

  // Marketing / Content pages
  marketingPages(): Promise<Result<AdminContentRow[], AdminError>> {
    return request<AdminContentRow[]>('/v1/ops/marketing/pages');
  },

  // Create school/tenant
  createSchool(data: { name: string; slug?: string }): Promise<Result<{ id: string; name: string; slug: string }, AdminError>> {
    return request('/v1/admin/schools', 'POST', data);
  },

  // Job detail + retry
  jobDetail(id: string): Promise<Result<Record<string, unknown>, AdminError>> {
    return request<Record<string, unknown>>(`/v1/admin/jobs/${id}`);
  },

  // School detail (members list) + rename + delete
  schoolDetail(id: string): Promise<Result<{
    school: { id: string; workspaceId: string; name: string; slug: string; plan: string; state: string; seats: number; renewsAt: string };
    members: { id: string; email: string; name: string; username: string | null; roles: string[]; createdAt: string }[];
    memberCount: number;
  }, AdminError>> {
    return request(`/v1/admin/schools/${id}`);
  },

  renameSchool(id: string, name: string): Promise<Result<{ id: string; name: string }, AdminError>> {
    return request(`/v1/admin/schools/${id}`, 'PATCH', { name });
  },

  deleteSchool(id: string): Promise<Result<{ id: string; deleted: boolean }, AdminError>> {
    return request(`/v1/admin/schools/${id}`, 'DELETE');
  },

  // Quality report detail + notes update
  qualityDetail(id: string): Promise<Result<{
    id: string; reason: string; status: string; reporter: string; notes: string;
    workspaceId: string; createdAt: string;
  }, AdminError>> {
    return request(`/v1/admin/quality-reports/${id}`);
  },

  updateQualityNotes(id: string, data: { notes?: string; status?: string }): Promise<Result<unknown, AdminError>> {
    return request(`/v1/admin/quality-reports/${id}`, 'PATCH', data);
  },

  // Prompt detail + versions + eval cases + learning signals
  promptDetail(id: string): Promise<Result<Record<string, unknown>, AdminError>> {
    return request(`/v1/admin/prompts/${id}`);
  },

  promptVersions(id: string): Promise<Result<unknown[], AdminError>> {
    return request<unknown[]>(`/v1/admin/prompts/${id}/versions`);
  },

  activatePromptVersion(id: string, version: number): Promise<Result<unknown, AdminError>> {
    return request(`/v1/admin/prompts/${id}/versions/${version}/activate`, 'PATCH');
  },

  promptEvalCases(id: string): Promise<Result<unknown[], AdminError>> {
    return request<unknown[]>(`/v1/admin/prompts/${id}/eval-cases`);
  },

  promptMetrics(id: string): Promise<Result<Record<string, unknown>, AdminError>> {
    return request(`/v1/admin/prompts/${id}/metrics`);
  },

  learningSignals(): Promise<Result<{ prompt_template_id: string; pattern: string; frequency: number; avg_rating: number; suggested_action: string }[], AdminError>> {
    return request<{ prompt_template_id: string; pattern: string; frequency: number; avg_rating: number; suggested_action: string }[]>('/v1/admin/learning-signals');
  },

  createPrompt(data: { name: string; slug: string; description?: string; promptText?: string; contextWindow?: string }): Promise<Result<Record<string, unknown>, AdminError>> {
    return request('/v1/admin/prompts', 'POST', data);
  },

  // Set entitlement (plan) for a workspace
  setEntitlement(workspaceId: string, data: { plan: 'free' | 'pro' }): Promise<Result<PlanChangeResult, AdminError>> {
    return request<PlanChangeResult>(`/v1/admin/entitlements/${workspaceId}`, 'POST', data);
  },

  // Marketing CMS publish/unpublish
  publishPage(slug: string, revision?: number): Promise<Result<unknown, AdminError>> {
    return request(
      `/v1/ops/marketing/pages/${encodeURIComponent(slug)}/publish`,
      'POST',
      undefined,
      revision !== undefined ? { 'If-Match': String(revision) } : undefined,
    );
  },

  unpublishPage(slug: string, revision?: number): Promise<Result<unknown, AdminError>> {
    return request(
      `/v1/ops/marketing/pages/${encodeURIComponent(slug)}/unpublish`,
      'POST',
      undefined,
      revision !== undefined ? { 'If-Match': String(revision) } : undefined,
    );
  },

  // Create marketing content page
  createMarketingPage(data: { slug: string; title: string }): Promise<Result<{ slug: string; title: string }, AdminError>> {
    return request('/v1/ops/marketing/pages', 'POST', data);
  },

  // ── Catalog CRUD ─────────────────────────────────────────────────────────
  updateGradeStatus(id: string, status: 'active' | 'archived' | 'unavailable'): Promise<Result<{ id: string; status: string }, AdminError>> {
    return request<{ id: string; status: string }>(`/v1/admin/catalog/grades/${id}/status`, 'PATCH', { status });
  },
  updateSubjectStatus(id: string, status: 'active' | 'archived' | 'unavailable'): Promise<Result<{ id: string; status: string }, AdminError>> {
    return request<{ id: string; status: string }>(`/v1/admin/catalog/subjects/${id}/status`, 'PATCH', { status });
  },
  createGrade(data: { label: string; status?: string }): Promise<Result<{ id: string; label: string; status: string }, AdminError>> {
    return request<{ id: string; label: string; status: string }>('/v1/admin/catalog/grades', 'POST', data);
  },
  createSubject(data: { label: string; status?: string }): Promise<Result<{ id: string; label: string; status: string }, AdminError>> {
    return request<{ id: string; label: string; status: string }>('/v1/admin/catalog/subjects', 'POST', data);
  },
  archiveGrade(id: string): Promise<Result<{ id: string; archived: boolean }, AdminError>> {
    return request<{ id: string; archived: boolean }>(`/v1/admin/catalog/grades/${id}`, 'DELETE');
  },
  archiveSubject(id: string): Promise<Result<{ id: string; archived: boolean }, AdminError>> {
    return request<{ id: string; archived: boolean }>(`/v1/admin/catalog/subjects/${id}`, 'DELETE');
  },
};

// ── AI Provider config ──────────────────────────────────────────────────────

export type AiProviderConfig = {
  driver: 'mock' | 'openai' | 'hermes';
  primaryBaseUrl: string;
  primaryApiKey: string;
  primaryModelId: string;
  fallbackBaseUrl: string;
  fallbackApiKey: string;
  fallbackModelId: string;
  timeoutMs: number;
  apiKeyPresent: boolean;
};

export type AiProviderUpdatePayload = Partial<Omit<AiProviderConfig, 'apiKeyPresent'>>;

export type AiProviderTestResult = {
  ok: boolean;
  status: number;
  message: string;
};

export const aiProviderService = {
  getAiProvider(): Promise<Result<AiProviderConfig, AdminError>> {
    return request<AiProviderConfig>('/v1/admin/ai-provider', 'GET');
  },
  updateAiProvider(payload: AiProviderUpdatePayload): Promise<Result<{ updated: boolean; fields?: string[] }, AdminError>> {
    return request<{ updated: boolean; fields?: string[] }>('/v1/admin/ai-provider', 'PATCH', payload);
  },
  testAiProvider(payload: {
    target: 'primary' | 'fallback';
    baseUrl?: string;
    apiKey?: string;
    modelId?: string;
  }): Promise<Result<AiProviderTestResult, AdminError>> {
    return request<AiProviderTestResult>('/v1/admin/ai-provider/test', 'POST', payload);
  },
};
