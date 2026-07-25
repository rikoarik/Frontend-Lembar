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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/v1';

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
): Promise<Result<T, AdminError>> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'id',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.ok) {
      const json = (await response.json()) as { data: T };
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
  qualityOpen: number;
  flagsEnabled: number;
};

export type AdminJobRow = {
  id: string;
  type: string;
  tenant: string;
  status: 'queued' | 'running' | 'failed' | 'succeeded';
  progress: string;
  updatedAt: string;
};

export type AdminAccountRow = {
  id: string;
  displayName: string;
  email: string;
  role: 'teacher' | 'school_admin' | 'superadmin';
  status: 'aktif' | 'ditangguhkan' | 'baru';
  school: string;
};

export type AdminSchoolRow = {
  id: string;
  name: string;
  plan: 'pilot' | 'active' | 'grace' | 'blocked';
  teachers: number;
  usage: string;
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

export type AdminFlagRow = {
  id: string;
  key: string;
  description: string;
  enabled: boolean;
  scope: 'global' | 'pilot';
};

export type AdminPromptRow = {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'draft';
};

export type AdminAuditRow = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
};

// ── Service ────────────────────────────────────────────────────────────────

export const adminService = {
  // Dashboard KPI
  dashboard(): Promise<Result<AdminDashboard, AdminError>> {
    return request<AdminDashboard>('/v1/admin/dashboard');
  },

  // Accounts
  accounts(): Promise<Result<AdminAccountRow[], AdminError>> {
    return request<AdminAccountRow[]>('/v1/admin/accounts');
  },

  // Schools
  schools(): Promise<Result<AdminSchoolRow[], AdminError>> {
    return request<AdminSchoolRow[]>('/v1/admin/schools');
  },

  // Jobs
  jobs(limit = 20): Promise<Result<AdminJobRow[], AdminError>> {
    return request<AdminJobRow[]>(`/v1/admin/jobs?limit=${limit}`);
  },

  retryJob(id: string): Promise<Result<{ id: string; retried: boolean }, AdminError>> {
    return request(`/v1/admin/jobs/${id}/retry`, 'POST');
  },

  // Quality reports
  qualityReports(): Promise<Result<AdminQualityRow[], AdminError>> {
    return request<AdminQualityRow[]>('/v1/admin/quality-reports');
  },

  triageReport(id: string, status: string): Promise<Result<unknown, AdminError>> {
    return request(`/v1/admin/quality-reports/${id}`, 'PATCH', { status });
  },

  // Billing
  billing(): Promise<Result<AdminBillingRow[], AdminError>> {
    return request<AdminBillingRow[]>('/v1/admin/billing');
  },

  // Flags
  flags(): Promise<Result<AdminFlagRow[], AdminError>> {
    return request<AdminFlagRow[]>('/v1/admin/flags');
  },

  toggleFlag(key: string): Promise<Result<{ key: string; enabled: boolean }, AdminError>> {
    return request(`/v1/admin/flags/${key}/toggle`, 'PATCH');
  },

  // Prompts
  prompts(): Promise<Result<AdminPromptRow[], AdminError>> {
    return request<AdminPromptRow[]>('/v1/admin/prompts');
  },

  // Audit
  audit(params?: { action?: string; actor?: string }): Promise<Result<AdminAuditRow[], AdminError>> {
    const qs = new URLSearchParams();
    if (params?.action) qs.set('action', params.action);
    if (params?.actor) qs.set('actor', params.actor);
    const q = qs.toString();
    return request<AdminAuditRow[]>(`/v1/admin/audit${q ? `?${q}` : ''}`);
  },
};
