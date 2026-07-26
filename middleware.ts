import { type NextRequest, NextResponse } from 'next/server';

/**
 * Name of the session cookie set by the backend on login/register.
 * Must stay in sync with the backend session configuration.
 */
const SESSION_COOKIE = 'lembar_session';
const ROLES_COOKIE = 'lembar_roles';
const ACTIVE_ROLE_COOKIE = 'lembar_active_role';

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
    return rolesStr
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);
  }
  // Fallback for compatibility/mock sessions
  if (session === 'ops') return ['superadmin'];
  if (session === 'admin') return ['school_admin'];
  return ['teacher'];
}

/**
 * Determine the user's current active role.
 */
function getActiveRole(request: NextRequest, session: string, roles: string[]): string {
  const cookieRole = request.cookies.get(ACTIVE_ROLE_COOKIE)?.value;
  if (cookieRole && (roles.includes(cookieRole) || roles.length === 0)) {
    return cookieRole;
  }
  if (roles.includes('superadmin')) return 'superadmin';
  if (roles.includes('school_admin')) return 'school_admin';
  return 'teacher';
}

/**
 * Route guards & Role-based workspace redirects:
 * - /app/* represents Teacher / Personal Workspace
 * - /school/* represents School Admin Workspace
 * - /ops/* represents Platform Superadmin Workspace
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
  const activeRole = getActiveRole(request, session, roles);
  const isSuperadmin = roles.includes('superadmin');
  const isSchoolAdmin = roles.includes('school_admin');

  // --- Access guards (hard blocks) ---

  if (isOps && !isSuperadmin) {
    return redirectTo(request, isSchoolAdmin ? '/school' : '/app');
  }

  if (isSchool && !isSchoolAdmin && !isSuperadmin) {
    return redirectTo(request, '/app');
  }

  // --- Landing-page redirects (redirect user to their active role workspace) ---

  const isAppLanding = pathname === '/app' || pathname === '/app/';

  if (isApp && isAppLanding) {
    if (activeRole === 'superadmin') {
      return redirectTo(request, '/ops');
    }
    if (activeRole === 'school_admin') {
      return redirectTo(request, '/school');
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/school/:path*', '/ops/:path*'],
};
