import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';
import { liveClaims } from '@/src/lib/api/liveAssessment';

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ templateId: string }> },
) {
  const auth = await liveClaims();
  if (!auth)
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  const { templateId } = await context.params;
  const upstream = await backendFetch(`/v1/templates/${encodeURIComponent(templateId)}`, {
    method: 'DELETE',
    token: auth.token,
  });
  return new NextResponse(upstream.status === 204 ? null : await upstream.text(), {
    status: upstream.status,
    headers:
      upstream.status === 204
        ? undefined
        : { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
