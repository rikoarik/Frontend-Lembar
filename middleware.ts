import { type NextRequest, NextResponse } from 'next/server';

/**
 * Name of the session cookie set by the backend on login/register.
 * Must stay in sync with the backend session configuration.
 */
const SESSION_COOKIE = 'lembar_session';

/**
 * Redirect unauthenticated users hitting any /app/* route to /masuk.
 * All other routes (auth pages, marketing, static assets) pass through.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Only guard /app/* routes
  if (!pathname.startsWith('/app')) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/masuk';
    // Preserve the original destination so we can redirect back after login
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all /app/* paths.
     * Exclude Next.js internals and static files so they never hit the guard.
     */
    '/app/:path*',
  ],
};
