/**
 * Invitation preview (BUG-20a, FE-AUD-01-2026-09-30).
 *
 * Contract (backend `GET /v1/auth/invitations/preview?token=…`): answers 200
 * with `{ data: { status, workspaceName|schoolName, role, expiresAt } }`, and
 * answers 200 with `status: 'invalid'` for a token it does not know. It only
 * 404s when the route itself is not registered on the backend.
 *
 * The previous version added a fallback probe to `POST /v1/auth/invitations/consume`
 * and, whenever that 404'd too, reported `{ status: 'invalid' }` with HTTP 200.
 * A perfectly valid token was therefore shown as "Undangan tidak lagi aktif."
 * Now an unreachable/missing upstream is reported as an upstream failure (503,
 * retryable) so the page can say "cannot check" instead of blaming the token.
 */
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

const PREVIEW_PATH = '/v1/auth/invitations/preview';

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const jar = await cookies();
  const sessionToken = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;

  const upstream = await backendFetch(`${PREVIEW_PATH}?token=${encodeURIComponent(token)}`, {
    method: 'GET',
    token: sessionToken,
  });

  const payload = (await upstream.json().catch(() => null)) as {
    data?: {
      status?: string;
      schoolName?: string;
      workspaceName?: string;
      email?: string;
      role?: string;
      expiresAt?: string;
    };
    status?: string;
    schoolName?: string;
  } | null;

  if (!upstream.ok) {
    // 404 here means the preview route is not deployed — not that the token is
    // invalid. Report it as retryable so the page shows "cannot check".
    const status = upstream.status === 404 ? 503 : upstream.status;
    return NextResponse.json(
      {
        error: {
          code: 'UPSTREAM_UNAVAILABLE',
          message: 'Undangan tidak dapat diperiksa saat ini.',
          retryable: true,
        },
      },
      { status },
    );
  }

  const envelope = (payload?.data ?? payload) as
    | {
        status?: string;
        schoolName?: string;
        workspaceName?: string;
        email?: string;
        role?: string;
        expiresAt?: string;
      }
    | null
    | undefined;
  const data = envelope ?? {};
  const schoolName = data.schoolName ?? data.workspaceName;

  return NextResponse.json({
    data: {
      status: data.status ?? 'invalid',
      ...(schoolName ? { schoolName } : {}),
      ...(data.email ? { email: data.email } : {}),
      ...(data.role ? { role: data.role } : {}),
      ...(data.expiresAt ? { expiresAt: data.expiresAt } : {}),
    },
  });
}
