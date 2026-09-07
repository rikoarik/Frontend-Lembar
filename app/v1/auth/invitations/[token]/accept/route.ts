import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { authCookieOptions, backendFetch, jwtCookieOptions, JWT_COOKIE, SESSION_COOKIE, normalizeRoles } from '@/src/lib/api/session';

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const jar = await cookies();
  const sessionToken =
    jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value || jar.get('token')?.value || null;

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  if (!token || !body.password) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_FAILED',
          message: 'token dan password wajib diisi.',
          retryable: false,
        },
      },
      { status: 400 },
    );
  }

  const upstream = await backendFetch('/v1/invitations/accept', {
    method: 'POST',
    token: sessionToken,
    body: JSON.stringify({
      token,
      password: body.password,
    }),
  });

  const payload = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(
      payload ?? {
        error: {
          code: 'UPSTREAM_ERROR',
          message: 'Tidak dapat mengaktifkan undangan.',
        },
      },
      { status: upstream.status },
    );
  }

  const tokenFromResponse = payload?.token ?? payload?.data?.token;
  const user = payload?.user ?? payload?.data?.user;
  if (!tokenFromResponse) {
    return NextResponse.json({ error: { code: 'UPSTREAM_ERROR', message: 'Respons aktivasi tidak lengkap.' } }, { status: 502 });
  }
  const response = NextResponse.json({ data: { accepted: true } }, { status: 200 });
  response.cookies.set(jwtCookieOptions(tokenFromResponse));
  response.cookies.set({ name: SESSION_COOKIE, value: '', path: '/', maxAge: 0 });
  const roles = normalizeRoles(user);
  if (roles.length > 0) response.cookies.set(authCookieOptions('lembar_roles', roles.join(',')));
  return response;
}
