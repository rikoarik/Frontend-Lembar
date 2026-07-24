import { type NextRequest, NextResponse } from 'next/server';

/**
 * Name of the session cookie set by the backend on login/register.
 * Must stay in sync with the backend session configuration.
 */
const SESSION_COOKIE = 'lembar_session';

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/masuk';
  loginUrl.search = '';
  return NextResponse.redirect(loginUrl);
}

function redirectTo(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  return NextResponse.redirect(url);
}

/**
 * Route guards:
 * - /app/* requires any valid session
 * - /school/* requires school_admin (or superadmin)
 * - /ops/* requires superadmin
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get(SESSION_COOKIE)?.value;

  const isApp = pathname.startsWith('/app');
  const isSchool = pathname.startsWith('/school');
  const isOps = pathname.startsWith('/ops');

  if (!isApp && !isSchool && !isOps) {
    return NextResponse.next();
  }

  if (!session) {
    return redirectToLogin(request);
  }

  // Mock role mapping from session cookie value.
  const role =
    session === 'ops'
      ? 'superadmin'
      : session === 'admin'
        ? 'school_admin'
        : session === 'demo'
          ? 'teacher'
          : 'teacher';

  if (isOps && role !== 'superadmin') {
    return redirectTo(request, role === 'school_admin' ? '/school' : '/app');
  }

  if (isSchool && role !== 'school_admin' && role !== 'superadmin') {
    return redirectTo(request, '/app');
  }

  // Superadmin landing should prefer /ops, but can still open school for support.
  if (isApp && role === 'superadmin') {
    // allow app for support viewing; no force redirect
  }

  if (isApp && role === 'school_admin') {
    // school admin can still open teacher app surfaces if needed
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/school/:path*', '/ops/:path*'],
};
