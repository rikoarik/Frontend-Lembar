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
import { loadLiveAssessment } from '@/src/lib/api/liveAssessment';

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

  const summary = dashboardSummaryFromBackendUser(user);
  const workspaceId = summary.workspace.id;
  const history = await backendFetch('/v1/history?limit=100', {
    method: 'GET',
    token,
    headers: { 'x-workspace-id': workspaceId },
  });
  if (history.ok) {
    const historyPayload = (await history.json().catch(() => null)) as {
      data?: { items?: Array<{ id?: string }> };
    } | null;
    const details = await Promise.all(
      (historyPayload?.data?.items ?? []).flatMap((item) =>
        item.id ? [loadLiveAssessment(token, workspaceId, item.id)] : [],
      ),
    );
    const lifecycles = details.flatMap((result) => {
      const data = (result.payload as { data?: { lifecycle?: string } } | null)?.data;
      return result.status === 200 && data?.lifecycle ? [data.lifecycle] : [];
    });
    summary.metrics.assessments = {
      total: lifecycles.length,
      draft: lifecycles.filter((value) => value === 'draft').length,
      inReview: lifecycles.filter((value) => value === 'review').length,
      final: lifecycles.filter((value) => value === 'final').length,
    };
    summary.emptyState.isEmpty = lifecycles.length === 0;
  }
  return mockOk(summary);
}
