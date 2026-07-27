import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

export async function POST() {
  const jar = await cookies();
  const impersonatorToken = jar.get('lembar_impersonator')?.value;

  const response = NextResponse.json({
    data: { targetPath: '/ops' },
  });

  const activeToken = impersonatorToken || 'ops';

  response.cookies.set({
    name: JWT_COOKIE,
    value: activeToken,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
  });

  response.cookies.set({
    name: SESSION_COOKIE,
    value: activeToken,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
  });

  response.cookies.set({
    name: 'lembar_roles',
    value: 'superadmin',
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
  });

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
