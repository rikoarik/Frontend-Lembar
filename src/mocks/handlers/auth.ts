import { HttpResponse, delay, http } from 'msw';
import type {
  AuthSuccessPayload,
  InvitationPreview,
  WorkspaceKind,
  ActiveRole,
} from '@/src/types/auth';

type AuthErrorBody = {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
    retryable?: boolean;
  };
};

function ok<T>(data: T, headers: Record<string, string> = {}): HttpResponse<{ data: T }> {
  return HttpResponse.json<{ data: T }>({ data }, { status: 200, headers });
}

function fail(
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[]>,
): HttpResponse<AuthErrorBody> {
  const body: AuthErrorBody = {
    error: {
      code,
      message,
      fieldErrors,
      retryable: code === 'RATE_LIMITED' || code === 'PROVIDER_NOT_READY',
    },
  };
  return HttpResponse.json<AuthErrorBody>(body, { status });
}

function successPayload(): AuthSuccessPayload {
  return {
    accountId: 'acct_demo',
    workspaceId: 'ws_demo',
    workspaceKind: 'personal' satisfies WorkspaceKind,
    activeRole: 'teacher' satisfies ActiveRole,
  };
}

const SESSION_COOKIE = 'lembar_session=demo; Path=/; SameSite=Strict; HttpOnly';

export const authHandlers = [
  http.post<never, { identifier: string; password: string }>(
    '/v1/auth/login',
    async ({ request }) => {
      await delay(150);
      const body = (await request.json()) as { identifier?: string; password?: string };
      if (body.identifier === 'demo' && body.password === 'demo1234') {
        return ok(successPayload(), { 'Set-Cookie': SESSION_COOKIE });
      }
      return fail('INVALID_CREDENTIALS', 'Username/email/phone dan kata sandi tidak cocok.', 401);
    },
  ),

  http.post<never, { username: string; email: string; phone: string; password: string }>(
    '/v1/auth/register',
    async ({ request }) => {
      await delay(180);
      const body = (await request.json()) as {
        username?: string;
        email?: string;
        phone?: string;
        password?: string;
      };
      if (!body.username || !body.email || !body.phone || !body.password) {
        return fail('VALIDATION_FAILED', 'Lengkapi semua isian.', 400, {
          username: body.username ? [] : ['Wajib diisi.'],
          email: body.email ? [] : ['Wajib diisi.'],
          phone: body.phone ? [] : ['Wajib diisi.'],
          password: body.password ? [] : ['Wajib diisi.'],
        });
      }
      if (body.email === 'demo@example.com') {
        return fail('DUPLICATE_RESOURCE', 'Email sudah terdaftar.', 409);
      }
      return ok(successPayload(), { 'Set-Cookie': SESSION_COOKIE });
    },
  ),

  http.post<never, { identifier: string }>('/v1/auth/recovery/request', async () => {
    await delay(160);
    return ok({ ok: true });
  }),

  http.post<never, { token: string; password: string }>(
    '/v1/auth/recovery/reset',
    async ({ request }) => {
      await delay(180);
      const body = (await request.json()) as { token?: string; password?: string };
      if (body.token !== 'demo-reset') {
        return fail('RECOVERY_TOKEN_INVALID', 'Tautan pemulihan tidak valid.', 400);
      }
      return ok({ ok: true });
    },
  ),

  http.get<{ token: string }>('/v1/auth/invitations/:token', async ({ params }) => {
    await delay(140);
    const token = String(params.token);
    if (token === 'demo-aktif') {
      const body: InvitationPreview = {
        status: 'pending',
        schoolName: 'SDN Contoh 01',
        email: 'guru@sekolah.id',
      };
      return ok(body);
    }
    if (token === 'kedaluwarsa') {
      const body: InvitationPreview = { status: 'expired' };
      return ok(body);
    }
    const body: InvitationPreview = { status: 'invalid' };
    return ok(body);
  }),

  http.post<
    { token: string },
    { username: string; email: string; phone: string; password: string }
  >('/v1/auth/invitations/:token/accept', async ({ request, params }) => {
    await delay(200);
    const token = String(params.token);
    if (token !== 'demo-aktif') {
      return fail('INVITATION_INVALID', 'Undangan tidak lagi aktif.', 410);
    }
    const body = (await request.json()) as {
      username?: string;
      email?: string;
      phone?: string;
      password?: string;
    };
    if (!body.username || !body.email || !body.phone || !body.password) {
      return fail('VALIDATION_FAILED', 'Lengkapi semua isian.', 400);
    }
    return ok(successPayload(), { 'Set-Cookie': SESSION_COOKIE });
  }),
];
