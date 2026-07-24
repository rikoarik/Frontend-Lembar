import { NextResponse } from 'next/server';
import {
  authSuccessFor,
  findMockAccount,
} from '@/src/lib/mock-api/accounts';
import {
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
  let body: { identifier?: string; password?: string; email?: string } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return mockFail('VALIDATION_FAILED', 'Periksa kembali isian formulir.', 400);
  }

  const identifier = String(body.identifier ?? body.email ?? '').trim();
  const password = String(body.password ?? '');

  if (!identifier || !password) {
    return mockFail('VALIDATION_FAILED', 'Email dan kata sandi wajib diisi.', 400, {
      identifier: identifier ? [] : ['Wajib diisi.'],
      password: password ? [] : ['Wajib diisi.'],
    });
  }

  // Mock mode keeps local demo accounts.
  if (isMockApiMode()) {
    const account = findMockAccount(identifier, password);
    if (!account) {
      return mockFail(
        'INVALID_CREDENTIALS',
        'Username/email/phone dan kata sandi tidak cocok.',
        401,
      );
    }
    return mockOk(authSuccessFor(account), { setSession: account.session });
  }

  // Live mode: proxy to backend JWT auth.
  // Backend currently accepts email only.
  const email = identifier.includes('@') ? identifier : identifier;
  const upstream = await backendFetch('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!upstream.ok) {
    const payload = await upstream.json().catch(() => null);
    const message =
      payload?.error?.message ||
      (upstream.status === 401
        ? 'Email dan kata sandi tidak cocok.'
        : 'Gagal masuk. Coba lagi.');
    return mockFail(
      upstream.status === 401 ? 'INVALID_CREDENTIALS' : 'UNKNOWN',
      message,
      upstream.status === 401 ? 401 : upstream.status || 500,
    );
  }

  const auth = (await upstream.json()) as BackendAuthResponse;
  if (!auth?.token || !auth?.user) {
    return mockFail('UNKNOWN', 'Respons autentikasi tidak valid.', 502);
  }

  const response = NextResponse.json({ data: authSuccessFromBackend(auth) }, { status: 200 });
  response.cookies.set(jwtCookieOptions(auth.token));
  // Keep legacy cookie name for any existing mock-era readers.
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
