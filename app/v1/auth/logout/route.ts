import { NextResponse } from 'next/server';
import { isMockApiMode, mockOk } from '@/src/lib/mock-api/preview';
import { clearJwtCookieOptions, JWT_COOKIE } from '@/src/lib/api/session';

export async function POST() {
  if (isMockApiMode()) {
    return mockOk({ loggedOut: true }, { clearSession: true });
  }

  const response = NextResponse.json({ data: { loggedOut: true } }, { status: 200 });
  response.cookies.set(clearJwtCookieOptions());
  response.cookies.set({
    name: 'lembar_session',
    value: '',
    path: '/',
    maxAge: 0,
  });
  // Explicit clear both cookies
  response.cookies.set({ name: JWT_COOKIE, value: '', path: '/', maxAge: 0 });
  return response;
}
