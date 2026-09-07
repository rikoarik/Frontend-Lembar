/**
 * Invitation preview. Reads an invitation token and returns its visibility
 * state (pending / expired / invalid). Used by the invitation page before
 * the user fills the activation form. Falls back to the backend
 * `/v1/auth/invitations/consume` route via GET-as-preview is not supported
 * there, so we instead map to a backend preview route we add alongside
 * (see BE work). When the BE route does not exist, return a friendly
 * 'invalid' so the user is not stuck on a load spinner.
 */
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { backendFetch, JWT_COOKIE, SESSION_COOKIE } from '@/src/lib/api/session';

const PREVIEW_PATH = '/v1/invitations/preview';

export async function GET(_request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const jar = await cookies();
  const sessionToken = jar.get(JWT_COOKIE)?.value || jar.get(SESSION_COOKIE)?.value;

  const upstream = await backendFetch(`${PREVIEW_PATH}?token=${encodeURIComponent(token)}`, {
    method: 'GET',
    token: sessionToken,
  });

  const payload = await upstream.json().catch(() => null);

  if (!upstream.ok) {
    return NextResponse.json(
      {
        data: {
          status: 'invalid',
          safeMessage: 'Undangan tidak dapat diperiksa.',
        },
      },
      { status: 200 },
    );
  }

  // Normalise shape. Backend currently returns an arbitrary envelope;
  // expose the minimal field used by the FE page: status.
  const status = payload?.status ?? payload?.data?.status ?? (upstream.ok ? 'pending' : 'invalid');

  return NextResponse.json({
    data: {
      status,
      schoolName: payload?.schoolName ?? payload?.data?.schoolName,
      email: payload?.email ?? payload?.data?.email,
    },
  });
}
