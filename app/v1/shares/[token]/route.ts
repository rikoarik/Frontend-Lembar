import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';
import { liveClaims } from '@/src/lib/api/liveAssessment';

export async function GET() {
  return NextResponse.json(
    {
      error: {
        code: 'LEGACY_SHARE_DISABLED',
        message: 'Gunakan halaman pengerjaan asesmen.',
        retryable: false,
      },
    },
    { status: 410 },
  );
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const auth = await liveClaims();
  if (!auth) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk terlebih dahulu.' } },
      { status: 401 },
    );
  }

  const upstream = await backendFetch(`/v1/shares/${encodeURIComponent(token)}`, {
    method: 'DELETE',
    token: auth.token,
    body: await request.text(),
  });
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
