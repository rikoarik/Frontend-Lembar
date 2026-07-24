import { cookies } from 'next/headers';
import {
  dashboardSummaryPayload,
  isMockApiMode,
  mockFail,
  mockOk,
} from '@/src/lib/mock-api/preview';
import {
  backendFetch,
  dashboardSummaryFromBackendUser,
  JWT_COOKIE,
  SESSION_COOKIE,
  type BackendUser,
} from '@/src/lib/api/session';

export async function GET() {
  if (isMockApiMode()) {
    const jar = await cookies();
    if (!jar.has(SESSION_COOKIE) && !jar.has(JWT_COOKIE)) {
      return mockFail('AUTH_REQUIRED', 'Silakan masuk terlebih dahulu.', 401);
    }
    return mockOk(dashboardSummaryPayload());
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
  const user = (payload?.user ?? payload?.data ?? payload) as BackendUser | null;
  if (!user?.id) {
    return mockFail('AUTH_REQUIRED', 'Sesi tidak valid. Masuk ulang.', 401);
  }

  return mockOk(dashboardSummaryFromBackendUser(user));
}
