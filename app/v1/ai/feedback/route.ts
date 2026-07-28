import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

export async function POST(request: NextRequest) {
  const jar = await cookies();
  const token =
    jar.get(JWT_COOKIE)?.value ||
    jar.get(SESSION_COOKIE)?.value ||
    jar.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Silakan masuk.', retryable: false } },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.promptTemplateId !== 'string' || typeof body.rating !== 'number') {
    return NextResponse.json(
      { error: { code: 'VALIDATION_FAILED', message: 'promptTemplateId dan rating wajib diisi.' } },
      { status: 400 },
    );
  }

  const upstream = await backendFetch('/v1/ai/feedback', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });

  const json = await upstream.json().catch(() => null);
  return NextResponse.json(
    json ?? { error: { code: 'UPSTREAM_ERROR', message: 'Gagal mengirim feedback AI.' } },
    { status: upstream.status },
  );
}
