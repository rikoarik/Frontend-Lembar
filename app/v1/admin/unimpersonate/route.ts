import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authCookieOptions, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

export async function POST() {
  const jar = await cookies();
  const impersonatorToken = jar.get('lembar_impersonator')?.value;

  const response = NextResponse.json({
    data: { targetPath: '/ops' },
  });

  const activeToken = impersonatorToken || 'ops';

  response.cookies.set(authCookieOptions(JWT_COOKIE, activeToken));
  response.cookies.set({ name: SESSION_COOKIE, value: '', path: '/', maxAge: 0 });
  response.cookies.set(authCookieOptions('lembar_roles', 'superadmin'));

  // Delete impersonation tracking cookies
  response.cookies.set({
    name: 'lembar_impersonator',
    value: '',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set({
    name: 'lembar_impersonated_name',
    value: '',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set({
    name: 'lembar_is_impersonating',
    value: '',
    path: '/',
    maxAge: 0,
  });

  return response;
}
