import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await context.params;
  const path = `/v1/catalog/${slug.join('/')}`;
  const search = request.nextUrl.search;
  const fullPath = `${path}${search}`;

  const jar = await cookies();
  const token =
    jar.get(JWT_COOKIE)?.value ||
    jar.get(SESSION_COOKIE)?.value ||
    jar.get('token')?.value ||
    jar.get('jwt')?.value;

  if (!token) {
    return NextResponse.json(
      { error: { code: 'AUTH_REQUIRED', message: 'Token tidak ditemukan.', retryable: false } },
      { status: 401 },
    );
  }

  const upstream = await backendFetch(fullPath, { method: 'GET', token });

  if (!upstream.ok) {
    const payload = await upstream.json().catch(() => null);
    return NextResponse.json(
      payload ?? { error: { code: 'UPSTREAM_ERROR', message: 'Gagal mengambil data dari server.' } },
      { status: upstream.status },
    );
  }

  const payload = await upstream.json().catch(() => null);
  return NextResponse.json(payload ?? { data: [] }, { status: 200 });
}

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const path = `/v1/catalog/${slug.join('/')}`;
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value || jar.get('token')?.value;
  if (!token) return NextResponse.json({ error: { code: 'AUTH_REQUIRED', message: 'Token tidak ditemukan.' } }, { status: 401 });
  const body = await request.json().catch(() => undefined);
  const upstream = await backendFetch(path, { method: 'POST', token, body: body !== undefined ? JSON.stringify(body) : undefined });
  const payload = await upstream.json().catch(() => null);
  return NextResponse.json(payload ?? { data: null }, { status: upstream.status });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const path = `/v1/catalog/${slug.join('/')}`;
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value || jar.get('token')?.value;
  if (!token) return NextResponse.json({ error: { code: 'AUTH_REQUIRED', message: 'Token tidak ditemukan.' } }, { status: 401 });
  const body = await request.json().catch(() => undefined);
  const upstream = await backendFetch(path, { method: 'PATCH', token, body: body !== undefined ? JSON.stringify(body) : undefined });
  const payload = await upstream.json().catch(() => null);
  return NextResponse.json(payload ?? { data: null }, { status: upstream.status });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await context.params;
  const path = `/v1/catalog/${slug.join('/')}`;
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value || jar.get('token')?.value;
  if (!token) return NextResponse.json({ error: { code: 'AUTH_REQUIRED', message: 'Token tidak ditemukan.' } }, { status: 401 });
  const upstream = await backendFetch(path, { method: 'DELETE', token });
  const payload = await upstream.json().catch(() => null);
  return NextResponse.json(payload ?? { data: null }, { status: upstream.status });
}
