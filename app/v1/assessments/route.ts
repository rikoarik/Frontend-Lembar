import { NextResponse, type NextRequest } from 'next/server';
import { listAssessmentsHandler } from '@/src/lib/mock-api/assessmentHandlers';
import { backendFetch, isMockApiMode } from '@/src/lib/api/session';
import { liveClaims, loadLiveAssessment } from '@/src/lib/api/liveAssessment';

export async function GET(request: NextRequest) {
  if (isMockApiMode()) return listAssessmentsHandler(request);
  const auth = await liveClaims();
  if (!auth) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  }
  const upstream = await backendFetch('/v1/history?limit=100', {
    method: 'GET',
    token: auth.token,
    headers: { 'x-workspace-id': auth.claims.workspaceId },
  });
  const payload = (await upstream.json().catch(() => null)) as {
    data?: { items?: Array<{ id?: string }> };
    error?: unknown;
  } | null;
  if (!upstream.ok) return NextResponse.json(payload, { status: upstream.status });

  const details = await Promise.all(
    (payload?.data?.items ?? []).flatMap((item) =>
      item.id
        ? [loadLiveAssessment(auth.token, auth.claims.workspaceId, item.id)]
        : [],
    ),
  );
  let items = details.flatMap((result) => {
    const data = (result.payload as { data?: Record<string, unknown> } | null)?.data;
    return result.status === 200 && data ? [data] : [];
  });
  const q = request.nextUrl.searchParams.get('q')?.trim().toLowerCase();
  const lifecycle = request.nextUrl.searchParams.get('lifecycle');
  if (q) {
    items = items.filter((item) =>
      [item.title, item.subject, item.gradeLabel].some((value) =>
        String(value ?? '').toLowerCase().includes(q),
      ),
    );
  }
  if (lifecycle) items = items.filter((item) => item.lifecycle === lifecycle);
  return NextResponse.json({ data: items });
}
