import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'lembar_session';
const SESSION_VALUE = 'demo';

export function isMockApiMode(): boolean {
  return process.env.NEXT_PUBLIC_API_MODE !== 'live';
}

export function mockNotFound() {
  return NextResponse.json(
    { error: { code: 'RESOURCE_NOT_FOUND', message: 'Sumber tidak ditemukan.', retryable: false } },
    { status: 404 },
  );
}

export function mockFail(
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        fieldErrors,
        retryable: code === 'RATE_LIMITED' || code === 'PROVIDER_NOT_READY',
      },
    },
    { status },
  );
}

export function mockOk<T>(
  data: T,
  init?: { setSession?: boolean | string; status?: number; clearSession?: boolean },
) {
  const response = NextResponse.json({ data }, { status: init?.status ?? 200 });
  if (init?.clearSession) {
    response.cookies.set({
      name: SESSION_COOKIE,
      value: '',
      path: '/',
      maxAge: 0,
    });
  }
  if (init?.setSession) {
    const value = typeof init.setSession === 'string' ? init.setSession : SESSION_VALUE;
    response.cookies.set({
      name: SESSION_COOKIE,
      value,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      // Preview is often plain HTTP on the VPS; secure only when the app URL is https.
      secure: process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ?? false,
    });
  }
  return response;
}

export {
  authSuccessFor as authSuccessPayloadFromAccount,
  mePayloadFor as mePayloadFromAccount,
} from './accounts';

// Backward-compatible defaults for older routes/tests.
export function authSuccessPayload() {
  return {
    accountId: 'acct_demo',
    workspaceId: 'ws_demo',
    workspaceKind: 'personal' as const,
    activeRole: 'teacher' as const,
    homePath: '/app',
  };
}

export function mePayload() {
  return {
    account: {
      id: 'acct_demo',
      displayName: 'Demo Guru',
    },
    activeWorkspaceId: 'ws_demo',
    activeWorkspace: {
      id: 'ws_demo',
      name: 'Ruang pribadi',
      type: 'personal' as const,
      role: 'teacher' as const,
      permissions: ['assessment.create', 'assessment.read'],
    },
    workspaces: [
      {
        id: 'ws_demo',
        name: 'Ruang pribadi',
        type: 'personal' as const,
        role: 'teacher' as const,
        permissions: ['assessment.create', 'assessment.read'],
      },
      {
        id: 'ws_school_demo',
        name: 'SDN Contoh 01',
        type: 'school' as const,
        role: 'school_admin' as const,
        permissions: ['assessment.create', 'assessment.read', 'workspace.member.manage'],
      },
    ],
  };
}

export function dashboardSummaryPayload() {
  return {
    workspace: {
      id: 'ws_demo',
      type: 'personal',
      name: 'Ruang pribadi',
      role: 'teacher',
      permissions: ['assessment.create', 'assessment.read'],
    },
    metrics: {
      assessments: { total: 15, draft: 8, inReview: 3, final: 4 },
      sources: { total: 5, ready: 4, processing: 1, failed: 0 },
      jobs: { total: 2, active: 1, failed: 0 },
    },
    emptyState: { isEmpty: false, message: '' },
  };
}
