import { NextResponse } from 'next/server';
import { isMockApiMode, mockFail } from '@/src/lib/mock-api/preview';
import { backendFetch } from '@/src/lib/api/session';
import { normalizeGoogleAuthorizationPayload, oauthStateCookie } from '@/src/lib/api/oauthState';

export async function GET() {
  if (isMockApiMode()) {
    return NextResponse.json(
      {
        error: {
          code: 'PROVIDER_NOT_READY',
          message: 'Google OAuth tidak tersedia di mode mock.',
          retryable: false,
        },
      },
      { status: 503 },
    );
  }

  const upstream = await backendFetch('/v1/auth/google/url', { method: 'GET' });
  if (!upstream.ok) {
    return mockFail('PROVIDER_NOT_READY', 'Gagal memuat Google OAuth.', upstream.status || 502);
  }

  const payload = await upstream.json().catch(() => null);
  const authorization = normalizeGoogleAuthorizationPayload(payload);
  if (!authorization) {
    return mockFail('PROVIDER_NOT_READY', 'Respons Google OAuth tidak valid.', 502);
  }

  const response = NextResponse.json(authorization);
  response.cookies.set(oauthStateCookie(authorization.state));
  return response;
}
