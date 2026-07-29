import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  backendFetch,
  JWT_COOKIE,
  SESSION_COOKIE,
  TRIAL_DEVICE_COOKIE,
} from '@/src/lib/api/session';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET() {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  const trialDeviceToken = jar.get(TRIAL_DEVICE_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk.', retryable: false } },
      { status: 401 },
    );
  }

  const payload = decodeJwtPayload(token);
  const workspaceId = (payload?.['workspaceId'] as string) || '';
  const upstream = await backendFetch('/v1/me/plan', {
    method: 'GET',
    token,
    headers: {
      'x-workspace-id': workspaceId,
      // Ponytail: current BE plan/payment stack keys rows by workspaceId.
      'x-tenant-id': workspaceId,
      ...(trialDeviceToken ? { 'x-trial-device-token': trialDeviceToken } : {}),
    },
  });

  const body = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(
      body ?? { error: { code: 'UPSTREAM_ERROR', message: 'Gagal memuat data paket.' } },
      { status: upstream.status },
    );
  }

  return NextResponse.json(body ?? { data: null }, { status: 200 });
}
