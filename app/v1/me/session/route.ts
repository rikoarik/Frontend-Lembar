import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { isMockApiMode, mockFail, mockOk } from '@/src/lib/mock-api/preview';
import { JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

/**
 * Lightweight endpoint: returns the current session's JWT time claims.
 *
 * The token lives in an httpOnly cookie, so the browser cannot read `iat`/`exp`
 * itself. `/ops/profile` needs the real session start (FE-VER-02 F-3) instead of
 * a client-side `new Date()` at mount time.
 */
export async function GET() {
  const jar = await cookies();
  const token = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;
  if (!token) return mockFail('AUTH_REQUIRED', 'Silakan masuk terlebih dahulu.', 401);

  if (isMockApiMode()) {
    // Mock sessions are opaque strings, not JWTs — no claims to expose.
    return mockOk({ issuedAt: null, expiresAt: null, source: 'mock' });
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) {
      return mockOk({ issuedAt: null, expiresAt: null, source: 'opaque' });
    }
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
      iat?: unknown;
      exp?: unknown;
    };
    const issuedAt = typeof payload.iat === 'number' ? payload.iat : null;
    const expiresAt = typeof payload.exp === 'number' ? payload.exp : null;
    return NextResponse.json({ data: { issuedAt, expiresAt, source: 'jwt' } });
  } catch {
    return mockOk({ issuedAt: null, expiresAt: null, source: 'unparsable' });
  }
}
