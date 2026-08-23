import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  backendFetch,
  JWT_COOKIE,
  SESSION_COOKIE,
  TRIAL_DEVICE_COOKIE,
} from '@/src/lib/api/session';

export { TRIAL_DEVICE_COOKIE };
const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export async function POST(request: Request) {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk.', retryable: false } },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const input = (await request.json().catch(() => null)) as { claimToken?: unknown } | null;
  const claimToken = input?.claimToken;
  if (typeof claimToken !== 'string' || claimToken.length < 32 || claimToken.length > 512) {
    return NextResponse.json(
      {
        error: {
          code: 'TRIAL_CLAIM_LINK_REQUIRED',
          message: 'Tautan klaim trial tidak valid.',
          retryable: false,
        },
      },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const existingDeviceToken = jar.get(TRIAL_DEVICE_COOKIE)?.value;
  const deviceToken = existingDeviceToken || crypto.randomUUID();
  const upstream = await backendFetch('/v1/me/plan/trial/claim', {
    method: 'POST',
    token,
    body: JSON.stringify({ claimToken, deviceToken }),
  });
  const body = await upstream.json().catch(() => null);
  if (body?.data && typeof body.data === 'object') {
    delete body.data.claimToken;
    delete body.data.deviceToken;
  }
  if (body && typeof body === 'object') {
    delete body.claimToken;
    delete body.deviceToken;
  }
  const response = NextResponse.json(
    body ?? { error: { code: 'UPSTREAM_ERROR', message: 'Gagal mengaktifkan trial.' } },
    { status: upstream.status, headers: { 'Cache-Control': 'no-store' } },
  );

  if (!existingDeviceToken && upstream.ok) {
    response.cookies.set({
      name: TRIAL_DEVICE_COOKIE,
      value: deviceToken,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: DEVICE_COOKIE_MAX_AGE,
    });
  }

  return response;
}
