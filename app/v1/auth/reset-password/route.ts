/**
 * BUG-19 (FE-AUD-01-2026-09-30): the reset-password form called
 * `/auth/recovery/reset`, a path that never had a BFF route (404) and whose
 * upstream (`/v1/auth/recovery/complete`) does not exist on the backend either.
 *
 * The backend endpoint that does exist — and was proven to return 200 with the
 * new password taking effect immediately — is `POST /v1/auth/reset-password`
 * with body `{ token, newPassword }`.
 *
 * This route is the thin BFF proxy for it. The FE service speaks
 * `{ token, password }`; the upstream contract wants `newPassword`, so the
 * rename happens here, in one place.
 */
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

export async function POST(request: NextRequest) {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  if (typeof body.token !== 'string' || !body.token || typeof body.password !== 'string') {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'token dan password wajib diisi.',
          retryable: false,
        },
      },
      { status: 400 },
    );
  }

  const upstream = await backendFetch('/v1/auth/reset-password', {
    method: 'POST',
    token,
    body: JSON.stringify({
      token: body.token,
      newPassword: body.password,
      ...(typeof body.captchaToken === 'string' ? { captchaToken: body.captchaToken } : {}),
    }),
  });

  const payload = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(
      payload ?? {
        error: {
          code: 'UPSTREAM_ERROR',
          message: 'Tidak dapat mengatur ulang sandi.',
          retryable: true,
        },
      },
      { status: upstream.status },
    );
  }

  return NextResponse.json({ data: { ok: true, ...((payload as { data?: object })?.data ?? {}) } });
}
