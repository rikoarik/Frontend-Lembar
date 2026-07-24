import { NextResponse } from 'next/server';
import {
  authSuccessPayload,
  isMockApiMode,
  mockFail,
  mockOk,
} from '@/src/lib/mock-api/preview';
import {
  authSuccessFromBackend,
  backendFetch,
  jwtCookieOptions,
  type BackendAuthResponse,
} from '@/src/lib/api/session';

export async function POST(request: Request) {
  let body: {
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
    name?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return mockFail('VALIDATION_FAILED', 'Periksa kembali isian formulir.', 400);
  }

  if (isMockApiMode()) {
    if (!body.username || !body.email || !body.phone || !body.password) {
      return mockFail('VALIDATION_FAILED', 'Lengkapi semua isian.', 400, {
        username: body.username ? [] : ['Wajib diisi.'],
        email: body.email ? [] : ['Wajib diisi.'],
        phone: body.phone ? [] : ['Wajib diisi.'],
        password: body.password ? [] : ['Wajib diisi.'],
      });
    }
    if (body.email === 'demo@example.com') {
      return mockFail('DUPLICATE_RESOURCE', 'Email sudah terdaftar.', 409, {
        email: ['Email sudah terdaftar.'],
      });
    }
    return mockOk(authSuccessPayload(), { setSession: true });
  }

  // Live mode → backend JWT register
  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '');
  const name = String(body.name ?? body.username ?? '').trim();

  if (!email || !password || !name) {
    return mockFail('VALIDATION_FAILED', 'Lengkapi email, nama, dan kata sandi.', 400, {
      email: email ? [] : ['Wajib diisi.'],
      username: name ? [] : ['Wajib diisi.'],
      password: password ? [] : ['Wajib diisi.'],
    });
  }

  const upstream = await backendFetch('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });

  if (!upstream.ok) {
    const payload = await upstream.json().catch(() => null);
    const message = payload?.error?.message || 'Gagal membuat akun.';
    const code =
      upstream.status === 409 || /sudah terdaftar/i.test(message)
        ? 'DUPLICATE_RESOURCE'
        : upstream.status === 400
          ? 'VALIDATION_FAILED'
          : 'UNKNOWN';
    return mockFail(code, message, upstream.status || 500, {
      email: code === 'DUPLICATE_RESOURCE' ? ['Email sudah terdaftar.'] : [],
    });
  }

  const auth = (await upstream.json()) as BackendAuthResponse;
  if (!auth?.token || !auth?.user) {
    return mockFail('UNKNOWN', 'Respons registrasi tidak valid.', 502);
  }

  const response = NextResponse.json(
    { data: authSuccessFromBackend(auth) },
    { status: 201 },
  );
  response.cookies.set(jwtCookieOptions(auth.token));
  response.cookies.set({
    name: 'lembar_session',
    value: auth.token,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') ?? false,
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
