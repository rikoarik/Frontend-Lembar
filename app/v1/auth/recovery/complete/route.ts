/**
 * Reset password via recovery token. Proxies the FE service call
 * `authMutations.resetPassword` (POST /auth/recovery/reset) to the
 * backend endpoint that actually exists: /v1/auth/recovery/complete.
 *
 * Ponytail: until the BE adds a `/v1/auth/reset-password` helper (currently
 * used by superadmin-initiated resets only), all end-user reset flows
 * funnel through this recovery/complete route so we don't have a 404.
 */
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import {
  backendFetch,
  JWT_COOKIE,
  SESSION_COOKIE,
} from '@/src/lib/api/session';

export async function POST(request: NextRequest) {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  if (!body.token || !body.password) {
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

  const upstream = await backendFetch('/v1/auth/recovery/complete', {
    method: 'POST',
    token,
    body: JSON.stringify({
      token: body.token,
      newPassword: body.password,
    }),
  });

  const payload = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(
      payload ?? {
        error: {
          code: 'UPSTREAM_ERROR',
          message: 'Tidak dapat mengatur ulang sandi.',
        },
      },
      { status: upstream.status },
    );
  }

  return NextResponse.json({ ok: true, ...(payload ?? {}) }, { status: 200 });
}
