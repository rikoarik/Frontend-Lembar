import { NextResponse } from 'next/server';
import { isMockApiMode, mockFail } from '@/src/lib/mock-api/preview';
import { backendFetch } from '@/src/lib/api/session';

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

  const payload = await upstream.json();
  return NextResponse.json(payload);
}
