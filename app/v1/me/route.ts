import { cookies } from 'next/headers';
import { findMockAccountBySession, mePayloadFor } from '@/src/lib/mock-api/accounts';
import { isMockApiMode, mePayload, mockFail, mockOk } from '@/src/lib/mock-api/preview';
import {
  ACTIVE_ROLE_COOKIE,
  ACTIVE_WORKSPACE_COOKIE,
  backendFetch,
  JWT_COOKIE,
  mePayloadFromBackendUser,
  SESSION_COOKIE,
  type BackendUser,
} from '@/src/lib/api/session';

export async function GET() {
  if (isMockApiMode()) {
    const jar = await cookies();
    const session = jar.get(SESSION_COOKIE)?.value;
    if (!session) {
      return mockFail('AUTH_REQUIRED', 'Silakan masuk terlebih dahulu.', 401);
    }

    const account = findMockAccountBySession(session);
    if (!account) {
      if (session === 'demo') return mockOk(mePayload());
      return mockFail('AUTH_REQUIRED', 'Sesi tidak valid. Masuk ulang.', 401);
    }

    return mockOk(mePayloadFor(account, jar.get(ACTIVE_WORKSPACE_COOKIE)?.value));
  }

  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return mockFail('AUTH_REQUIRED', 'Silakan masuk terlebih dahulu.', 401);
  }

  const upstream = await backendFetch('/v1/auth/me', {
    method: 'GET',
    token,
  });

  if (!upstream.ok) {
    return mockFail('AUTH_REQUIRED', 'Sesi tidak valid. Masuk ulang.', 401);
  }

  const payload = await upstream.json().catch(() => null);
  // Backend may return user directly or wrapped.
  const user = (payload?.user ?? payload?.data ?? payload) as BackendUser | null;
  if (!user?.id) {
    return mockFail('AUTH_REQUIRED', 'Sesi tidak valid. Masuk ulang.', 401);
  }

  return mockOk(
    mePayloadFromBackendUser(
      user,
      jar.get(ACTIVE_ROLE_COOKIE)?.value,
      jar.get(ACTIVE_WORKSPACE_COOKIE)?.value,
    ),
  );
}
