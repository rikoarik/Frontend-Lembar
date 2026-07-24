import { type NextRequest, NextResponse } from 'next/server';

/**
 * Name of the session cookie set by the backend on login/register.
 * Must stay in sync with the backend session configuration.
 */
const SESSION_COOKIE = 'lembar_session';
const ROLES_COOKIE = 'lembar_roles';

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
 * Retrieve roles array from cookies, falling back to session-based inference.
 */
function getRolesFromCookies(request: NextRequest, session: string): string[] {
  const rolesStr = request.cookies.get(ROLES_COOKIE)?.value;
  if (rolesStr) {
    return rolesStr.split(',').map((r) => r.trim()).filter(Boolean);
  }
  // Fallback for compatibility/mock sessions
  if (session === 'ops') return ['superadmin'];
  if (session === 'admin') return ['school_admin'];
  return ['teacher'];
}

/**
 * Route guards:
 * - /app/* requires any valid session
 * - /school/* requires school_admin (or superadmin)
 * - /ops/* requires superadmin
 *
 * Role-based redirects on landing pages:
 * - superadmin hitting /app → redirect to /ops
 * - school_admin hitting /app → redirect to /school
 * Exception: if user has multiple roles they can access /app freely
 * since they also have teacher capabilities.
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

  const roles = getRolesFromCookies(request, session);
  const isSuperadmin = roles.includes('superadmin');
  const isSchoolAdmin = roles.includes('school_admin');
  const multiRole = roles.length > 1;

  // --- Access guards (hard blocks) ---

  if (isOps && !isSuperadmin) {
    return redirectTo(request, isSchoolAdmin ? '/school' : '/app');
  }

  if (isSchool && !isSchoolAdmin && !isSuperadmin) {
    return redirectTo(request, '/app');
  }

  // --- Landing-page redirects (soft: redirect single-role users to their panel) ---

  const isAppLanding = pathname === '/app' || pathname === '/app/';

  if (isApp && isSuperadmin && isAppLanding) {
    // Superadmin always goes to /ops — superadmin doesn't need teacher dashboard.
    return redirectTo(request, '/ops');
  }

  if (isApp && isSchoolAdmin && isAppLanding && !multiRole) {
    // Pure school_admin → redirect to school panel.
    // Multi-role (e.g. teacher + school_admin) can stay on /app.
    return redirectTo(request, '/school');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/school/:path*', '/ops/:path*'],
};
